import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

import {
  BrowserRouter as Router,
  Routes,
  NavLink,
  Route,
} from 'react-router-dom'

function Notify({ errorMsg }) {
  if (!errorMsg) return

  return <div style={{ color: 'red' }}>{errorMsg} </div>
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [error, setError] = useState(null)

  function notify(msg) {
    setError(msg)
    setTimeout(() => {
      setError(null)
    }, 2000)
  }

  const padding = { padding: 5 }
  const nav = { padding: '20px 10px' }

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
      </nav>

      <Routes>
        <Route path="/" element={<Authors err={notify} />} />
        <Route path="/books" element={<Books />} />
        <Route path="/newbook" element={<NewBook setError={notify} />} />
      </Routes>
    </Router>
  )
}

export default App
