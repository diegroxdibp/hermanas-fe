/* hero-app.jsx — Care hero rebuilt around a transparent cut-out portrait.
   The portrait (hero/care-hero-cut.png) sits directly on the lilac wall, anchored
   to the right so the headline stays readable. Impactful options exposed as tweaks:
   typed "Care é…" headline, soft daylight halo, grounding shadow, hand-drawn motif. */
const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "fullbleed",
  "headlineMode": "typed",
  "word": "acolhimento",
  "headlineScale": 1.0,
  "accent": "#8e7fae",
  "showSub": true,
  "showCta": true,
  "personX": 2,
  "personScale": 1.0,
  "crop": "nose",
  "halo": true,
  "ground": true,
  "motif": false
}/*EDITMODE-END*/;

const ACCENTS = [
  "#8e7fae", // lilac (brand)
  "#77c5d5", // cyan
  "#56b093", // green
  "#42458e", // indigo
];

const WORDS = ["acolhimento", "escuta", "vínculo", "cuidado", "presença", "ressignificação"];
// ⤵ TO REPLACE THE HERO PHOTO: drop a new transparent-background PNG at this path
// (person on the right, ending near the sweater hem, works best with the crops).
const PHOTO = "hero/care-hero-cut.png";
const ALT = "Pessoa em um momento de acolhimento";

/* fullbleed portrait crop presets — top edge of the hero slices through the face.
   h = photo height (% of frame), by = bottom offset, rx = extra right shift. */
const CROP_MAP = {
  full:     { "--crop-h": "119%", "--crop-bottom": "-7%",  "--crop-rx": "0%" },
  forehead: { "--crop-h": "150%", "--crop-bottom": "-22%", "--crop-rx": "-20%" },
  nose:     { "--crop-h": "198%", "--crop-bottom": "-50%", "--crop-rx": "-30%" },
  mouth:    { "--crop-h": "248%", "--crop-bottom": "-76%", "--crop-rx": "-37%" },
};

/* ---- inline icons (network-independent) ---- */
const IconBell = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);
const IconChevron = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const IconArrow = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

/* ---- header ---- */
function Header() {
  const links = ["Home", "Sobre", "Contato", "Agendar"];
  return (
    <header className="site-header">
      <img className="logo" src="assets/logo-horizontal.svg" alt="Care" />
      <nav className="nav">
        <div className="nav-links">
          {links.map((l) => (
            <a key={l} href="#" className={l === "Home" ? "active" : ""}>{l}</a>
          ))}
        </div>
        <div className="header-right">
          <button className="icon-btn" aria-label="Notificações">
            <IconBell />
          </button>
          <div className="user-pill">
            <div className="avatar">DP</div>
            <div className="user-meta"><b>Diego</b><span>Paciente</span></div>
            <IconChevron />
          </div>
          <button className="icon-btn menu-btn" aria-label="Menu">
            <IconMenu />
          </button>
        </div>
      </nav>
    </header>
  );
}

/* ---- typed "Care é …" word (brand signature) ---- */
function TypedWord() {
  const [text, setText] = useState("");
  const st = useRef({ wi: 0, ci: 0, deleting: false });
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setText(WORDS[0]); return; }
    let timer;
    const tick = () => {
      const s = st.current;
      const word = WORDS[s.wi];
      setText(word.slice(0, s.ci));
      let delay;
      if (!s.deleting && s.ci < word.length) { s.ci++; delay = 95; }
      else if (!s.deleting && s.ci === word.length) { s.deleting = true; delay = 1900; }
      else if (s.deleting && s.ci > 0) { s.ci--; delay = 45; }
      else { s.deleting = false; s.wi = (s.wi + 1) % WORDS.length; delay = 320; }
      timer = setTimeout(tick, delay);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  return (
    <span className="h-word typed">{text}<span className="h-cursor" /></span>
  );
}

/* ---- reusable headline / content block ---- */
function HeroContent({ t, eyebrow }) {
  return (
    <React.Fragment>
      <h1 className="h-title reveal d1">
        <span>Care é</span>
        {t.headlineMode === "typed"
          ? <TypedWord />
          : <span className="h-word">{t.word}</span>}
      </h1>
      {t.showSub && (
        <p className="h-sub reveal d2">
          Uma clínica ampliada de cuidado em saúde mental, relacional, física e social.
        </p>
      )}
      {t.showCta && (
        <div className="h-cta reveal d3">
          <button className="btn-primary">
            Agendar um atendimento
            <IconArrow />
          </button>
        </div>
      )}
    </React.Fragment>
  );
}

