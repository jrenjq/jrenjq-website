import profileImg from './assets/profile-pic.jpg'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import sgFlag from './assets/sg-flag.svg'
import linkedinLogo from './assets/linkedin.svg'
import githubLogo from './assets/github.svg'
import instagramLogo from './assets/instagram.svg'
import emailLogo from './assets/email.svg'
import Card from './components/Card'
import './App.css'

const projects = [
  {
    title: 'Project One',
    subtitle: 'A short description of what it does',
    icon: viteLogo,
    type: 'project',
    link: 'https://github.com/mysite1',
    repo: 'https://github.com/jrenjq/project-one',
  },
  {
    title: 'Project Two',
    subtitle: 'Another whimsical tech trinket',
    icon: reactLogo,
    type: 'project',
    repo: 'https://github.com/jrenjq/project-two',
  },
]

const articles = [
  {
    title: 'Blog One',
    subtitle: 'A short description of what it does',
    icon: viteLogo,
    type: 'article',
    link: 'https://github.com/jrenjq/blog1',
  },
  {
    title: 'Blog Two',
    subtitle: 'Another article about something',
    icon: reactLogo,
    type: 'article',
    link: 'https://github.com/jrenjq/blog2',
  },
]

function App() {

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={profileImg} className="base" style={{ borderRadius: 48 }} width="170" height="179" alt="" />
        </div>
        <div>
          <h1>Ren Jiaqi<span className="subscript"><img className="flag" src={sgFlag} alt="Singapore flag" /></span></h1>
          <div className="tags">
            <button type="button" className="blue-bg-button bg-button-code">
              software engineer
            </button>
            <button type="button" className="purple-bg-button bg-button-code">
              blogger & writer
            </button>
          </div>
        </div>
        <div className="socials">
          <a className="social-tile" href="https://linkedin.com/in/jrenjq" target="_blank" rel="noreferrer">
            <img src={linkedinLogo} alt="" />
            <span>LinkedIn</span>
          </a>
          <a className="social-tile" href="https://github.com/jrenjq" target="_blank" rel="noreferrer">
            <img src={githubLogo} alt="" />
            <span>GitHub</span>
          </a>
          <a className="social-tile" href="https://instagram.com/jrenjq" target="_blank" rel="noreferrer">
            <img src={instagramLogo} alt="" />
            <span>Instagram</span>
          </a>
          <a className="social-tile" href="mailto:jrenjq@gmail.com" target="_blank" rel="noreferrer">
            <img src={emailLogo} alt="" />
            <span>Email</span>
          </a>
        </div>
      </section>

      <section id="highlights">
        <div id="projects">
          <h2>
            <svg className="icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#documentation-icon"></use>
            </svg>
            Tech Projects
          </h2>
          <p><i>fun apps i made to try now or view code</i></p>
          <ul className="card-list">
            {projects.map((project) => (
              <Card key={project.title} {...project} />
            ))}
          </ul>
        </div>
        <div id="articles">
          <h2>
            <svg className="icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#social-icon"></use>
            </svg>
            Blogs, Writings, etc.
          </h2>
          <p><i>a collection of my articles and works</i></p>
          <ul className="card-list">
            {articles.map((blog) => (
              <Card key={blog.title} {...blog} />
            ))}
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
