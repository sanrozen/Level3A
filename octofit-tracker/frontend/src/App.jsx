import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Activities from './components/Activities.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Teams from './components/Teams.jsx'
import Users from './components/Users.jsx'
import Workouts from './components/Workouts.jsx'

const apiBaseUrl = import.meta.env.VITE_CODESPACE_NAME
  ? `https://${import.meta.env.VITE_CODESPACE_NAME}-8000.app.github.dev`
  : 'http://localhost:8000'

const resources = [
  { path: 'activities', label: 'Activities', endpoint: '/api/activities/' },
  { path: 'leaderboard', label: 'Leaderboard', endpoint: '/api/leaderboard/' },
  { path: 'teams', label: 'Teams', endpoint: '/api/teams/' },
  { path: 'users', label: 'Users', endpoint: '/api/users/' },
  { path: 'workouts', label: 'Workouts', endpoint: '/api/workouts/' },
]

function getRecords(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    for (const key of ['results', 'data', 'items', 'docs']) {
      if (key in payload) {
        return getRecords(payload[key])
      }
    }
  }

  throw new Error('The API response did not contain a list of records.')
}

function formatLabel(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (character) => character.toUpperCase())
}

function displayValue(value) {
  if (value == null) {
    return '—'
  }

  if (Array.isArray(value)) {
    return value.map(displayValue).join(', ') || '—'
  }

  if (typeof value === 'object') {
    return value.username ?? value.name ?? value.title ?? JSON.stringify(value)
  }

  if (typeof value === 'string' && !Number.isNaN(Date.parse(value)) && value.includes('T')) {
    return new Date(value).toLocaleString()
  }

  return String(value)
}

function ResourcePage({ resource }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadRecords() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${apiBaseUrl}${resource.endpoint}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`)
        }

        const payload = await response.json()
        setRecords(getRecords(payload))
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load records.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadRecords()
    return () => controller.abort()
  }, [resource, reload])

  const columns = [...new Set(records.flatMap((record) => Object.keys(record)))]
    .filter((column) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(column))

  return (
    <section aria-labelledby="resource-heading">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 id="resource-heading" className="h2 mb-1">{resource.label}</h1>
          <p className="text-secondary mb-0">OctoFit Tracker {resource.label.toLowerCase()}</p>
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
          Loading {resource.label.toLowerCase()}…
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          <p className="mb-2">Could not load {resource.label.toLowerCase()}: {error}</p>
          <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => setReload((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="alert alert-light border" role="status">
          No {resource.label.toLowerCase()} found.
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="table-responsive rounded border bg-white">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                {columns.map((column) => <th key={column} scope="col">{formatLabel(column)}</th>)}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record._id ?? index}>
                  {columns.map((column) => <td key={column}>{displayValue(record[column])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function AppLayout() {
  return (
    <div className="min-vh-100 bg-light">
      <header className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <NavLink className="navbar-brand fw-semibold" to="/activities">OctoFit Tracker</NavLink>
          <nav className="navbar-nav flex-row flex-wrap gap-1" aria-label="Main navigation">
            {resources.map((resource) => (
              <NavLink
                key={resource.path}
                to={`/${resource.path}`}
                className={({ isActive }) => `nav-link px-2${isActive ? ' active fw-semibold' : ''}`}
              >
                {resource.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="container py-4 py-md-5">
        <Routes>
          <Route path="/" element={<Navigate to="/activities" replace />} />
          {resources.map((resource) => (
            <Route
              key={resource.path}
              path={`/${resource.path}`}
              element={
                resource.path === 'activities'
                  ? <Activities />
                  : resource.path === 'leaderboard'
                    ? <Leaderboard />
                    : resource.path === 'teams'
                      ? <Teams />
                      : resource.path === 'users'
                        ? <Users />
                        : resource.path === 'workouts'
                          ? <Workouts />
                          : <ResourcePage resource={resource} />
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/activities" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
