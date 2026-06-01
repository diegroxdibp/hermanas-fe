/* Mobile versions of all 4 screens — 390 wide, fits iPhone-sized viewport */

const { useState: useMState } = React;

/* ---------- Shared mobile chrome ---------- */

function HamburgerIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="7" x2="21" y2="7"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="17" x2="21" y2="17"/>
    </svg>
  );
}

function MobileHeader({ authed = false, initials = '?' }) {
  return (
    <header style={{
      height: 64, width: '100%', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', background: '#fff',
      borderBottom: '1px solid var(--color-surface-tint)',
      flex: 'none',
    }}>
      <img src="design-system/assets/logo-horizontal.svg" alt="Care" style={{ height: 38, width: 'auto' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {authed && (
          <>
            <button aria-label="Notificações" style={{
              background: 'transparent', border: 0, cursor: 'pointer',
              color: 'var(--color-primary-blue)', display: 'inline-flex', padding: 4,
            }}>
              <BellIcon />
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--color-primary-blue)',
              color: '#fff', fontFamily: 'var(--font-sans)',
              fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{initials}</div>
          </>
        )}
        <button aria-label="Menu" style={{
          background: 'transparent', border: 0, cursor: 'pointer',
          color: 'var(--color-primary-blue)', display: 'inline-flex', padding: 4,
        }}>
          <HamburgerIcon />
        </button>
      </div>
    </header>
  );
}

function MobileFooter() {
  return (
    <footer style={{
      background: 'var(--color-secondary-cyan)',
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
      flex: 'none',
    }}>
      <div style={{ color: 'var(--color-secondary-indigo)', fontFamily: 'var(--font-sans)' }}>
        <div style={{ fontWeight: 800, fontSize: 13 }}>Todos os direitos reservados ©</div>
        <div style={{ fontWeight: 400, fontSize: 13, marginTop: 2 }}>Care · +351 915 784 896</div>
      </div>
      <ul style={{ display: 'flex', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
        {[
          { vb: '0 0 448 512', d: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3a26.8 26.8 0 1 1-53.6 0 26.8 26.8 0 0 1 53.6 0zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1S3.3 127.5 1.5 163.4c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8z' },
          { vb: '0 0 448 512', d: 'M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z' },
          { vb: '0 0 512 512', d: 'M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416z' },
        ].map((s, i) => (
          <li key={i}>
            <a style={{
              display: 'flex', width: 36, height: 36, borderRadius: 7,
              alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-secondary-indigo)', cursor: 'pointer',
            }}>
              <svg viewBox={s.vb} width="16" height="16" fill="#fff"><path d={s.d}/></svg>
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}

/* ---------- M_SignIn ---------- */
function MobileSignInScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#fff' }}>
      <MobileHeader />
      <main style={{
        flex: 1, padding: '32px 20px',
        background: 'linear-gradient(180deg, var(--color-surface-tint) 0%, #fff 70%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
      }}>
        <form onSubmit={(e) => e.preventDefault()} style={{
          background: '#fff', borderRadius: 14, padding: 22,
          filter: 'var(--shadow-card)',
          display: 'flex', flexDirection: 'column',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700,
            color: 'var(--color-primary-blue)', margin: '0 0 4px', lineHeight: 1.2,
          }}>Bem-vindo de volta</h1>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-primary-blue)',
            margin: '0 0 20px', textAlign: 'left', lineHeight: 1.5,
          }}>Acesse sua conta para gerir os seus agendamentos.</p>

          <Field label="Email:" style={{ marginBottom: 12 }}>
            <input style={inputStyle} defaultValue="luane@care.pt" />
          </Field>
          <Field label="Password:" style={{ marginBottom: 4 }}>
            <input type="password" style={inputStyle} defaultValue="••••••••" />
          </Field>
          <a style={{
            alignSelf: 'flex-end',
            fontFamily: 'var(--font-sans)', fontSize: 13,
            fontWeight: 500, fontStyle: 'italic',
            color: 'var(--color-primary-purple)',
            margin: '4px 0 16px', cursor: 'pointer',
          }}>Esqueci minha senha</a>

          <PrimaryButton>Sign In</PrimaryButton>
          <Divider label="Or sign in with" />
          <GoogleButton />

          <div style={{
            display: 'flex', justifyContent: 'center', marginTop: 18,
            fontFamily: 'var(--font-sans)', fontSize: 14,
            color: 'var(--color-primary-blue)',
          }}>
            <span>Don't you have an account?{' '}
              <a style={{ color: 'var(--color-primary-purple)', fontWeight: 700, cursor: 'pointer' }}>Sign up</a>
            </span>
          </div>
        </form>
      </main>
      <MobileFooter />
    </div>
  );
}

/* ---------- M_SignUp ---------- */
function MobileSignUpScreen() {
  const [pwd, setPwd] = useMState('Care2026');
  const rules = [
    { ok: pwd.length >= 8, label: 'Mínimo de 8 caracteres' },
    { ok: /[A-Z]/.test(pwd), label: 'Pelo menos 1 letra maiúscula' },
    { ok: /[0-9]/.test(pwd), label: 'Pelo menos 1 número' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#fff' }}>
      <MobileHeader />
      <main style={{
        flex: 1, padding: '32px 20px',
        background: 'linear-gradient(180deg, var(--color-surface-tint) 0%, #fff 70%)',
      }}>
        <form onSubmit={(e) => e.preventDefault()} style={{
          background: '#fff', borderRadius: 14, padding: 22,
          filter: 'var(--shadow-card)',
          display: 'flex', flexDirection: 'column',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700,
            color: 'var(--color-primary-blue)', margin: '0 0 4px', lineHeight: 1.2,
          }}>Crie sua conta</h1>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-primary-blue)',
            margin: '0 0 20px', textAlign: 'left', lineHeight: 1.5,
          }}>Um espaço para acolher quem cuida e quem precisa de cuidado.</p>

          <Field label="Email:" style={{ marginBottom: 12 }}>
            <input style={inputStyle} placeholder="seu@email.com" />
          </Field>

          <Field label="Password:" style={{ marginBottom: 8 }}>
            <input type="password" style={inputStyle} value={pwd} onChange={e => setPwd(e.target.value)} />
          </Field>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
            {rules.map((r, i) => <PasswordRule key={i} valid={r.ok}>{r.label}</PasswordRule>)}
          </div>

          <Field label="Confirme a password:" style={{ marginBottom: 16 }}>
            <input type="password" style={inputStyle} placeholder="••••••••" />
          </Field>

          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontFamily: 'var(--font-sans)', fontSize: 13,
            color: 'var(--color-primary-blue)',
            marginBottom: 18, lineHeight: 1.45,
            cursor: 'pointer',
          }}>
            <input type="checkbox" defaultChecked style={{
              width: 18, height: 18, marginTop: 1, accentColor: 'var(--color-primary-blue)',
              flex: 'none',
            }} />
            <span>Concordo com os <a style={{ color: 'var(--color-primary-purple)', fontWeight: 700 }}>termos de uso</a> e a <a style={{ color: 'var(--color-primary-purple)', fontWeight: 700 }}>política de privacidade</a>.</span>
          </label>

          <PrimaryButton>Sign Up</PrimaryButton>
          <Divider label="Or sign up with" />
          <GoogleButton>Sign up with Google</GoogleButton>

          <div style={{
            display: 'flex', justifyContent: 'center', marginTop: 18,
            fontFamily: 'var(--font-sans)', fontSize: 14,
            color: 'var(--color-primary-blue)',
          }}>
            <span>Já tem uma conta?{' '}
              <a style={{ color: 'var(--color-primary-purple)', fontWeight: 700, cursor: 'pointer' }}>Sign in</a>
            </span>
          </div>
        </form>
      </main>
      <MobileFooter />
    </div>
  );
}

