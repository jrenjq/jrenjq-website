import Card from './Card'
import { ExternalLinkIcon } from './Icons'

function ArticleCard({ title, subtitle, icon, link }) {
  return (
    <Card title={title} subtitle={subtitle} icon={icon} href={link}>
      <a
        className="card-link"
        href={link}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${title}`}
      >
        <ExternalLinkIcon />
        <span>Link</span>
      </a>
    </Card>
  )
}

export default ArticleCard