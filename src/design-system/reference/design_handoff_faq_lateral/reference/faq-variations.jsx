/* faq-variations.jsx — five refined FAQ directions.
   Each component takes { mobile } and renders a responsive layout.
   Shared helpers come from faq-kit.jsx via window. */

const { useFaq, Chevron, PlusMark, BreathingMark, ContactPrompt, FaqHeading } = window;

/* small helper: smooth height reveal via grid-rows trick */
function Reveal({ open, children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: open ? '1fr' : '0fr',
      transition: 'grid-template-rows .42s var(--ease-care)',
    }}>
      <div style={{ overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

const PAD_D = '48px 52px 44px';
const PAD_M = '32px 22px 30px';

/* ============================================================
   1 · SERENO — airy, white, lilac underline tabs
   ============================================================ */
function VarSereno({ mobile }) {
  const { data, topic, sel, selectTopic, openKey, toggle } = useFaq();
  return (
    <div style={{ padding: mobile ? PAD_M : PAD_D, fontFamily: 'var(--font-sans)', height: '100%', boxSizing: 'border-box' }}>
      <FaqHeading mobile={mobile} />

      <div style={{
        display: 'flex', gap: mobile ? 20 : 30,
        overflowX: mobile ? 'auto' : 'visible', flexWrap: mobile ? 'nowrap' : 'wrap',
        borderBottom: '1px solid var(--color-border-soft)', marginBottom: mobile ? 8 : 12,
      }}>
        {data.map((t) => {
          const on = t.topicName === topic;
          return (
            <button key={t.topicName} onClick={() => selectTopic(t.topicName)} style={{
              border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              padding: '0 0 13px', marginBottom: -1, fontFamily: 'var(--font-sans)',
              fontSize: mobile ? 14.5 : 16.5, fontWeight: on ? 700 : 500,
              color: on ? 'var(--color-primary-blue)' : 'var(--color-muted)',
              borderBottom: '2px solid ' + (on ? 'var(--color-primary-purple)' : 'transparent'),
              transition: 'color .2s var(--ease-care)',
            }}>{t.topicName}</button>
          );
        })}
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {sel.items.map((it, i) => {
          const open = openKey === String(i);
          return (
            <li key={i} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
              <button onClick={() => toggle(String(i))} style={{
                width: '100%', display: 'flex', gap: 16, alignItems: 'flex-start',
                justifyContent: 'space-between', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', padding: mobile ? '17px 2px' : '22px 2px',
              }}>
                <span style={{
                  color: 'var(--color-primary-blue)', fontWeight: 700,
                  fontSize: mobile ? 16 : 18.5, lineHeight: 1.32,
                }}>{it.question}</span>
                <span style={{ marginTop: 2 }}><Chevron open={open} size={mobile ? 21 : 24} color="var(--color-primary-purple)" /></span>
              </button>
              <Reveal open={open}>
                <p style={{
                  color: 'var(--color-secondary-indigo)', fontWeight: 400,
                  fontSize: mobile ? 14.5 : 16, lineHeight: 1.62, textAlign: 'justify',
                  margin: 0, padding: mobile ? '0 2px 17px' : '0 56px 23px 2px',
                }}>{it.answer}</p>
              </Reveal>
            </li>
          );
        })}
      </ul>

      <ContactPrompt accent="var(--color-primary-blue)" soft="var(--color-surface-tint)" mobile={mobile} illo="hands6.svg" />
    </div>
  );
}

/* ============================================================
   2 · LATERAL — sticky side nav + answers.
   Mobile: topics stacked on top; tapping one scrolls to the answers.
   ============================================================ */
function VarLateral({ mobile }) {
  const { data, topic, sel, selectTopic, openKey, toggle } = useFaq();
  // mobile nested-accordion state (nothing open at first)
  const [mTopic, setMTopic] = React.useState(null);
  const [mQ, setMQ] = React.useState(null);

  const QuestionList = () => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {sel.items.map((it, i) => {
        const open = openKey === String(i);
        return (
          <li key={i} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
            <button onClick={() => toggle(String(i))} style={{
              width: '100%', display: 'flex', gap: 16, alignItems: 'flex-start',
              justifyContent: 'space-between', background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left', padding: mobile ? '16px 0' : '20px 0',
            }}>
              <span style={{ color: 'var(--color-primary-blue)', fontWeight: 700, fontSize: mobile ? 16 : 18, lineHeight: 1.32 }}>{it.question}</span>
              <span style={{ marginTop: 2 }}><PlusMark open={open} size={mobile ? 18 : 20} color="var(--color-primary-purple)" /></span>
            </button>
            <Reveal open={open}>
              <p style={{ color: 'var(--color-secondary-indigo)', fontWeight: 400, fontSize: mobile ? 14.5 : 16, lineHeight: 1.62, textAlign: 'justify', margin: 0, padding: mobile ? '0 0 16px' : '0 30px 22px 0' }}>{it.answer}</p>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );

  /* ---------- DESKTOP ---------- */
  if (!mobile) {
    const TopicNav = (
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data.map((t) => {
          const on = t.topicName === topic;
          return (
            <button key={t.topicName} onClick={() => selectTopic(t.topicName)} style={{
              position: 'relative', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: on ? 'var(--color-surface-tint)' : 'transparent',
              borderRadius: 'var(--radius-md)', padding: '13px 14px 13px 18px',
              fontFamily: 'var(--font-sans)', fontSize: 16.5, fontWeight: on ? 700 : 500,
              color: on ? 'var(--color-primary-blue)' : 'var(--color-muted)',
              lineHeight: 1.3, transition: 'background .2s var(--ease-care), color .2s var(--ease-care)',
            }}>
              <span style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: on ? '58%' : 0, borderRadius: 3,
                background: 'var(--color-primary-purple)', transition: 'height .25s var(--ease-care)',
              }} />
              {t.topicName}
            </button>
          );
        })}
      </nav>
    );
    return (
      <div style={{ padding: PAD_D, fontFamily: 'var(--font-sans)', height: '100%', boxSizing: 'border-box' }}>
        <FaqHeading mobile={false} />
        <div style={{ display: 'grid', gridTemplateColumns: '232px 1fr', gap: 48, alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 16 }}>{TopicNav}</div>
          <QuestionList />
        </div>
        <ContactPrompt accent="var(--color-primary-purple)" soft="var(--color-surface-tint)" mobile={false} illo="hands2.svg" />
      </div>
    );
  }

  /* ---------- MOBILE (nested accordion: topics → questions → answers) ---------- */
  return (
    <div style={{ padding: '32px 22px 30px', fontFamily: 'var(--font-sans)', height: '100%', boxSizing: 'border-box' }}>
      <FaqHeading mobile={true} />
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 700, fontStyle: 'italic',
        letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 10,
      }}>Escolha um tema</div>

      <div style={{ borderTop: '1px solid var(--color-border-soft)' }}>
        {data.map((t) => {
          const topicOpen = mTopic === t.topicName;
          return (
            <div key={t.topicName} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
              <button
                onClick={() => { setMTopic(topicOpen ? null : t.topicName); setMQ(null); }}
                style={{
                  position: 'relative', width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  background: topicOpen ? 'var(--color-surface-tint)' : 'transparent',
                  padding: '16px 12px 16px 18px', transition: 'background .2s var(--ease-care)',
                }}>
                <span style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: topicOpen ? '60%' : 0, borderRadius: 3,
                  background: 'var(--color-primary-purple)', transition: 'height .25s var(--ease-care)',
                }} />
                <span style={{ minWidth: 0 }}>
                  <span style={{
                    display: 'block', fontFamily: 'var(--font-sans)', fontSize: 16.5,
                    fontWeight: topicOpen ? 700 : 600, lineHeight: 1.25,
                    color: topicOpen ? 'var(--color-primary-blue)' : 'var(--color-secondary-indigo)',
                  }}>{t.topicName}</span>
                  <span style={{
                    display: 'block', fontFamily: 'var(--font-sans)', fontSize: 12.5,
                    fontWeight: 400, color: 'var(--color-muted)', marginTop: 2,
                  }}>{t.items.length} {t.items.length === 1 ? 'pergunta' : 'perguntas'}</span>
                </span>
                <Chevron open={topicOpen} size={22} color={topicOpen ? 'var(--color-primary-purple)' : 'var(--color-muted)'} />
              </button>

              <div style={{ maxHeight: topicOpen ? 1200 : 0, overflow: 'hidden', transition: 'max-height .45s var(--ease-care)' }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: '0 12px 12px 18px', background: 'var(--color-surface-tint)' }}>
                  {t.items.map((it, i) => {
                    const qOpen = topicOpen && mQ === i;
                    return (
                      <li key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                        <button onClick={() => setMQ(qOpen ? null : i)} style={{
                          width: '100%', display: 'flex', gap: 12, alignItems: 'flex-start',
                          justifyContent: 'space-between', background: 'none', border: 'none',
                          cursor: 'pointer', textAlign: 'left', padding: '13px 0',
                        }}>
                          <span style={{ color: 'var(--color-primary-blue)', fontWeight: 600, fontSize: 15, lineHeight: 1.38 }}>{it.question}</span>
                          <span style={{ marginTop: 1 }}><PlusMark open={qOpen} size={16} color="var(--color-primary-purple)" /></span>
                        </button>
                        <Reveal open={qOpen}>
                          <p style={{ color: 'var(--color-secondary-indigo)', fontWeight: 400, fontSize: 14, lineHeight: 1.6, textAlign: 'justify', margin: 0, padding: '0 0 14px' }}>{it.answer}</p>
                        </Reveal>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <ContactPrompt accent="var(--color-primary-purple)" soft="var(--color-surface-tint)" mobile={true} illo="hands2.svg" />
    </div>
  );
}

/* ============================================================
   3 · CARTÕES — soft tinted cards, cyan accent
   ============================================================ */
function VarCartoes({ mobile }) {
  const { data, topic, sel, selectTopic, openKey, toggle } = useFaq();
  return (
    <div style={{ padding: mobile ? PAD_M : PAD_D, fontFamily: 'var(--font-sans)', height: '100%', boxSizing: 'border-box' }}>
      <FaqHeading mobile={mobile} accent="var(--color-secondary-cyan)" />

      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: mobile ? 18 : 24 }}>
        {data.map((t) => {
          const on = t.topicName === topic;
          return (
            <button key={t.topicName} onClick={() => selectTopic(t.topicName)} style={{
              border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-pill)',
              background: on ? 'var(--color-secondary-cyan)' : 'var(--color-surface-tint)',
              color: 'var(--color-primary-blue)', padding: mobile ? '9px 15px' : '10px 18px',
              fontFamily: 'var(--font-sans)', fontSize: mobile ? 13.5 : 14.5, fontWeight: on ? 700 : 600,
              lineHeight: 1.2, transition: 'background .25s var(--ease-care)',
            }}>{t.topicName}</button>
          );
        })}
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: mobile ? 10 : 12 }}>
        {sel.items.map((it, i) => {
          const open = openKey === String(i);
          return (
            <li key={i} style={{
              background: open ? '#fff' : 'var(--color-surface-tint)',
              borderRadius: 'var(--radius-lg)', boxSizing: 'border-box',
              borderLeft: '4px solid ' + (open ? 'var(--color-secondary-cyan)' : 'transparent'),
              boxShadow: open ? 'var(--shadow-card)' : 'none',
              transition: 'background .3s var(--ease-care), box-shadow .3s var(--ease-care), border-color .3s var(--ease-care)',
            }}>
              <button onClick={() => toggle(String(i))} style={{
                width: '100%', display: 'flex', gap: 14, alignItems: 'flex-start',
                justifyContent: 'space-between', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', padding: mobile ? '16px 16px' : '19px 22px',
              }}>
                <span style={{ color: 'var(--color-primary-blue)', fontWeight: 700, fontSize: mobile ? 15.5 : 17.5, lineHeight: 1.32 }}>{it.question}</span>
                <span style={{ marginTop: 2 }}><PlusMark open={open} size={mobile ? 18 : 20} color="var(--color-primary-blue)" /></span>
              </button>
              <Reveal open={open}>
                <p style={{ color: 'var(--color-secondary-indigo)', fontWeight: 400, fontSize: mobile ? 14.5 : 16, lineHeight: 1.62, textAlign: 'justify', margin: 0, padding: mobile ? '0 16px 17px' : '0 22px 21px' }}>{it.answer}</p>
              </Reveal>
            </li>
          );
        })}
      </ul>

      <ContactPrompt accent="var(--color-secondary-indigo)" soft="var(--color-surface-tint)" mobile={mobile} illo="hands4.svg" />
    </div>
  );
}

