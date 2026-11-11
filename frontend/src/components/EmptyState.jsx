// empty lists, load errors, missing items. children = action buttons
function EmptyState({ title, text, children }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children && <div className="empty-state-actions">{children}</div>}
    </div>
  )
}

export default EmptyState
