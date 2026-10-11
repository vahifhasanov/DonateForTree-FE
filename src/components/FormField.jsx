import { useId, useState } from 'react'
import styles from './FormField.module.css'
export default function FormField({
  label,
  type = 'text',
  children,
  className = '',
  ...props
}) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.control}>
        {children ? (
          <select id={id} {...props}>
            {children}
          </select>
        ) : (
          <input
            id={id}
            type={type === 'password' && visible ? 'text' : type}
            {...props}
          />
        )}
        {type === 'password' && (
          <button
            type="button"
            className={styles.reveal}
            aria-label={
              visible
                ? `Hide ${label.toLowerCase()}`
                : `Show ${label.toLowerCase()}`
            }
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    </div>
  )
}