/* ============================================================
   4 · EDITORIAL — serif heading + hand illustration anchor
   ============================================================ */
function VarEditorial({ mobile }) {
  const { data, topic, sel, selectTopic, openKey, toggle } = useFaq();

  const Aside = () => (
    <div style={{ textAlign: mobile ? 'center' : 'left' }}>
      <div style={{
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontStyle: 'italic',
        letterSpacing: 4, textTransform: 'uppercase', color: 'var(--color-primary-purple)',
        fontSize: mobile ? 11.5 : 13, marginBottom: 12,
      }}>Perguntas frequentes</div>
      <h2 style={{
        fontFamily: 'var(--font-serif)', color: 'var(--color-primary-blue)', fontWeight: 600,
        fontSize: mobile ? 30 : 40, lineHeight: 1.08, margin: 0,
      }}>Ficou com alguma dúvida?</h2>
      <p style={{
        fontFamily: 'var(--font-serif)', color: 'var(--color-secondary-indigo)', fontWeight: 400,
        fontSize: mobile ? 15.5 : 17, lineHeight: 1.6, textAlign: mobile ? 'center' : 'left',
        margin: mobile ? '14px auto 0' : '16px 0 0', maxWidth: mobile ? 340 : 'none', fontStyle: 'italic',
      }}>Reunimos as perguntas que mais chegam até nós. Se a sua não estiver aqui, escreva — cada dúvida é o começo de um cuidado.</p>

      <div style={{ display: 'flex', justifyContent: mobile ? 'center' : 'flex-start', margin: mobile ? '8px 0 4px' : '26px 0 22px' }}>
        <BreathingMark src="hands2.svg" width={mobile ? 120 : 168} />
      </div>

      {!mobile && (
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((t) => {
            const on = t.topicName === topic;
            return (
              <button key={t.topicName} onClick={() => selectTopic(t.topicName)} style={{
                border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
                padding: '8px 0', fontFamily: 'var(--font-sans)', fontSize: 16,
                fontWeight: on ? 700 : 500, color: on ? 'var(--color-primary-blue)' : 'var(--color-muted)',
                transition: 'color .2s var(--ease-care)', lineHeight: 1.3,
              }}>
                <span style={{
                  borderBottom: '2px solid ' + (on ? 'var(--color-primary-purple)' : 'transparent'),
                  paddingBottom: 2,
                }}>{t.topicName}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );

  const Chips = () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
      {data.map((t) => {
        const on = t.topicName === topic;
        return (
          <button key={t.topicName} onClick={() => selectTopic(t.topicName)} style={{
            border: '1px solid ' + (on ? 'var(--color-primary-purple)' : 'var(--color-border)'),
            background: on ? 'var(--color-primary-purple)' : '#fff', cursor: 'pointer',
            borderRadius: 'var(--radius-pill)', padding: '8px 14px',
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
            color: on ? '#fff' : 'var(--color-secondary-indigo)',
          }}>{t.topicName}</button>
        );
      })}
    </div>
  );

  const List = () => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {sel.items.map((it, i) => {
        const open = openKey === String(i);
        return (
          <li key={i} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
            <button onClick={() => toggle(String(i))} style={{
              width: '100%', display: 'flex', gap: 16, alignItems: 'flex-start',
              justifyContent: 'space-between', background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left', padding: mobile ? '16px 0' : '19px 0',
            }}>
              <span style={{ color: 'var(--color-primary-blue)', fontWeight: 700, fontSize: mobile ? 15.5 : 17.5, lineHeight: 1.33 }}>{it.question}</span>
              <span style={{ marginTop: 2 }}><Chevron open={open} size={mobile ? 20 : 22} color="var(--color-primary-purple)" /></span>
            </button>
            <Reveal open={open}>
              <p style={{ color: 'var(--color-secondary-indigo)', fontWeight: 400, fontSize: mobile ? 14.5 : 16, lineHeight: 1.62, textAlign: 'justify', margin: 0, padding: mobile ? '0 0 16px' : '0 24px 21px 0' }}>{it.answer}</p>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div style={{ padding: mobile ? PAD_M : '50px 52px 44px', fontFamily: 'var(--font-sans)', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '300px 1fr', gap: mobile ? 22 : 56, alignItems: 'start' }}>
        <Aside />
        <div>
          {mobile && <Chips />}
          <List />
        </div>
      </div>
      <ContactPrompt accent="var(--color-primary-purple)" soft="var(--color-surface-tint)" mobile={mobile} illo="hands6.svg" />
    </div>
  );
}

/* ============================================================
   5 · PAINEL — soft tinted panel, segmented tabs, green accent
   ============================================================ */
function VarPainel({ mobile }) {
  const { data, topic, sel, selectTopic, openKey, toggle } = useFaq();
  const GREEN = 'var(--color-secondary-green)';
  return (
    <div style={{ padding: mobile ? '24px 16px' : '40px 44px', fontFamily: 'var(--font-sans)', height: '100%', boxSizing: 'border-box' }}>
      <div style={{
        background: 'var(--color-surface-tint)', borderRadius: 'var(--radius-xl)',
        padding: mobile ? '28px 18px 24px' : '40px 40px 36px',
      }}>
        <FaqHeading mobile={mobile} align="center" accent={GREEN} />

        {/* segmented control inside a white container */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5,
          background: '#fff', borderRadius: 'var(--radius-lg)', padding: 5,
          margin: mobile ? '0 auto 22px' : '0 auto 28px', width: 'fit-content', maxWidth: '100%',
        }}>
          {data.map((t) => {
            const on = t.topicName === topic;
            return (
              <button key={t.topicName} onClick={() => selectTopic(t.topicName)} style={{
                border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                background: on ? GREEN : 'transparent', color: on ? '#fff' : 'var(--color-secondary-indigo)',
                padding: mobile ? '9px 13px' : '10px 17px', fontFamily: 'var(--font-sans)',
                fontSize: mobile ? 13 : 14.5, fontWeight: on ? 700 : 600, lineHeight: 1.2,
                transition: 'background .25s var(--ease-care), color .25s var(--ease-care)',
              }}>{t.topicName}</button>
            );
          })}
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: mobile ? 9 : 10 }}>
          {sel.items.map((it, i) => {
            const open = openKey === String(i);
            return (
              <li key={i} style={{
                background: '#fff', borderRadius: 'var(--radius-md)',
                boxShadow: open ? 'var(--shadow-card)' : 'none',
                transition: 'box-shadow .3s var(--ease-care)',
              }}>
                <button onClick={() => toggle(String(i))} style={{
                  width: '100%', display: 'flex', gap: 14, alignItems: 'center',
                  justifyContent: 'space-between', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left', padding: mobile ? '15px 16px' : '18px 22px',
                }}>
                  <span style={{ display: 'flex', gap: 13, alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{
                      flex: 'none', width: 7, height: 7, borderRadius: '50%', marginTop: mobile ? 7 : 8,
                      background: open ? GREEN : 'var(--color-border)', transition: 'background .25s var(--ease-care)',
                    }} />
                    <span style={{ color: 'var(--color-primary-blue)', fontWeight: 700, fontSize: mobile ? 15.5 : 17.5, lineHeight: 1.32 }}>{it.question}</span>
                  </span>
                  <span style={{ marginTop: 2 }}><Chevron open={open} size={mobile ? 20 : 22} color={GREEN} /></span>
                </button>
                <Reveal open={open}>
                  <p style={{ color: 'var(--color-secondary-indigo)', fontWeight: 400, fontSize: mobile ? 14.5 : 16, lineHeight: 1.62, textAlign: 'justify', margin: 0, padding: mobile ? '0 16px 16px 36px' : '0 22px 20px 42px' }}>{it.answer}</p>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <ContactPrompt accent={GREEN} soft="#fff" mobile={mobile} illo="hands4.svg" />
      </div>
    </div>
  );
}

Object.assign(window, { VarSereno, VarLateral, VarCartoes, VarEditorial, VarPainel });
