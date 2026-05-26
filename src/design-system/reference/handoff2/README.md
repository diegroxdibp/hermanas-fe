# Handoff — Mobile menu: bottom sheet (Variant D)

## What's changing

The current `app-fullscreen-menu` (`src/app/shared/components/fullscreen-menu/`) is a centered, italic-on-navy-blue takeover screen — the version your screenshot showed. It works but feels foreign next to the rest of the marketing surface, has no notifications cue, and centers everything which makes it look "old web".

This handoff replaces it with a **bottom-sheet** pattern:

- **Slides up from the bottom** over a translucent navy scrim — the page behind stays visible (and re-focusable by tapping the scrim or close button)
- **User identity strip** at the top of the sheet (avatar, name, email, close-X)
- **Rounded-top white card** with rows: each row is `icon · label · (badge) · chevron`
- **Notifications row carries the unread badge** (`3`), so mobile gets the same unread cue as desktop without needing a separate bell
- **"Terminar sessão" in danger red** at the bottom — clearly destructive, no chevron
- **Staggered entry animation**: scrim fades in (300ms), sheet rises (450ms), each row stagger fade-up at 40ms apart

This pattern matches Care's calmer visual language — it sits **on top of** the page rather than blacking it out — and gives the developer a known shape (Angular Material `MatBottomSheet`) to lean on.

> The files in this folder are **design references**, not production code to copy. Implement them as Angular 20 components using `MatBottomSheet`, the existing `palette.scss` tokens, and the routing services already in place.

---

## Files to edit / create

| File | Change |
|---|---|
| `src/app/shared/components/fullscreen-menu/fullscreen-menu.component.ts` | Replace the in-template overlay logic with a `MatBottomSheet.open(MobileMenuSheetComponent)` call when the hamburger is tapped. Keep the hamburger SVG + its open/close transform. |
| `src/app/shared/components/fullscreen-menu/fullscreen-menu.component.html` | Strip out everything inside the existing `@if (isMenuOpen) { … }` block — the sheet renders via `MatBottomSheet` overlay now. Keep only the trigger button. |
| `src/app/shared/components/fullscreen-menu/fullscreen-menu.component.scss` | Drop the `.fullscreen-menu` block + its animations. Keep `.menu-button` and the hamburger-to-X SVG transform. |
| `src/app/shared/components/mobile-menu-sheet/` *(new)* | New component: the sheet body. |
| `src/app/app.config.ts` *(or wherever you bootstrap)* | Ensure `provideAnimationsAsync()` is in providers — Material bottom-sheet needs it. |

---

## 1. New component — `MobileMenuSheetComponent`

### TypeScript

```ts
// src/app/shared/components/mobile-menu-sheet/mobile-menu-sheet.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/auth.service';
import { NavigationService } from '../../services/navigation.service';
import { NotificationsService } from '../../services/notifications.service';
import { Pages } from '../../enums/pages.enum';

interface MenuRow {
  label: string;
  icon: string;          // mat-icon ligature
  page?: Pages;
  showBadge?: boolean;
  danger?: boolean;
}

@Component({
  selector: 'app-mobile-menu-sheet',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './mobile-menu-sheet.component.html',
  styleUrl: './mobile-menu-sheet.component.scss',
})
export class MobileMenuSheetComponent {
  readonly ref = inject(MatBottomSheetRef<MobileMenuSheetComponent>);
  readonly authService = inject(AuthService);
  readonly navigationService = inject(NavigationService);
  readonly notificationsService = inject(NotificationsService);
  readonly Pages = Pages;

  readonly user = this.authService.currentUser; // signal or whatever exists
  readonly rows: MenuRow[] = [
    { label: 'Home',         icon: 'home',          page: Pages.HOME },
    { label: 'Sobre',        icon: 'info',          page: Pages.ABOUT },
    { label: 'Contato',      icon: 'mail',          page: Pages.CONTACT },
    { label: 'Agendar',      icon: 'calendar_today',page: Pages.SCHEDULING },
    { label: 'Notificações', icon: 'notifications', page: Pages.NOTIFICATIONS, showBadge: true },
    { label: 'Conta',        icon: 'person',        page: Pages.DASHBOARD },
  ];

  go(page: Pages | undefined) {
    if (page) this.navigationService.navigateTo(page);
    this.ref.dismiss();
  }

  logout() {
    this.authService.logout();
    this.ref.dismiss();
  }

  close() { this.ref.dismiss(); }
}
```

### Template

