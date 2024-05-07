import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { LOGIN } from '../queries'

export default function LoginForm({ setError, setToken }) {
  const [userInfos, setUserInfos] = useState({
    username: '',
    password: '',
  })

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    },
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('person-user-token', token)
    }
  }, [result.data])

  function handleChange(e) {
    const { value, name } = e.target
    setUserInfos({ ...userInfos, [name]: value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    login({ variables: userInfos })
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          username
          <input
            type="text"
            value={userInfos.username}
            name="username"
            onChange={handleChange}
          />
        </div>

        <div>
          password
          <input
            type="password"
            value={userInfos.password}
            name="password"
            onChange={handleChange}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}
