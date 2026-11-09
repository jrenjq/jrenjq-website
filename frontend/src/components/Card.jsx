import './Card.css'

function Card({ title, subtitle, icon, href, children }) {
  return (
    <li className="card">
      <img className="card-icon" src={icon} alt="" />
      <div className="card-info">
        <h3>
          <a className="card-main-link" href={href} target="_blank" rel="noreferrer">
            {title}
          </a>
        </h3>
        <p>{subtitle}</p>
      </div>
      {children && <div className="card-actions">{children}</div>}
    </li>
  )
}

export default Card