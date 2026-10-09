import { useEffect, useState } from 'react'

const apiBaseUrl = import.meta.env.VITE_CODESPACE_NAME
  ? `https://${import.meta.env.VITE_CODESPACE_NAME}-8000.app.github.dev`
  : 'http://localhost:8000'

function getWorkouts(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    for (const key of ['results', 'data', 'items', 'docs']) {
      if (key in payload) {
        return getWorkouts(payload[key])
      }
    }
  }

  throw new Error('The API response did not contain a list of workouts.')
}

function getSuggestedAthlete(athlete) {
  if (typeof athlete === 'string') {
    return athlete
  }

  return athlete?.username
    ?? [athlete?.firstName, athlete?.lastName].filter(Boolean).join(' ')
    ?? athlete?.name
    ?? 'Athlete'
}

function Workouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadWorkouts() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${apiBaseUrl}/api/workouts/`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`)
        }

        setWorkouts(getWorkouts(await response.json()))
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load workouts.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadWorkouts()
    return () => controller.abort()
  }, [reload])

  return (
    <section aria-labelledby="workouts-heading">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 id="workouts-heading" className="h2 mb-1">Workouts</h1>
          <p className="text-secondary mb-0">Explore workout suggestions tailored to OctoFit athletes.</p>
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
          Loading workouts…
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          <p className="mb-2">Could not load workouts: {error}</p>
          <button
            className="btn btn-sm btn-outline-danger"
            type="button"
            onClick={() => setReload((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && workouts.length === 0 && (
        <div className="alert alert-light border" role="status">No workouts found.</div>
      )}

      {!loading && !error && workouts.length > 0 && (
        <div className="row g-3">
          {workouts.map((workout, index) => (
            <div className="col-12 col-md-6 col-xl-4" key={workout._id ?? index}>
              <article className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <h2 className="h5 card-title">{workout.name ?? 'Workout'}</h2>
                    {workout.difficulty && (
                      <span className="badge text-bg-primary text-capitalize">{workout.difficulty}</span>
                    )}
                  </div>
                  <p className="card-text text-secondary">{workout.description ?? 'No description provided.'}</p>
                  <dl className="row small mt-auto mb-0">
                    <dt className="col-6">Activity</dt>
                    <dd className="col-6">{workout.activityType ?? '—'}</dd>
                    <dt className="col-6">Duration</dt>
                    <dd className="col-6">{workout.durationMinutes == null ? '—' : `${workout.durationMinutes} min`}</dd>
                  </dl>
                  {workout.suggestedFor?.length > 0 && (
                    <div className="mt-3">
                      <h3 className="h6">Suggested for</h3>
                      <ul className="list-inline mb-0">
                        {workout.suggestedFor.map((athlete, athleteIndex) => (
                          <li className="list-inline-item" key={athlete?._id ?? athleteIndex}>
                            {getSuggestedAthlete(athlete)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Workouts
