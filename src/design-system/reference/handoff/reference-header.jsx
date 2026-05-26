/* header.jsx — CARE header with notifications badge + user dropdown */
const { useState, useEffect, useRef } = React;

/* ---------- Inline SVG icons (more robust than icon font for capture) ---------- */
const Icon = {
  bell: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  chevron: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  person: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  event: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  ),
};

/* ---------- Notification badge styles ----------
   'pill'  — rounded count pill (lilac), shows number
   'dot'   — small dot only (no count)
   'square'— filled square w/ count (more "system" feel)
*/
function NotifBadge({ count, style = 'pill', tone = '#8E7FAE' }) {
  if (!count) return null;
  // pick fg by luminance — cyan needs dark text, the rest white
  const isLight = (() => {
    const h = String(tone).replace('#', '');
    const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
    const n = parseInt(x, 16);
    const r = n >> 16 & 255,g = n >> 8 & 255,b = n & 255;
    return r * 299 + g * 587 + b * 114 > 148000;
  })();
  const t = { bg: tone, fg: isLight ? 'var(--color-primary-blue)' : '#fff' };
  const display = count > 9 ? '9+' : String(count);

  if (style === 'dot') {
    return (
      <span aria-label={`${count} novas notificações`}
      style={{
        position: 'absolute', top: 6, right: 6,
        width: 10, height: 10, borderRadius: 999,
        background: t.bg, border: '2px solid #fff',
        animation: 'pulseDot 2s var(--ease-care) infinite'
      }} />);

  }
  const sq = style === 'square';
  return (
    <span aria-label={`${count} novas notificações`}
    style={{
      position: 'absolute',
      top: -4, right: -4,
      minWidth: 20, height: 20,
      padding: count > 9 ? '0 5px' : 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: t.bg, color: t.fg,
      fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-sans)',
      lineHeight: 1,
      borderRadius: sq ? 4 : 999,
      border: '2px solid #fff',
      boxSizing: 'border-box',
      animation: 'badgePop 320ms var(--ease-care) both'
    }}>
      {display}
    </span>);

}

/* ---------- Bell button (separate from avatar dropdown) ---------- */
function NotifBell({ count, badgeStyle, badgeTone, active, onClick }) {
  return (
    <button onClick={onClick}
    aria-label={`Notificações ${count ? `(${count} novas)` : ''}`}
    style={{
      position: 'relative',
      width: 44, height: 44, borderRadius: 999,
      background: active ? 'var(--color-surface-tint)' : 'transparent',
      border: 'none', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--color-primary-blue)',
      transition: 'background 0.2s ease, transform 0.2s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-tint)'}
    onMouseLeave={(e) => e.currentTarget.style.background = active ? 'var(--color-surface-tint)' : 'transparent'}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.bell}</span>
      <NotifBadge count={count} style={badgeStyle} tone={badgeTone} />
    </button>);

}

/* ---------- Notifications panel (opens from bell) ---------- */
function NotifPanel({ items, onMarkAll, dropBg, dropStyle }) {
  const panel = panelStylesFor(dropBg, dropStyle);
  return (
    <div role="menu"
    style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
      width: 360,
      ...panel.outer,
      animation: 'menuIn 200ms var(--ease-care) both',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: `1px solid ${panel.divider}`
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: panel.fg }}>Notificações</div>
        <button onClick={onMarkAll}
        style={{
          background: 'transparent', border: 'none', padding: 0,
          font: 'italic 500 13px var(--font-sans)',
          color: 'var(--color-primary-purple)',
          cursor: 'pointer'
        }}>marcar todas como lidas</button>
      </div>
      <ul style={{ maxHeight: 320, overflow: 'auto' }}>
        {items.length === 0 &&
        <li style={{ padding: '28px 18px', textAlign: 'center', color: panel.muted, fontSize: 14 }}>
            Sem notificações pendentes.
          </li>
        }
        {items.map((n) =>
        <li key={n.id}
        style={{
          display: 'flex', gap: 12,
          padding: '14px 18px',
          borderBottom: `1px solid ${panel.divider}`,
          background: n.unread ? panel.unreadBg : 'transparent',
          cursor: 'pointer'
        }}>
            <span aria-hidden style={{
            flexShrink: 0,
            width: 8, height: 8, borderRadius: 999,
            marginTop: 8,
            background: n.unread ? 'var(--color-primary-purple)' : 'transparent'
          }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
              fontSize: 14, lineHeight: 1.4,
              color: panel.fg,
              fontWeight: n.unread ? 600 : 400,
              textAlign: 'left'
            }}>
                {n.title}
              </div>
              <div style={{ fontSize: 12, color: panel.muted, marginTop: 2, textAlign: 'left' }}>
                {n.when}
              </div>
            </div>
          </li>
        )}
      </ul>
      <a style={{
        display: 'block', padding: '12px 18px',
        textAlign: 'center', fontSize: 13, fontWeight: 700,
        color: 'var(--color-primary-blue)',
        borderTop: `1px solid ${panel.divider}`
      }}>Ver todas</a>
    </div>);

}

