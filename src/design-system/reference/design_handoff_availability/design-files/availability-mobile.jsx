/* ===========================================================
   Therapist availability — mobile (Teams-style)
   MobileCalendar (calendar + FAB + nav)
   MobileCreate   (calendar dimmed + bottom-sheet form)
   =========================================================== */

const { useState: useMob } = React;
const MMI = ({ name, style }) => <span className="material-symbols-outlined" style={style}>{name}</span>;

const M_SERVICES = ['Análise Reichiana', 'Mindfulness', 'Somatic Experience®', 'Supervisão'];
const M_HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
const M_ROW = 46;

// Selected day = Qua 14. Blocks for that day:
const M_BLOCKS = [
  { id: 1, start: 6, span: 4, mod: '',    svc: 'Análise Reichiana', slots: 4, freq: 'semanal' },
];
// Week strip; days with availability get a dot
const M_WEEK = [
  { wd: 'S', n: 12, has: true },
  { wd: 'T', n: 13, has: false },
  { wd: 'Q', n: 14, has: true, sel: true },
  { wd: 'Q', n: 15, has: true },
  { wd: 'S', n: 16, has: true },
  { wd: 'S', n: 17, has: false },
  { wd: 'D', n: 18, has: false },
];

function MobCalendarInner() {
  return (
    <>
      <div className="m-top">
        <div className="m-title">Maio<small>Disponibilidades · semana 12–18</small></div>
        <div className="m-actions">
          <button className="m-icon"><MMI name="calendar_view_week" /></button>
          <div className="m-avatar">LB</div>
        </div>
      </div>

      <div className="m-strip">
        {M_WEEK.map((d, i) => (
          <button key={i} className={"m-day" + (d.sel ? ' sel' : '')}>
            <span className="wd">{d.wd}</span>
            <span className="dn">{d.n}</span>
            <span className={"dot" + (d.has ? '' : ' hidden')} />
          </button>
        ))}
      </div>

      <div className="m-agenda">
        <div className="m-daylabel">Quarta-feira, 14 de Maio</div>
        <div className="m-tl">
          {M_HOURS.map((h, i) => (
            <div key={i} className="m-hour"><span className="lbl">{h}</span></div>
          ))}
          {M_BLOCKS.map(b => {
            const unica = b.freq === 'unica';
            return (
              <div
                key={b.id}
                className={"m-block " + b.mod + (unica ? ' unica' : '')}
                style={{ top: b.start * M_ROW + 3, height: b.span * M_ROW - 6 }}
              >
                <div className="mb-top">
                  <span className="mb-time">{M_HOURS[b.start]} – {M_HOURS[b.start + b.span]}</span>
                  <span className="mb-badge"><MMI name={unica ? 'push_pin' : 'event_repeat'} /></span>
                </div>
                <div className="mb-svc">{b.svc}</div>
                <div className="mb-meta">
                  <span><MMI name="location_on" />Consultório</span>
                  <span><MMI name="grid_view" />{b.slots} sessões</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function MobNav() {
  return (
    <nav className="m-nav">
      <a><MMI name="home" /><span>Início</span></a>
      <a className="active"><MMI name="calendar_month" /><span>Agenda</span></a>
      <a><MMI name="forum" /><span>Mensagens</span></a>
      <a><MMI name="person" /><span>Conta</span></a>
    </nav>
  );
}

/* Screen 1 — calendar with FAB */
function MobileCalendar() {
  return (
    <div className="av mob">
      <MobCalendarInner />
      <button className="m-fab" aria-label="Nova disponibilidade"><MMI name="add" /></button>
      <MobNav />
    </div>
  );
}

/* Screen 2 — FAB tapped → bottom sheet create menu */
function MobileCreate() {
  const [modality, setModality] = useMob('Presencial');
  const [freq, setFreq] = useMob('Semanal');
  const [services, setServices] = useMob(['Análise Reichiana']);
  const [days, setDays] = useMob(['Qua']);
  const weekdays = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const toggleSvc = (s) => setServices(v => v.includes(s) ? v.filter(x => x !== s) : [...v, s]);
  const toggleDay = (d) => setDays(v => v.includes(d) ? v.filter(x => x !== d) : [...v, d]);

  return (
    <div className="av mob">
      <MobCalendarInner />
      <MobNav />

      <div className="m-scrim" />
      <div className="m-sheet">
        <div className="handle" />
        <div className="sh-head">
          <h3>Nova disponibilidade</h3>
          <button className="sh-close"><MMI name="close" /></button>
        </div>

        <div className="sh-body">
          <div className="sh-section">
            <label className="control-label">Serviço <span className="req">*</span></label>
            <div className="chips">
              {M_SERVICES.map(s => (
                <button key={s} className={"chip" + (services.includes(s) ? ' on' : '')} onClick={() => toggleSvc(s)}>
                  <MMI name="check" />{s}
                </button>
              ))}
            </div>
          </div>

          <div className="sh-section">
            <label className="control-label">Modalidade <span className="req">*</span></label>
            <div className="seg">
              {['Presencial','Remoto','Qualquer'].map(m => (
                <button
                  key={m}
                  className={(modality === m ? 'on ' : '') + (m === 'Presencial' ? 'presencial' : m === 'Remoto' ? 'remoto' : '')}
                  onClick={() => setModality(m)}
                >
                  {modality === m && <MMI name="check" />}{m}
                </button>
              ))}
            </div>
          </div>

          <div className="sh-section">
            <label className="control-label">Frequência</label>
            <div className="seg">
              {['Data única','Semanal'].map(f => (
                <button key={f} className={freq === f ? 'on' : ''} onClick={() => setFreq(f)}>
                  {freq === f && <MMI name="check" />}{f}
                </button>
              ))}
            </div>
            {freq === 'Semanal' ? (
              <div style={{ marginTop: 14 }}>
                <label className="control-label">Dias da semana</label>
                <div className="weekdays">
                  {weekdays.map(d => (
                    <button key={d} className={"weekday" + (days.includes(d) ? ' on' : '')} onClick={() => toggleDay(d)}>
                      {d[0]}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="field" style={{ marginTop: 14 }}>
                <div className="field-inner">
                  <span className="field-label">Data</span>
                  <span className="field-value">14/05/2026</span>
                </div>
                <MMI name="calendar_today" style={{ fontSize: 20, color: 'var(--color-secondary-indigo)' }} />
              </div>
            )}
          </div>

          <div className="sh-section">
            <label className="control-label">Intervalo de horas</label>
            <div className="time-row">
              <div className="time-field">
                <span className="field-label">Início</span>
                <div className="time-value"><MMI name="schedule" /><span>14:00</span></div>
              </div>
              <div className="time-field">
                <span className="field-label">Fim</span>
                <div className="time-value"><MMI name="schedule" /><span>18:00</span></div>
              </div>
            </div>
            <label className="control-label" style={{ marginTop: 14 }}>Duração de cada sessão</label>
            <div className="seg">
              <button>50 min</button>
              <button className="on">60 min</button>
              <button>90 min</button>
            </div>
            <div className="hint"><MMI name="info" />Gera 4 sessões agendáveis:</div>
            <div className="slots-preview">
              {['14:00','15:00','16:00','17:00'].map(t => <span key={t} className="slot-pill">{t}</span>)}
            </div>
          </div>
        </div>

        <div className="sh-foot">
          <button className="btn-add"><MMI name="check" />Guardar disponibilidade</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileCalendar, MobileCreate });
