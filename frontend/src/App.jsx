import profileImg from './assets/profile-pic.jpg'
import sgFlag from './assets/sg-flag.svg'
import linkedinLogo from './assets/linkedin.svg'
import githubLogo from './assets/github.svg'
import instagramLogo from './assets/instagram.svg'
import emailLogo from './assets/email.svg'
import blogLogo from './assets/blog.svg'
import codeLogo from './assets/code.svg'
import ProjectCard from './components/ProjectCard'
import ArticleCard from './components/ArticleCard'
import PaginatedList from './components/PaginatedList'
import BenefactorCarousel from './components/BenefactorCarousel'
import { useState, useEffect } from 'react'
import './App.css'

// Empty in development (the Vite proxy handles /api); the backend URL in production
const API = import.meta.env.VITE_API_URL ?? ''

function useFetch(path) {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch(`${API}${path}`)
      .then((r) => r.json())
      .then((rows) =>
        // API returns relative image paths like /api/images/<id>, so prefix them
        setData(rows.map((r) => (r.icon ? { ...r, icon: `${API}${r.icon}` } : r)))
      )
      .catch(console.error)
  }, [path])

  return data
}

function App() {
  const projects = useFetch('/api/projects')
  const articles = useFetch('/api/articles')
  const benefactors = useFetch('/api/benefactors')

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={profileImg} className="base" style={{ borderRadius: 48 }} width="170" height="179" alt="" />
        </div>
        <div className="intro">
          <h1 className="name-row">
            <span className="name">Ren Jiaqi</span>
            <span className="subscript">
              <img className="flag" src={sgFlag} alt="Singapore flag" />
            </span>
          </h1>
          <div className="tags">
            <button type="button" className="blue-bg-button bg-button-code">
              software engineer
            </button>
            <button type="button" className="purple-bg-button bg-button-code">
              writer quest-er
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
            <img className="icon" src={codeLogo} alt="" />
            Tech Projects
          </h2>
          <p><i>software apps and whimsical builds</i></p>
          <PaginatedList
            items={projects}
            pageSize={5}
            renderItem={(project) => <ProjectCard key={project.id} {...project} />}
          />
        </div>
        <div id="articles">
          <h2>
            <img className="icon" src={blogLogo} alt="" />
            Writings & Quests
          </h2>
          <p><i>collection of articles and adventures</i></p>
          <PaginatedList
            items={articles}
            pageSize={5}
            renderItem={(article) => <ArticleCard key={article.id} {...article} />}
          />
        </div>
      </section>

      <section id="benefactors">
        <h2>🙏Benefactors</h2>
        <p><i>generous organisations & supportive figures</i></p>
        <BenefactorCarousel items={benefactors} />
      </section>

      <section id="spacer"></section>
    </>
  )
}

export default App