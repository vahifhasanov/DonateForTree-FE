import { useEffect, useState } from 'react'
import './index.css'

function App() {
  const [quantity, setQuantity] = useState(1)
  const [purchasedTrees, setPurchasedTrees] = useState(0)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [totalTrees, setTotalTrees] = useState(2152)

  useEffect(() => {
    const savedTrees = Number(localStorage.getItem('treesPurchased')) || 0
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPurchasedTrees(savedTrees)

    const interval = setInterval(() => {
      setTotalTrees((current) => current + Math.floor(Math.random() * 3) + 1)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const openBuyModal = () => {
    setQuantity(1)
    setBuyModalOpen(true)
  }

  const closeBuyModal = () => {
    setBuyModalOpen(false)
  }

  const openTrackModal = () => {
    setTrackModalOpen(true)
  }

  const closeTrackModal = () => {
    setTrackModalOpen(false)
  }

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1))
  }

  const increaseQuantity = () => {
    setQuantity((current) => current + 1)
  }

  const changeQuantity = (event) => {
    const value = Number(event.target.value)

    if (!Number.isNaN(value)) {
      setQuantity(Math.max(1, value))
    }
  }

  const buyTrees = () => {
    const newTotal = purchasedTrees + quantity

    setPurchasedTrees(newTotal)
    localStorage.setItem('treesPurchased', newTotal)
    setBuyModalOpen(false)
  }

  const resetTrees = () => {
    setPurchasedTrees(0)
    localStorage.removeItem('treesPurchased')
  }

  return (
    <>
      <header className="header">
        <div className="container header-row">
          <div className="logo">
            <img src="/img/333333.png" height="80" alt="" />
          </div>

          <nav className="nav left">
            <a href="#home">home</a>
            <a href="#info">info</a>
          </nav>

          <div className="spacer"></div>

          <nav className="nav right">
            <a href="#features">your trees</a>
            <a href="#about">about us</a>
          </nav>
        </div>
      </header>

      <img
        src="/img/tree.png"
        alt="tree"
        className="tree"
        onClick={openBuyModal}
      />

      <main>
        <section id="home" className="home">
          <div className="container">
            <div className="tree-callout">
              CLICK ON THE
              <br />
              TREE FOR
              <br />
              DONATION
            </div>

            <div className="plant">
              <img src="/img/plant.png" alt="plant" height="50" />
            </div>

            <div className="login-box">
              <h1 className="login-title">Login</h1>

              <form
                className="login-form"
                onSubmit={(event) => event.preventDefault()}
              >
                <label>
                  <input
                    className="field"
                    type="text"
                    placeholder="FIRST name *"
                  />
                </label>

                <label>
                  <input
                    className="field"
                    type="text"
                    placeholder="LAST name *"
                  />
                </label>

                <label>
                  <input className="field" type="email" placeholder="email *" />
                </label>

                <button className="submit" type="submit" aria-label="Submit">
                  <span className="arrow"></span>
                </button>
              </form>
            </div>
          </div>
        </section>

        <section id="info" className="info-block">
          <div className="info-inner">
            <h2 className="info-title">
              THERE IS A NEW WAY TO MAKE OUR COUNTRY MORE GREEN
              <br />
              WE ARE PRETEND TO SHOW YOU
            </h2>

            <img
              src="/img/ppl.png"
              alt="ppl-img"
              className="ppl-img"
              height="435"
            />

            <ul className="info-list">
              <li>Planting online</li>
              <li>Watch all about your profit</li>
              <li>Track your trees</li>
              <li>Help our country</li>
              <li>Do more</li>
            </ul>

            <div className="center-stick"></div>
          </div>
        </section>

        <img
          src="/img/triangle.png"
          alt="triangle"
          className="triangle"
          height="50"
        />

        <img src="/img/bird.png" alt="bird" className="bird" height="150" />

        <section className="features" id="features">
          <div className="features-row">
            <div className="features-left">
              <p>
                <span>
                  you can track
                  <br />
                  all info about
                  <br />
                  your trees
                </span>
              </p>
            </div>

            <div className="features-mid">
              <button
                className="features-btn"
                type="button"
                onClick={openTrackModal}
              >
                TRACK
              </button>
            </div>

            <div className="features-right">
              <div className="features-count-title">Trees count</div>
              <div className="features-count-num" id="totalTreesCount">
                {totalTrees}
              </div>
            </div>
          </div>
        </section>

        <section className="about" id="about">
          <div className="about-content">
            <h2 className="about-title">
              We are from Ukraine
              <br />
              Uzhgorod
            </h2>

            <p className="about-sub">
              Our CEO is Vagif Hasanov Iqam ogli
              <br />
              And his team is from uzhn
            </p>

            <p className="about-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
              iaculis nisl sit amet ullamcorper fermentum. Nunc quis egestas
              dui, nec
              <br />
              faucibus massa. Proin id massa quis nulla maximus viverra vel sit
              amet ante. Aliquam neque enim, porttitor vel quam ut, tristique
              semper
              <br />
              augue. Curabitur vel leo at erat vulputate tincidunt. Mauris
              malesuada, eros in fermentum pulvinar, leo ante maximus ex, ac
              laoreet erat
              <br />
              dui in lectus. sagittis mattis. Sed erat est, porta eget dolor sit
              amet, laoreet volutpat neque. Ut a sagittis ex, ut congue arcu.
            </p>
          </div>
        </section>

        <img className="flag" src="/img/flag.png" alt="Ukraine flag" />
      </main>

      <footer id="footer" className="footer">
        <div className="footer-inner">
          <div className="footer-slogan">
            Be the reason someones life is better
          </div>

          <div className="footer-bottom">
            <div className="footer-left">
              <img className="footer-logo" src="/img/Group 5.png" alt="Vgas" />

              <div className="footer-text">
                A 501(c)(3) Non-Profit Organization
                <br />
                Accredited by United Nations (UNCCD)
              </div>
            </div>

            <div className="footer-icons">
              <a
                href="https://www.figma.com/design/THwViIUeFTkTQJiuqNcHEM/donatefortree?node-id=0-1&t=Na4Gy2yBLy9jt713-1"
                target="_blank"
                rel="noreferrer"
                aria-label="Figma"
              >
                <img src="/img/Figma.png" alt="" />
              </a>

              <a
                href="https://github.com/vagifgame"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <img src="/img/Github.png" alt="" />
              </a>

              <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <img src="/img/Youtube.png" alt="" />
              </a>

              <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <img src="/img/Instagram.png" alt="" />
              </a>

              <a
                href="https://www.linkedin.com/in/vagif-gasanov-459480385/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <img src="/img/Linkedin.png" alt="" />
              </a>

              <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
              >
                <img src="/img/Twitter.png" alt="" />
              </a>

              <a href="mailto:vagifgame@gmail.com" aria-label="Mail">
                <img src="/img/Mail.png" alt="" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {buyModalOpen && (
        <div className="modal" id="buyModal" aria-hidden="false">
          <div className="modal-backdrop" onClick={closeBuyModal}></div>

          <div className="modal-card" role="dialog" aria-modal="true">
            <button
              className="modal-close"
              type="button"
              onClick={closeBuyModal}
            >
              ✕
            </button>

            <h3 className="modal-title">Buy a tree</h3>
            <p className="modal-sub">Choose quantity:</p>

            <div className="qty">
              <button
                className="qty-btn"
                type="button"
                id="qtyMinus"
                onClick={decreaseQuantity}
              >
                −
              </button>

              <input
                className="qty-input"
                id="qtyInput"
                type="number"
                min="1"
                value={quantity}
                onChange={changeQuantity}
              />

              <button
                className="qty-btn"
                type="button"
                id="qtyPlus"
                onClick={increaseQuantity}
              >
                +
              </button>
            </div>

            <button
              className="buy-btn"
              id="buyBtn"
              type="button"
              onClick={buyTrees}
            >
              Buy <span id="qtyText">{quantity}</span> tree(s)
            </button>
          </div>
        </div>
      )}

      {trackModalOpen && (
        <div className="modal" id="trackModal" aria-hidden="false">
          <div className="modal-backdrop" onClick={closeTrackModal}></div>

          <div className="modal-card" role="dialog" aria-modal="true">
            <button
              className="modal-close"
              type="button"
              onClick={closeTrackModal}
            >
              ✕
            </button>

            <h3 className="modal-title">Your trees</h3>

            <p className="modal-sub">
              You have bought:{' '}
              <b>
                <span id="myTreesCount">{purchasedTrees}</span>
              </b>{' '}
              tree(s)
            </p>

            <button className="buy-btn" type="button" onClick={closeTrackModal}>
              OK
            </button>

            <p>Just test? You can reset your trees</p>

            <button
              className="buy-btn reset-btn"
              type="button"
              id="resetTrees"
              onClick={resetTrees}
            >
              Reset my trees
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
