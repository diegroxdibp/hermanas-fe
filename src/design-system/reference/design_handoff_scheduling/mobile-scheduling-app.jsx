/* Care · scheduling — MOBILE. Native patterns: bottom-sheet pickers, stacked layout. */
const { useState, useEffect, useRef } = React;
const { IOSDevice } = window;

/* -------------------- Data -------------------- */
const SERVICES = [
  { id: 'reichiana', name: 'Análise Corporal Reichiana', dur: '50 min' },
  { id: 'mindfulness', name: 'Mindfulness', dur: '60 min' },
  { id: 'somatic', name: 'Somatic Experience®', dur: '75 min' },
  { id: 'supervisao', name: 'Supervisão clínica', dur: '90 min' },
  { id: 'grupo', name: 'Grupo de Mulheres', dur: '120 min' },
];
const PROFESSIONALS = [
  { id: 'xeraku', name: 'Mestre Xeraku', initials: 'MX',
    role: 'Análise Corporal Reichiana · Somatic Experiencing®',
    bio: 'Acompanha processos de cuidado integrativo, com foco em escuta corporal e ressignificação do sofrimento.',
    tags: ['Reichiana', 'Somatic Experience®', 'Supervisão'], modes: ['presencial', 'remoto'] },
  { id: 'luane', name: 'Luane Bastos', initials: 'LB',
    role: 'Fundadora · Reichiana, Somatic Experiencing®',
    bio: 'Formada no Brasil em projeto pedagógico transprofissional. Atende em integralidade e ética clínica.',
    tags: ['Reichiana', 'Somatic Experience®', 'Mindfulness'], modes: ['presencial', 'remoto'] },
  { id: 'mariana', name: 'Mariana Costa', initials: 'MC',
    role: 'Mindfulness · Trabalho em grupo',
    bio: 'Conduz práticas de atenção plena e grupos de mulheres com enfoque em escuta coletiva.',
    tags: ['Mindfulness', 'Grupo de Mulheres'], modes: ['remoto'] },
];
const MONTH_PT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const DOW_PT = ['D','S','T','Q','Q','S','S'];
const pad = (n) => String(n).padStart(2,'0');
const fmtDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
const sameDay = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
function slotsFor(profId, date) {
  if (!profId || !date) return [];
  const seed = (profId.length * 7 + date.getDate() * 13 + date.getMonth()) % 5;
  const base = [['09:00 AM','10:00 AM'],['10:00 AM','11:00 AM'],['11:30 AM','12:30 PM'],['02:00 PM','03:00 PM'],['03:30 PM','04:30 PM'],['05:00 PM','06:00 PM']];
  const rotated = [...base.slice(seed), ...base.slice(0, seed)];
  return rotated.slice(0, 4).map(([s,e], i) => ({ id: `${profId}-${date.getDate()}-${i}`, start: s, end: e }));
}
function Icon({ name, style }) { return <span className="material-symbols-outlined" style={style}>{name}</span>; }

/* -------------------- Bottom sheet -------------------- */
function Sheet({ open, title, onClose, children }) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => { if (open) setMounted(true); }, [open]);
  if (!mounted) return null;
  return (
    <div className={'m-sheet-scrim' + (open ? ' is-open' : '')}
      onClick={onClose}
      onTransitionEnd={() => { if (!open) setMounted(false); }}>
      <div className={'m-sheet' + (open ? ' is-open' : '')} onClick={(e) => e.stopPropagation()}>
        <div className="m-sheet-grip"></div>
        <div className="m-sheet-head">
          <span>{title}</span>
          <button className="m-sheet-x" onClick={onClose} aria-label="Fechar"><Icon name="close" /></button>
        </div>
        <div className="m-sheet-body">{children}</div>
      </div>
    </div>
  );
}

/* -------------------- Field (tap → sheet) -------------------- */
function Field({ label, required, value, placeholder, trailing, onClick, disabled }) {
  return (
    <button type="button" className={'m-field' + (disabled ? ' is-disabled' : '')} onClick={disabled ? null : onClick}>
      <span className="m-field-label">{label}{required ? <span className="req">*</span> : null}</span>
      <span className={'m-field-value' + (value ? '' : ' placeholder')}>{value || placeholder}</span>
      <span className="m-field-trailing"><Icon name={trailing} /></span>
    </button>
  );
}