/* ---------- Dropdown background variants ----------
   Resolves the {background, divider, foreground, shadow} for both
   the user-menu and the notifications panel based on the tweak.
*/
function panelStylesFor(bg, dropStyle) {
  const shadow = dropStyle === 'flat' ?
  '0 1px 2px rgba(34,50,110,0.08), 0 0 0 1px rgba(34,50,110,0.08)' :
  '0 10px 30px rgba(34,50,110,0.16), 0 2px 6px rgba(34,50,110,0.08)';

  const variants = {
    /* clean white card with proper care drop-shadow — the canonical fix */
    white: {
      outer: {
        background: '#fff',
        border: '1px solid rgba(34,50,110,0.06)',
        borderRadius: 12,
        boxShadow: shadow
      },
      divider: 'rgba(34,50,110,0.08)',
      fg: 'var(--color-primary-blue)',
      muted: 'var(--color-muted)',
      unreadBg: 'rgba(142,127,174,0.08)'
    },
    /* pale care wash — soft, on-brand */
    tint: {
      outer: {
        background: 'var(--color-surface-tint)',
        border: '1px solid rgba(34,50,110,0.08)',
        borderRadius: 12,
        boxShadow: shadow
      },
      divider: 'rgba(34,50,110,0.10)',
      fg: 'var(--color-primary-blue)',
      muted: 'var(--color-muted)',
      unreadBg: 'rgba(255,255,255,0.7)'
    },
    /* inverted — primary blue card, white text. high contrast, dramatic */
    blue: {
      outer: {
        background: 'var(--color-primary-blue)',
        border: 'none',
        borderRadius: 12,
        boxShadow: shadow
      },
      divider: 'rgba(255,255,255,0.12)',
      fg: '#fff',
      muted: 'rgba(255,255,255,0.65)',
      unreadBg: 'rgba(255,255,255,0.06)'
    },
    /* lilac accent — white card w/ purple top edge */
    lilacEdge: {
      outer: {
        background: '#fff',
        border: '1px solid rgba(34,50,110,0.06)',
        borderTop: '3px solid var(--color-primary-purple)',
        borderRadius: 12,
        boxShadow: shadow
      },
      divider: 'rgba(34,50,110,0.08)',
      fg: 'var(--color-primary-blue)',
      muted: 'var(--color-muted)',
      unreadBg: 'rgba(142,127,174,0.08)'
    }
  };
  return variants[bg] || variants.white;
}

