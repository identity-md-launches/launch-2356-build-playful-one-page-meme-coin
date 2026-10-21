import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { Icon, RobotMark } from './icons';
import { launch } from './config';
import robot from './assets/dongle.webp';

const filmSeenKey = 'dongle-film-seen';

const specs = [
  ['Actuator travel', '2 mm', 'Every millimeter counts.'],
  ['Confidence output', '9,000 RPM', 'Absolutely no load testing.'],
  ['Practical application', '0%', 'A feature, according to him.'],
  ['Torque rating', 'Astronomical*', '*Self-reported.'],
  ['Power source', 'Pure conviction', 'USB compatibility pending.'],
  ['Emotional stability', 'Industrial grade', 'Dimensionally challenged only.'],
];

type DialogKind = 'notice' | 'share' | null;

function TestNotice() {
  return <p className="test-token-notice"><strong>JUST A TEST TOKEN</strong><span>Launched only to test the platform.</span></p>;
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [testRuns, setTestRuns] = useState(0);
  const [testing, setTesting] = useState(false);
  const modal = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const testTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const film = useRef<HTMLDialogElement>(null);
  const filmVideo = useRef<HTMLVideoElement>(null);
  const filmTrigger = useRef<HTMLElement | null>(null);
  const filmNext = useRef<'notice' | null>(null);
  const heroNotice = useRef<HTMLButtonElement>(null);

  const shareText = '$DONGLE was just a TEST TOKEN, launched only to test the platform.';
  const shareUrl = new URL(window.location.href);
  shareUrl.hash = '';
  const xShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl.href)}`;
  const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(shareUrl.href)}&text=${encodeURIComponent(shareText)}`;

  useEffect(() => {
    if (dialog && modal.current && !modal.current.open) modal.current.showModal();
  }, [dialog]);

  useEffect(() => {
    const overflow = document.body.style.overflow;
    if (dialog) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [dialog]);

  useEffect(() => () => { if (testTimer.current) clearTimeout(testTimer.current); }, []);

  // The field-test film greets each new session. Reduced motion opens it paused on its poster.
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(filmSeenKey) === '1'; } catch { /* storage blocked: show the film */ }
    if (!seen) openFilm(null);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        document.getElementById('menu-toggle')?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);

  function openDialog(kind: Exclude<DialogKind, null>) {
    lastTrigger.current = document.activeElement as HTMLElement;
    setCopyStatus('');
    setDialog(kind);
    setMenuOpen(false);
  }

  function closeDialog() {
    modal.current?.close();
  }

  function openFilm(trigger: HTMLElement | null) {
    const dialogEl = film.current;
    const video = filmVideo.current;
    if (!dialogEl || !video || dialogEl.open) return;
    filmTrigger.current = trigger;
    filmNext.current = null;
    dialogEl.showModal();
    document.body.style.overflow = 'hidden';
    video.currentTime = 0;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) void video.play().catch(() => {});
  }

  function closeFilm() {
    film.current?.close();
  }

  function handleFilmClosed() {
    filmVideo.current?.pause();
    document.body.style.overflow = '';
    try { sessionStorage.setItem(filmSeenKey, '1'); } catch { /* storage blocked */ }
    if (filmNext.current === 'notice') {
      filmNext.current = null;
      lastTrigger.current = heroNotice.current;
      setCopyStatus('');
      setDialog('notice');
    } else {
      filmTrigger.current?.focus();
    }
  }

  function noticeFromFilm() {
    filmNext.current = 'notice';
    closeFilm();
  }

  function closeOnBackdrop(event: ReactMouseEvent<HTMLDialogElement>, close: () => void) {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  }

  function handleClosed() {
    setDialog(null);
    setCopyStatus('');
    lastTrigger.current?.focus();
  }

  function containDialogFocus(event: ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled)');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  async function copy(value: string, success: string, failure = 'Clipboard unavailable. Select and copy the text below.') {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(success);
    } catch {
      setCopyStatus(failure);
    }
  }

  function runTest() {
    if (testing) return;
    setTesting(true);
    testTimer.current = setTimeout(() => {
      setTesting(false);
      setTestRuns((runs) => runs + 1);
    }, 1000);
  }

  function navigateToContract() {
    closeDialog();
    window.location.hash = 'contract';
    requestAnimationFrame(() => document.getElementById('contract-heading')?.focus({ preventScroll: true }));
  }

  const testMessage = testing
    ? 'Simulating all 2 mm of travel…'
    : testRuns > 0
      ? ['Test complete. 2 mm traveled. Ego unchanged.', 'Mountains moved: 0. Confidence: still 9,000 RPM.', 'USB connection failed. Blaming the USB port.'][(testRuns - 1) % 3]
      : 'Stand clear. This is a very small demonstration.';

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header shell">
        <a className="brand" href="#" aria-label="$DONGLE home"><RobotMark /><span>$DONGLE<span className="brand-dot">®</span></span></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#story">The story</a><a href="#specs">Technical specs</a><a href="#manifesto">Manifesto</a>
        </nav>
        <a className="header-join" href="#main">Read the notice <Icon name="arrowUp" /></a>
        <button id="menu-toggle" className="icon-button menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        {menuOpen && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
          {[['The story', 'story'], ['Technical specs', 'specs'], ['Manifesto', 'manifesto'], ['Share the notice', 'community']].map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}<Icon name="arrow" /></a>)}
        </nav>}
      </header>

      <main id="main">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title"><span>$DONGLE.</span><span>JUST A</span><span className="accent">TEST TOKEN.</span></h1>
            <p className="hero-description">$DONGLE was launched only to test the platform.</p>
            <div className="hero-actions">
              <button ref={heroNotice} className="button primary" type="button" onClick={() => openDialog('notice')}>Read the test-token notice <Icon name="arrow" /></button>
              <a className="spec-link" href="#specs">Explore the robot <Icon name="arrow" /></a>
            </div>
            <p className="hero-footnote"><span className="status-dot" />Platform testing only.</p>
          </div>

          <div className="hero-visual" aria-label="Meet Dongle, the tiny robot">
            <div className="artboard grid-paper">
              <div className="artboard-top"><span className="mono">DNG–001 / FRONT VIEW</span><span className="mono">SCALE 100:1</span></div>
              <span className="art-corner top-left" /><span className="art-corner top-right" /><span className="art-corner bottom-left" /><span className="art-corner bottom-right" />
              <button className="film-trigger" type="button" onClick={(event) => openFilm(event.currentTarget)}><Icon name="play" /><span className="film-trigger-label">Play the film</span></button>
              <div className="orbit" aria-hidden="true" />
              <img className="hero-robot" src={robot} width="1000" height="1048" alt="Dongle: a tiny orange factory robot with angry, determined eyes, a huge yellow hard hat, and a comically small silver actuator." fetchPriority="high" />
              <div className="annotation helmet-note"><span>Oversized helmet.</span><span>Undersized everything else.</span><svg viewBox="0 0 90 46" aria-hidden="true"><path d="M1 1h48l38 42" /><circle cx="87" cy="43" r="2" /></svg></div>
              <div className="measurement mono" aria-hidden="true"><span />2 mm<span /></div>
              <div className="inspection-stamp"><Icon name="warning" /><span>CAUTION<br /><strong>UNREASONABLE<br />CONFIDENCE</strong></span></div>
              <div className="artboard-bottom mono"><span><span className="status-dot" />EGO SYSTEMS ONLINE</span><span>FIG. 01</span></div>
            </div>
          </div>
        </section>

        <div className="spec-strip shell" aria-label="At a glance">
          <div><span className="stat-number">2<span className="stat-unit">mm</span></span><span>of travel</span><svg className="strip-mark ruler" viewBox="0 0 48 24" aria-hidden="true"><path d="M2 20h44M2 20V5m11 15v-8m11 8V5m11 15v-8m11 8V5" /></svg></div>
          <div><span className="stat-number">9000<span className="stat-unit">RPM</span></span><span>confidence</span><Icon name="bolt" /></div>
          <div><span className="stat-number">0<span className="stat-unit">%</span></span><span>practical use</span><span className="strip-mark crossed-circle" aria-hidden="true">∅</span></div>
          <p>micro hardware.<br /><strong>macro ego.</strong></p>
        </div>

        <section className="story-section shell section-space" id="story" aria-labelledby="story-heading">
          <TestNotice />
          <div className="story-visual grid-paper" aria-hidden="true">
            <div className="blueprint-caption mono">ENGINEERING A MINOR INCONVENIENCE</div>
            <svg className="usb-blueprint" viewBox="0 0 440 300" fill="none">
              <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                <path d="m55 143 100-58 108 62-100 59zM55 143v58l108 62 100-58v-58M163 206v57" />
                <path d="m55 143-17-10v58l17 10m100-116-17-10L38 133m100-58 108 62 17 10M78 145l78-44 83 48-77 44z" />
                <path d="m89 147 25-14 13 8-25 14zm41-23 25-14 14 8-25 14zm-17 37 25-15 14 8-26 15zm41-24 25-15 14 8-26 15z" fill="currentColor" />
                <path d="m263 163 55-32 69 40-55 32-22-13m8-59v24l46 27M387 171v27l-55 32-37-21m37-6v27M312 145l-16-10m7 26-16-10M263 191l21 12" />
                <path d="M316 104V79h71v65m-71-52h71M316 90l5-5m-5 5 5 5m66-5-5-5m5 5-5 5M32 223l-7 4v-73m-5 0h10m-10 73h10" />
                <path d="m278 90 7-11m-5 23 18-6m-21-18-2-16" strokeWidth="3" />
                <path d="M43 268h217M272 268h125" strokeDasharray="4 5" />
              </g>
              <g fill="currentColor" fontFamily="monospace" fontSize="12"><text x="326" y="74">2 mm gap</text><text x="65" y="287">PROBLEM: RECTANGLE</text><text x="285" y="255">ALSO RECTANGLE</text></g>
            </svg>
            <div className="blueprint-bottom"><span className="mono">CONNECTION ATTEMPT #4</span><span className="failed-label"><Icon name="close" />Still upside down</span></div>
          </div>
          <div className="story-copy">
            <h2 id="story-heading">Built to move mountains.<br /><span className="muted-heading">Currently struggles<br className="desktop-break" /> with a USB port.</span></h2>
            <p>Somewhere in a very serious robotics lab, a very unserious engineering error was born. They gave him a mountain-moving mission. And approximately 2 mm to work with.</p>
            <p>He has not let that stop him. He has also not started.</p>
            <p className="story-signoff">The robot is fictional. The token was a platform test.</p>
          </div>
        </section>

        <section className="tech-section section-space" id="specs" aria-labelledby="specs-heading">
          <div className="shell">
            <TestNotice />
            <div className="section-heading-row"><div><h2 id="specs-heading">Fictional robot specifications.</h2><p>A playful engineering sheet for a fictional robot.</p></div><span className="technical-tag mono"><Icon name="warning" />Entirely fictional specifications</span></div>
            <div className="tech-layout">
              <div className="spec-table" role="table" aria-label="Fictional engineering specifications">
                <div className="spec-table-head" role="row"><span role="columnheader">Parameter</span><span role="columnheader">Factory specification</span></div>
                {specs.map(([parameter, value, note]) => <div className="spec-row" role="row" key={parameter}><span role="rowheader">{parameter}</span><div role="cell"><strong>{value}</strong><span>{note}</span></div></div>)}
              </div>
              <div className="test-panel">
                <div className="test-panel-header"><span><span className="status-dot" />Actuator test bench</span><Icon name="bolt" /></div>
                <div className={`piston-demo ${testing ? 'is-testing' : ''}`} aria-hidden="true">
                  <div className="piston-housing"><div className="housing-band" /><div className="housing-bolt top" /><div className="housing-bolt bottom" /><div className="piston-shaft" /><div className="piston-tip" /></div>
                  <div className="demo-measure mono">← 2 mm →</div>
                </div>
                <div className="test-readout"><span className="mono">Travel distance</span><strong>{testing ? '…' : testRuns > 0 ? '2.00' : '0.00'} <span>mm</span></strong></div>
                <button className="button test-button" type="button" onClick={runTest} disabled={testing}><Icon name={testing ? 'bolt' : 'play'} />{testing ? 'Running simulation…' : testRuns > 0 ? 'Run it again' : 'Run a torque test'}</button>
                <p className="test-status" role="status">{testMessage}</p>
                <span className="simulation-note">A highly unscientific simulation.</span>
              </div>
            </div>
            <p className="specs-bottom-note"><Icon name="warning" />Fictional robot specifications; test token only.</p>
          </div>
        </section>

        <section className="manifesto-section section-space" id="manifesto" aria-labelledby="manifesto-heading">
          <div className="shell manifesto-layout">
            <TestNotice />
            <div className="manifesto-title"><h2 id="manifesto-heading">The $DONGLE<br />manifesto.</h2><p>Fictional robot lore<br />from a platform test.</p><div className="torque-seal" aria-hidden="true"><Icon name="bolt" /><span>100%<br />CONVICTION</span></div></div>
            <ol className="manifesto-list">
              <li><span className="manifesto-number mono">01</span><div><h3>Size is a specification.<br />Confidence is a choice.</h3><p>The blueprint said “compact.” He read “unstoppable.” We support his interpretation.</p></div></li>
              <li><span className="manifesto-number mono">02</span><div><h3>Overengineer the dream.</h3><p>If a problem needs a mountain-sized solution, bring a 2 mm actuator and an unreasonable attitude.</p></div></li>
              <li><span className="manifesto-number mono">03</span><div><h3>No roadmap. Just torque.</h3><p>No world-changing promises. No revolutionary utility. Just a tiny robot and a joke we’re taking far too seriously.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="community-section shell section-space" id="community" aria-labelledby="community-heading">
          <TestNotice />
          <div className="section-heading-row"><div><h2 id="community-heading">Share the test notice.</h2><p>Keep the test-token context with every share.</p></div><div className="community-doodle" aria-hidden="true"><RobotMark /><span>test token</span></div></div>
          <div className="community-links">
            <a href={launch.xUrl ?? xShare} target="_blank" rel="noopener noreferrer"><Icon name="x" /><div><h3>{launch.xUrl ? 'Meet the crew on X' : 'Share the notice on X'}</h3><p>$DONGLE was just a test token.</p></div><Icon name="arrowUp" /></a>
            <a href={launch.telegramUrl ?? telegramShare} target="_blank" rel="noopener noreferrer"><Icon name="telegram" /><div><h3>{launch.telegramUrl ? 'Join the Telegram crew' : 'Send the notice on Telegram'}</h3><p>Launched only for platform testing.</p></div><Icon name="arrowUp" /></a>
            <button type="button" onClick={() => openDialog('share')}><Icon name="download" /><div><h3>Get the test-token card</h3><p>Download the notice with Dongle’s artwork.</p></div><Icon name="arrowUp" /></button>
          </div>
          {!launch.xUrl && !launch.telegramUrl && <p className="community-note">X and Telegram open sharing tools for this notice.</p>}
        </section>

        <section className="contract-section shell" id="contract" aria-labelledby="contract-heading">
          <TestNotice />
          <div className="contract-inner"><div><div className="contract-title"><Icon name="warning" /><h2 id="contract-heading" tabIndex={-1}>Test-token mint address</h2></div><p>{launch.chain} token mint address</p></div><div className="contract-value"><code>{launch.contractAddress}</code></div><button className="icon-button" type="button" aria-label="Copy token mint address" onClick={() => void copy(launch.contractAddress, 'Mint address copied.', 'Clipboard unavailable. Select and copy the address above.')}><Icon name="copy" /></button></div>
          <p className="contract-note">This is the existing test-token mint address, retained for reference. $DONGLE was launched only to test the platform.</p>
          <p className="contract-copy-status" role="status">{!dialog ? copyStatus : ''}</p>
        </section>
      </main>

      <footer className="site-footer shell">
        <TestNotice />
        <div className="footer-top"><a className="brand" href="#" aria-label="$DONGLE home"><RobotMark /><span>$DONGLE</span></a><p>Launched only for platform testing.</p><a className="back-to-top" href="#">Back to top <span aria-hidden="true">↑</span></a></div>
        <div className="footer-bottom"><p>$DONGLE was just a test token launched to test the platform. The robot and engineering specifications are fictional. No promised utility or guaranteed returns. Nothing here is financial advice.</p><span>© {new Date().getFullYear()} $DONGLE<br />All dimensions approximate.</span></div>
      </footer>
      <div className="hazard-stripe" aria-hidden="true" />

      <dialog ref={modal} className="factory-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description" onClose={handleClosed} onKeyDown={containDialogFocus} onClick={(event) => closeOnBackdrop(event, closeDialog)}>
        <div className="dialog-content"><button className="icon-button dialog-close" type="button" aria-label="Close dialog" onClick={closeDialog}><Icon name="close" /></button>
          <div className="dialog-symbol"><Icon name={dialog === 'notice' ? 'warning' : 'bolt'} /></div>
          <h2 id="dialog-title">{dialog === 'notice' ? 'Just a test token.' : 'Share the test-token notice.'}</h2>
          <p id="dialog-description" className="dialog-test-description">$DONGLE was launched only to test the platform.</p>
          {dialog === 'notice' ? <><div className="dialog-status"><span className="status-dot" />Existing {launch.chain} test-token mint: <code>{launch.contractAddress}</code></div><button className="button primary" type="button" onClick={navigateToContract}>View test-token address <Icon name="arrow" /></button><button type="button" className="dialog-text-button" onClick={closeDialog}>Back to the site</button></> : <><img className="share-preview" src="./images/dongle-share.png" alt="$DONGLE test-token notice: just a test token, launched only to test the platform, beside the helmeted orange robot." width="1200" height="630" /><a className="button primary" href="./images/dongle-share.png" download="dongle-test-token-notice.png">Download share card <Icon name="download" /></a><button className="button secondary" type="button" onClick={() => void copy(shareUrl.href, 'Notice link copied.')}><Icon name="copy" />Copy page link</button><p className="dialog-copy-status" role="status">{copyStatus}</p>{copyStatus.startsWith('Clipboard unavailable') && <input className="copy-fallback" aria-label="Page link to copy" readOnly value={shareUrl.href} onFocus={(event) => event.currentTarget.select()} />}</>}
        </div>
      </dialog>

      <dialog ref={film} className="factory-dialog film-dialog" aria-labelledby="film-title" aria-describedby="film-description" onClose={handleFilmClosed} onKeyDown={containDialogFocus} onClick={(event) => closeOnBackdrop(event, closeFilm)}>
        <div className="film-content">
          <div className="film-head"><h2 id="film-title">JUST A TEST TOKEN</h2><button className="icon-button" type="button" aria-label="Close film" onClick={closeFilm}><Icon name="close" /></button></div>
          <p className="film-test-notice">$DONGLE was launched only to test the platform.</p>
          <video ref={filmVideo} className="film-video" poster="./media/dongle-film-poster.webp" width="720" height="720" muted playsInline controls preload="metadata" aria-describedby="film-description"><source src="./media/dongle-film.webm" type="video/webm" /><source src="./media/dongle-film.mp4" type="video/mp4" /></video>
          <p id="film-description" className="film-description">Silent, 11 seconds. Dongle lands, measures his 2 mm actuator, then tops out at 9,000 RPM of confidence.</p>
          <div className="film-actions"><button className="button primary" type="button" onClick={noticeFromFilm}>Read the notice <Icon name="arrow" /></button><button className="button secondary" type="button" onClick={closeFilm}>Skip to the site</button></div>
        </div>
      </dialog>
    </>
  );
}
