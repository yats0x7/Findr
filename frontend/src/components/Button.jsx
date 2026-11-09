import { Link } from 'react-router-dom'

/*
  One button for the whole app.

  - Pass `to` and it becomes a link to another page (React Router <Link>).
  - Leave `to` out and it is a normal <button> (for forms and clicks).

  variant: 'primary' | 'secondary' | 'ghost' | 'lost' | 'found'
  size:    'small' | 'medium' | 'large'

  Example: <Button to="/report" variant="lost">I lost something</Button>
*/
function Button({ to, variant = 'primary', size = 'medium', className = '', children, ...otherProps }) {
  const classes = ['button', `button-${variant}`]

  if (size !== 'medium') {
    classes.push(`button-${size}`)
  }

  if (className) {
    classes.push(className)
  }

  if (to) {
    return (
      <Link to={to} className={classes.join(' ')} {...otherProps}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes.join(' ')} {...otherProps}>
      {children}
    </button>
  )
}

export default Button
