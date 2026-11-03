import githubLogo from '../assets/github.svg'
import './Card.css'

function Card({ title, subtitle, icon, link, repo }) {
  const mainHref = link ?? repo

  return (
    <li className="card">
      <img className="card-icon" src={icon} alt="" />
      <div className="card-info">
        <h3>
          <a className="card-main-link" href={mainHref} target="_blank" rel="noreferrer">
            {title}
          </a>
        </h3>
        <p>{subtitle}</p>
      </div>
      {(link || repo) && (
        <div className="card-actions">
          {link && (
            <a
              className="card-link"
              href={link}
              target="_blank"
              rel="noreferrer"
              aria-label={`${title} link`}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
              </svg>
              <span>Demo</span>
            </a>
          )}
          {repo && (
            <a
              className="card-link"
              href={repo}
              target="_blank"
              rel="noreferrer"
              aria-label={`${title} on GitHub`}
            >
              <img src={githubLogo} alt="" />
              <span>GitHub</span>
            </a>
          )}
        </div>
      )}
    </li>
  )
}

export default Card