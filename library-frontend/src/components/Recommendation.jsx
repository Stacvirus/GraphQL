import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { ME, ALL_BOOKS } from '../queries'

export default function Recommendation() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const luser = localStorage.getItem('person-user-token')
    setUser(luser)
    if (luser) {
    }
  }, [])

  const title = useQuery(ME)
  if (title.loading) return <div>loading...</div>

  const { favoriteGenre } = title.data.me

  return (
    <div>
      <h2>Recommendations</h2>
      <br />
      <p>
        books in your favourite genre <strong>{favoriteGenre}</strong>
      </p>
      <RecommendBooks favorite={favoriteGenre} />
    </div>
  )
}

function RecommendBooks({ favorite }) {
  const { data, loading } = useQuery(ALL_BOOKS, {
    variables: { genre: favorite },
  })
  if (loading) return <div>loading...</div>

  return (
    <table>
      <tbody>
        <tr>
          <th></th>
          <th>author</th>
          <th>published</th>
        </tr>
        {data.allBooks.map((a) => (
          <tr key={a.title}>
            <td>{a.title}</td>
            <td>{a.author.name}</td>
            <td>{a.published}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
