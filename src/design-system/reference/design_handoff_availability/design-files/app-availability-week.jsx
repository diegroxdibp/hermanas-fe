/* ===========================================================
   App — merged B+A availability (single focused artboard)
   =========================================================== */

const {
  DesignCanvas: DCw, DCSection: DCSw, DCArtboard: DCAw, DCPostIt: DCPw,
} = window;

function AppAvailabilityWeek() {
  return (
    <DCw
      title="Criar disponibilidades — calendário + editor"
      subtitle="Weekly painter (B) with the 'Quando'-style block editor (A) as its lateral column — now with Serviço and Modalidade, and an icon to tell single-date blocks from recurring ones."
    >
      <DCSw id="merged" title="Disponibilidades do profissional" subtitle="Calendar grid is pixel-aligned; the right column edits the selected/new block.">
        <DCAw id="week-edit" label="Calendário + editor de bloco" width={1380} height={920}>
          <window.AvailabilityWeek />
        </DCAw>
        <DCPw top={-92} left={1380 + 56} width={250} rotate={2}>
          <strong>What changed</strong><br />
          · Grid gutter + day columns share one row track → hour lines align<br />
          · Right column = A's "Quando" + Serviço + Modalidade<br />
          · Modalidade is a full-width segmented (no overflow)<br />
          · <em>Pin badge</em> = data única; <em>repeat</em> icon = semanal
        </DCPw>
      </DCSw>

      <DCSw id="mobile" title="Mobile (estilo Teams)" subtitle="Calendar with a + FAB that opens the create menu as a bottom sheet.">
        <DCAw id="mob-cal" label="Calendário + FAB" width={390} height={844}>
          <window.MobileCalendar />
        </DCAw>
        <DCAw id="mob-create" label="FAB → criar (bottom sheet)" width={390} height={844}>
          <window.MobileCreate />
        </DCAw>
        <DCPw top={-72} left={390 + 390 + 48} width={240} rotate={-2}>
          Tap <strong>+</strong> on the calendar → the create menu rises as a bottom sheet over the dimmed agenda, like Teams mobile.
        </DCPw>
      </DCSw>
    </DCw>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppAvailabilityWeek />);
