import { useEffect, useState } from 'react'

const apiBaseUrl = import.meta.env.VITE_CODESPACE_NAME
  ? `https://${import.meta.env.VITE_CODESPACE_NAME}-8000.app.github.dev`
  : 'http://localhost:8000'

function getActivities(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    for (const key of ['results', 'data', 'items', 'docs']) {
      if (key in payload) {
        return getActivities(payload[key])
      }
    }
  }

  throw new Error('The API response did not contain a list of activities.')
}

function Activities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadActivities() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${apiBaseUrl}/api/activities/`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`)
        }

        setActivities(getActivities(await response.json()))
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load activities.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadActivities()
    return () => controller.abort()
  }, [reload])

  return (
    <section aria-labelledby="activities-heading">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 id="activities-heading" className="h2 mb-1">Activities</h1>
          <p className="text-secondary mb-0">Review recent OctoFit workouts and activity logs.</p>
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
          Loading activities…
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          <p className="mb-2">Could not load activities: {error}</p>
          <button
            className="btn btn-sm btn-outline-danger"
            type="button"
            onClick={() => setReload((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && activities.length === 0 && (
        <div className="alert alert-light border" role="status">No activities found.</div>
      )}

      {!loading && !error && activities.length > 0 && (
        <div className="table-responsive rounded border bg-white">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Activity</th>
                <th scope="col">Athlete</th>
                <th scope="col">Duration</th>
                <th scope="col">Distance</th>
                <th scope="col">Points</th>
                <th scope="col">Completed</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={activity._id ?? index}>
                  <td className="fw-semibold">{activity.type ?? 'Activity'}</td>
                  <td>{activity.user?.username ?? activity.user?.name ?? '—'}</td>
                  <td>{activity.durationMinutes == null ? '—' : `${activity.durationMinutes} min`}</td>
                  <td>{activity.distanceKm == null ? '—' : `${activity.distanceKm} km`}</td>
                  <td>{activity.points ?? '—'}</td>
                  <td>
                    {activity.completedAt
                      ? new Date(activity.completedAt).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Activities
