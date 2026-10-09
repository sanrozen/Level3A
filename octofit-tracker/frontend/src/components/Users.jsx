import { useEffect, useState } from 'react'

const apiBaseUrl = import.meta.env.VITE_CODESPACE_NAME
  ? `https://${import.meta.env.VITE_CODESPACE_NAME}-8000.app.github.dev`
  : 'http://localhost:8000'

function getUsers(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    for (const key of ['results', 'data', 'items', 'docs']) {
      if (key in payload) {
        return getUsers(payload[key])
      }
    }
  }

  throw new Error('The API response did not contain a list of users.')
}

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${apiBaseUrl}/api/users/`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`)
        }

        setUsers(getUsers(await response.json()))
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load users.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadUsers()
    return () => controller.abort()
  }, [reload])

  return (
    <section aria-labelledby="users-heading">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 id="users-heading" className="h2 mb-1">Users</h1>
          <p className="text-secondary mb-0">OctoFit Tracker athlete profiles.</p>
        </div>
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={() => setReload((count) => count + 1)}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="d-flex align-items-center gap-2 text-secondary" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          Loading users…
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          <p className="mb-2">Could not load users: {error}</p>
          <button
            className="btn btn-sm btn-outline-danger"
            type="button"
            onClick={() => setReload((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="alert alert-light border" role="status">No users found.</div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="table-responsive rounded border bg-white">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Athlete</th>
                <th scope="col">Username</th>
                <th scope="col">Email</th>
                <th scope="col">Team</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id ?? index}>
                  <td className="fw-semibold">
                    {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td>{user.username ?? '—'}</td>
                  <td>{user.email ?? '—'}</td>
                  <td>{user.team?.name ?? user.team ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Users