/* ---------- M_Onboarding ---------- */
function MobileOnboardingScreen() {
  const [country, setCountry] = useMState('+351');
  const [open, setOpen] = useMState(false);
  const [gender, setGender] = useMState('Prefiro não responder');
  const sel = COUNTRIES.find(c => c.code === country);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#fff' }}>
      <MobileHeader authed initials="?" />
      <main style={{ flex: 1, padding: '24px 20px' }}>
        <form onSubmit={(e) => e.preventDefault()} style={{
          background: '#fff', borderRadius: 14, padding: 22,
          filter: 'var(--shadow-card)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700,
              color: 'var(--color-primary-blue)', margin: '0 0 4px', lineHeight: 1.2,
            }}>Complete o seu perfil</h2>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.5,
              color: 'var(--color-primary-blue)', margin: 0, textAlign: 'left',
            }}>Estes dados ajudam o seu profissional a preparar a sessão.</p>
          </div>

          <Field label="Nome:">
            <input style={inputStyle} placeholder="Bruxo Voador da Silva" />
          </Field>

          <Field label="Data de nascimento:">
            <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--color-muted)' }}>
              <span>Escolha uma data</span>
              <span style={{ color: 'var(--color-primary-blue)' }}><CalendarIcon /></span>
            </div>
          </Field>

          <Field label="Gênero:">
            <div style={{ position: 'relative' }}>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
                  paddingRight: 44, cursor: 'pointer',
                }}
              >
                {['Feminino','Masculino','Não-binário','Prefiro não responder','Outro'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-primary-blue)', pointerEvents: 'none',
              }}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </Field>

          <Field label="País:">
            <CountrySelect value={country} onChange={setCountry} open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />
          </Field>

          <Field label="Telefone:">
            <div style={{ position: 'relative' }}>
              <input style={{ ...inputStyle, paddingLeft: 60 }} placeholder="Telefone" />
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
                color: 'var(--color-muted)',
                paddingRight: 10, borderRight: '1px solid var(--color-border)',
              }}>{sel.code}</span>
            </div>
          </Field>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" style={{
              flex: 1, padding: '13px 16px', borderRadius: 12,
              background: 'transparent', color: 'var(--color-primary-blue)',
              border: '1.5px solid var(--color-primary-blue)',
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}>Voltar</button>
            <PrimaryButton style={{ flex: 1, width: 'auto', padding: '13px 16px', fontSize: 13 }}>Continuar</PrimaryButton>
          </div>
        </form>
      </main>
      <MobileFooter />
    </div>
  );
}

