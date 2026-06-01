/* Account edit screen — sidebar + form, with profile pic, phone, delete account */

const { useState: useAcctState } = React;

const GENDERS = ['Feminino', 'Masculino', 'Não-binário', 'Prefiro não responder', 'Outro'];

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  );
}

function PhoneRow({ country, setCountry, phone, setPhone }) {
  const [open, setOpen] = useAcctState(false);
  const sel = COUNTRIES.find(c => c.code === country) || COUNTRIES[0];
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ position: 'relative', width: 200, flex: 'none' }}>
        <button type="button" onClick={() => setOpen(o => !o)} style={{
          ...inputStyle, padding: '12px 14px',
          textAlign: 'left', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
          borderColor: open ? 'var(--color-primary-blue)' : 'var(--color-border)',
        }}>
          <FlagPill flag={sel.flag} />
          <span style={{ flex: 1 }}>{sel.code}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: '#fff', border: '1px solid var(--color-border)',
            borderRadius: 10, maxHeight: 240, overflowY: 'auto',
            filter: 'var(--shadow-floating)', zIndex: 20, padding: '6px 0',
          }}>
            {COUNTRIES.map(c => (
              <div key={c.code} onClick={() => { setCountry(c.code); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                fontFamily: 'var(--font-sans)', fontSize: 15,
                color: c.code === country ? 'var(--color-primary-purple)' : 'var(--color-primary-blue)',
                background: c.code === country ? 'var(--color-surface-tint)' : 'transparent',
                cursor: 'pointer', fontWeight: c.code === country ? 600 : 400,
              }}>
                <FlagPill flag={c.flag} />
                <span style={{ flex: 1 }}>{c.name} ({c.code})</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <input style={{ ...inputStyle, paddingLeft: 58 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone" />
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
          color: 'var(--color-muted)',
          paddingRight: 10, borderRight: '1px solid var(--color-border)',
        }}>{sel.code}</span>
      </div>
    </div>
  );
}

function ConfirmDeleteDialog({ open, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(34, 50, 110, 0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 24,
    }}>
      <div style={{
        width: 440, background: '#fff', borderRadius: 16, padding: 32,
        filter: 'var(--shadow-floating)',
        boxSizing: 'border-box',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700,
          color: 'var(--color-primary-blue)', margin: '0 0 10px', lineHeight: 1.2,
        }}>Apagar a sua conta?</h3>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.55,
          color: 'var(--color-primary-blue)', margin: '0 0 20px', textAlign: 'left',
        }}>Esta ação é permanente. Os seus agendamentos serão cancelados e o seu histórico clínico ficará indisponível.</p>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.55,
          color: 'var(--color-primary-blue)', margin: '0 0 14px', textAlign: 'left',
        }}>Digite <strong>APAGAR</strong> para confirmar:</p>
        <input style={{ ...inputStyle, marginBottom: 20 }} placeholder="APAGAR" />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '12px 22px', borderRadius: 10, border: 0,
            background: 'transparent', color: 'var(--color-primary-blue)',
            fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={onConfirm} style={{
            padding: '12px 22px', borderRadius: 10, border: 0,
            background: '#c0392b', color: '#fff',
            fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
          }}>Apagar conta</button>
        </div>
      </div>
    </div>
  );
}

