import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import { useState } from 'react'

import Select from 'react-select'

let options = []

const Authors = (props) => {
  // if (!props.show) {
  //   return null
  // }

  const authors = useQuery(ALL_AUTHORS)
  if (authors.loading) return <div>loading...</div>

  function handleErr(msg) {
    console.log(msg)
    props.err(msg, 'red')
  }
  options = []

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => {
            options = options.concat({ value: a.name, label: a.name })
            return (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <BornForm setError={handleErr} />
    </div>
  )
}

function BornForm({ setError }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [born, setBorn] = useState('')
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    onError: (error) => {
      setError(error.graphQLErrors.map((e) => e.message).join('\n'))
    },
    // refetchQueries: [{ query: ALL_AUTHORS }],
    update: (cache, res) => {
      cache.updateQuery({ query: ALL_AUTHORS }, ({ allAuthors }) => {
        return {
          allAuthors: allAuthors.map((a) =>
            a.name === res.data.editAuthor.name
              ? { ...a, born: res.data.editAuthor.born }
              : a
          ),
        }
      })
    },
  })

  function submit(e) {
    e.preventDefault()
    editAuthor({ variables: { name: selectedOption.value, setBorn: born } })
    setBorn('')
  }

  return (
    <div>
      <h2>edit author birthday</h2>
      <form onSubmit={submit}>
        <Select
          defaultValue={selectedOption}
          onChange={setSelectedOption}
          options={options}
        />
        born
        <input
          type="text"
          value={born}
          onChange={({ target }) => setBorn(target.value)}
        />
        <br />
        <button type="submit">change birthday</button>
      </form>
    </div>
  )
}

export default Authors
