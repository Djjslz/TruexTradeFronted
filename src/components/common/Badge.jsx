const VARIANTES = {
  trueque: 'badge',
  neutral: 'badge badge-neutral',
}

function Badge({ children, variant = 'trueque', className = '' }) {
  return (
    <span className={`${VARIANTES[variant] ?? VARIANTES.trueque} ${className}`.trim()}>
      {children}
    </span>
  )
}

export default Badge