```html
<!-- src/app/shared/components/mobile-menu-sheet/mobile-menu-sheet.component.html -->
<div class="grab" aria-hidden="true"></div>

<div class="user-strip">
  <span class="avatar">{{ user.initials }}</span>
  <div class="user-meta">
    <div class="user-name">{{ user.name }}</div>
    <div class="user-email">{{ user.email }}</div>
  </div>
  <button class="close-btn" (click)="close()" aria-label="Fechar menu">
    <mat-icon>close</mat-icon>
  </button>
</div>

@for (row of rows; track row.label; let i = $index) {
  <a class="row" [style.--row-delay.s]="0.20 + i * 0.04"
     (click)="go(row.page)">
    <mat-icon class="icon">{{ row.icon }}</mat-icon>
    <span class="label">{{ row.label }}</span>
    @if (row.showBadge && notificationsService.unreadCount() > 0) {
      <span class="badge">{{ notificationsService.unreadCount() }}</span>
    }
    <mat-icon class="chev">chevron_right</mat-icon>
  </a>
}

<a class="row row-danger" style="--row-delay: 0.50s" (click)="logout()">
  <mat-icon class="icon">logout</mat-icon>
  <span class="label">Terminar sessão</span>
</a>
```

### Styles

```scss
// src/app/shared/components/mobile-menu-sheet/mobile-menu-sheet.component.scss
@use "../../../../assets/styles/palette.scss" as palette;
@use "../../../../assets/styles/typography.scss" as typography;

:host {
  display: block;
  font-family: typography.$sourceSans;
  color: palette.$primaryColorBlue;
  // Sheet entrance — the surrounding overlay handles scrim fade-in.
  animation: sheet-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes sheet-in {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.grab {
  width: 40px; height: 4px;
  margin: 0 auto 8px;
  background: rgba(34, 50, 110, 0.20);
  border-radius: 999px;
}

.user-strip {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 24px 18px;
}
.avatar {
  flex: 0 0 auto;
  width: 44px; height: 44px;
  border-radius: 999px;
  background: palette.$primaryColorBlue;
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px;
}
.user-meta { flex: 1; line-height: 1.2; }
.user-name  { font-weight: 700; font-size: 16px; }
.user-email { font-size: 12px; color: palette.$muted; margin-top: 2px; }

.close-btn {
  flex: 0 0 auto;
  width: 36px; height: 36px; padding: 0;
  border: none; border-radius: 999px;
  background: #f6f7fb;
  color: palette.$primaryColorBlue;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { background: #e8ebf5; }
  mat-icon { font-size: 18px; width: 18px; height: 18px; }
}

.row {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 24px;
  color: palette.$primaryColorBlue;
  font-family: typography.$sourceSans;
  font-size: 17px; font-weight: 500;
  border-top: 1px solid rgba(34, 50, 110, 0.06);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1);

  // Per-row stagger entry; --row-delay is set inline.
  animation: row-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--row-delay, 0s);

  &:hover  { background: rgba(142, 127, 174, 0.08); }
  &:active { background: rgba(142, 127, 174, 0.14); }

  .icon { color: palette.$primaryColorBlue; opacity: 0.95; }
  .label { flex: 1; }
  .chev  { opacity: 0.45; }
}

.badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 20px;
  padding: 0 6px;
  background: palette.$primaryColorPurple;
  color: #fff;
  font-size: 11px; font-weight: 700;
  border-radius: 999px;
}

.row-danger {
  color: #B33049;
  font-weight: 600;
  .icon { color: #B33049; }
}

@keyframes row-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## 2. Opening the sheet from `FullscreenMenuComponent`

### TS — replace the body of the existing component

```ts
import { Component, inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MobileMenuSheetComponent } from '../mobile-menu-sheet/mobile-menu-sheet.component';

@Component({
  selector: 'app-fullscreen-menu',
  standalone: true,
  imports: [],
  templateUrl: './fullscreen-menu.component.html',
  styleUrl: './fullscreen-menu.component.scss',
})
export class FullscreenMenuComponent {
  private readonly bottomSheet = inject(MatBottomSheet);
  isMenuOpen = false;

  toggleMenu() {
    if (this.isMenuOpen) return;
    this.isMenuOpen = true;
    const ref = this.bottomSheet.open(MobileMenuSheetComponent, {
      panelClass: 'care-menu-sheet',
      backdropClass: 'care-menu-backdrop',
      ariaLabel: 'Menu',
      // Sheet handles its own entrance; matters only for accessibility.
      restoreFocus: true,
    });
    ref.afterDismissed().subscribe(() => { this.isMenuOpen = false; });
  }
}
```

### HTML — keep only the hamburger trigger

The existing template's first `<button class="menu-button">…</button>` stays as-is. Delete the `@if (isMenuOpen) { <div class="fullscreen-menu open">…</div> }` block entirely.

### SCSS — global overrides for the sheet's CDK overlay

These need to live in a **global** stylesheet (e.g. `src/styles.scss`) because the bottom sheet renders outside any component's view encapsulation:

```scss
// src/styles.scss
@use "./assets/styles/palette.scss" as palette;

