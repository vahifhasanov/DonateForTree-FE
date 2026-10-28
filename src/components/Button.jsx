import { Link } from 'react-router-dom'
import styles from './Button.module.css'
export default function Button({
  children,
  to,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = `${styles.button} ${className}`
  return to ? (
    <Link to={to} className={classes} {...props}>
      {children}
    </Link>
  ) : (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