/* ---- portrait (transparent cut-out) ---- */
function Portrait({ t, className }) {
  return (
    <div className={"portrait" + (className ? " " + className : "")}
         data-ground={t.ground ? "1" : "0"}>
      {t.halo && <div className="portrait-halo" aria-hidden="true" />}
      {t.motif && (
        <img className="motif-hands" src="assets/hands7.svg" alt=""
             aria-hidden="true" />
      )}
      <img className="hero-photo reveal" src={PHOTO} alt={ALT} />
    </div>
  );
}

/* ---- layouts ---- */
function FullBleed({ t, style }) {
  return (
    <section className="hero fullbleed" style={style} data-screen-label="Hero">
      <Portrait t={t} className="fb" />
      <div className="h-content">
        <div className="h-stack">
          <HeroContent t={t} eyebrow />
        </div>
      </div>
    </section>
  );
}

function Split({ t, style }) {
  return (
    <section className="hero split" style={style} data-screen-label="Hero">
      <div className="pane-text">
        <div className="inner">
          <HeroContent t={t} eyebrow />
        </div>
      </div>
      <div className="pane-photo">
        <Portrait t={t} className="sp" />
      </div>
    </section>
  );
}

function Framed({ t, style }) {
  return (
    <section className="hero framed" style={style} data-screen-label="Hero">
      <div className="frame-text">
        <HeroContent t={t} eyebrow />
      </div>
      <div className="frame reveal d1">
        <Portrait t={t} className="fr" />
        <div className="tab">Acolhimento</div>
      </div>
    </section>
  );
}

/* ---- app ---- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // Allow a forced crop + chrome-hiding via URL (?crop=mouth&bare=1) so the
  // comparison page can show every variant side-by-side from one source file.
  const params = new URLSearchParams(window.location.search);
  const forcedCrop = params.get("crop");
  const bare = params.get("bare") === "1";
  const crop = forcedCrop && CROP_MAP[forcedCrop] ? forcedCrop : t.crop;
  const heroStyle = {
    "--accent": t.accent,
    "--hscale": t.headlineScale,
    "--person-x": t.personX + "%",
    "--person-scale": t.personScale,
    ...(CROP_MAP[crop] || CROP_MAP.forehead),
  };

  let Layout = FullBleed;
  if (t.direction === "split") Layout = Split;
  else if (t.direction === "framed") Layout = Framed;

  const concepts = ["Saúde Mental", "Comunidade", "Suporte", "Educação", "Medicina"];

  return (
    <div>
      <Header />
      <Layout t={t} style={heroStyle} />

      <div className="concepts">
        <div className="track">
          {[0, 1].map((dup) => (
            <React.Fragment key={dup}>
              {concepts.map((c, i) => (
                <span key={dup + "-" + c} className={"item" + (i % 2 ? " alt" : "")}>{c}</span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {!bare && (
      <TweaksPanel title="Tweaks">
        <TweakSection label="Direction" />
        <TweakRadio label="Hero layout" value={t.direction}
          options={["fullbleed", "split", "framed"]}
          onChange={(v) => setTweak("direction", v)} />

        <TweakSection label="Headline" />
        <TweakRadio label="Word style" value={t.headlineMode}
          options={[{ value: "typed", label: "Typed" }, { value: "static", label: "Static" }]}
          onChange={(v) => setTweak("headlineMode", v)} />
        {t.headlineMode === "static" && (
          <TweakSelect label="Word" value={t.word} options={WORDS}
            onChange={(v) => setTweak("word", v)} />
        )}
        <TweakSlider label="Headline size" value={t.headlineScale} min={0.8} max={1.4} step={0.05}
          onChange={(v) => setTweak("headlineScale", v)} />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS}
          onChange={(v) => setTweak("accent", v)} />
        <TweakToggle label="Supporting line" value={t.showSub}
          onChange={(v) => setTweak("showSub", v)} />
        <TweakToggle label="Call to action" value={t.showCta}
          onChange={(v) => setTweak("showCta", v)} />

        <TweakSection label="Portrait" />
        <TweakRadio label="Crop / zoom" value={t.crop}
          options={[{ value: "full", label: "Full" }, { value: "forehead", label: "Forehead" }, { value: "nose", label: "Nose" }, { value: "mouth", label: "Mouth" }]}
          onChange={(v) => setTweak("crop", v)} />
        <TweakSlider label="Horizontal position" value={t.personX} min={-6} max={16} step={1} unit="%"
          onChange={(v) => setTweak("personX", v)} />
        <TweakSlider label="Scale" value={t.personScale} min={0.85} max={1.2} step={0.01}
          onChange={(v) => setTweak("personScale", v)} />
        <TweakToggle label="Daylight halo" value={t.halo}
          onChange={(v) => setTweak("halo", v)} />
        <TweakToggle label="Grounding shadow" value={t.ground}
          onChange={(v) => setTweak("ground", v)} />
        <TweakToggle label="Hands motif" value={t.motif}
          onChange={(v) => setTweak("motif", v)} />
      </TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
