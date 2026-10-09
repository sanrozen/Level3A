import { useEffect, useState } from 'react'

const apiBaseUrl = import.meta.env.VITE_CODESPACE_NAME
  ? `https://${import.meta.env.VITE_CODESPACE_NAME}-8000.app.github.dev`
  : 'http://localhost:8000'

function getEntries(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    for (const key of ['results', 'data', 'items', 'docs']) {
      if (key in payload) {
        return getEntries(payload[key])
      }
    }
  }

  throw new Error('The API response did not contain a leaderboard.')
}

function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadLeaderboard() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${apiBaseUrl}/api/leaderboard/`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`)
        }

        setEntries(getEntries(await response.json()))
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error
            ? requestError.message
            : 'Unable to load the leaderboard.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadLeaderboard()
    return () => controller.abort()
  }, [reload])

  return (
    <section aria-labelledby="leaderboard-heading">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 id="leaderboard-heading" className="h2 mb-1">Leaderboard</h1>
          <p className="text-secondary mb-0">See how athletes rank by activity points.</p>
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
          Loading leaderboard…
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          <p className="mb-2">Could not load leaderboard: {error}</p>
          <button
            className="btn btn-sm btn-outline-danger"
            type="button"
            onClick={() => setReload((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="alert alert-light border" role="status">No leaderboard entries found.</div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="table-responsive rounded border bg-white">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Athlete</th>
                <th scope="col">Points</th>
                <th scope="col">Activities completed</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry._id ?? entry.user?._id ?? index}>
                  <td className="fw-semibold">{entry.rank ?? index + 1}</td>
                  <td>{entry.user?.username ?? entry.user?.name ?? '—'}</td>
                  <td>{entry.points ?? 0}</td>
                  <td>{entry.activitiesCompleted ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Leaderboard