/* ---------- M_AccountEdit ---------- */
function MobileAccountEditScreen() {
  const [name, setName] = useMState('Bruxo Voador da Silva');
  const [email, setEmail] = useMState('bruxo@care.pt');
  const [birth, setBirth] = useMState('1992-08-14');
  const [gender, setGender] = useMState('Prefiro não responder');
  const [country, setCountry] = useMState('+351');
  const [phone, setPhone] = useMState('915 784 896');
  const [pcOpen, setPcOpen] = useMState(false);
  const sel = COUNTRIES.find(c => c.code === country);

  const tabs = [
    { id: 'agendamentos', label: 'Agendamentos' },
    { id: 'notificacoes', label: 'Notificações' },
    { id: 'conta', label: 'Conta' },
  ];
  const active = 'conta';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#fff' }}>
      <MobileHeader authed initials="BS" />

      {/* Top tab strip replacing the sidebar */}
      <div style={{
        display: 'flex', gap: 4, padding: '12px 20px',
        borderBottom: '1px solid var(--color-surface-tint)',
        overflowX: 'auto',
        flex: 'none',
      }}>
        {tabs.map(t => {
          const isActive = active === t.id;
          return (
            <a key={t.id} style={{
              padding: '8px 14px',
              borderRadius: 999,
              background: isActive ? 'var(--color-surface-tint)' : 'transparent',
              color: 'var(--color-primary-blue)',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>{t.label}</a>
          );
        })}
      </div>

      <main style={{ flex: 1, padding: '20px 20px 28px' }}>
        <h1 style={{
          fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700,
          color: 'var(--color-primary-blue)', margin: '0 0 4px', lineHeight: 1.2,
        }}>A sua conta</h1>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.5,
          color: 'var(--color-muted)', margin: '0 0 18px', textAlign: 'left',
        }}>Apenas o seu profissional tem acesso.</p>

        {/* Profile picture */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 10, padding: '8px 0 18px',
          borderBottom: '1px solid var(--color-surface-tint)', marginBottom: 18,
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'var(--color-surface-tint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--color-border-soft)',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--color-border)">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', borderRadius: 10,
              background: 'var(--color-primary-blue)', color: '#fff',
              border: 0, cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Alterar foto
            </button>
            <button style={{
              padding: '9px 14px', borderRadius: 10,
              background: 'transparent', color: 'var(--color-primary-blue)',
              border: '1px solid var(--color-border)', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
            }}>Remover</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Nome:">
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <Field label="Email:">
            <input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
          </Field>
          <Field label="Data de nascimento:">
            <div style={{ position: 'relative' }}>
              <input type="date" style={{ ...inputStyle, paddingRight: 44 }} value={birth} onChange={e => setBirth(e.target.value)} />
              <span style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-primary-blue)', pointerEvents: 'none',
              }}><CalendarIcon /></span>
            </div>
          </Field>
          <Field label="Gênero:">
            <div style={{ position: 'relative' }}>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
                  paddingRight: 44, cursor: 'pointer',
                }}
              >
                {['Feminino','Masculino','Não-binário','Prefiro não responder','Outro'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-primary-blue)', pointerEvents: 'none',
              }}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </Field>

          <Field label="País:">
            <CountrySelect value={country} onChange={setCountry} open={pcOpen} onOpen={() => setPcOpen(true)} onClose={() => setPcOpen(false)} />
          </Field>
          <Field label="Telefone:">
            <div style={{ position: 'relative' }}>
              <input style={{ ...inputStyle, paddingLeft: 60 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone" />
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
                color: 'var(--color-muted)',
                paddingRight: 10, borderRight: '1px solid var(--color-border)',
              }}>{sel.code}</span>
            </div>
          </Field>
        </div>

        {/* Save bar */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          marginTop: 26, paddingTop: 18,
          borderTop: '1px solid var(--color-surface-tint)',
        }}>
          <button style={{
            padding: '14px 24px', borderRadius: 10,
            background: 'var(--color-primary-blue)', color: '#fff',
            border: 0,
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
          }}>Salvar alterações</button>
          <button style={{
            padding: '12px 24px', borderRadius: 10,
            background: 'transparent', color: 'var(--color-primary-blue)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}>Cancelar</button>
        </div>

        {/* Danger zone */}
        <div style={{
          marginTop: 36, paddingTop: 20,
          borderTop: '1px solid var(--color-surface-tint)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-sans)', fontSize: 12,
            fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#c0392b', margin: '0 0 10px',
          }}>Zona de risco</h3>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700,
            color: 'var(--color-primary-blue)', marginBottom: 4,
          }}>Apagar a sua conta</div>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.5,
            color: 'var(--color-muted)', margin: '0 0 14px', textAlign: 'left',
          }}>Esta ação é permanente. Não é possível recuperar os seus dados depois.</p>
          <button style={{
            width: '100%',
            padding: '12px 20px', borderRadius: 10,
            background: 'transparent', color: '#c0392b',
            border: '1.5px solid #c0392b',
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
          }}>Apagar conta</button>
        </div>
      </main>
      <MobileFooter />
    </div>
  );
}

Object.assign(window, {
  MobileSignInScreen, MobileSignUpScreen,
  MobileOnboardingScreen, MobileAccountEditScreen,
});
