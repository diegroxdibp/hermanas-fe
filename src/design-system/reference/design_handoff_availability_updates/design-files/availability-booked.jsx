/* ===========================================================
   Booked-slot awareness + edit guards — prototype v4
   No header. Each slot band: time · per-slot recurrence ·
   (booked) SERVICE on top + patient. Modality = block colour.
   =========================================================== */

const { useState: useBkState } = React;
const BMI = ({ name, style }) => <span className="material-symbols-outlined" style={style}>{name}</span>;

const B_HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
const B_ROW = 52;
const bToMin = (t) => { const [h,m]=t.split(':').map(Number); return h*60+m; };
const bMinTo = (m) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const bRowIdx = (t) => bToMin(t)/60 - 8;
const initials = (name) => name.split(' ').filter(Boolean).slice(0,2).map(n=>n[0].toUpperCase()).join('');
const firstName = (name) => name.split(' ')[0];

const B_HEAD = [
  { dow:'Seg', n:12 }, { dow:'Ter', n:13 }, { dow:'Qua', n:14, today:true },
  { dow:'Qui', n:15 }, { dow:'Sex', n:16 }, { dow:'Sáb', n:17 }, { dow:'Dom', n:18 },
];

const NAME_POOL = ['Joana Almeida','Marcos Reis','Beatriz Pinto','André Salles','Catarina V.'];
const SVC_POOL = ['Análise Reichiana','Mindfulness','Somatic Exp.®','Supervisão'];
const SVC_SHORT = { 'Análise Reichiana':'Reichiana', 'Mindfulness':'Mindfulness', 'Somatic Exp.®':'Somatic', 'Somatic Experience®':'Somatic', 'Supervisão':'Supervisão' };

// build slot list from start/end/dur + booked count; each slot carries recurring + svc
function buildSlots(b) {
  if (b.slots) return b.slots;
  const out = [];
  let m = bToMin(b.start);
  const end = bToMin(b.end);
  let i = 0;
  while (m + b.dur <= end) {
    const booked = i < b.booked;
    out.push({
      time: bMinTo(m), booked,
      patient: booked ? NAME_POOL[i % NAME_POOL.length] : undefined,
      svc: booked ? SVC_POOL[i % SVC_POOL.length] : undefined,
      recurring: b.recurring !== undefined ? b.recurring : true,
    });
    m += b.dur; i++;
  }
  return out;
}

// Selected block: Wed 14:00–18:00, 60min, 4 slots; mixed recurrence + bookings
const SEL_BLOCK = {
  col: 2, start: '14:00', end: '18:00', mod: '', dur: 60,
  slots: [
    { time: '14:00', booked: true,  patient: 'Joana Almeida', svc: 'Análise Reichiana', recurring: true },
    { time: '15:00', booked: false, recurring: true },
    { time: '16:00', booked: true,  patient: 'Marcos Reis',   svc: 'Mindfulness',       recurring: false },
    { time: '17:00', booked: false, recurring: false },
  ],
};

const OTHER_BLOCKS = [
  { id:'a', col:0, start:'09:00', end:'12:00', mod:'', dur:60, booked:1, recurring:true },
  { id:'b', col:3, start:'10:00', end:'13:00', mod:'remoto', dur:60, booked:3, recurring:true },
  { id:'c', col:4, start:'16:00', end:'19:00', mod:'any', dur:60, booked:0, recurring:false },
  { id:'d', col:5, start:'11:00', end:'12:00', mod:'', dur:60, booked:1, recurring:false }, // 1h booked
];

const RecIcon = ({ recurring }) => (
  <span className={"bd-rec" + (recurring ? '' : ' unica')}>
    <BMI name={recurring ? 'event_repeat' : 'push_pin'} />
  </span>
);

