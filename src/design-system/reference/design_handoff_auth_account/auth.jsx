/* Auth screens: SignIn, SignUp, Onboarding */

const { useState: useAuthState } = React;

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.05-3.72 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.2 1.65l3.15-3.15A11 11 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
    </svg>
  );
}

function PrimaryButton({ children, ...rest }) {
  return (
    <button {...rest} style={{
      width: '100%',
      padding: '14px 18px',
      borderRadius: 12,
      border: 0,
      background: 'var(--color-primary-blue)',
      color: '#fff',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      ...rest.style,
    }}>{children}</button>
  );
}

function GoogleButton({ children = 'Sign in with Google' }) {
  return (
    <button type="button" style={{
      width: '100%',
      padding: '12px 18px',
      borderRadius: 12,
      border: 0,
      background: '#f3f9fa',
      color: 'var(--color-primary-blue)',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    }}>
      <GoogleG /> {children}
    </button>
  );
}

function Divider({ label = 'Or sign in with' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }}/>
      <span style={{
        fontFamily: 'var(--font-sans)', fontSize: 13,
        color: 'var(--color-primary-blue)', fontWeight: 400,
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }}/>
    </div>
  );
}

/* ----------------- SIGN IN ----------------- */
function SignInScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <MarketingHeader active="" showSignIn={false} />
      <main style={{
        flex: 1,
        background: 'linear-gradient(180deg, var(--color-surface-tint) 0%, #fff 60%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <form onSubmit={(e) => e.preventDefault()} style={{
          width: 420, background: '#fff', borderRadius: 16, padding: 36,
          filter: 'var(--shadow-card)',
          display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 28, fontWeight: 700,
            color: 'var(--color-primary-blue)',
            margin: '0 0 6px',
            lineHeight: 1.2,
          }}>Bem-vindo de volta</h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15, color: 'var(--color-primary-blue)',
            margin: '0 0 24px', textAlign: 'left',
            lineHeight: 1.5,
          }}>Acesse sua conta para gerir os seus agendamentos.</p>

          <Field label="Email:" style={{ marginBottom: 14 }}>
            <input style={inputStyle} placeholder="seu@email.com" defaultValue="luane@care.pt" />
          </Field>

          <Field label="Password:" style={{ marginBottom: 6 }}>
            <input type="password" style={inputStyle} placeholder="••••••••" defaultValue="••••••••" />
          </Field>

          <a style={{
            alignSelf: 'flex-end',
            fontFamily: 'var(--font-sans)', fontSize: 13,
            fontWeight: 500, fontStyle: 'italic',
            color: 'var(--color-primary-purple)',
            margin: '4px 0 18px', cursor: 'pointer',
          }}>Esqueci minha senha</a>

          <PrimaryButton>Sign In</PrimaryButton>

          <Divider label="Or sign in with" />

          <GoogleButton />

          <div style={{
            display: 'flex', justifyContent: 'center', marginTop: 22,
            fontFamily: 'var(--font-sans)', fontSize: 15,
            color: 'var(--color-primary-blue)',
          }}>
            <span>Don't you have an account?{' '}
              <a style={{ color: 'var(--color-primary-purple)', fontWeight: 700, cursor: 'pointer' }}>Sign up</a>
            </span>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

/* ----------------- SIGN UP ----------------- */
function PasswordRule({ valid, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--font-sans)', fontSize: 12.5,
      fontWeight: 500,
      color: valid ? 'var(--color-success)' : 'rgba(34, 50, 110, 0.45)',
      lineHeight: 1.3,
    }}>
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid currentColor',
        background: valid ? 'var(--color-success)' : 'transparent',
        flex: 'none',
      }}>
        {valid && (
          <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4.2 L3.2 5.9 L6.5 2.4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        )}
      </span>
      {children}
    </div>
  );
}

