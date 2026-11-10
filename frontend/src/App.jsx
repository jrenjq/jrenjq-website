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
import sungeiIcon from './assets/sungei-road.jpg'
import govtechIcon from './assets/govtech-intern.png'
import graduationIcon from './assets/graduation.png'
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
    tags: ['Python', 'Serverless', 'AWS', 'OpenAI'],
    subtitle: 'Bot that mimics human replies: with preset personality, profile, read/typing quirks.',
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
    subtitle: 'Desktop app that forecasts upcoming dengue season via past rainfall & dengue data.',
    icon: dengueIcon,
    type: 'project',
    repo: 'https://github.com/jrenjq/Dengue-Season-Predictor',
  },
]

const articles = [
  {
    title: 'SIT ICT 2024 Graduation',
    tags: ['speech', '2024', 'video'],
    subtitle: 'Farewell speech I delivered for my university graduation: SIT ICT Class of 2024.',
    icon: graduationIcon,
    type: 'article',
    link: 'https://youtu.be/5FJ-h6TRjG0?t=4996',
  },
  {
    title: 'From the Harbour to the High Seas',
    tags: ['blog', '2023', 'article'],
    subtitle: 'Medium article written during my internship for GovTech publicity & outreach.',
    icon: govtechIcon,
    type: 'article',
    link: 'https://medium.com/@jrenjq/from-the-harbour-to-the-high-seas-776f8e6dc860',
  },
  {
    title: 'Sungei Road Forever',
    tags: ['poetry', '2016', 'PDF'],
    subtitle: 'Freeform poetry on Sungei Road Thieves Market closure. Published in VJC email list.',
    icon: sungeiIcon,
    type: 'article',
    link: 'https://drive.google.com/file/d/19xMk-GVRbCmrDy10ZIecfNpelRVdg6-J/view?usp=sharing',
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
