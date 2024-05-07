const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const cors = require('cors')
const http = require('http')

// const { startStandaloneServer } = require('@apollo/server/standalone')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const User = require('./models/user')
const resolvers = require('./utils/resolvers')
const typeDefs = require('./utils/schema')

const mongoose = require('mongoose')
const { MONGODB_URI, JWT_SECRET, PORT } = process.env

mongoose.set('strictQuery', false)

console.log('connecting to MongoDB', MONGODB_URI)
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('connected to mongoDB'))
  .catch((error) => console.log(error))

// mongoose.set('debug', true)

const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })

  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleaup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleaup()
            },
          }
        },
      },
    ],
  })

  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null

        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
          const currentUser = await User.findById(decodedToken.id)

          return { currentUser }
        }
      },
    })
  )

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is now running on http://localhost:${PORT}`)
  })
}

start()