function SignUpScreen() {
  const [pwd, setPwd] = useAuthState('Care2026');
  const rules = [
    { ok: pwd.length >= 8, label: 'Mínimo de 8 caracteres' },
    { ok: /[A-Z]/.test(pwd), label: 'Pelo menos 1 letra maiúscula' },
    { ok: /[0-9]/.test(pwd), label: 'Pelo menos 1 número' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <MarketingHeader active="" showSignIn={false} />
      <main style={{
        flex: 1,
        background: 'linear-gradient(180deg, var(--color-surface-tint) 0%, #fff 60%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <form onSubmit={(e) => e.preventDefault()} style={{
          width: 460, background: '#fff', borderRadius: 16, padding: 36,
          filter: 'var(--shadow-card)',
          display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 28, fontWeight: 700,
            color: 'var(--color-primary-blue)',
            margin: '0 0 6px', lineHeight: 1.2,
          }}>Crie sua conta</h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15, color: 'var(--color-primary-blue)',
            margin: '0 0 24px', textAlign: 'left',
            lineHeight: 1.5,
          }}>Um espaço para acolher quem cuida e quem precisa de cuidado.</p>

          <Field label="Email:" style={{ marginBottom: 14 }}>
            <input style={inputStyle} placeholder="seu@email.com" />
          </Field>

          <Field label="Password:" style={{ marginBottom: 8 }}>
            <input type="password" style={inputStyle} value={pwd} onChange={e => setPwd(e.target.value)} />
          </Field>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {rules.map((r, i) => <PasswordRule key={i} valid={r.ok}>{r.label}</PasswordRule>)}
          </div>

          <Field label="Confirme a password:" style={{ marginBottom: 18 }}>
            <input type="password" style={inputStyle} placeholder="••••••••" />
          </Field>

          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontFamily: 'var(--font-sans)', fontSize: 13.5,
            color: 'var(--color-primary-blue)',
            marginBottom: 22, lineHeight: 1.5,
            cursor: 'pointer',
          }}>
            <input type="checkbox" defaultChecked style={{
              width: 18, height: 18, marginTop: 2, accentColor: 'var(--color-primary-blue)',
              flex: 'none',
            }} />
            <span>Concordo com os <a style={{ color: 'var(--color-primary-purple)', fontWeight: 700 }}>termos de uso</a> e a <a style={{ color: 'var(--color-primary-purple)', fontWeight: 700 }}>política de privacidade</a>.</span>
          </label>

          <PrimaryButton>Sign Up</PrimaryButton>

          <Divider label="Or sign up with" />
          <GoogleButton>Sign up with Google</GoogleButton>

          <div style={{
            display: 'flex', justifyContent: 'center', marginTop: 22,
            fontFamily: 'var(--font-sans)', fontSize: 15,
            color: 'var(--color-primary-blue)',
          }}>
            <span>Já tem uma conta?{' '}
              <a style={{ color: 'var(--color-primary-purple)', fontWeight: 700, cursor: 'pointer' }}>Sign in</a>
            </span>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

/* ----------------- ONBOARDING ----------------- */
const COUNTRIES = [
  { flag: '🇵🇹', name: 'Portugal', code: '+351' },
  { flag: '🇧🇷', name: 'Brasil', code: '+55' },
  { flag: '🇪🇸', name: 'España', code: '+34' },
  { flag: '🇫🇷', name: 'France', code: '+33' },
  { flag: '🇮🇹', name: 'Italia', code: '+39' },
  { flag: '🇩🇪', name: 'Deutschland', code: '+49' },
  { flag: '🇬🇧', name: 'United Kingdom', code: '+44' },
  { flag: '🇺🇸', name: 'United States', code: '+1' },
  { flag: '🇮🇪', name: 'Ireland', code: '+353' },
  { flag: '🇳🇱', name: 'Nederland', code: '+31' },
];

function FlagPill({ flag }) {
  return <span style={{ fontSize: 18, lineHeight: 1, marginRight: 8 }}>{flag}</span>;
}

