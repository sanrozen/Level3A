import { useEffect, useState } from 'react'

const apiBaseUrl = import.meta.env.VITE_CODESPACE_NAME
  ? `https://${import.meta.env.VITE_CODESPACE_NAME}-8000.app.github.dev`
  : 'http://localhost:8000'

function getTeams(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    for (const key of ['results', 'data', 'items', 'docs']) {
      if (key in payload) {
        return getTeams(payload[key])
      }
    }
  }

  throw new Error('The API response did not contain a list of teams.')
}

function getMemberName(member) {
  if (typeof member === 'string') {
    return member
  }

  return member?.username
    ?? [member?.firstName, member?.lastName].filter(Boolean).join(' ')
    ?? member?.name
    ?? 'Member'
}

function Teams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTeams() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${apiBaseUrl}/api/teams/`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`)
        }

        setTeams(getTeams(await response.json()))
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load teams.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadTeams()
    return () => controller.abort()
  }, [reload])

  return (
    <section aria-labelledby="teams-heading">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 id="teams-heading" className="h2 mb-1">Teams</h1>
          <p className="text-secondary mb-0">Meet the teams training together in OctoFit.</p>
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
          Loading teams…
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          <p className="mb-2">Could not load teams: {error}</p>
          <button
            className="btn btn-sm btn-outline-danger"
            type="button"
            onClick={() => setReload((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && teams.length === 0 && (
        <div className="alert alert-light border" role="status">No teams found.</div>
      )}

      {!loading && !error && teams.length > 0 && (
        <div className="row g-3">
          {teams.map((team, index) => (
            <div className="col-12 col-md-6 col-xl-4" key={team._id ?? index}>
              <article className="card h-100 shadow-sm">
                <div className="card-body">
                  <h2 className="h5 card-title">{team.name ?? 'Unnamed team'}</h2>
                  {team.motto && <p className="card-text text-secondary">{team.motto}</p>}
                  <h3 className="h6 mt-4">Members</h3>
                  {team.members?.length ? (
                    <ul className="list-group list-group-flush">
                      {team.members.map((member, memberIndex) => (
                        <li className="list-group-item px-0" key={member?._id ?? memberIndex}>
                          {getMemberName(member)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-secondary mb-0">No members listed.</p>
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

export default Teams
