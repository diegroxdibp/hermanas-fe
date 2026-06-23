/* ===========================================================
   Therapist availability — three design suggestions
   A · Form + list   B · Weekly painter   C · Recurring rules
   =========================================================== */

const { useState: useAvState } = React;
const AvMI = window.MI || (({ name, style }) => <span className="material-symbols-outlined" style={style}>{name}</span>);

const SERVICES = ['Análise Reichiana', 'Mindfulness', 'Somatic Experience®', 'Supervisão'];

/* ─────────────────────────────────────────────────────────
   Shared panel header
   ───────────────────────────────────────────────────────── */
function PanelHead({ kicker, title, sub }) {
  return (
    <div className="panel-head">
      <div className="kicker">{kicker}</div>
      <h1>{title}</h1>
      <p className="sub">{sub}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Suggestion A — Form + list (Nova disponibilidade)
   ───────────────────────────────────────────────────────── */
function SuggestionA() {
  const [modality, setModality] = useAvState('Presencial');
  const [freq, setFreq] = useAvState('Semanal');
  const [services, setServices] = useAvState(['Análise Reichiana']);
  const [days, setDays] = useAvState(['Qua']);
  const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const toggleSvc = (s) => setServices(v => v.includes(s) ? v.filter(x => x !== s) : [...v, s]);
  const toggleDay = (d) => setDays(v => v.includes(d) ? v.filter(x => x !== d) : [...v, d]);

  return (
    <div className="av av-board">
      <PanelHead
        kicker="Disponibilidades"
        title="Criar nova disponibilidade"
        sub="Defina os blocos em que está disponível. Cada bloco é dividido automaticamente em sessões agendáveis pelos pacientes."
      />
      <div className="panel-body">
        <div className="form-grid">

          <div className="form-card">
            <div className="fc-head">
              <AvMI name="medical_services" />
              <h3>Serviço e modalidade</h3>
            </div>

            <label className="control-label">Serviços <span className="req">*</span></label>
            <div className="chips" style={{ marginBottom: 22 }}>
              {SERVICES.map(s => (
                <button key={s} className={"chip" + (services.includes(s) ? ' on' : '')} onClick={() => toggleSvc(s)}>
                  <AvMI name="check" />{s}
                </button>
              ))}
            </div>

            <label className="control-label">Modalidade <span className="req">*</span></label>
            <div className="seg">
              {['Presencial', 'Remoto', 'Qualquer'].map(m => (
                <button
                  key={m}
                  className={(modality === m ? 'on ' : '') + (m === 'Presencial' ? 'presencial' : m === 'Remoto' ? 'remoto' : '')}
                  onClick={() => setModality(m)}
                >
                  {modality === m && <AvMI name="check" />}{m}
                </button>
              ))}
            </div>
            {modality !== 'Remoto' && (
              <div className="field" style={{ marginTop: 14 }}>
                <div className="field-inner">
                  <span className="field-label">Local do atendimento</span>
                  <span className="field-value">Consultório · Rua da Misericórdia 53</span>
                </div>
                <AvMI name="location_on" style={{ fontSize: 22, color: 'var(--color-secondary-indigo)' }} />
              </div>
            )}
          </div>

          <div className="form-card">
            <div className="fc-head">
              <AvMI name="event_repeat" />
              <h3>Quando</h3>
            </div>

            <label className="control-label">Frequência</label>
            <div className="seg" style={{ marginBottom: 20 }}>
              {['Data única', 'Semanal'].map(f => (
                <button key={f} className={freq === f ? 'on' : ''} onClick={() => setFreq(f)}>
                  {freq === f && <AvMI name="check" />}{f}
                </button>
              ))}
            </div>

            {freq === 'Semanal' ? (
              <>
                <label className="control-label">Dias da semana</label>
                <div className="weekdays" style={{ marginBottom: 20 }}>
                  {weekdays.map(d => (
                    <button key={d} className={"weekday" + (days.includes(d) ? ' on' : '')} onClick={() => toggleDay(d)}>
                      {d[0]}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="field" style={{ marginBottom: 20 }}>
                <div className="field-inner">
                  <span className="field-label">Data</span>
                  <span className="field-value">21/05/2026</span>
                </div>
                <AvMI name="calendar_today" style={{ fontSize: 22, color: 'var(--color-secondary-indigo)' }} />
              </div>
            )}

            <label className="control-label">Intervalo de horas</label>
            <div className="time-row">
              <div className="time-field">
                <span className="field-label">Início</span>
                <div className="time-value"><AvMI name="schedule" /><span>14:00</span></div>
              </div>
              <div className="time-field">
                <span className="field-label">Fim</span>
                <div className="time-value"><AvMI name="schedule" /><span>18:00</span></div>
              </div>
              <div className="time-field">
                <span className="field-label">Duração / sessão</span>
                <div className="time-value"><AvMI name="hourglass_empty" /><span>60 min</span></div>
              </div>
            </div>

            <div className="hint"><AvMI name="info" />Este bloco gera 4 sessões agendáveis:</div>
            <div className="slots-preview">
              {['14:00', '15:00', '16:00', '17:00'].map(t => (
                <span key={t} className="slot-pill">{t}</span>
              ))}
            </div>
          </div>

          <button className="btn-add"><AvMI name="add" />Adicionar disponibilidade</button>

          {/* Existing list */}
          <div style={{ marginTop: 12 }}>
            <div className="list-head">
              <h2>Disponibilidades ativas</h2>
              <span className="count">3 blocos · 11 sessões</span>
            </div>

            <div className="day-group">
              <div className="day-title">Quartas-feiras <small>· semanal</small></div>
              <div className="av-row">
                <span className="time">14:00–18:00</span>
                <div className="detail">
                  <div className="svc">Análise Reichiana</div>
                  <div className="meta">
                    <span><AvMI name="location_on" />Consultório</span>
                    <span><AvMI name="grid_view" />4 sessões · 60 min</span>
                  </div>
                </div>
                <span className="mod-pill">Presencial</span>
                <div className="actions">
                  <button><AvMI name="edit" /></button>
                  <button className="del"><AvMI name="delete" /></button>
                </div>
              </div>
            </div>

            <div className="day-group">
              <div className="day-title">Quintas-feiras <small>· semanal</small></div>
              <div className="av-row online">
                <span className="time">10:00–13:00</span>
                <div className="detail">
                  <div className="svc">Mindfulness · Supervisão</div>
                  <div className="meta">
                    <span><AvMI name="videocam" />Vídeo</span>
                    <span><AvMI name="grid_view" />3 sessões · 60 min</span>
                  </div>
                </div>
                <span className="mod-pill">Remoto</span>
                <div className="actions">
                  <button><AvMI name="edit" /></button>
                  <button className="del"><AvMI name="delete" /></button>
                </div>
              </div>
            </div>

            <div className="day-group">
              <div className="day-title">28 de Maio <small>· data única</small></div>
              <div className="av-row any">
                <span className="time">16:00–20:00</span>
                <div className="detail">
                  <div className="svc">Somatic Experience®</div>
                  <div className="meta">
                    <span><AvMI name="check_circle" /><span className="booked-tag"><AvMI name="check" />1 já agendada</span></span>
                    <span><AvMI name="grid_view" />4 sessões · 60 min</span>
                  </div>
                </div>
                <span className="mod-pill">Qualquer</span>
                <div className="actions">
                  <button><AvMI name="edit" /></button>
                  <button className="del"><AvMI name="delete" /></button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Suggestion B — Weekly schedule painter
   ───────────────────────────────────────────────────────── */
function SuggestionB() {
  const days = [
    { dow: 'Seg', n: 12 }, { dow: 'Ter', n: 13 }, { dow: 'Qua', n: 14, today: true },
    { dow: 'Qui', n: 15 }, { dow: 'Sex', n: 16 }, { dow: 'Sáb', n: 17 }, { dow: 'Dom', n: 18 },
  ];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  // blocks: dayIndex, startHourIndex, span (in hours), modality, svc, slots
  const blocks = [
    { day: 0, start: 1, span: 3, mod: '', svc: 'Análise Reichiana', slots: 3 },
    { day: 2, start: 6, span: 4, mod: '', svc: 'Análise Reichiana', slots: 4 },
    { day: 3, start: 2, span: 3, mod: 'remoto', svc: 'Mindfulness', slots: 3 },
    { day: 4, start: 8, span: 3, mod: 'any', svc: 'Somatic Exp.®', slots: 3 },
  ];

  const blockAt = (day, hi) => blocks.find(b => b.day === day && b.start === hi);
  const covered = (day, hi) => blocks.find(b => b.day === day && hi > b.start && hi < b.start + b.span);

  return (
    <div className="av av-board">
      <PanelHead
        kicker="Disponibilidades · Vista semanal"
        title="Pinte a sua semana"
        sub="Clique e arraste numa coluna para abrir um bloco de disponibilidade. Ajuste serviço e modalidade no painel à direita."
      />
      <div className="panel-body">
        <div className="week-toolbar">
          <div className="wk-nav">
            <button><AvMI name="chevron_left" /></button>
            <span className="wk-label">12 – 18 Maio · 2026</span>
            <button><AvMI name="chevron_right" /></button>
          </div>
          <div className="legend">
            <span className="lg"><span className="sw presencial" />Presencial</span>
            <span className="lg"><span className="sw remoto" />Remoto</span>
            <span className="lg"><span className="sw any" />Qualquer</span>
          </div>
        </div>

        <div className="week-layout">
          <div>
            <div className="week-grid">
              <div className="wg-corner" />
              {days.map((d, i) => (
                <div key={i} className={"wg-dayhead" + (d.today ? ' today' : '')}>
                  <div className="dow">{d.dow}</div>
                  <div className="dn">{d.n}</div>
                </div>
              ))}

              {hours.map((h, hi) => (
                <React.Fragment key={hi}>
                  <div className="wg-time">{h}</div>
                  {days.map((d, di) => {
                    const b = blockAt(di, hi);
                    const cov = covered(di, hi);
                    return (
                      <div key={di} className={"wg-cell" + (b || cov ? ' has-block' : '')}>
                        {b && (
                          <div
                            className={"block " + b.mod}
                            style={{ height: `calc(${b.span * 48}px - 6px)` }}
                          >
                            <div className="b-time">{hours[b.start]}–{hours[b.start + b.span]}</div>
                            <div className="b-svc">{b.svc}</div>
                            <div className="b-slots">{b.slots} sessões</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            <div className="week-hint">
              <AvMI name="touch_app" />
              Toque numa célula vazia para criar; toque num bloco para editar ou remover.
            </div>
          </div>

          <aside className="inspector">
            <h3>Bloco selecionado</h3>
            <div className="insp-sub">Quarta, 14 Maio</div>

            <div className="insp-sel">
              <div className="t">14:00 – 18:00</div>
              <div className="d">4 sessões de 60 min</div>
            </div>

            <div className="insp-block">
              <label className="control-label">Serviço</label>
              <div className="field" style={{ padding: '10px 14px' }}>
                <div className="field-inner">
                  <span className="field-value" style={{ fontSize: 14 }}>Análise Reichiana</span>
                </div>
                <AvMI name="expand_more" style={{ fontSize: 20, color: 'var(--color-secondary-indigo)' }} />
              </div>
            </div>

            <div className="insp-block">
              <label className="control-label">Modalidade</label>
              <div className="seg" style={{ flexDirection: 'column', gap: 4 }}>
                <button className="on presencial" style={{ width: '100%' }}><AvMI name="check" />Presencial</button>
                <button style={{ width: '100%' }}>Remoto</button>
                <button style={{ width: '100%' }}>Qualquer</button>
              </div>
            </div>

            <div className="insp-block">
              <label className="control-label">Duração por sessão</label>
              <div className="seg compact" style={{ width: '100%' }}>
                <button>50 min</button>
                <button className="on">60 min</button>
                <button>90 min</button>
              </div>
            </div>

            <button className="btn-add" style={{ marginTop: 6 }}><AvMI name="check" />Guardar bloco</button>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 8, color: 'var(--color-primary-purple)', borderColor: 'var(--color-border)' }}>
              Remover
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Suggestion C — Recurring rules + exceptions
   ───────────────────────────────────────────────────────── */
function SuggestionC() {
  const [rules, setRules] = useAvState({ r1: true, r2: true, r3: false });
  const toggle = (k) => setRules(v => ({ ...v, [k]: !v[k] }));

  return (
    <div className="av av-board">
      <PanelHead
        kicker="Disponibilidades · Regras"
        title="As suas regras de disponibilidade"
        sub="Descreva quando atende em linguagem simples. As regras semanais repetem-se; pode juntar datas avulsas e marcar ausências."
      />
      <div className="panel-body">

        <div className="rule-section">
          <div className="rs-head">
            <h2><AvMI name="event_repeat" />Semanais</h2>
            <button className="add-link"><AvMI name="add" />Nova regra</button>
          </div>

          {/* inline composer */}
          <div className="composer">
            <div className="comp-line">
              <span className="lead">Toda(s)</span>
              <span className="mini-field"><AvMI name="calendar_view_week" />Quarta-feira<AvMI name="expand_more" /></span>
              <span className="lead">das</span>
              <span className="mini-field">14:00</span>
              <span className="lead">às</span>
              <span className="mini-field">18:00</span>
              <span className="lead">para</span>
              <span className="mini-field"><AvMI name="medical_services" />Análise Reichiana<AvMI name="expand_more" /></span>
            </div>
            <div className="comp-line">
              <span className="lead">em modalidade</span>
              <span className="mini-field">Presencial<AvMI name="expand_more" /></span>
              <span className="lead">· sessões de</span>
              <span className="mini-field">60 min</span>
              <div className="comp-actions" style={{ marginLeft: 'auto' }}>
                <button className="btn-add"><AvMI name="add" />Adicionar regra</button>
              </div>
            </div>
          </div>

          <div className={"rule-card" + (rules.r1 ? '' : ' off')}>
            <div className="when-badge">
              <div className="dow">Qua</div>
              <div className="freq">semanal</div>
            </div>
            <div className="rule-body">
              <div className="phrase">Todas as quartas, <span className="hl">14:00 – 18:00</span></div>
              <div className="rule-meta">
                <span><AvMI name="medical_services" />Análise Reichiana</span>
                <span className="mod-pill">Presencial</span>
                <span><AvMI name="grid_view" />4 sessões · 60 min</span>
              </div>
            </div>
            <div className="rule-right">
              <button className="icon-btn"><AvMI name="edit" /></button>
              <button className={"switch" + (rules.r1 ? ' on' : '')} onClick={() => toggle('r1')}><i /></button>
            </div>
          </div>

          <div className={"rule-card" + (rules.r2 ? '' : ' off')}>
            <div className="when-badge">
              <div className="dow">Qui</div>
              <div className="freq">semanal</div>
            </div>
            <div className="rule-body">
              <div className="phrase">Todas as quintas, <span className="hl">10:00 – 13:00</span></div>
              <div className="rule-meta">
                <span><AvMI name="medical_services" />Mindfulness · Supervisão</span>
                <span className="mod-pill remoto">Remoto</span>
                <span><AvMI name="grid_view" />3 sessões · 60 min</span>
              </div>
            </div>
            <div className="rule-right">
              <button className="icon-btn"><AvMI name="edit" /></button>
              <button className={"switch" + (rules.r2 ? ' on' : '')} onClick={() => toggle('r2')}><i /></button>
            </div>
          </div>

          <div className={"rule-card" + (rules.r3 ? '' : ' off')}>
            <div className="when-badge">
              <div className="dow">Sex</div>
              <div className="freq">semanal</div>
            </div>
            <div className="rule-body">
              <div className="phrase">Todas as sextas, <span className="hl">09:00 – 12:00</span></div>
              <div className="rule-meta">
                <span><AvMI name="medical_services" />Somatic Experience®</span>
                <span className="mod-pill">Presencial</span>
                <span><AvMI name="pause_circle" />pausada</span>
              </div>
            </div>
            <div className="rule-right">
              <button className="icon-btn"><AvMI name="edit" /></button>
              <button className={"switch" + (rules.r3 ? ' on' : '')} onClick={() => toggle('r3')}><i /></button>
            </div>
          </div>
        </div>

        <div className="rule-section">
          <div className="rs-head">
            <h2><AvMI name="event_available" />Datas avulsas</h2>
            <button className="add-link"><AvMI name="add" />Adicionar data</button>
          </div>
          <div className="rule-card">
            <div className="when-badge">
              <div className="dow">28 Mai</div>
              <div className="freq">única</div>
            </div>
            <div className="rule-body">
              <div className="phrase">Quarta extra, <span className="hl">16:00 – 20:00</span></div>
              <div className="rule-meta">
                <span><AvMI name="medical_services" />Somatic Experience®</span>
                <span className="mod-pill" style={{ background: 'rgba(119,197,213,0.20)', color: 'var(--color-secondary-indigo)' }}>Qualquer</span>
                <span className="booked-tag"><AvMI name="check" />1 já agendada</span>
              </div>
            </div>
            <div className="rule-right">
              <button className="icon-btn"><AvMI name="edit" /></button>
              <button className="switch on"><i /></button>
            </div>
          </div>
        </div>

        <div className="rule-section">
          <div className="rs-head">
            <h2><AvMI name="block" />Ausências e feriados</h2>
            <button className="add-link"><AvMI name="add" />Marcar ausência</button>
          </div>
          <div className="exc-card">
            <AvMI name="beach_access" />
            <div className="exc-text">
              <div className="t">Férias</div>
              <div className="d">2 – 9 de Junho · nenhuma sessão será oferecida</div>
            </div>
            <button className="icon-btn"><AvMI name="close" /></button>
          </div>
          <div className="exc-card">
            <AvMI name="flag" />
            <div className="exc-text">
              <div className="t">Feriado · Dia de Portugal</div>
              <div className="d">10 de Junho · indisponível o dia todo</div>
            </div>
            <button className="icon-btn"><AvMI name="close" /></button>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { SuggestionA, SuggestionB, SuggestionC });
