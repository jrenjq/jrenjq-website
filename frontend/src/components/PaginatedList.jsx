import { useState, useEffect } from 'react'
import './PaginatedList.css'

const MOBILE_QUERY = '(max-width: 1024px)'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

function LoadMoreList({ items, renderItem, pageSize }) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const hasMore = visibleCount < items.length

  return (
    <>
      <ul className="card-list">{items.slice(0, visibleCount).map(renderItem)}</ul>
      {hasMore && (
        <button
          type="button"
          className="load-more-btn"
          onClick={() => setVisibleCount((c) => c + pageSize)}
        >
          Load more
        </button>
      )}
    </>
  )
}

function PagedList({ items, renderItem, pageSize }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const visibleItems = items.slice(start, start + pageSize)
  const fillerCount = totalPages > 1 ? pageSize - visibleItems.length : 0

  return (
    <>
      <ul className="card-list">
        {visibleItems.map(renderItem)}
        {Array.from({ length: fillerCount }, (_, i) => (
          <li key={`filler-${i}`} className="card-placeholder" aria-hidden="true">
            <ul className="card-list">{renderItem(items[0])}</ul>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <span className="pagination-page" aria-live="polite">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            className="pagination-btn"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </nav>
      )}
    </>
  )
}

function PaginatedList({ items, renderItem, pageSize = 5 }) {
  const isMobile = useIsMobile()
  const Mode = isMobile ? LoadMoreList : PagedList
  return <Mode items={items} renderItem={renderItem} pageSize={pageSize} />
}

export default PaginatedList