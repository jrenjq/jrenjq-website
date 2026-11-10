import profileImg from './assets/profile-pic.jpg'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import sgFlag from './assets/sg-flag.svg'
import linkedinLogo from './assets/linkedin.svg'
import githubLogo from './assets/github.svg'
import instagramLogo from './assets/instagram.svg'
import emailLogo from './assets/email.svg'
import miniSentry from './assets/minisentry.png'
import morseCode from './assets/morse-code.png'
import botIcon from './assets/bot.png'
import snakeIcon from './assets/snakegame.png'
import dengueIcon from './assets/stopdengue.jpg'
import './App.css'
import ProjectCard from './components/ProjectCard'
import ArticleCard from './components/ArticleCard'

const projects = [
  {
    title: 'Telegram Moderator Bot',
    tags: ['Golang', 'Claude'],
    subtitle: 'Bot that uses Claude API to evaluate & delete vulgar texts on uni telegram group.',
    icon: miniSentry,
    type: 'project',
    repo: 'https://github.com/jrenjq/TelegramAutoModerator',
  },
  {
    title: 'Morse Code Decoder',
    tags: ['C'],
    subtitle: 'Translates morse code input (.-/) into english text: C struct, union, lib exercise.',
    icon: morseCode,
    type: 'project',
    repo: 'https://github.com/jrenjq/C-Morse-Code-Decoder',
  },
  {
    title: 'Telegram Character Bot',
    tags: ['Python', 'AWS', 'Serverless', 'OpenAI'],
    subtitle: 'Bot that mimics human replies: preset personality, profile, read/typing quirks.',
    icon: botIcon,
    type: 'project',
    repo: 'https://github.com/jrenjq/Character-Roleplay-Automatic-Bots-Telegram',
  },
  {
    title: 'Snake Game Clone',
    tags: ['C++', 'Java'],
    subtitle: 'Snake game cloned in both C++ and Java: from a uni team assignment.',
    icon: snakeIcon,
    type: 'project',
    repo: 'https://github.com/jrenjq/Snake-Game-Clone',
  },
  {
    title: 'Dengue Season Predictor',
    tags: ['Python', 'Tkinter', 'SciPy', 'Data.Gov.Sg'],
    subtitle: 'Desktop app that forecasts upcoming dengue season via historic rainfall & dengue data.',
    icon: dengueIcon,
    type: 'project',
    repo: 'https://github.com/jrenjq/Dengue-Season-Predictor',
  },
]

const articles = [
  {
    title: 'Blog One',
    tags: ['c', 'java', 'c++'],
    subtitle: 'A short description of what it does A short description of what it does',
    icon: viteLogo,
    type: 'article',
    link: 'https://github.com/jrenjq/blog1',
  },
  {
    title: 'Blog Two',
    tags: ['c', 'java', 'c++'],
    subtitle: 'Another article about something Another article about something',
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
              writer & quester
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
          <p><i>software apps and whimsical builds</i></p>
          <ul className="card-list">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </ul>
        </div>
        <div id="articles">
          <h2>
            <svg className="icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#social-icon"></use>
            </svg>
            Writings & Quests
          </h2>
          <p><i>collection of articles and adventures</i></p>
          <ul className="card-list">
            {articles.map((article) => (
              <ArticleCard key={article.title} {...article} />
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
