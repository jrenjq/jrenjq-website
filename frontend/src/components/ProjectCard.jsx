import Card from './Card'
import { PlayIcon } from './Icons'
import githubLogo from '../assets/github.svg'

function ProjectCard({ title, subtitle, icon, tags, link, repo }) {
  return (
    <Card title={title} subtitle={subtitle} icon={icon} tags={tags} variant="blue" href={link ?? repo}>
      {link && (
        <a
          className="card-link"
          href={link}
          target="_blank"
          rel="noreferrer"
          aria-label={`Try ${title}`}
        >
          <PlayIcon />
          <span>Try Me!</span>
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
    </Card>
  )
}

export default ProjectCard