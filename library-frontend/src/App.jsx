import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendation from './components/Recommendation'

import { useEffect } from 'react'
import { useApolloClient } from '@apollo/client'

import { useSubscription } from '@apollo/client'
import { BOOK_ADDED, ALL_BOOKS } from './queries'

import {
  BrowserRouter as Router,
  Routes,
  NavLink,
  Route,
} from 'react-router-dom'

function Notify({ errorMsg }) {
  if (!errorMsg) return

  return <div style={{ color: errorMsg.clr }}>{errorMsg.msg} </div>
}

const App = () => {
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)

  const client = useApolloClient()

  function notify(msg, clr) {
    setError({ msg, clr })
    setTimeout(() => {
      setError(null)
    }, 2000)
  }

  const padding = { padding: 5 }
  const nav = { padding: '20px 10px' }

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const { bookAdded } = data.data
      console.log(bookAdded, 'is successfully added')

      notify(`${bookAdded.title} added`, 'green')

      client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(bookAdded),
        }
      })
    },
  })

  useEffect(() => {
    const localToken = localStorage.getItem('person-user-token')
    if (localToken) {
      setToken(localToken)
    }
  }, [])

  function logout() {
    setToken(null)
    localStorage.removeItem('person-user-token')
    client.resetStore()
  }

  if (!token) {
    return (
      <div>
        <Notify errorMsg={error} clr="red" />
        <h2>Login</h2>
        <LoginForm setToken={setToken} setError={setError} />
      </div>
    )
  }

  return (
    <Router>
      <Notify errorMsg={error} />

      <nav style={nav}>
        <NavLink to="/" style={padding}>
          authors
        </NavLink>
        <NavLink to="/books" style={padding}>
          books
        </NavLink>
        <NavLink to="/newbook" style={padding}>
          newbook
        </NavLink>
        <NavLink to="/recommend" style={padding}>
          recommend
        </NavLink>
        <button onClick={logout}>logout</button>
      </nav>

      <Routes>
        <Route path="/" element={<Authors err={notify} />} />
        <Route path="/books" element={<Books setError={notify} />} />
        <Route path="/newbook" element={<NewBook setError={notify} />} />
        <Route path="/recommend" element={<Recommendation />} />
      </Routes>
    </Router>
  )
}

export default App
