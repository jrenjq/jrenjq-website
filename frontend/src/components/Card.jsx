import './Card.css'

function Card({ title, subtitle, icon, href, tags, variant, children }) {
  return (
    <li className="card">
      <img className="card-icon" src={icon} alt="" />
      <div className="card-info">
        <h3>
          <a className="card-main-link" href={href} target="_blank" rel="noreferrer">
            {title}
          </a>
        </h3>
        {tags?.length > 0 && (
          <ul className={`card-tags card-tags--${variant}`}>
            {tags.map((tag) => (
              <li key={tag}>
                <code className="">{tag}</code>
              </li>
            ))}
          </ul>
        )}
        <p>{subtitle}</p>
      </div>
      {children && <div className="card-actions">{children}</div>}
    </li>
  )
}

export default Card