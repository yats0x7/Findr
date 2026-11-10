/*
  The message shown when a list has nothing in it, a page can't load,
  or an item doesn't exist. `children` is for buttons or links.
*/
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