/* -------------------- Calendar -------------------- */
function Calendar({ value, onChange }) {
  const today = new Date();
  const initial = value || new Date(2026, 5, 10);
  const [view, setView] = useState({ y: initial.getFullYear(), m: initial.getMonth() });
  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const prevDays = new Date(view.y, view.m, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push({ d: prevDays - startDow + 1 + i, m: view.m - 1, other: true });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ d: i, m: view.m, other: false });
  while (cells.length % 7 !== 0) { const i = cells.length - (startDow + daysInMonth) + 1; cells.push({ d: i, m: view.m + 1, other: true }); }
  const shiftMonth = (delta) => { let m = view.m + delta, y = view.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } setView({ y, m }); };
  return (
    <div className="m-cal">
      <div className="m-cal-head">
        <button onClick={() => shiftMonth(-1)} aria-label="Anterior"><Icon name="chevron_left" /></button>
        <div className="month">{MONTH_PT[view.m]} {view.y}</div>
        <button onClick={() => shiftMonth(1)} aria-label="Próximo"><Icon name="chevron_right" /></button>
      </div>
      <div className="m-cal-grid">
        {DOW_PT.map((d, i) => <div key={'dow' + i} className="dow">{d}</div>)}
        {cells.map((c, i) => {
          const date = new Date(view.y, c.m, c.d);
          const isToday = sameDay(date, today);
          const isSel = sameDay(date, value);
          const past = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button key={i} className={'day' + (c.other ? ' is-other' : '') + (isToday ? ' is-today' : '') + (isSel ? ' is-selected' : '')}
              disabled={past} onClick={() => onChange(date)}>{c.d}</button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- Professional card -------------------- */
function ProfCard({ prof }) {
  if (!prof) return <div className="m-prof"><div className="m-prof-empty">Selecione um profissional para ver o perfil.</div></div>;
  return (
    <div className="m-prof">
      <div className="m-prof-top">
        <div className="m-prof-photo" aria-hidden="true"><Icon name="person" /></div>
        <div className="m-prof-id">
          <div className="m-prof-name">{prof.name}</div>
          <div className="m-prof-role">{prof.role}</div>
        </div>
      </div>
      <div className="m-prof-bio">{prof.bio}</div>
      <div className="m-prof-tags">{prof.tags.map(t => <span key={t} className="m-tag">{t}</span>)}</div>
    </div>
  );
}

/* -------------------- Slot card -------------------- */
function SlotCard({ slot, date, prof, defaultOpen, onConfirm, confirmedId }) {
  const [open, setOpen] = useState(defaultOpen);
  const [mode, setMode] = useState('qualquer');
  const isConfirmed = confirmedId === slot.id;
  return (
    <div className={'m-slot' + (open ? ' is-open' : '') + (isConfirmed ? ' is-confirmed' : '')}>
      <div className="m-slot-head" onClick={() => setOpen(o => !o)}>
        <span className="m-slot-person" aria-hidden="true"><Icon name="account_circle" /></span>
        <div className="m-slot-when">
          <div className="m-slot-time">{slot.start} – {slot.end}</div>
          <div className="m-slot-date">{fmtDate(date)}</div>
        </div>
        <button className="m-slot-toggle" aria-label={open ? 'Recolher' : 'Expandir'}
          onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}><Icon name="expand_more" /></button>
      </div>
      <div className="m-slot-body"><div className="inner">
        <div className="m-seg" role="group" aria-label="Modalidade">
          {[{ id: 'presencial', label: 'Presencial' },{ id: 'remoto', label: 'Remoto' },{ id: 'qualquer', label: 'Qualquer' }].map(o => {
            const enabled = o.id === 'qualquer' || !prof || prof.modes.includes(o.id);
            return (
              <button key={o.id} className={mode === o.id ? 'is-selected' : ''} disabled={!enabled}
                onClick={() => enabled && setMode(o.id)}>
                {mode === o.id ? <Icon name="check" style={{ fontSize: 18 }} /> : null}{o.label}
              </button>
            );
          })}
        </div>
        <button className="m-agendar" disabled={isConfirmed} onClick={() => onConfirm(slot, mode)}>
          {isConfirmed ? 'Confirmado' : 'Agendar'}
        </button>
      </div></div>
    </div>
  );
}

/* -------------------- Menu sheet -------------------- */
function MenuSheet({ open, onClose }) {
  const items = ['Home', 'Sobre', 'Contato', 'Agendar'];
  return (
    <Sheet open={open} title="Menu" onClose={onClose}>
      <div className="m-menu">
        {items.map(it => (
          <button key={it} className={'m-menu-item' + (it === 'Agendar' ? ' is-active' : '')} onClick={onClose}>
            {it}{it === 'Agendar' ? <Icon name="check" /> : null}
          </button>
        ))}
        <div className="m-menu-divider"></div>
        <button className="m-menu-item" onClick={onClose}><Icon name="notifications" style={{fontSize:22}} />Notificações<span className="m-menu-badge">3</span></button>
        <button className="m-menu-item" onClick={onClose}><Icon name="account_circle" style={{fontSize:22}} />Diego · Paciente</button>
      </div>
    </Sheet>
  );
}

/* -------------------- Screen -------------------- */
function Screen() {
  const [service, setService] = useState('reichiana');
  const [profId, setProfId] = useState('xeraku');
  const [date, setDate] = useState(new Date(2026, 5, 10));
  const [sheet, setSheet] = useState(null); // 'service' | 'prof' | 'date' | 'menu'
  const [toast, setToast] = useState(null);
  const [confirmedId, setConfirmedId] = useState(null);

  const prof = PROFESSIONALS.find(p => p.id === profId);
  const sv = SERVICES.find(s => s.id === service);
  const slots = slotsFor(profId, date);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const onConfirm = (slot, mode) => {
    setConfirmedId(slot.id);
    const modeLabel = mode === 'qualquer' ? 'qualquer modalidade' : mode;
    flash(`Sessão agendada · ${fmtDate(date)} · ${slot.start} · ${modeLabel}.`);
    setTimeout(() => setConfirmedId(null), 4000);
  };
  useEffect(() => { setConfirmedId(null); }, [service, profId, date]);

  return (
    <div className="m-app">
      <header className="m-header">
        <img className="m-logo" src="assets/logo-horizontal.svg" alt="Care" />
        <div className="m-header-actions">
          <button className="m-icon-btn" aria-label="Notificações" onClick={() => setSheet('menu')}>
            <Icon name="notifications" /><span className="m-notif-dot"></span>
          </button>
          <button className="m-icon-btn" aria-label="Menu" onClick={() => setSheet('menu')}>
            <Icon name="menu" />
          </button>
        </div>
      </header>

      <div className="m-scroll">
        <h1 className="m-title">Agendar consulta</h1>
        <div className="m-stack">
          <Field label="Escolha um serviço" required value={sv ? sv.name : ''} placeholder="Selecione…"
            trailing="expand_more" onClick={() => setSheet('service')} />
          <Field label="Escolha um profissional" required value={prof ? prof.name : ''}
            placeholder={service ? 'Selecione…' : 'Escolha um serviço primeiro'}
            trailing="expand_more" disabled={!service} onClick={() => setSheet('prof')} />
          <ProfCard prof={prof} />
          <Field label="Escolha uma data" value={date ? fmtDate(date) : ''} placeholder="dd/mm/aaaa"
            trailing="calendar_today" onClick={() => setSheet('date')} />

          <div className="m-slots-label">Horários disponíveis</div>
          {slots.length === 0 && <div className="m-slot m-noslots">Sem horários disponíveis para esta data.</div>}
          {slots.map((s, i) => (
            <SlotCard key={s.id} slot={s} date={date} prof={prof} defaultOpen={i === 0}
              confirmedId={confirmedId} onConfirm={onConfirm} />
          ))}
        </div>
      </div>

      {/* Sheets */}
      <Sheet open={sheet === 'service'} title="Escolha um serviço" onClose={() => setSheet(null)}>
        <div className="m-opts">
          {SERVICES.map(s => (
            <button key={s.id} className={'m-opt' + (s.id === service ? ' is-selected' : '')}
              onClick={() => { setService(s.id); setSheet(null); }}>
              <span>{s.name}</span>
              <span className="m-opt-meta">{s.dur}{s.id === service ? <Icon name="check" style={{fontSize:20, marginLeft:8, color:'var(--color-primary-blue)'}} /> : null}</span>
            </button>
          ))}
        </div>
      </Sheet>
      <Sheet open={sheet === 'prof'} title="Escolha um profissional" onClose={() => setSheet(null)}>
        <div className="m-opts">
          {PROFESSIONALS.map(p => (
            <button key={p.id} className={'m-opt m-opt-prof' + (p.id === profId ? ' is-selected' : '')}
              onClick={() => { setProfId(p.id); setSheet(null); }}>
              <span className="m-opt-av">{p.initials}</span>
              <span className="m-opt-prof-meta">
                <span className="m-opt-prof-name">{p.name}</span>
                <span className="m-opt-prof-role">{p.role.split(' · ')[0]}</span>
              </span>
              {p.id === profId ? <Icon name="check" style={{color:'var(--color-primary-blue)'}} /> : null}
            </button>
          ))}
        </div>
      </Sheet>
      <Sheet open={sheet === 'date'} title="Escolha uma data" onClose={() => setSheet(null)}>
        <Calendar value={date} onChange={(d) => { setDate(d); setSheet(null); }} />
      </Sheet>
      <MenuSheet open={sheet === 'menu'} onClose={() => setSheet(null)} />

      {toast && <div className="m-toast">{toast}</div>}
    </div>
  );
}

function App() {
  return (
    <div className="m-wrap">
      <IOSDevice>
        <Screen />
      </IOSDevice>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
