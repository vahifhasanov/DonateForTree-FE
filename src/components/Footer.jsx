import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import soil from '../../img/81QiK-godZL._AC_UF894,1000_QL80_.jpg'
import logo from '../../img/Group 5.png'
import figma from '../../img/Figma.png'
import github from '../../img/Github.png'
import youtube from '../../img/Youtube.png'
import instagram from '../../img/Instagram.png'
import linkedin from '../../img/Linkedin.png'
import twitter from '../../img/Twitter.png'
import mail from '../../img/Mail.png'
const socials = [
  [
    'Figma',
    figma,
    'https://www.figma.com/design/THwViIUeFTkTQJiuqNcHEM/donatefortree',
  ],
  ['GitHub', github, 'https://github.com/vahifhasanov/DonateForTree-FE'],
  ['YouTube', youtube],
  ['Instagram', instagram],
  ['LinkedIn', linkedin],
  ['Twitter', twitter],
  ['Email', mail],
]
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <img src={soil} className={styles.soil} alt="" />
      <p className={styles.slogan}>Be the reason someone’s life is better</p>
      <div className={styles.bottom}>
        <Link to="/" aria-label="DonateForTree home">
          <img src={logo} className={styles.logo} alt="" />
        </Link>
        <p className={styles.caption}>
          DonateForTree · Laboratory project
          <br />
          Static interface demonstration
        </p>
        <div
          className={styles.socials}
          aria-label="Project links and decorative social icons"
        >
          {socials.map(([name, source, href]) =>
            href ? (
              <a
                key={name}
                href={href}
                aria-label={name}
                target="_blank"
                rel="noreferrer"
              >
                <img src={source} alt="" />
              </a>
            ) : (
              <span key={name} title={`${name} · demo icon`}>
                <img src={source} alt="" />
              </span>
            ),
          )}
        </div>
      </div>
    </footer>
  )
}
