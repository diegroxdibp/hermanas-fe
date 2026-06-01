/* Shared chrome: header, footer, sidebar, plus a Field component used by all screens. */

const NavLink = ({ children, active, accent, onClick }) => (
  <a
    onClick={onClick}
    style={{
      fontFamily: 'var(--font-sans)',
      fontSize: 19,
      fontWeight: 700,
      color: active ? 'var(--color-primary-purple)' : 'var(--color-primary-blue)',
      cursor: 'pointer',
      transition: 'color .2s ease, transform .2s ease',
      display: 'inline-block',
      transform: active ? 'scale(1.04)' : 'none',
    }}
  >{children}</a>
);

function BellIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  );
}

function MarketingHeader({ active = 'home', showSignIn = true, onNavigate = () => {} }) {
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'contato', label: 'Contato' },
    { id: 'agendar', label: 'Agendar' },
  ];
  return (
    <header style={{
      height: 80, width: '100%', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center',
      padding: '0 40px', background: '#fff',
      borderBottom: '1px solid var(--color-surface-tint)',
    }}>
      <a style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <img src="design-system/assets/logo-horizontal.svg" alt="Care" style={{ height: 52, width: 'auto' }} />
      </a>
      <nav style={{ marginLeft: 'auto', display: 'flex', gap: 36, alignItems: 'center' }}>
        {items.map(it => (
          <NavLink key={it.id} active={active === it.id} onClick={() => onNavigate(it.id)}>{it.label}</NavLink>
        ))}
        {showSignIn && (
          <a style={{
            marginLeft: 8,
            padding: '10px 22px',
            borderRadius: 10,
            background: 'var(--color-primary-blue)',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}>Sign In</a>
        )}
      </nav>
    </header>
  );
}

function AuthedHeader({ active = 'conta', initials = 'MX', name = 'Mestre', role = 'Paciente' }) {
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'contato', label: 'Contato' },
    { id: 'agendar', label: 'Agendar' },
  ];
  return (
    <header style={{
      height: 80, width: '100%', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center',
      padding: '0 40px', background: '#fff',
      borderBottom: '1px solid var(--color-surface-tint)',
    }}>
      <a style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <img src="design-system/assets/logo-horizontal.svg" alt="Care" style={{ height: 52, width: 'auto' }} />
      </a>
      <nav style={{ marginLeft: 'auto', display: 'flex', gap: 36, alignItems: 'center' }}>
        {items.map(it => (
          <NavLink key={it.id} active={active === it.id}>{it.label}</NavLink>
        ))}
        <button aria-label="Notificações" style={{
          background: 'transparent', border: 0, cursor: 'pointer',
          color: 'var(--color-primary-blue)', display: 'inline-flex', padding: 6,
          marginLeft: 4,
        }}>
          <BellIcon />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 4 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--color-primary-blue)',
            color: '#fff', fontFamily: 'var(--font-sans)',
            fontWeight: 700, fontSize: 15, letterSpacing: '0.02em',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{initials}</div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, color: 'var(--color-primary-blue)' }}>{name}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 400, color: 'var(--color-primary-blue)' }}>{role}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{
      background: 'var(--color-secondary-cyan)',
      padding: '22px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{ color: 'var(--color-secondary-indigo)', fontFamily: 'var(--font-sans)' }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>Todos os direitos reservados ©</div>
        <div style={{ fontWeight: 400, fontSize: 14, marginTop: 2 }}>Care: +351 915 784 896</div>
      </div>
      <ul style={{ display: 'flex', gap: 12, listStyle: 'none', padding: 0, margin: 0 }}>
        {[
          { vb: '0 0 448 512', d: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3a26.8 26.8 0 1 1-53.6 0 26.8 26.8 0 0 1 53.6 0zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1S3.3 127.5 1.5 163.4c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8z' },
          { vb: '0 0 448 512', d: 'M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z' },
          { vb: '0 0 512 512', d: 'M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416z' },
        ].map((s, i) => (
          <li key={i}>
            <a style={{
              display: 'flex', width: 44, height: 44, borderRadius: 8,
              alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-secondary-indigo)', cursor: 'pointer',
            }}>
              <svg viewBox={s.vb} width="20" height="20" fill="#fff" aria-hidden="true"><path d={s.d}/></svg>
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}

/* Account sidebar — matches the screenshot's "CONTA" group */
function AccountSidebar({ active = 'conta' }) {
  const items = [
    { id: 'agendamentos', label: 'Agendamentos', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )},
    { id: 'notificacoes', label: 'Notificações', icon: <BellIcon /> },
    { id: 'conta', label: 'Conta', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )},
  ];
  return (
    <aside style={{
      width: 240, flex: 'none',
      padding: '28px 0 28px 28px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.18em',
        color: 'var(--color-muted)',
        padding: '0 16px 14px',
      }}>CONTA</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => {
          const isActive = active === it.id;
          return (
            <a key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              background: isActive ? 'var(--color-surface-tint)' : 'transparent',
              color: 'var(--color-primary-blue)',
              fontFamily: 'var(--font-sans)',
              fontSize: 16,
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
            }}>
              <span style={{ color: 'var(--color-primary-blue)', display: 'inline-flex' }}>{it.icon}</span>
              {it.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

/* Reusable form field (label above input) — matches design-system input pattern */
function Field({ label, children, hint, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {label && (
        <label style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--color-primary-blue)',
        }}>{label}</label>
      )}
      {children}
      {hint && (
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--color-muted)',
        }}>{hint}</span>
      )}
    </div>
  );
}

const inputStyle = {
  fontFamily: 'var(--font-sans)',
  fontSize: 16,
  color: 'var(--color-primary-blue)',
  padding: '14px 16px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: '#fff',
  outline: 0,
  width: '100%',
  boxSizing: 'border-box',
};

const readonlyInputStyle = {
  ...inputStyle,
  background: '#eef0f4',
  border: '1px solid #e6e8f1',
  color: 'var(--color-muted)',
};

Object.assign(window, {
  MarketingHeader, AuthedHeader, Footer, AccountSidebar, Field, NavLink, BellIcon,
  inputStyle, readonlyInputStyle,
});
