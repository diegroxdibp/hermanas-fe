/* app.jsx — host page + tweak wiring */
const { useState } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dropBg": "white",
  "dropStyle": "elevated",
  "notifPlacement": "bell",
  "badgeStyle": "pill",
  "badgeTone": "#8E7FAE",
  "unreadCount": 3
}/*EDITMODE-END*/;

function App() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);
  const [notifs, setNotifs] = useState([
    { id: 1, title: 'Luane Bastos confirmou a sua sessão de quinta-feira.', when: 'há 4 min', unread: true },
    { id: 2, title: 'Nova mensagem no grupo Análise Corporal Reichiana.',   when: 'há 1 h',  unread: true },
    { id: 3, title: 'Pagamento da consulta de 12/05 processado.',           when: 'há 2 h',  unread: true },
    { id: 4, title: 'Lembrete: questionário de acolhimento pendente.',      when: 'ontem',   unread: false },
    { id: 5, title: 'A sua próxima sessão é dia 27 às 18h.',                when: '23 mai',  unread: false },
  ]);

  // Sync visible unread count with tweak slider — slice unread state to first N items.
  const visibleNotifs = notifs.map((n, i) => ({
    ...n,
    unread: i < t.unreadCount,
  }));

  return (
    <>
      <div className="stage">
        <CareHeader
          t={t}
          notifications={visibleNotifs}
          onMarkAll={() => setT({ unreadCount: 0 })} />

        <main className="page-body">
          <h1>Olá, Mestre.</h1>
          <p>Bem-vindo ao seu espaço CARE. As suas próximas sessões, mensagens e pendências aparecem aqui. Use o menu superior para gerir a sua conta ou agendar novos encontros.</p>
          <p className="stage-hint">Página de fundo apenas para contexto — o foco é o cabeçalho e o menu aberto acima.</p>
        </main>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Notificações">
          <TweakSelect
            label="Estilo"
            value={t.badgeStyle}
            onChange={v => setT({ badgeStyle: v })}
            options={[
              { value: 'pill',   label: 'Pílula com número' },
              { value: 'square', label: 'Quadrado com número' },
              { value: 'dot',    label: 'Apenas ponto' },
            ]} />
          <TweakColor
            label="Cor"
            value={t.badgeTone}
            onChange={v => setT({ badgeTone: v })}
            options={['#8E7FAE', '#D9304F', '#42458E', '#77C5D5']} />
          <TweakSlider
            label="Não lidas"
            min={0} max={5} step={1}
            value={t.unreadCount}
            onChange={v => setT({ unreadCount: v })} />
        </TweakSection>

        <TweakSection label="Fundo do dropdown">
          <TweakSelect
            label="Variante"
            value={t.dropBg}
            onChange={v => setT({ dropBg: v })}
            options={[
              { value: 'white',     label: 'Branco + sombra' },
              { value: 'tint',      label: 'Lavagem CARE' },
              { value: 'lilacEdge', label: 'Topo lilás' },
              { value: 'blue',      label: 'Azul invertido' },
            ]} />
          <TweakRadio
            label="Elevação"
            value={t.dropStyle}
            onChange={v => setT({ dropStyle: v })}
            options={[
              { value: 'elevated', label: 'Elevado' },
              { value: 'flat',     label: 'Plano' },
            ]} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
