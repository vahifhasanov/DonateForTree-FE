import Button from './Button.jsx'
export default function RequestState({ loading, error, retry }) {
  if (loading)
    return (
      <p className="request-state" role="status">
        Loading…
      </p>
    )
  if (error)
    return (
      <div className="request-state" role="alert">
        <p>{error}</p>
        {retry && <Button onClick={retry}>Try again</Button>}
      </div>
    )
  return null
}
