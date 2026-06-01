/* Care · scheduling page — interactive prototype. */
const { useState, useEffect, useRef } = React;
const { TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle, TweakSelect, TweakSlider } = window;

/* -------------------- Data -------------------- */

const SERVICES = [
  { id: 'reichiana', name: 'Análise Corporal Reichiana', dur: '50 min' },
  { id: 'mindfulness', name: 'Mindfulness', dur: '60 min' },
  { id: 'somatic', name: 'Somatic Experience®', dur: '75 min' },
  { id: 'supervisao', name: 'Supervisão clínica', dur: '90 min' },
  { id: 'grupo', name: 'Grupo de Mulheres', dur: '120 min' },
];

const PROFESSIONALS = [
  {
    id: 'xeraku',
    name: 'Mestre Xeraku',
    initials: 'MX',
    role: 'Análise Corporal Reichiana · Somatic Experiencing®',
    bio: 'Acompanha processos de cuidado integrativo, com foco em escuta corporal e ressignificação do sofrimento.',
    tags: ['Reichiana', 'Somatic Experience®', 'Supervisão'],
    modes: ['presencial', 'remoto'],
  },
  {
    id: 'luane',
    name: 'Luane Bastos',
    initials: 'LB',
    role: 'Fundadora · Reichiana, Somatic Experiencing®',
    bio: 'Formada no Brasil em projeto pedagógico transprofissional. Atende em integralidade e ética clínica.',
    tags: ['Reichiana', 'Somatic Experience®', 'Mindfulness'],
    modes: ['presencial', 'remoto'],
  },
  {
    id: 'mariana',
    name: 'Mariana Costa',
    initials: 'MC',
    role: 'Mindfulness · Trabalho em grupo',
    bio: 'Conduz práticas de atenção plena e grupos de mulheres com enfoque em escuta coletiva.',
    tags: ['Mindfulness', 'Grupo de Mulheres'],
    modes: ['remoto'],
  },
];

const MONTH_PT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const DOW_PT = ['D','S','T','Q','Q','S','S'];

const pad = (n) => String(n).padStart(2,'0');
const fmtDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
const sameDay = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

/* Build a deterministic slot list per (prof, date). */
function slotsFor(profId, date) {
  if (!profId || !date) return [];
  const seed = (profId.length * 7 + date.getDate() * 13 + date.getMonth()) % 5;
  const base = [
    ['09:00 AM', '10:00 AM'],
    ['10:00 AM', '11:00 AM'],
    ['11:30 AM', '12:30 PM'],
    ['02:00 PM', '03:00 PM'],
    ['03:30 PM', '04:30 PM'],
    ['05:00 PM', '06:00 PM'],
  ];
  // rotate based on seed, drop a couple
  const rotated = [...base.slice(seed), ...base.slice(0, seed)];
  return rotated.slice(0, 4).map(([s,e], i) => ({ id: `${profId}-${date.getDate()}-${i}`, start: s, end: e }));
}

/* -------------------- Building blocks -------------------- */

function Icon({ name, style }) {
  return <span className="material-symbols-outlined" style={style}>{name}</span>;
}

function FilledField({ label, required, value, placeholder, open, onClick, trailing, popover, fieldRef }) {
  return (
    <div style={{ position: 'relative' }} ref={fieldRef}>
      <button type="button"
        className={'filled-field' + (open ? ' is-open' : '')}
        onClick={onClick}>
        <span className="label">{label}{required ? <span className="req">*</span> : null}</span>
        <span className={'value' + (value ? '' : ' placeholder')}>{value || placeholder}</span>
        <span className="trailing"><Icon name={trailing} /></span>
      </button>
      {open && popover}
    </div>
  );
}

/* Click-outside helper */
function useOutside(ref, onAway) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onAway();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onAway]);
}

/* -------------------- Header -------------------- */

function Header({ active = 'agendar' }) {
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'contato', label: 'Contato' },
    { id: 'agendar', label: 'Agendar' },
  ];
  return (
    <header className="app-header">
      <a className="logo" href="#"><img src="assets/logo-horizontal.svg" alt="Care" /></a>
      <nav>
        {items.map(it => (
          <a key={it.id} className={'nav-link' + (active === it.id ? ' is-active' : '')}>{it.label}</a>
        ))}
      </nav>
      <button className="icon-btn" aria-label="Notificações">
        <Icon name="notifications" />
        <span className="notif-dot"></span>
      </button>
      <button className="user-chip" aria-label="Conta">
        <span className="avatar">DP</span>
        <span className="user-meta">
          <span className="name">Diego</span>
          <span className="role">Paciente</span>
        </span>
        <Icon name="expand_more" style={{ fontSize: 24, color: 'var(--color-primary-blue)' }} />
      </button>
    </header>
  );
}