function CountrySelect({ value, onChange, open, onOpen, onClose }) {
  const sel = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <button type="button" onClick={() => (open ? onClose() : onOpen())} style={{
        ...inputStyle,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '12px 14px',
        cursor: 'pointer',
        position: 'relative',
        borderColor: open ? 'var(--color-primary-blue)' : 'var(--color-border)',
      }}>
        <span style={{
          position: 'absolute',
          top: open ? -8 : 14,
          left: 12,
          fontSize: open ? 12 : 16,
          fontWeight: open ? 600 : 400,
          color: open ? 'var(--color-primary-blue)' : 'var(--color-muted)',
          background: '#fff',
          padding: '0 6px',
          transition: 'all .15s ease',
          pointerEvents: 'none',
        }}>País{open && <span style={{ color: 'var(--color-primary-purple)' }}>*</span>}</span>
        <FlagPill flag={sel.flag} />
        <span style={{ flex: 1, color: 'var(--color-primary-blue)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel.name} ({sel.code})</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-primary-blue)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          maxHeight: 260,
          overflowY: 'auto',
          filter: 'var(--shadow-floating)',
          zIndex: 10,
          padding: '6px 0',
        }}>
          {COUNTRIES.map(c => {
            const isSel = c.code === value;
            return (
              <div key={c.code} onClick={() => { onChange(c.code); onClose(); }} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 14px',
                fontFamily: 'var(--font-sans)', fontSize: 15,
                color: isSel ? 'var(--color-primary-purple)' : 'var(--color-primary-blue)',
                background: isSel ? 'var(--color-surface-tint)' : 'transparent',
                cursor: 'pointer',
                fontWeight: isSel ? 600 : 400,
              }}>
                <FlagPill flag={c.flag} />
                <span style={{ flex: 1 }}>{c.name} ({c.code})</span>
                {isSel && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

const ONBOARDING_GENDERS = ['Feminino', 'Masculino', 'Não-binário', 'Prefiro não responder', 'Outro'];

function OnboardingScreen() {
  const [country, setCountry] = useAuthState('+351');
  const [open, setOpen] = useAuthState(true); // show open state to mirror screenshot
  const [gender, setGender] = useAuthState('Prefiro não responder');
  const sel = COUNTRIES.find(c => c.code === country);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <AuthedHeader active="" initials="?" name="" role="Paciente" />
      <main style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '48px 24px 24px',
        background: '#fff',
      }}>
        <form onSubmit={(e) => e.preventDefault()} style={{
          width: 580, background: '#fff', borderRadius: 16, padding: 32,
          filter: 'var(--shadow-card)',
          display: 'flex', flexDirection: 'column', gap: 16,
          boxSizing: 'border-box',
        }}>
          <div style={{ marginBottom: 4 }}>
            <h2 style={{
              fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700,
              color: 'var(--color-primary-blue)', margin: '0 0 4px', lineHeight: 1.2,
            }}>Complete o seu perfil</h2>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5,
              color: 'var(--color-primary-blue)', margin: 0, textAlign: 'left',
            }}>Estes dados ajudam o seu profissional a preparar a sessão.</p>
          </div>

          <Field label="Nome:">
            <input style={inputStyle} placeholder="Bruxo Voador da Silva" />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    paddingRight: 44,
                    cursor: 'pointer',
                  }}
                >
                  {ONBOARDING_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-primary-blue)', pointerEvents: 'none',
                }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <CountrySelect value={country} onChange={setCountry} open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />
            <div style={{ flex: 1, position: 'relative' }}>
              <input style={{ ...inputStyle, paddingLeft: 58 }} placeholder="Telefone" />
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
                color: 'var(--color-muted)',
                paddingRight: 10, borderRight: '1px solid var(--color-border)',
              }}>{sel.code}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="button" style={{
              flex: 1, padding: '14px 18px', borderRadius: 12,
              background: 'transparent', color: 'var(--color-primary-blue)',
              border: '1.5px solid var(--color-primary-blue)',
              fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}>Voltar</button>
            <PrimaryButton style={{ flex: 1, width: 'auto' }}>Continuar</PrimaryButton>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

Object.assign(window, { SignInScreen, SignUpScreen, OnboardingScreen, PrimaryButton, GoogleButton, Divider });