.care-menu-sheet.mat-mdc-bottom-sheet-container {
  // Strip Material's chrome — we draw our own.
  background: #fff;
  padding: 12px 0 calc(28px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -10px 30px rgba(34, 50, 110, 0.18);
  max-height: 80vh;
  min-width: auto;
  // The sheet content scrolls if it overflows.
  overflow-y: auto;
}

.care-menu-backdrop.cdk-overlay-backdrop {
  background: rgba(34, 50, 110, 0.55);
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.care-menu-backdrop.cdk-overlay-backdrop-showing { opacity: 1; }
```

---

## 3. NotificationsService — reuse the desktop handoff

This component depends on the same `NotificationsService` defined in the previous handoff (`design_handoff_header.../README.md` § 4 — `unreadCount()` signal). If that's not yet shipped, ship it first.

If notifications haven't been wired to a backend yet, seed the signal with a stub so the badge UI can be evaluated:

```ts
this.items.set([
  { id: '1', title: 'Sessão confirmada',     when: 'há 4 min', unread: true },
  { id: '2', title: 'Nova mensagem',         when: 'há 1 h',   unread: true },
  { id: '3', title: 'Pagamento processado',  when: 'há 2 h',   unread: true },
]);
```

---

## 4. What to delete

After the bottom sheet is wired up, **remove** the following from `fullscreen-menu.component.scss` — they're all replaced by the sheet:

- `.fullscreen-menu { … }` and `.fullscreen-menu.open { … }`
- `.fullscreen-menu nav { … }` and its `.open nav { … }` counterpart
- The `nav ul li .menu-item` rules and `.menu-item:hover { color: #00ff88; … }`
   *(Side note: that lime-green hover color `#00ff88` is off-brand; the new sheet uses a 10% lilac wash for hover, which matches the desktop dropdown.)*
- `mat-divider { … }` (the white horizontal divider between nav groups)

Keep `.menu-button` and the SVG hamburger-to-X transform — the trigger is unchanged.

---

## Design tokens used

| Token | Value | Where |
|---|---|---|
| `$primaryColorBlue` | `#22326E` | Sheet text, avatar background, icon strokes |
| `$primaryColorPurple` | `#8E7FAE` | Unread badge background, hover wash (at 8% / 14%) |
| Danger | `#B33049` | "Terminar sessão" color |
| Scrim | `rgba(34, 50, 110, 0.55)` | Backdrop |
| Sheet shadow | `0 -10px 30px rgba(34, 50, 110, 0.18)` | Sheet elevation |
| Sheet radius | `24px 24px 0 0` | Sheet top corners |
| Avatar | `44 × 44`, font `14px / 700` | User strip |
| Row height | `~52px` (padding 14px + 22px icon + 1px border) | Touch target ≥ 44px |
| Badge | min-width `22px`, height `20px`, font `11px / 700` | Inline meta on rows |
| Stagger | `40ms` between rows, `35ms` total per row | `row-in` entrance |
| Sheet entrance | `450ms cubic-bezier(0.4, 0, 0.2, 1)` | `sheet-in` translateY |
| Scrim entrance | `300ms cubic-bezier(0.4, 0, 0.2, 1)` | CDK backdrop fade-in |
| Hover wash | `rgba(142, 127, 174, 0.08)` | Row hover |
| Active wash | `rgba(142, 127, 174, 0.14)` | Row press |

---

## Accessibility checklist

- `MatBottomSheet` traps focus inside the sheet — leave `restoreFocus: true` so focus returns to the hamburger on dismiss.
- Pass `ariaLabel: 'Menu'` when opening so screen readers announce purpose.
- Tap on backdrop and Esc both dismiss — CDK handles this automatically.
- Touch targets: every row is ~52px tall, close button is 36px (acceptable since the whole sheet can be dismissed by tapping the scrim).
- Notifications badge: the unread count is announced as part of the row's accessible name — add `[attr.aria-label]="'Notificações' + (n > 0 ? ', ' + n + ' não lidas' : '')"` to that row specifically.
- Avoid trapping the entire viewport in a `position: fixed` overlay if `prefers-reduced-motion` is set — the `sheet-in` and `row-in` animations should be wrapped:

```scss
@media (prefers-reduced-motion: reduce) {
  :host, .row { animation: none; }
}
```

---

## Reference files in this folder

- **`reference-variant-D.html`** — runnable, no-framework reference. Open in a browser at any width; resize the window to mobile widths to see the intended scale. The animations are stripped from this static reference so the dev can read the final state — see the prototype at the project root (`Mobile fullscreen menu.html`) for the live entrance motion.
- **`preview-D.png`** — final visual reference.

---

## Open questions

- **Do you have a real `Pages.NOTIFICATIONS` route yet?** The dashboard has a `dashboard-notifications` component but it currently houses an expense-split calculator (not actual notifications). Once a real notifications page exists, route the Notificações row to it; until then, point it to the dashboard.
- **Email visible to all roles?** The user strip shows the email under the name. If patient privacy concerns make this undesirable, swap for role (`'Paciente'`) to match the desktop dropdown.
- **Brazilian or European Portuguese for the rows?** Current copy uses "Terminar sessão" (PT-PT). The codebase has "Terminar Sessssão" (typo) elsewhere — fix on the way through.