/* -------------------- Selects -------------------- */

function ServiceSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  const v = SERVICES.find(s => s.id === value);
  return (
    <FilledField
      fieldRef={ref}
      label="Escolha um serviço" required
      value={v ? v.name : ''}
      placeholder="Selecione…"
      open={open}
      onClick={() => setOpen(o => !o)}
      trailing="expand_more"
      popover={
        <div className="popover">
          {SERVICES.map(s => (
            <div key={s.id}
              className={'opt' + (s.id === value ? ' is-selected' : '')}
              onClick={() => { onChange(s.id); setOpen(false); }}>
              <span>{s.name}</span>
              <span className="meta">{s.dur}</span>
            </div>
          ))}
        </div>
      }
    />
  );
}

function ProfessionalSelect({ value, onChange, serviceId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  const v = PROFESSIONALS.find(p => p.id === value);
  return (
    <FilledField
      fieldRef={ref}
      label="Escolha um profissional" required
      value={v ? v.name : ''}
      placeholder={serviceId ? 'Selecione…' : 'Escolha um serviço primeiro'}
      open={open}
      onClick={() => { if (serviceId) setOpen(o => !o); }}
      trailing="expand_more"
      popover={
        <div className="popover">
          {PROFESSIONALS.map(p => (
            <div key={p.id}
              className={'opt' + (p.id === value ? ' is-selected' : '')}
              onClick={() => { onChange(p.id); setOpen(false); }}>
              <span>{p.name}</span>
              <span className="meta">{p.role.split(' · ')[0]}</span>
            </div>
          ))}
        </div>
      }
    />
  );
}

/* -------------------- Calendar field -------------------- */

function Calendar({ value, onChange }) {
  const today = new Date();
  const initial = value || new Date(2026, 5, 10); // June 10, 2026 — matches mock
  const [view, setView] = useState({ y: initial.getFullYear(), m: initial.getMonth() });

  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay(); // 0=Sun
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const prevDays = new Date(view.y, view.m, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) {
    cells.push({ d: prevDays - startDow + 1 + i, m: view.m - 1, other: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ d: i, m: view.m, other: false });
  }
  while (cells.length % 7 !== 0) {
    const i = cells.length - (startDow + daysInMonth) + 1;
    cells.push({ d: i, m: view.m + 1, other: true });
  }

  const shiftMonth = (delta) => {
    let m = view.m + delta, y = view.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setView({ y, m });
  };

  return (
    <div className="cal">
      <div className="cal-head">
        <button onClick={() => shiftMonth(-1)} aria-label="Anterior"><Icon name="chevron_left" /></button>
        <div className="month">{MONTH_PT[view.m]} {view.y}</div>
        <button onClick={() => shiftMonth(1)} aria-label="Próximo"><Icon name="chevron_right" /></button>
      </div>
      <div className="cal-grid">
        {DOW_PT.map((d, i) => <div key={'dow' + i} className="dow">{d}</div>)}
        {cells.map((c, i) => {
          const date = new Date(view.y, c.m, c.d);
          const isToday = sameDay(date, today);
          const isSel = sameDay(date, value);
          const past = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button key={i}
              className={'day' + (c.other ? ' is-other' : '') + (isToday ? ' is-today' : '') + (isSel ? ' is-selected' : '')}
              disabled={past}
              onClick={() => onChange(date)}>
              {c.d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateField({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  return (
    <FilledField
      fieldRef={ref}
      label="Escolha uma data"
      value={value ? fmtDate(value) : ''}
      placeholder="dd/mm/aaaa"
      open={open}
      onClick={() => setOpen(o => !o)}
      trailing="calendar_today"
      popover={
        <div className="popover" style={{ width: 320 }}>
          <Calendar value={value} onChange={(d) => { onChange(d); setOpen(false); }} />
        </div>
      }
    />
  );
}

/* -------------------- Professional preview card -------------------- */

function ProfCard({ prof }) {
  if (!prof) {
    return (
      <div className="prof-card">
        <div className="empty-prof">Selecione um profissional para ver o perfil.</div>
      </div>
    );
  }
  return (
    <div className="prof-card">
      <div className="name">{prof.name}</div>
      <div className="bio">{prof.role}<br/>{prof.bio}</div>
      <div className="creds">
        {prof.tags.map(t => <span key={t} className="tag">{t}</span>)}
      </div>
      <div className="photo-wrap" aria-hidden="true">
        <Icon name="person" />
      </div>
    </div>
  );
}

/* -------------------- Slot card -------------------- */

function SlotCard({ slot, date, prof, defaultOpen, defaultMode, onConfirm, confirmedId }) {
  const [open, setOpen] = useState(defaultOpen);
  const [mode, setMode] = useState(defaultMode);
  useEffect(() => { setMode(defaultMode); }, [defaultMode]);

  const isConfirmed = confirmedId === slot.id;

  return (
    <div className={'slot' + (open ? ' is-open' : '') + (isConfirmed ? ' is-confirmed' : '')}>
      <div className="slot-head" onClick={() => setOpen(o => !o)}>
        <div className="slot-time">{slot.start} – {slot.end}</div>
        <div className="slot-date">{fmtDate(date)}</div>
        <span className="person" aria-hidden="true"><Icon name="account_circle" /></span>
        <button className="toggle" aria-label={open ? 'Recolher' : 'Expandir'}
          onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>
          <Icon name="expand_more" />
        </button>
      </div>
      <div className="slot-body">
        <div className="inner">
          <div className="row">
            <div className="seg" role="group" aria-label="Modalidade">
              {[
                { id: 'presencial', label: 'Presencial' },
                { id: 'remoto', label: 'Remoto' },
                { id: 'qualquer', label: 'Qualquer' },
              ].map(o => {
                const enabled = o.id === 'qualquer' || !prof || prof.modes.includes(o.id);
                return (
                  <button key={o.id}
                    className={mode === o.id ? 'is-selected' : ''}
                    disabled={!enabled}
                    style={!enabled ? { opacity: 0.4, cursor: 'not-allowed' } : null}
                    onClick={() => enabled && setMode(o.id)}>
                    {mode === o.id ? <Icon name="check" /> : null}
                    {o.label}
                  </button>
                );
              })}
            </div>
            <button className="btn-pill"
              disabled={isConfirmed}
              onClick={() => onConfirm(slot, mode)}>
              {isConfirmed ? 'Confirmado' : 'Agendar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- App -------------------- */

function App() {
  const [t, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "slotsVisible": 1,
    "defaultMode": "qualquer",
    "showBio": true,
    "expandFirstSlot": true
  }/*EDITMODE-END*/);

  const [service, setService] = useState('reichiana');
  const [profId, setProfId] = useState('xeraku');
  const [date, setDate] = useState(new Date(2026, 5, 10));
  const [toast, setToast] = useState(null);
  const [confirmedId, setConfirmedId] = useState(null);

  const prof = PROFESSIONALS.find(p => p.id === profId);
  const allSlots = slotsFor(profId, date);
  const slots = allSlots.slice(0, t.slotsVisible);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const onConfirm = (slot, mode) => {
    setConfirmedId(slot.id);
    const modeLabel = mode === 'qualquer' ? 'qualquer modalidade' : mode;
    flash(`Sessão agendada · ${prof.name} · ${fmtDate(date)} · ${slot.start} · ${modeLabel}.`);
    setTimeout(() => setConfirmedId(null), 4000);
  };

  // Reset confirmedId when filters change
  useEffect(() => { setConfirmedId(null); }, [service, profId, date]);

  return (
    <div>
      <Header active="agendar" />
      <main>
        <ServiceSelect value={service} onChange={(v) => { setService(v); }} />
        <ProfessionalSelect value={profId} onChange={setProfId} serviceId={service} />
        <ProfCard prof={prof && t.showBio ? prof : (prof ? { ...prof, role: '', bio: '' } : null)} />
        <DateField value={date} onChange={setDate} />
        {slots.length === 0 && (
          <div className="slot" style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 32 }}>
            Sem horários disponíveis para esta data.
          </div>
        )}
        {slots.map((s, i) => (
          <SlotCard key={s.id}
            slot={s} date={date} prof={prof}
            defaultOpen={i === 0 && t.expandFirstSlot}
            defaultMode={t.defaultMode}
            confirmedId={confirmedId}
            onConfirm={onConfirm} />
        ))}
      </main>

      {toast && <div className="care-toast">{toast}</div>}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Slot list">
          <TweakSlider label="Slots visible" min={1} max={4} step={1}
            value={t.slotsVisible} onChange={(v) => setTweak('slotsVisible', v)} />
          <TweakToggle label="Expand first slot"
            value={t.expandFirstSlot} onChange={(v) => setTweak('expandFirstSlot', v)} />
        </TweakSection>
        <TweakSection title="Defaults">
          <TweakRadio label="Modality default" options={['presencial','remoto','qualquer']}
            value={t.defaultMode} onChange={(v) => setTweak('defaultMode', v)} />
        </TweakSection>
        <TweakSection title="Professional card">
          <TweakToggle label="Show bio + tags"
            value={t.showBio} onChange={(v) => setTweak('showBio', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
