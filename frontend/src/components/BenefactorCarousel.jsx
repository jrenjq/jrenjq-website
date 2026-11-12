import { useRef, useState, useEffect, useCallback } from 'react'
import './BenefactorCarousel.css'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

// Fisher-Yates shuffle (returns a new array)
function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function BenefactorCarousel({ items }) {
  const trackRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  // Shuffled once on mount, so the order stays stable while the page is open
  const [shuffled] = useState(() => shuffle(items))

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const scrollByPage = (dir) => {
    const el = trackRef.current
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <>
      <ul className="carousel-track" ref={trackRef}>
        {shuffled.map((b) => (
          <li className="benefactor-card" key={`${b.name}-${b.organisation}`}>
            <span
              className={`benefactor-avatar benefactor-avatar--${b.type}`}
              aria-hidden="true"
            >
              {initials(b.name)}
            </span>
            <h3>{b.name}</h3>
            <p>{b.organisation}</p>
          </li>
        ))}
      </ul>

      <nav className="pagination" aria-label="Benefactors carousel">
        <button
          type="button"
          className="pagination-btn"
          onClick={() => scrollByPage(-1)}
          disabled={!canPrev}
          aria-label="Previous benefactors"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          className="pagination-btn"
          onClick={() => scrollByPage(1)}
          disabled={!canNext}
          aria-label="Next benefactors"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </nav>
    </>
  )
}

export default BenefactorCarousel