/* calendar block → per-slot bands, no header */
function CalBlock({ b, selected, onSlotClick, selSlotKey }) {
  const top = bRowIdx(b.start) * B_ROW + 3;
  const height = (bRowIdx(b.end) - bRowIdx(b.start)) * B_ROW - 6;
  const slots = buildSlots(b);
  const bookedN = slots.filter(s => s.booked).length;
  const full = bookedN === slots.length && slots.length > 0;
  const bandH = height / slots.length;
  const dense = bandH < 30;

  return (
    <div
      className={"block " + (b.mod || '') + (bookedN > 0 ? ' pinned' : '') + (full ? ' full-booked' : '') + (dense ? ' dense' : '') + (selected ? ' selected' : '')}
      style={{ top, height }}>
      <div className="b-bands">
        {slots.map((s, i) => {
          const key = b.start + '-' + s.time;
          return (
            <div key={i}
              className={"b-band " + (s.booked ? 'booked' : 'free') + (selSlotKey === key ? ' sel-slot' : '')}
              onClick={s.booked && onSlotClick ? (e) => { e.stopPropagation(); onSlotClick(s, key); } : undefined}>
              <div className="bd-row">
                <span className="bd-time">{s.time}</span>
                <RecIcon recurring={s.recurring} />
              </div>
              {s.booked ? (
                <>
                  <span className="bd-svc">{SVC_SHORT[s.svc] || s.svc}</span>
                  <span className="bd-name">{firstName(s.patient)}</span>
                </>
              ) : (
                <span className="bd-name">livre</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* editor slot list */
function SlotList({ slots, dur }) {
  const booked = slots.filter(s => s.booked).length;
  return (
    <div className="be-section slots-section">
      <div className="ss-head">
        <label className="control-label" style={{ margin: 0 }}>Sessões geradas</label>
        <span className={"ss-count" + (booked === 0 ? ' none' : '')}>
          {booked === 0 ? `${slots.length} livres` : `${booked} de ${slots.length} reservadas`}
        </span>
      </div>
      <div className="slot-list">
        {slots.map((s, i) => (
          <div key={i} className={"slot-row " + (s.booked ? 'booked' : 'free')}>
            {s.booked
              ? <span className={"s-av c" + (i % 4)}>{initials(s.patient)}</span>
              : <span className="s-dot" />}
            <span className="s-time">{s.time}</span>
            <div className="s-body">
              {s.booked
                ? <>
                    <div className="s-name">{s.patient}</div>
                    <div className="s-meta">
                      {s.svc} · {dur} min
                      <span className="rec"><BMI name={s.recurring ? 'event_repeat' : 'push_pin'} />{s.recurring ? 'semanal' : 'única'}</span>
                    </div>
                  </>
                : <>
                    <div className="s-name">Livre</div>
                    <div className="s-meta">
                      <span className="rec"><BMI name={s.recurring ? 'event_repeat' : 'push_pin'} />{s.recurring ? 'semanal' : 'única'}</span>
                    </div>
                  </>}
            </div>
            {s.booked ? <span className="s-chev"><BMI name="chevron_right" /></span> : <span />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Desktop ── */
function BookedDesktop() {
  const sb = SEL_BLOCK;
  const [appt, setAppt] = useBkState(null); // {slot, key} when a booked slot is clicked
  return (
    <div className="av av-board">
      <div className="panel-head">
        <div className="kicker">Disponibilidades · Sessões reservadas</div>
        <h1>Quando há sessões marcadas</h1>
        <p className="sub">Cada bloco mostra as suas sessões hora a hora — qual está livre, qual está reservada (com o serviço marcado) e se cada uma é semanal ou de data única. As sessões reservadas ficam protegidas.</p>
      </div>

      <div className="panel-body">
        <div className="merge-layout">
          <div>
            <div className="cal-toolbar">
              <div className="wk-nav">
                <button className="today-btn">Hoje</button>
                <button><BMI name="chevron_left" /></button>
                <span className="wk-label">12 – 18 Maio · 2026</span>
                <button><BMI name="chevron_right" /></button>
              </div>
              <div className="legend">
                <span className="lg"><span className="sw presencial" />Presencial</span>
                <span className="lg"><span className="sw remoto" />Remoto</span>
                <span className="lg"><span className="sw any" />Qualquer</span>
                <span className="lg-sep" />
                <span className="lg"><BMI name="event_repeat" />Semanal</span>
                <span className="lg"><BMI name="push_pin" />Data única</span>
              </div>
            </div>

            <div className="cal">
              <div className="cal-head">
                <div className="corner" />
                {B_HEAD.map((d,i) => (
                  <div key={i} className={"dh" + (d.today ? ' today' : '')}>
                    <div className="dow">{d.dow}</div><div className="dn">{d.n}</div>
                  </div>
                ))}
              </div>
              <div className="cal-body">
                <div className="cal-gutter">{B_HOURS.map(h => <div key={h} className="tcell">{h}</div>)}</div>
                {B_HEAD.map((d, di) => (
                  <div key={di} className="daycol">
                    {B_HOURS.map((h,hi) => <div key={hi} className="hcell" />)}
                    {OTHER_BLOCKS.filter(b => b.col === di).map(b => <CalBlock key={b.id} b={b} />)}
                    {sb.col === di && <CalBlock b={sb} selected onSlotClick={(s, key) => setAppt({ slot: s, key })} selSlotKey={appt?.key} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="cal-hint">
              <BMI name="info" />
              Bandas mais claras são horários livres; as preenchidas mostram o serviço e o paciente. O ícone à direita diz se a sessão é semanal ou única.
            </div>
          </div>

          {appt ? (
            <AppointmentDetail slot={appt.slot} onBack={() => setAppt(null)} />
          ) : (
          <aside className="block-editor">
            <div className="be-head">
              <div>
                <div className="be-title">Disponibilidade de quarta</div>
                <div className="be-sub">Quartas-feiras · das 14:00 às 18:00</div>
              </div>
              <span className="be-chip"><BMI name="event_repeat" />Semanal</span>
            </div>

            <div className="be-body">
              <div className="book-notice">
                <BMI name="event_available" />
                <div className="bn-text">
                  <strong>2 sessões reservadas</strong> neste bloco (14:00 e 16:00). Para as proteger, alguns campos ficam fixos. Pode estender o horário e adicionar serviços livremente.
                </div>
              </div>

              <SlotList slots={sb.slots} dur={sb.dur} />

              <div className="be-section">
                <label className="control-label">Serviço <span className="req">*</span></label>
                <div className="chips">
                  <button className="chip booked-svc">Análise Reichiana<span className="bdot" /></button>
                  <button className="chip booked-svc">Mindfulness<span className="bdot" /></button>
                  <button className="chip">Somatic Experience®</button>
                  <button className="chip">Supervisão</button>
                </div>
                <div className="hint"><BMI name="info" />Serviços com reservas (•) não podem ser removidos.</div>
              </div>

              <div className="be-section fixed">
                <label className="control-label">Frequência <span className="fixed-tag">fixo</span></label>
                <div className="seg">
                  <button>Data única</button>
                  <button className="on">Semanal</button>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label className="control-label">Dias da semana</label>
                  <div className="weekdays">
                    {['S','T','Q','Q','S','S','D'].map((d,i) => (
                      <button key={i} className={"weekday" + (i===2 ? ' on' : '')}>{d}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="be-section">
                <label className="control-label">Intervalo de horas</label>
                <div className="time-row">
                  <div className="time-field fixed" style={{ flex: 1 }}>
                    <span className="field-label">Início <span className="fixed-tag">fixo</span></span>
                    <div className="time-value"><BMI name="schedule" /><span>14:00</span></div>
                  </div>
                  <div className="time-field" style={{ flex: 1 }}>
                    <span className="field-label">Fim</span>
                    <div className="time-value"><BMI name="schedule" /><span>18:00</span><BMI name="expand_more" style={{ fontSize: 16, marginLeft: 'auto', color: 'var(--color-secondary-indigo)' }} /></div>
                  </div>
                </div>
                <label className="control-label fixed" style={{ marginTop: 14 }}>Duração de cada sessão <span className="fixed-tag">fixo</span></label>
                <div className="seg fixed">
                  <button>30 min</button>
                  <button className="on">60 min</button>
                  <button>90 min</button>
                </div>
                <div className="hint"><BMI name="info" />A duração só muda quando não há sessões reservadas.</div>
              </div>
            </div>

            <div className="be-actions">
              <button className="btn-add"><BMI name="check" />Guardar disponibilidade</button>
              <div className="remove-guard">
                <BMI name="event_busy" />
                <div className="rg-text">
                  <strong>Este bloco não pode ser removido.</strong> Tem 2 sessões reservadas — cancele ou reagende essas sessões primeiro.
                </div>
              </div>
            </div>
          </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/* Appointment detail shown in the right column when a booked slot is clicked */
function AppointmentDetail({ slot, onBack }) {
  const ci = ['c0','c1','c2'][(slot.time.charCodeAt(1)) % 3];
  return (
    <aside className="block-editor appt-detail">
      <div className="be-head" style={{ display: 'block' }}>
        <button className="be-back" onClick={onBack}><BMI name="arrow_back" />Voltar ao bloco</button>
        <div className="be-title">Sessão reservada</div>
      </div>
      <div className="be-body">
        <div className="ad-patient">
          <span className={"ad-av " + ci}>{initials(slot.patient)}</span>
          <div>
            <div className="pt-name">{slot.patient}</div>
            <div className="pt-sub">Paciente</div>
          </div>
        </div>
        <div className="ad-rows">
          <div className="ad-row">
            <BMI name="medical_services" />
            <div><div className="ad-k">Serviço</div><div className="ad-v">{slot.svc}</div></div>
          </div>
          <div className="ad-row">
            <BMI name="schedule" />
            <div><div className="ad-k">Horário</div><div className="ad-v">Quarta, 14 Mai · {slot.time}–{bMinTo(bToMin(slot.time)+60)}</div></div>
          </div>
          <div className="ad-row">
            <BMI name={slot.recurring ? 'event_repeat' : 'push_pin'} />
            <div><div className="ad-k">Recorrência</div><div className="ad-v">{slot.recurring ? 'Semanal' : 'Data única'}</div></div>
          </div>
          <div className="ad-row">
            <BMI name="location_on" />
            <div><div className="ad-k">Modalidade</div><div className="ad-v"><span className="ad-pill presencial">Presencial</span></div></div>
          </div>
          <div className="ad-row">
            <BMI name="mail" />
            <div><div className="ad-k">Contacto</div><div className="ad-v">{firstName(slot.patient).toLowerCase()}@email.com</div></div>
          </div>
        </div>
      </div>
      <div className="be-actions">
        <div className="ad-actions">
          <button className="btn-resched"><BMI name="edit_calendar" />Reagendar sessão</button>
          <button className="btn-cancel"><BMI name="close" />Cancelar sessão</button>
        </div>
      </div>
    </aside>
  );
}

/* ── Anatomy ── */
function BookedAnatomy() {
  const States = [
    { h: 150, label:'Sem reservas', desc:'Bandas livres (claras). Cada uma indica se é semanal ou de data única.',
      b:{ start:'14:00', end:'17:00', mod:'', dur:60, booked:0, recurring:true } },
    { h: 202, label:'Reservas + recorrência mista', desc:'14:00 semanal (Reichiana/Joana); 16:00 data única (Mindfulness/Marcos). 15:00 e 17:00 livres.',
      b:{ start:'14:00', end:'18:00', mod:'', dur:60, slots:[
        { time:'14:00', booked:true, patient:'Joana Almeida', svc:'Análise Reichiana', recurring:true },
        { time:'15:00', booked:false, recurring:true },
        { time:'16:00', booked:true, patient:'Marcos Reis', svc:'Mindfulness', recurring:false },
        { time:'17:00', booked:false, recurring:false },
      ] } },
    { h: 46, label:'Bloco de 1 hora', desc:'Uma só banda: hora, serviço, paciente e recorrência. Continua legível.',
      b:{ start:'14:00', end:'15:00', mod:'remoto', dur:60, booked:1, recurring:false } },
  ];
  return (
    <div className="av av-board">
      <div className="panel-head">
        <div className="kicker">Disponibilidades · Anatomia</div>
        <h1>Cada slot, descrito no bloco</h1>
        <p className="sub">Sem cabeçalho: cada banda traz a hora, o estado, o serviço marcado e a recorrência. A modalidade fica na cor do bloco.</p>
      </div>
      <div className="panel-body">
        <div className="anat-wrap">
          {States.map((s, i) => (
            <div key={i} className="anat-col">
              <div className="anat-stage" style={{ height: s.h + 28 }}>
                <CalBlock b={s.b} />
              </div>
              <div className="anat-cap">
                <div className="t">{s.label}</div>
                <div className="d">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="anat-note">
          A recorrência é por sessão: um bloco pode ter umas bandas semanais (↻) e outras de data única (📌).
        </div>
      </div>
    </div>
  );
}

/* ── Mobile ── */
function MobBlock({ b, rowH }) {
  const top = bRowIdx(b.start) * rowH + 3;
  const height = (bRowIdx(b.end) - bRowIdx(b.start)) * rowH - 6;
  const slots = buildSlots(b);
  const bookedN = slots.filter(s => s.booked).length;
  const full = bookedN === slots.length;
  return (
    <div className={"m-block " + (b.mod || '') + (bookedN>0?' pinned':'') + (full?' full-booked':'')} style={{ top, height }}>
      <div className="mb-bands">
        {slots.map((s,i) => (
          <div key={i} className={"mb-band " + (s.booked ? 'booked' : 'free')}>
            <span className="bd-time">{s.time}</span>
            <div className="bd-main">
              {s.booked
                ? <><span className="bd-svc">{SVC_SHORT[s.svc] || s.svc}</span><span className="bd-name">{firstName(s.patient)}</span></>
                : <span className="bd-name">livre</span>}
            </div>
            <RecIcon recurring={s.recurring} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BookedMobile() {
  const M_ROW = 46;
  const slots = SEL_BLOCK.slots;
  return (
    <div className="av mob" style={{ position:'relative' }}>
      <div className="m-top">
        <div className="m-title">Maio<small>Disponibilidades · semana 12–18</small></div>
        <div className="m-actions"><button className="m-icon"><BMI name="calendar_view_week" /></button><div className="m-avatar">LB</div></div>
      </div>
      <div className="m-strip">
        {B_HEAD.map((d,i) => (
          <button key={i} className={"m-day" + (i===2 ? ' sel' : '')}>
            <span className="wd">{d.dow[0]}</span><span className="dn">{d.n}</span>
            <span className={"dot" + ((i===0||i===2||i===3||i===4) ? '' : ' hidden')} />
          </button>
        ))}
      </div>
      <div className="m-agenda">
        <div className="m-daylabel">Quarta-feira, 14 de Maio</div>
        <div className="m-tl">
          {B_HOURS.map((h,i) => <div key={i} className="m-hour"><span className="lbl">{h}</span></div>)}
          <MobBlock b={SEL_BLOCK} rowH={M_ROW} />
        </div>
      </div>
      <button className="m-fab"><BMI name="add" /></button>
      <nav className="m-nav">
        <a><BMI name="home" /><span>Início</span></a>
        <a className="active"><BMI name="calendar_month" /><span>Agenda</span></a>
        <a><BMI name="forum" /><span>Mensagens</span></a>
        <a><BMI name="person" /><span>Conta</span></a>
      </nav>

      <div className="m-scrim" />
      <div className="m-sheet">
        <div className="handle" />
        <div className="sh-head">
          <h3>Disponibilidade de quarta</h3>
          <button className="sh-close"><BMI name="close" /></button>
        </div>
        <div className="sh-body">
          <div className="book-notice">
            <BMI name="event_available" />
            <div className="bn-text"><strong>2 sessões reservadas</strong> (14:00 e 16:00). Alguns campos ficam fixos para não desmarcar pacientes.</div>
          </div>
          <SlotList slots={slots} dur={SEL_BLOCK.dur} />
        </div>
        <div className="sh-foot">
          <div className="remove-guard" style={{ marginBottom: 10 }}>
            <BMI name="event_busy" />
            <div className="rg-text"><strong>Não pode ser removido</strong> enquanto tiver sessões reservadas.</div>
          </div>
          <button className="btn-add"><BMI name="check" />Guardar disponibilidade</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BookedDesktop, BookedAnatomy, BookedMobile });
