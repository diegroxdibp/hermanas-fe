/* ===========================================================
   Merged B+A — weekly calendar with "Quando"-style block editor
   =========================================================== */

const { useState: useWk } = React;
const WMI = ({ name, style }) => <span className="material-symbols-outlined" style={style}>{name}</span>;

const WK_SERVICES = ['Análise Reichiana', 'Mindfulness', 'Somatic Experience®', 'Supervisão'];
const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
const ROW_H = 52;

// day index 0=Seg … blocks reference start (hour index) + span (hours)
const WK_BLOCKS = [
  { id: 1, day: 0, start: 1, span: 3, mod: '',       svc: 'Análise Reichiana', slots: 3, freq: 'semanal' },
  { id: 2, day: 2, start: 6, span: 4, mod: '',       svc: 'Análise Reichiana', slots: 4, freq: 'semanal' },
  { id: 3, day: 3, start: 2, span: 3, mod: 'remoto', svc: 'Mindfulness',       slots: 3, freq: 'semanal' },
  { id: 4, day: 4, start: 8, span: 3, mod: 'any',    svc: 'Somatic Exp.®',     slots: 3, freq: 'unica' },
];

function AvailabilityWeek() {
  const [selectedId, setSelectedId] = useWk(2);
  const [modality, setModality] = useWk('Presencial');
  const [freq, setFreq] = useWk('Semanal');
  const [services, setServices] = useWk(['Análise Reichiana']);
  const [days, setDays] = useWk(['Qua']);

  const weekdays = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const headDays = [
    { dow:'Seg', n:12 }, { dow:'Ter', n:13 }, { dow:'Qua', n:14, today:true },
    { dow:'Qui', n:15 }, { dow:'Sex', n:16 }, { dow:'Sáb', n:17 }, { dow:'Dom', n:18 },
  ];

  const toggleSvc = (s) => setServices(v => v.includes(s) ? v.filter(x => x !== s) : [...v, s]);
  const toggleDay = (d) => setDays(v => v.includes(d) ? v.filter(x => x !== d) : [...v, d]);

  const blocksFor = (di) => WK_BLOCKS.filter(b => b.day === di);

  return (
    <div className="av av-board">
      <div className="panel-head">
        <div className="kicker">Disponibilidades · Vista semanal</div>
        <h1>A sua semana de atendimentos</h1>
        <p className="sub">Toque numa célula para abrir um bloco, ou num bloco existente para o editar. Os detalhes — serviço, modalidade, horas — ficam na coluna à direita.</p>
      </div>

      <div className="panel-body">
        <div className="merge-layout">

          {/* ─── Calendar ─── */}
          <div>
            <div className="cal-toolbar">
              <div className="wk-nav">
                <button className="today-btn">Hoje</button>
                <button><WMI name="chevron_left" /></button>
                <span className="wk-label">12 – 18 Maio · 2026</span>
                <button><WMI name="chevron_right" /></button>
              </div>
              <div className="legend">
                <span className="lg"><span className="sw presencial" />Presencial</span>
                <span className="lg"><span className="sw remoto" />Remoto</span>
                <span className="lg"><span className="sw any" />Qualquer</span>
                <span className="lg-sep" />
                <span className="lg"><WMI name="event_repeat" />Semanal</span>
                <span className="lg"><span className="pin-badge"><WMI name="push_pin" /></span>Data única</span>
              </div>
            </div>

            <div className="cal">
              <div className="cal-head">
                <div className="corner" />
                {headDays.map((d, i) => (
                  <div key={i} className={"dh" + (d.today ? ' today' : '')}>
                    <div className="dow">{d.dow}</div>
                    <div className="dn">{d.n}</div>
                  </div>
                ))}
              </div>

              <div className="cal-body">
                <div className="cal-gutter">
                  {HOURS.map(h => <div key={h} className="tcell">{h}</div>)}
                </div>

                {headDays.map((d, di) => (
                  <div key={di} className="daycol">
                    {HOURS.map((h, hi) => <div key={hi} className="hcell" />)}
                    {blocksFor(di).map(b => {
                      const isUnica = b.freq === 'unica';
                      return (
                        <div
                          key={b.id}
                          className={"block " + b.mod + (isUnica ? ' unica' : '') + (selectedId === b.id ? ' selected' : '')}
                          style={{ top: b.start * ROW_H + 3, height: b.span * ROW_H - 6 }}
                          onClick={() => setSelectedId(b.id)}
                        >
                          <div className="b-top">
                            <span className="b-time">{HOURS[b.start]}–{HOURS[b.start + b.span]}</span>
                            <span className="b-badge"><WMI name={isUnica ? 'push_pin' : 'event_repeat'} /></span>
                          </div>
                          <div className="b-svc">{b.svc}</div>
                          <div className="b-slots">{b.slots} sessões</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="cal-hint">
              <WMI name="touch_app" />
              Arraste verticalmente numa coluna para definir o intervalo de horas de um novo bloco.
            </div>
          </div>

          {/* ─── Block editor (A's "Quando" + Serviço + Modalidade) ─── */}
          <aside className="block-editor">
            <div className="be-head">
              <div>
                <div className="be-title">Bloco de quarta</div>
                <div className="be-sub">14 de Maio · 2026</div>
              </div>
              <span className="be-chip"><WMI name="event_repeat" />Semanal</span>
            </div>

            <div className="be-body">
              {/* Serviço */}
              <div className="be-section">
                <label className="control-label">Serviço <span className="req">*</span></label>
                <div className="chips">
                  {WK_SERVICES.map(s => (
                    <button key={s} className={"chip" + (services.includes(s) ? ' on' : '')} onClick={() => toggleSvc(s)}>
                      <WMI name="check" />{s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modalidade — full-width segmented (fixed) */}
              <div className="be-section">
                <label className="control-label">Modalidade <span className="req">*</span></label>
                <div className="seg">
                  {['Presencial','Remoto','Qualquer'].map(m => (
                    <button
                      key={m}
                      className={(modality === m ? 'on ' : '') + (m === 'Presencial' ? 'presencial' : m === 'Remoto' ? 'remoto' : '')}
                      onClick={() => setModality(m)}
                    >
                      {modality === m && <WMI name="check" />}{m}
                    </button>
                  ))}
                </div>
                {modality !== 'Remoto' && (
                  <div className="field" style={{ marginTop: 12 }}>
                    <div className="field-inner">
                      <span className="field-label">Local</span>
                      <span className="field-value" style={{ fontSize: 14 }}>Consultório · R. da Misericórdia 53</span>
                    </div>
                    <WMI name="location_on" style={{ fontSize: 20, color: 'var(--color-secondary-indigo)' }} />
                  </div>
                )}
              </div>

              {/* Frequência */}
              <div className="be-section">
                <label className="control-label">Frequência</label>
                <div className="seg">
                  {['Data única','Semanal'].map(f => (
                    <button key={f} className={freq === f ? 'on' : ''} onClick={() => setFreq(f)}>
                      {freq === f && <WMI name="check" />}{f}
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
                    <WMI name="calendar_today" style={{ fontSize: 20, color: 'var(--color-secondary-indigo)' }} />
                  </div>
                )}
              </div>

              {/* Horas */}
              <div className="be-section">
                <label className="control-label">Intervalo de horas</label>
                <div className="time-row">
                  <div className="time-field">
                    <span className="field-label">Início</span>
                    <div className="time-value"><WMI name="schedule" /><span>14:00</span></div>
                  </div>
                  <div className="time-field">
                    <span className="field-label">Fim</span>
                    <div className="time-value"><WMI name="schedule" /><span>18:00</span></div>
                  </div>
                </div>
                <label className="control-label" style={{ marginTop: 14 }}>Duração de cada sessão</label>
                <div className="seg">
                  <button>50 min</button>
                  <button className="on">60 min</button>
                  <button>90 min</button>
                </div>

                <div className="hint"><WMI name="info" />Gera 4 sessões agendáveis:</div>
                <div className="slots-preview">
                  {['14:00','15:00','16:00','17:00'].map(t => <span key={t} className="slot-pill">{t}</span>)}
                </div>
              </div>
            </div>

            <div className="be-actions">
              <button className="btn-add"><WMI name="check" />Guardar bloco</button>
              <button className="btn-remove"><WMI name="delete" />Remover bloco</button>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AvailabilityWeek });
