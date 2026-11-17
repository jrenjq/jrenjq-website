# Frontend

React single-page site built with Vite. The projects, articles and benefactors are not hardcoded: the page fetches them from the Flask API and renders them with reusable card components.

For server setup, deployment and the backend, see the [main README](../README.md).

**Contents**

- [Structure](#structure)
- [How the data arrives](#how-the-data-arrives)
- Techniques used
  - [1. Pagination](#1-pagination)
  - [2. Responsive design](#2-responsive-design)
  - [3. CSS grid for centering and layout](#3-css-grid-for-centering-and-layout)
  - [4. Carousel](#4-carousel)
  - [5. Loading states](#5-loading-states)
- [Run locally](#run-locally)

## Structure
```
frontend/
├── vite.config.js            # dev-only proxy: /api → http://localhost:5000
└── src/
    ├── App.jsx               # page layout + useFetch for the three API lists
    ├── App.css               # page-level styles (intro, cards, socials, footer)
    ├── index.css             # global tokens (colors, fonts) + light/dark mode variables
    ├── assets/               # profile picture, logos, flag (card icons live in MongoDB)
    └── components/
        ├── Card.jsx / Card.css            # one card, with a skeleton while its icon loads
        ├── ProjectCard.jsx                # blue card: "Try!" and "Code" buttons
        ├── ArticleCard.jsx                # purple card: "Link" button
        ├── PaginatedList.jsx / .css       # arrows on desktop, "Load more" on mobile
        └── BenefactorCarousel.jsx / .css  # shuffled scroll-snap carousel with dots
```

## How the data arrives
`App.jsx` fetches each list from the API and passes it to a component:
```jsx
const API = import.meta.env.VITE_API_URL ?? ''   // empty: nginx serves the site and /api from one domain

function useFetch(path) {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch(`${API}${path}`)
      .then((r) => r.json())
      .then((rows) => setData(rows.map((r) => (r.icon ? { ...r, icon: `${API}${r.icon}` } : r))))
      .catch(console.error)
  }, [path])
  return data
}

const projects = useFetch('/api/projects')
```
In development, the Vite proxy in `vite.config.js` forwards `/api` to Flask on port 5000, so the same relative URLs work locally.
```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',    // any request starting with /api goes to Flask
    },
  },
})
```
---

## 1. Pagination

**What it is:** splitting a long list into pages, showing only one page at a time.

**Problem it solves:** the Tech Projects and Writings lists will keep growing. Rendering everything makes the page long and pushes the sections below it out of reach.

**How it works:** `PaginatedList` keeps the current `page` in state and slices the array to show 5 cards. Arrow buttons change the page, and they are disabled at the first and last page. Controls only appear when there is more than one page.
```jsx
function PagedList({ items, renderItem, pageSize }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)           // guards against the list shrinking
  const start = (currentPage - 1) * pageSize
  const visibleItems = items.slice(start, start + pageSize)

  return (
    <>
      <ul className="card-list">{visibleItems.map(renderItem)}</ul>

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
          <span aria-live="polite">{currentPage} / {totalPages}</span>
          <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
        </nav>
      )}
    </>
  )
}
```

**Keeping the height stable:** a short last page would make the section shrink and the arrows jump. The list is padded with hidden copies of a card, so every page takes the same space.
```jsx
const fillerCount = totalPages > 1 ? pageSize - visibleItems.length : 0

{Array.from({ length: fillerCount }, (_, i) => (
  <li key={`filler-${i}`} className="card-placeholder" aria-hidden="true">
    <ul className="card-list">{renderItem(items[0])}</ul>
  </li>
))}
```
```css
.card-placeholder { visibility: hidden; pointer-events: none; }   /* takes space, can't be seen or clicked */
```

---

## 2. Responsive design

**What it is:** one codebase that adapts its layout to the screen size.

**Problem it solves:** the site has to work on a wide laptop and on a phone. Page arrows are awkward on mobile, and two side-by-side sections are too cramped on a narrow screen.

**How it works:** there is one main breakpoint, `1024px`, used in two places.

**In CSS**, media queries change layout, spacing and type size:
```css
#highlights {
  display: flex;                       /* projects | articles, side by side */
  @media (max-width: 1024px) {
    flex-direction: column;            /* stacked on mobile */
  }
}

h1 {
  font-size: 56px;
  @media (max-width: 1024px) { font-size: 36px; }
}
```

**In React**, CSS can't swap one behavior for another, so a hook asks the browser whether the screen is "mobile" and renders a different component. On narrow screens the arrows are replaced by a "Load more" button that adds 5 cards per tap.
```jsx
const MOBILE_QUERY = '(max-width: 1024px)'          // same breakpoint as the CSS

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)        // updates live when resizing or rotating
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
        <button onClick={() => setVisibleCount((c) => c + pageSize)}>Load more</button>
      )}
    </>
  )
}

function PaginatedList({ items, renderItem, pageSize = 5 }) {
  const isMobile = useIsMobile()
  const Mode = isMobile ? LoadMoreList : PagedList
  return <Mode items={items} renderItem={renderItem} pageSize={pageSize} />
}
```
The two modes are **separate components**, so switching between them remounts one with fresh state. Earlier, one component held both a `page` and a `visibleCount`, and the stale values from one mode showed up in the other.

Smaller breakpoints handle finer details:
```css
.socials { grid-template-columns: repeat(4, minmax(0, 120px)); }
@media (max-width: 768px) { .socials { grid-template-columns: repeat(2, 120px); } }

@media (max-width: 480px) { .card-link span { display: none; } }   /* icon-only buttons on small phones */
```

Colors are CSS variables, redefined under `prefers-color-scheme: dark`, so the site follows the visitor's light or dark setting without any JavaScript.

---

## 3. CSS grid for centering and layout

**What it is:** CSS grid divides an element into columns and rows, and places children into them.

**Problem it solves:** putting the Singapore flag after the name in the same line makes the name and flag centered as one unit, which pushes "Ren Jiaqi" to the left of the page center. The two tag buttons, which have different widths, have the same problem: centered as a pair, the gap between them is off-center. The original fix was a manual `margin-right` nudge.

**Name and flag:** a `1fr auto 1fr` grid puts the name in the middle column, which is only as wide as the text. The two side columns split the remaining space equally, so the name is exactly centered. The flag sits in the third column beside it.
```jsx
<h1 className="name-row">
  <span className="name">Ren Jiaqi</span>
  <span className="subscript"><img className="flag" src={sgFlag} alt="Singapore flag" /></span>
</h1>
```
```css
.name-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
.name-row .name { grid-column: 2; }                                   /* always in the exact center */
.name-row .subscript { grid-column: 3; justify-self: start; margin-left: 6px; }
```

**Tag buttons:** two equal columns meet at the page center, and each button hugs the middle gap.
```css
.tags { display: grid; grid-template-columns: 1fr 1fr; column-gap: 12px; }
.tags button:first-child { justify-self: end; }
.tags button:last-child  { justify-self: start; }
```

Grid is also used for the social tiles (4 per row, 2 on small screens) and for the two-row carousel on mobile.

---

## 4. Carousel

**What it is:** a horizontally scrolling row of cards, with arrows and page dots.

**Problem it solves:** the benefactors list is a set of small cards that would take a lot of vertical space as a column. A carousel fits them in one row. Since only the first few are visible without scrolling, the order is shuffled so that every benefactor has a chance to appear first.

**Scrolling:** a flex row with `overflow-x: auto` and CSS scroll-snap. It swipes natively on touch screens, and snaps to card edges.
```css
.carousel-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;       /* swipe snaps to card edges */
  scrollbar-width: none;
}
.benefactor-card { flex: 0 0 220px; scroll-snap-align: start; }
```

**Random order:** a Fisher-Yates shuffle, stored with `useMemo` so it only changes when the data changes, not on every re-render:
```jsx
function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const shuffled = useMemo(() => shuffle(items), [items])
```

**Arrows and dots:** both are derived from the scroll position, so they stay correct whatever the layout or screen size. One page is one visible width of cards. The arrows scroll about 80% of the visible width.
```jsx
const update = useCallback(() => {
  const el = trackRef.current
  const maxScroll = el.scrollWidth - el.clientWidth

  setCanPrev(el.scrollLeft > 4)
  setCanNext(el.scrollLeft < maxScroll - 4)

  const pages = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.01))
  setPageCount(pages)
  setActivePage(Math.round((maxScroll > 0 ? el.scrollLeft / maxScroll : 0) * (pages - 1)))
}, [])

useEffect(() => {
  const el = trackRef.current
  update()
  el.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)          // recount pages when the layout changes
  return () => {
    el.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
  }
}, [update, shuffled])

const scrollByPage = (dir) =>
  trackRef.current.scrollBy({ left: dir * trackRef.current.clientWidth * 0.8, behavior: 'smooth' })
```
The dots are plain indicators, not buttons:
```jsx
<div className="carousel-dots" role="img" aria-label={`Page ${activePage + 1} of ${pageCount}`}>
  {Array.from({ length: pageCount }, (_, i) => (
    <span key={i} className={`carousel-dot${i === activePage ? ' carousel-dot--active' : ''}`} />
  ))}
</div>
```

**Two rows on mobile:** switching to a column-flowing grid cuts the horizontal scrolling roughly in half. The arrows and dots need no changes, because they are calculated from the scroll size.
```css
@media (max-width: 1024px) {
  .carousel-track {
    display: grid;
    grid-template-rows: repeat(2, auto);
    grid-auto-flow: column;            /* fill top-to-bottom, then move right */
    grid-auto-columns: 200px;
  }
  .benefactor-card { flex: none; }     /* flex sizing no longer applies inside a grid */
}
```

**Avatar initials:** the circle shows the last two words of the name, so titles such as "Dr" or "Mr" don't become the initials. The color depends on the benefactor's `type`.
```jsx
const initials = (name) =>
  name.split(' ').filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join('')

<span className={`benefactor-avatar benefactor-avatar--${b.type}`}>{initials(b.name)}</span>
```
```css
.benefactor-avatar--people       { color: var(--purple); background: var(--purple-bg); }
.benefactor-avatar--organisation { color: var(--blue);   background: var(--blue-bg); }
```

---

## 5. Loading states

**What it is:** a placeholder shown while content is still arriving.

**Problem it solves:** card icons are served by the API, not bundled with the page. On a slow first load, they pop in one by one and the layout looks broken. If one fails, the browser would show a broken-image icon.

**How it works:** each card icon sits in a fixed 40px box. While the image is loading (or if it fails), the box shows a shimmering grey gradient. When the image loads it fades in on top.
```jsx
function CardIcon({ src }) {
  const [status, setStatus] = useState('loading')     // 'loading' | 'loaded' | 'error'
  const imgRef = useRef(null)

  // catches images that finished loading from cache before onLoad was attached
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
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  )
}
```
```css
.card-icon-wrap { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; }

.card-icon-wrap--skeleton {
  background: linear-gradient(90deg, var(--border) 25%, var(--code-bg) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

.card-icon { width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity 0.3s; }
.card-icon--loaded { opacity: 1; }

@keyframes skeleton-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

@media (prefers-reduced-motion: reduce) { .card-icon-wrap--skeleton { animation: none; } }
```
The skeleton uses the site's color variables, so it works in light and dark mode. People who have reduced motion turned on in their system settings get a static box.

---

## Run locally
```
npm install
npm run dev        # Vite dev server, proxying /api to Flask on port 5000
bash pushsync.sh   # pushes DEV code, builds and syncs build files only with PROD repo
```
The Flask backend must be running for the lists to load. See the [main README](../README.md) for local setup and deployment.
