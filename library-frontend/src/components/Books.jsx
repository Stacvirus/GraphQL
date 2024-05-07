import { useQuery, useSubscription } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'

function GenreBooks({ genre }) {
  const books = useQuery(ALL_BOOKS, {
    variables: { genre: genre },
  })

  if (books.loading) return <div>loading...</div>

  const { allBooks } = books.data

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Books = () => {
  const books = useQuery(ALL_BOOKS)
  const [title, setTitle] = useState('all genres')

  if (books.loading) return <div>loading...</div>
  const { allBooks } = books.data
  const btns = [
    'refactoring',
    'agile',
    'patterns',
    'design',
    'crime',
    'classic',
    'revolution',
    'anime',
    'all genres',
  ]

  return (
    <div>
      <h2>books</h2>
      <br />
      <p>
        in genre <strong>{title}</strong>
      </p>
      {title === 'all genres' ? (
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {allBooks.map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <GenreBooks genre={title} />
      )}
      <br />
      {btns.map((b, id) => (
        <button key={id} onClick={() => setTitle(b)}>
          {b}
        </button>
      ))}
    </div>
  )
}

export default Books