function AccountEditScreen() {
  const [name, setName] = useAcctState('Bruxo Voador da Silva');
  const [email, setEmail] = useAcctState('bruxo@care.pt');
  const [birth, setBirth] = useAcctState('1992-08-14');
  const [gender, setGender] = useAcctState('Prefiro não responder');
  const [country, setCountry] = useAcctState('+351');
  const [phone, setPhone] = useAcctState('915 784 896');
  const [confirmOpen, setConfirmOpen] = useAcctState(false);
  const [hoverPic, setHoverPic] = useAcctState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#fff', position: 'relative' }}>
      <AuthedHeader active="" initials="BS" name="Bruxo" role="Paciente" />
      <div style={{ flex: 1, display: 'flex', background: '#fff' }}>
        <AccountSidebar active="conta" />
        <main style={{
          flex: 1,
          padding: '28px 40px 40px',
        }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{
                fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 700,
                color: 'var(--color-primary-blue)', margin: '0 0 4px', lineHeight: 1.2,
              }}>A sua conta</h1>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5,
                color: 'var(--color-muted)', margin: 0, textAlign: 'left',
              }}>Os seus dados pessoais. Apenas o seu profissional tem acesso.</p>
            </div>

            {/* Profile picture */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 24,
              padding: '20px 0 28px', borderBottom: '1px solid var(--color-surface-tint)',
              marginBottom: 28,
            }}>
              <div
                onMouseEnter={() => setHoverPic(true)}
                onMouseLeave={() => setHoverPic(false)}
                style={{
                  width: 112, height: 112, borderRadius: '50%',
                  background: 'var(--color-surface-tint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                  border: '2px solid var(--color-border-soft)',
                  cursor: 'pointer',
                }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="var(--color-border)" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(34, 50, 110, 0.55)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 4,
                  opacity: hoverPic ? 1 : 0,
                  transition: 'opacity .2s ease',
                  fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Alterar
                </div>
              </div>
              <div>
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 10,
                  background: 'var(--color-primary-blue)', color: '#fff',
                  border: 0, cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Alterar foto
                </button>
                <button style={{
                  marginLeft: 8,
                  padding: '10px 18px', borderRadius: 10,
                  background: 'transparent', color: 'var(--color-primary-blue)',
                  border: '1px solid var(--color-border)', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                }}>Remover</button>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 12.5,
                  color: 'var(--color-muted)', marginTop: 10,
                }}>JPG ou PNG, até 5 MB.</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
              <Field label="Nome:" style={{ gridColumn: '1 / -1' }}>
                <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
              </Field>

              <Field label="Email:" style={{ gridColumn: '1 / -1' }}>
                <input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
              </Field>

              <Field label="Data de nascimento:">
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    style={{ ...inputStyle, paddingRight: 44 }}
                    value={birth}
                    onChange={e => setBirth(e.target.value)}
                  />
                  <span style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-primary-blue)', pointerEvents: 'none',
                  }}><CalendarIcon /></span>
                </div>
              </Field>

              <Field label="Gênero:">
                <div style={{ position: 'relative' }}>
                  <select
                    style={{
                      ...inputStyle,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      paddingRight: 44,
                      cursor: 'pointer',
                    }}
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                  >
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-primary-blue)', pointerEvents: 'none',
                  }}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </Field>

              <Field label="Telefone:" style={{ gridColumn: '1 / -1' }}>
                <PhoneRow country={country} setCountry={setCountry} phone={phone} setPhone={setPhone} />
              </Field>
            </div>

            {/* Save bar */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 12,
              marginTop: 32, paddingTop: 24,
              borderTop: '1px solid var(--color-surface-tint)',
            }}>
              <button style={{
                padding: '12px 24px', borderRadius: 10,
                background: 'transparent', color: 'var(--color-primary-blue)',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
              }}>Cancelar</button>
              <button style={{
                padding: '12px 28px', borderRadius: 10,
                background: 'var(--color-primary-blue)', color: '#fff',
                border: 0,
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
              }}>Salvar alterações</button>
            </div>

            {/* Danger zone */}
            <div style={{
              marginTop: 56,
              padding: '24px 0 8px',
              borderTop: '1px solid var(--color-surface-tint)',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-sans)', fontSize: 13,
                fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#c0392b', margin: '0 0 14px',
              }}>Zona de risco</h3>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 24,
              }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700,
                    color: 'var(--color-primary-blue)', marginBottom: 4,
                  }}>Apagar a sua conta</div>
                  <p style={{
                    fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5,
                    color: 'var(--color-muted)', margin: 0, textAlign: 'left',
                  }}>Esta ação é permanente. Não é possível recuperar os seus dados depois.</p>
                </div>
                <button onClick={() => setConfirmOpen(true)} style={{
                  flex: 'none',
                  padding: '12px 22px', borderRadius: 10,
                  background: 'transparent', color: '#c0392b',
                  border: '1.5px solid #c0392b',
                  fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                }}>Apagar conta</button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
      <ConfirmDeleteDialog open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={() => setConfirmOpen(false)} />
    </div>
  );
}

window.AccountEditScreen = AccountEditScreen;
