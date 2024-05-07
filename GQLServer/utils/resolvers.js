const DataLoader = require('dataloader')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const Book = require('../models/book')
const Author = require('../models/author')
const User = require('../models/user')

const { JWT_SECRET } = process.env

const authorLoader = new DataLoader(async (ids) => {
  return await Author.find({ _id: { $in: ids } })
})

async function getAuthors(id) {
  const res = await authorLoader.load(id)
  return res._doc
}

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, { genre, author }) => {
      // console.log('allBooks')
      let ans = []

      if (!genre && !author) {
        const books = await Book.find()
        books.map((b) => ans.push(b))
      }

      if (genre) {
        const res = await Book.find({ genres: genre })
        if (!res) return []
        res.map((b) => ans.push(b))
      }

      if (author) {
        const isAuthor = await Author.findOne({ name: author })
        if (!isAuthor) return []
        const res = await Book.find({ author: isAuthor._id })
        res.map((a) => ans.push(a))
      }

      if (ans.length <= 0) return []

      return ans.map((a) => {
        return {
          ...a._doc,
          author: getAuthors(a._doc.author.toString()),
        }
      })
    },
    allAuthors: async () => {
      // console.log('in all authors')
      return await Author.find({})
      // let books = await Book.find()

      // books = books.map((b) => {
      //   return {
      //     ...b._doc,
      //     author: getAuthors(b._doc.author.toString()),
      //   }
      // })
      // console.log(books[0])
      // const res = authors.map(async (a) => {
      //   let count = 0
      //   let res = a
      //   if (a.bookCount == 0) {
      //     books.map((b) => (b.author.name === a.name ? count++ : count))
      //     a.bookCount = count
      //     // console.log(a.author)
      //     res = await a.save()
      //   }
      //   return res
      // })
      // console.log('in all authors')
      // return authors.map(async (a) => {
      //   const books = await Book.find({ author: a._id })
      //   a.bookCount = books.length
      //   return await a.save()
      // })
    },
    me: (root, args, { currentUser }) => currentUser,
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      if (args.title.length < 5 || args.author.length < 5) {
        throw new GraphQLError(
          'title and author value should be more than 5 characters',
          {
            extensions: {
              code: 'DAB_USER_INPUT',
              invalidArgs: [args.title, args.author],
            },
          }
        )
      }

      const isAuthor = await Author.findOne({ name: args.author })
      // console.log('author exists ??')
      const author = !isAuthor ? new Author({ name: args.author }) : null

      let book = { ...args, author: isAuthor ? isAuthor._id : author._id }
      book = new Book(book)

      if (!isAuthor) {
        author.bookCount = author.bookCount += 1

        await author.save()
      } else {
        isAuthor.bookCount = isAuthor.bookCount += 1

        await isAuthor.save()
      }

      await book.save()

      pubsub.publish('BOOK_ADDED', { bookAdded: book.populate('author') })

      return await book.populate('author')
    },
    editAuthor: async (root, { setBorn, name }, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const author = await Author.findOne({ name })
      if (!author || !setBorn) {
        throw new GraphQLError(
          !author ? 'Author not found' : 'Enter the born date',
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: name,
            },
          }
        )
      }

      author.born = Number(setBorn)
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: name,
            error,
          },
        })
      }

      return author
    },
    createUser: async (root, { username, favoriteGenre }) => {
      if (!username || !favoriteGenre) {
        throw new GraphQLError('enter user infos', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: [username, favoriteGenre],
          },
        })
      }

      const newUser = new User({ username, favoriteGenre })
      return await newUser.save()
    },
    login: async (root, { username, password }) => {
      const user = await User.findOne({ username })

      if (!user || password !== 'secret') {
        throw new GraphQLError('invalid user credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const userToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userToken, JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}

module.exports = resolvers