/* ---------- User menu (avatar + name + chevron + dropdown) ---------- */
function UserMenu({
  user, open, onToggle, onClose,
  dropBg, dropStyle,
  showCountInChip = false, count = 0, badgeStyle, badgeTone
}) {
  const panel = panelStylesFor(dropBg, dropStyle);
  const menuItems = [
  { id: 'conta', label: 'Conta', icon: Icon.person },
  { id: 'sair', label: 'Terminar sessão', icon: Icon.logout, danger: true }];


  return (
    <div style={{ position: 'relative' }}>
      <button onClick={onToggle}
      aria-expanded={open}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '6px 12px 6px 6px',
        background: open ? 'var(--color-surface-tint)' : 'transparent',
        border: 'none', borderRadius: 999, cursor: 'pointer',
        font: '500 italic 18px var(--font-sans)',
        color: 'var(--color-primary-blue)',
        transition: 'background 0.2s ease'
      }}
      onMouseEnter={(e) => {if (!open) e.currentTarget.style.background = 'var(--color-surface-tint)';}}
      onMouseLeave={(e) => {if (!open) e.currentTarget.style.background = 'transparent';}}>
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38, borderRadius: 999,
            background: 'var(--color-primary-blue)',
            color: '#fff',
            font: '700 13px var(--font-sans)',
            letterSpacing: 0.5
          }}>{user.initials}</span>
          {showCountInChip && <NotifBadge count={count} style={badgeStyle} tone={badgeTone} />}
        </span>
        <span style={{ textAlign: 'left', lineHeight: 1.15 }}>
          <span style={{ display: 'block', fontStyle: 'normal', fontWeight: 700, fontSize: 16 }}>
            {user.name}
          </span>
          <span style={{ display: 'block', fontStyle: 'normal', fontWeight: 400, fontSize: 12, color: 'var(--fg-3)' }}>
            {user.role}
          </span>
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-primary-blue)',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s var(--ease-care)'
        }}>{Icon.chevron}</span>
      </button>

      {open &&
      <div role="menu"
      style={{
        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
        minWidth: 240,
        ...panel.outer,
        animation: 'menuIn 200ms var(--ease-care) both',
        overflow: 'hidden'
      }}>
          {/* user header strip */}
          <div style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${panel.divider}`
        }}>
            <div style={{
            fontWeight: 700, fontSize: 15, color: panel.fg, lineHeight: 1.2
          }}>{user.name}</div>
            <div style={{
            fontSize: 12, color: panel.muted, marginTop: 2
          }}>{user.email}</div>
          </div>
          {/* items */}
          <ul style={{ padding: '6px 0' }}>
            {menuItems.map((item) =>
          <li key={item.id}>
                <a role="menuitem"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 18px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500, fontSize: 15,
              color: item.danger ?
              dropBg === 'blue' ? '#FFB3B3' : '#B33049' :
              panel.fg,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = dropBg === 'blue' ?
              'rgba(255,255,255,0.08)' :
              'rgba(142,127,174,0.10)';
            }}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.meta != null &&
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 22, height: 20, padding: '0 6px',
                borderRadius: 999,
                background: 'var(--color-primary-purple)',
                color: '#fff',
                fontSize: 11, fontWeight: 700, backgroundColor: "rgb(217, 48, 79)"
              }}>{item.meta}</span>
              }
                </a>
              </li>
          )}
          </ul>
        </div>
      }
    </div>);

}

/* ---------- Header ---------- */
function CareHeader({ t, notifications, onMarkAll }) {
  const [menuOpen, setMenuOpen] = useState(true); // open by default so user sees it
  const [bellOpen, setBellOpen] = useState(false);
  const rootRef = useRef(null);

  const unread = notifications.filter((n) => n.unread).length;
  const bellIsSeparate = t.notifPlacement === 'bell';
  const showCountInChip = t.notifPlacement === 'avatar';

  // close on outside click
  useEffect(() => {
    function handle(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setMenuOpen(false);
        setBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: 70, width: '100%', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center',
      padding: '0 32px', background: '#fff',
      borderBottom: '1px solid var(--color-surface-tint)'
    }}>
      <a style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <img src="assets/logo-horizontal.svg" alt="Care" style={{ height: 44, width: 'auto' }} />
      </a>

      <nav style={{ marginLeft: 'auto', display: 'flex', gap: 28, alignItems: 'center' }}
      ref={rootRef}>
        {['Home', 'Sobre', 'Contato', 'Agendar'].map((label) =>
        <a key={label} className="nav-link"
        style={{
          fontWeight: 700, fontSize: 18,
          color: 'var(--color-primary-blue)',
          cursor: 'pointer'
        }}>{label}</a>
        )}

        {bellIsSeparate &&
        <div style={{ position: 'relative' }}>
            <NotifBell
            count={unread}
            badgeStyle={t.badgeStyle}
            badgeTone={t.badgeTone}
            active={bellOpen}
            onClick={() => {setBellOpen((o) => !o);setMenuOpen(false);}} />
            {bellOpen &&
          <NotifPanel
            items={notifications}
            onMarkAll={onMarkAll}
            dropBg={t.dropBg}
            dropStyle={t.dropStyle} />
          }
          </div>
        }

        <UserMenu
          user={{ initials: 'MX', name: 'Mestre', role: 'Paciente', email: 'mestre@care.pt' }}
          open={menuOpen}
          onToggle={() => {setMenuOpen((o) => !o);setBellOpen(false);}}
          onClose={() => setMenuOpen(false)}
          dropBg={t.dropBg}
          dropStyle={t.dropStyle}
          showCountInChip={showCountInChip}
          count={unread}
          badgeStyle={t.badgeStyle}
          badgeTone={t.badgeTone} />
      </nav>
    </header>);

}

window.CareHeader = CareHeader;