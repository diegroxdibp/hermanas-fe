/* faq-kit.jsx — shared building blocks for the FAQ variations.
   Attached to window so the other babel scripts can read them. */

const FAQ_ASSET = (name) => 'assets/' + name;

/* ---- state hook: one topic selected, one question open ---- */
function useFaq(opts = {}) {
  const data = window.FAQ_DATA;
  const [topic, setTopic] = React.useState(opts.initialTopic || data[0].topicName);
  // open the first question by default so the closed/open state reads at a glance
  const [openKey, setOpenKey] = React.useState(opts.openFirst === false ? null : '0');
  const sel = data.find((t) => t.topicName === topic) || data[0];
  const selectTopic = (name) => {
    if (name === topic) return;
    setTopic(name);
    setOpenKey(opts.openFirst === false ? null : '0');
  };
  const toggle = (key) => setOpenKey((k) => (k === key ? null : key));
  return { data, topic, sel, selectTopic, openKey, toggle };
}

/* ---- chevron (exact path from the Care codebase) ---- */
function Chevron({ open, size = 26, color = 'var(--color-primary-blue)', stroke = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{
        width: size, height: size, flex: 'none',
        fill: stroke ? 'none' : color,
        stroke: stroke ? color : 'none',
        strokeWidth: stroke ? 7 : 0,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform .35s var(--ease-care)',
      }}
    >
      <path d="M50,61.8472a2.9963,2.9963,0,0,1-1.8481-.6367L25.5264,43.5161A3,3,0,0,1,29.2227,38.79L50,55.0386,70.7773,38.79a3,3,0,1,1,3.6963,4.7266L51.8481,61.21A2.9963,2.9963,0,0,1,50,61.8472Z" />
    </svg>
  );
}

/* ---- plus / minus toggle mark (alternative to chevron) ---- */
function PlusMark({ open, size = 22, color = 'var(--color-primary-blue)' }) {
  return (
    <span style={{ position: 'relative', width: size, height: size, flex: 'none', display: 'inline-block' }}>
      <span style={{
        position: 'absolute', top: '50%', left: 0, width: '100%', height: 2,
        background: color, borderRadius: 2, transform: 'translateY(-50%)',
      }} />
      <span style={{
        position: 'absolute', top: '50%', left: 0, width: '100%', height: 2,
        background: color, borderRadius: 2,
        transform: open ? 'translateY(-50%) rotate(0deg)' : 'translateY(-50%) rotate(90deg)',
        transition: 'transform .35s var(--ease-care)',
      }} />
    </span>
  );
}

/* ---- a soft breathing illustration mark ---- */
function BreathingMark({ src, width = 120, opacity = 1, className = '' }) {
  return (
    <img
      src={FAQ_ASSET(src)}
      alt=""
      aria-hidden="true"
      className={'faq-breathe ' + className}
      style={{ width, height: 'auto', opacity, display: 'block', pointerEvents: 'none' }}
    />
  );
}

/* ---- "Still have questions?" contact prompt ----
   accent = strong color, soft = pale fill, onDark inverts text */
function ContactPrompt({ accent, soft, onDark = false, mobile = false, illo = 'hands6.svg' }) {
  const fg = onDark ? '#fff' : 'var(--color-primary-blue)';
  const sub = onDark ? 'rgba(255,255,255,.78)' : 'var(--color-secondary-indigo)';
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: mobile ? 16 : 22,
        flexDirection: mobile ? 'column' : 'row',
        textAlign: mobile ? 'center' : 'left',
        background: soft, borderRadius: 'var(--radius-xl)',
        padding: mobile ? '26px 22px' : '26px 30px',
        marginTop: mobile ? 26 : 36,
      }}
    >
      <div style={{
        flex: 'none', width: mobile ? 54 : 58, height: mobile ? 54 : 58,
        borderRadius: '50%', background: onDark ? 'rgba(255,255,255,.14)' : '#fff',
        display: 'grid', placeItems: 'center',
      }}>
        <img src={FAQ_ASSET(illo)} alt="" aria-hidden="true"
             style={{ width: '74%', height: 'auto' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-sans)', color: fg, fontWeight: 700,
          fontSize: mobile ? 18 : 20, lineHeight: 1.25,
        }}>Ainda com alguma dúvida?</div>
        <div style={{
          fontFamily: 'var(--font-sans)', color: sub, fontWeight: 400,
          fontSize: mobile ? 14.5 : 15.5, lineHeight: 1.45, marginTop: 3,
        }}>Acolhemos a sua pergunta com o mesmo cuidado de uma consulta.</div>
      </div>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={{
          flex: 'none', alignSelf: mobile ? 'stretch' : 'center',
          textAlign: 'center',
          background: accent, color: '#fff',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16,
          padding: '13px 22px', borderRadius: 'var(--radius-lg)',
          textDecoration: 'none', whiteSpace: 'nowrap',
          transition: 'transform .2s var(--ease-care), filter .2s var(--ease-care)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(.97)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; }}
      >Entrar em contato</a>
    </div>
  );
}

/* ---- section eyebrow + heading ---- */
function FaqHeading({ mobile = false, align = 'left', serif = false, accent = 'var(--color-primary-purple)' }) {
  return (
    <div style={{ textAlign: align, marginBottom: mobile ? 22 : 30 }}>
      <div style={{
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontStyle: 'italic',
        letterSpacing: 4, textTransform: 'uppercase',
        color: accent, fontSize: mobile ? 12 : 13, marginBottom: 10,
      }}>Perguntas frequentes</div>
      <h2 style={{
        fontFamily: serif ? 'var(--font-serif)' : 'var(--font-sans)',
        color: 'var(--color-primary-blue)', fontWeight: 700,
        fontSize: mobile ? 27 : 36, lineHeight: 1.12, margin: 0,
        letterSpacing: serif ? 0 : '-0.5px',
      }}>Ficou com alguma dúvida?</h2>
    </div>
  );
}

Object.assign(window, { useFaq, Chevron, PlusMark, BreathingMark, ContactPrompt, FaqHeading, FAQ_ASSET });
