/* contact.jsx — Care "Contato" page: auth header, contact form card, cyan footer */
const { useState, useRef } = React;

/* ---------- Inline SVG icons (robust, no icon-font dependency) ---------- */
function Icon({ name, size = 24, stroke = 2, style }) {
  const p = {
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    chevron: <polyline points="6 9 12 15 18 9"/>,
    person: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></>,
    calendar: <><rect x="3" y="4.5" width="18" height="17" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/></>,
    settings: <><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1h.09a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1z"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
  }[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
         style={style} aria-hidden="true">{p}</svg>
  );
}

/* ---------- Header (authenticated app variant) ---------- */
function AppHeader({ active = 'contato' }) {
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'contato', label: 'Contato' },
    { id: 'agendar', label: 'Agendar' },
  ];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <a className="brand" href="#" aria-label="Care — início">
        <img src="assets/logo-horizontal.svg" alt="Care · Clínica Ampliada Ressignificações" />
      </a>

      <nav className="app-nav">
        {items.map((it) => (
          <a key={it.id} href="#"
             className={'app-nav-link' + (active === it.id ? ' active' : '')}>
            {it.label}
          </a>
        ))}
      </nav>

      <div className="header-tools">
        <button className="bell-btn" aria-label="Notificações">
          <Icon name="bell" size={26} stroke={1.8} />
          <span className="bell-dot" aria-hidden="true"></span>
        </button>

        <button className="user-chip" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="true" aria-expanded={menuOpen}>
          <span className="avatar">DP</span>
          <span className="user-meta">
            <span className="user-name">Diego</span>
            <span className="user-role">Paciente</span>
          </span>
          <span className={'chev' + (menuOpen ? ' open' : '')}><Icon name="chevron" size={22} stroke={2.4} /></span>
        </button>

        {menuOpen && (
          <div className="user-menu" role="menu">
            <a href="#" role="menuitem"><Icon name="person" size={20} />Meu perfil</a>
            <a href="#" role="menuitem"><Icon name="calendar" size={20} />Meus agendamentos</a>
            <a href="#" role="menuitem"><Icon name="settings" size={20} />Definições</a>
            <div className="user-menu-divider"></div>
            <a href="#" role="menuitem" className="signout"><Icon name="logout" size={20} />Terminar sessão</a>
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------- Outlined field with label above (matches account dashboard) ---------- */
function FilledField({ id, label, value, onChange, multiline = false, type = 'text', error, placeholder }) {
  const cls = 'field' + (error ? ' is-error' : '');
  const common = {
    id,
    value,
    placeholder: placeholder || '',
    onChange: (e) => onChange(e.target.value),
    'aria-label': label.replace(/:$/, ''),
  };
  return (
    <div className={cls}>
      <label htmlFor={id} className="field-label">{label}</label>
      {multiline
        ? <textarea {...common} className="field-input" rows={4}></textarea>
        : <input {...common} type={type} className="field-input" />}
    </div>
  );
}

/* ---------- Contact form card ---------- */
function ContactCard({ t }) {
  const [form, setForm] = useState({ nome: '', telefone: '', assunto: '', mensagem: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: false })); };

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    ['nome', 'telefone', 'assunto', 'mensagem'].forEach((k) => { if (!form[k].trim()) errs[k] = true; });
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSent(true);
      setTimeout(() => setSent(false), 3200);
      setForm({ nome: '', telefone: '', assunto: '', mensagem: '' });
    }
  };

  return (
    <form className="contact-card" onSubmit={submit} noValidate>
      <div className="card-head">
        <h1 className="card-title">Contato</h1>
        <p className="card-sub">Tire suas dúvidas, envie-nos uma mensagem:</p>
      </div>
      <div className="card-divider"></div>

      <div className="card-body">
        <FilledField id="nome" label="Nome:" value={form.nome} onChange={set('nome')} error={errors.nome} placeholder="O seu nome" />
        <FilledField id="telefone" label="Telefone:" type="tel" value={form.telefone} onChange={set('telefone')} error={errors.telefone} placeholder="+351 915 784 896" />
        <FilledField id="assunto" label="Assunto:" value={form.assunto} onChange={set('assunto')} error={errors.assunto} placeholder="Sobre o que gostaria de falar?" />
        <FilledField id="mensagem" label="Mensagem:" value={form.mensagem} onChange={set('mensagem')} error={errors.mensagem} placeholder="Escreva a sua mensagem" multiline />

        <button type="submit" className={'enviar-btn' + (sent ? ' is-sent' : '')}>
          {sent ? (<><Icon name="check" size={20} stroke={2.4} />Mensagem enviada</>) : 'ENVIAR'}
        </button>

        <div className="card-fineprint">
          <p>Ao enviar o email, aceito os termos de uso e política de privacidade.</p>
          <p>Se quer agendar algum serviço, clique <a href="#"><strong>aqui</strong></a>.</p>
        </div>
      </div>
    </form>
  );
}

/* ---------- Footer ---------- */
function AppFooter() {
  const socials = [
    { label: 'Instagram', vb: '0 0 448 512', path: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3a26.8 26.8 0 1 1-53.6 0 26.8 26.8 0 0 1 53.6 0zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1S3.3 127.5 1.5 163.4c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8z' },
    { label: 'WhatsApp', vb: '0 0 448 512', path: 'M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 438.6h-.1c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 358.8l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-82.7 184.6-184.5 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z' },
    { label: 'Email', vb: '0 0 512 512', path: 'M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416zM48 400V214.398c22.914 18.251 58.043 45.985 87.928 70.155 33.34 26.992 78.55 67.992 119.328 67.992C295.851 352.545 341.061 311.545 374.4 284.553 404.385 260.383 439.513 232.65 464 214.398V400H48z' },
  ];
  return (
    <footer className="app-footer">
      <div className="footer-copy">
        <div className="footer-line1">Todos os direitos reservados ©</div>
        <div className="footer-line2">Care · +351 915 784 896</div>
      </div>
      <ul className="footer-socials">
        {socials.map((s) => (
          <li key={s.label}>
            <a href="#" aria-label={s.label} onClick={(e) => e.preventDefault()}>
              <svg viewBox={s.vb} width="20" height="20" fill="#fff" aria-hidden="true"><path d={s.path}></path></svg>
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}

Object.assign(window, { AppHeader, ContactCard, AppFooter, FilledField });
