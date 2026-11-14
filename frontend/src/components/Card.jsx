import { useState, useRef, useEffect } from 'react'
import './Card.css'

function CardIcon({ src }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'loaded' | 'error'
  const imgRef = useRef(null)

  // Reset when the source changes, and catch images that finished loading
  // (e.g. from cache) before React attached the onLoad handler
  useEffect(() => {
    setStatus(imgRef.current?.complete && imgRef.current.naturalWidth > 0 ? 'loaded' : 'loading')
  }, [src])

  return (
    <div className={`card-icon-wrap${status === 'loaded' ? '' : ' card-icon-wrap--skeleton'}`}>
      {src && status !== 'error' && (
      <img
        ref={imgRef}
        className={`card-icon${status === 'loaded' ? ' card-icon--loaded' : ''}`}
        src={src}
        alt=""
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
      )}
    </div>
  )
}

function Card({ title, subtitle, icon, href, tags, variant, children }) {
  return (
    <li className="card">
      <CardIcon src={icon} />
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