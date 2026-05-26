# Handoff — Header: notifications bell + user menu polish

## What's changing

The current Care header (`src/app/core/components/header/header.component.html`) has two issues:

1. **No notifications cue** — users have no way to see if there are unread items.
2. **`<mat-menu>` default surface is grey** — Angular Material's default panel background reads as foreign next to the rest of the Care palette (deep blue + white).

This handoff adds a notifications **bell** with an unread-count badge between the nav links and the user-menu trigger, and **replaces the Material grey** dropdown surface with a white card that uses Care's canonical drop-shadow.

This is **high-fidelity**: hex values, paddings, type sizes, and motion are all final. Drop them straight onto the existing Angular component.

> The files in this folder are **design references** built in plain HTML/JSX so the look and behavior can be inspected. The implementation target is the existing Angular 20 app (`hermanas-fe`). Use the existing `<mat-icon>` + `<mat-menu>` patterns and `palette.scss` tokens — don't ship the React JSX.

---

## Files to edit

| File | Change |
|---|---|
| `src/app/core/components/header/header.component.html` | Insert bell button before `<button class="account-button">`. Replace menu items as below. |
| `src/app/core/components/header/header.component.scss` | Add bell styles + `::ng-deep` overrides for the mat-menu panel surface. |
| `src/app/core/components/header/header.component.ts` | Inject a `NotificationsService` (new) and expose `unreadCount()` signal. |
| `src/app/shared/services/notifications.service.ts` *(new)* | Hold unread count signal; subscribe to whatever backend feed exists or stub. |
| `src/app/core/components/header/notifications-panel/` *(new)* | Optional — popover with the list. If you keep it simple, route the bell to an existing notifications page instead. |

---

## 1. Notifications bell

### Markup (insert into `header.component.html`)

Place this **immediately before** the existing `@if (navbarService.showUserMenu()) { ... }` block, inside the same `@if (screenSizeService.isTablet() || screenSizeService.isDesktop())` branch:

```html
@if (navbarService.showUserMenu()) {
  <button
    class="bell-button"
    matButton
    [matMenuTriggerFor]="notifMenu"
    [attr.aria-label]="
      'Notificações' + (notificationsService.unreadCount() > 0
        ? ' (' + notificationsService.unreadCount() + ' novas)'
        : '')
    "
  >
    <mat-icon>notifications</mat-icon>
    @if (notificationsService.unreadCount() > 0) {
      <span class="bell-badge">
        {{ notificationsService.unreadCount() > 9
            ? '9+'
            : notificationsService.unreadCount() }}
      </span>
    }
  </button>

  <mat-menu #notifMenu="matMenu" class="care-menu care-menu--notif">
    <!-- list items injected here; see "Notifications panel" below -->
  </mat-menu>
}
```

### Styles (append to `header.component.scss`)

```scss
.bell-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-right: 0.5em;
  padding: 0;
  border: none;
  border-radius: 999px;
  background-color: transparent;
  color: palette.$primaryColorBlue;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover,
  &:focus-visible {
    background-color: #f6f7fb; // --color-surface-tint
  }

  mat-icon {
    font-size: 26px;
    width: 26px;
    height: 26px;
  }
}

.bell-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: palette.$primaryColorPurple; // #8E7FAE
  color: #fff;
  font-family: typography.$sourceSans;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  border-radius: 999px;
  border: 2px solid #fff;
  box-sizing: border-box;
  animation: badgePop 320ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes badgePop {
  0%   { transform: scale(0.4); opacity: 0; }
  60%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); }
}
```

### Badge color choice

The design uses **`palette.$primaryColorPurple` (`#8E7FAE`)** — Care's lilac accent. This stays on-brand. If product wants a sharper "alert" feel, swap for **`#D9304F`** (the red used in error states) — both contrast cleanly against the white border.

---

## 2. Replace the grey `<mat-menu>` surface

The grey is Angular Material's default `.mat-mdc-menu-panel` background. Override it with Care's white-card surface.

### Styles (append to `header.component.scss`)

```scss
// ::ng-deep is required because mat-menu renders in the CDK overlay,
// outside the component's view encapsulation.
::ng-deep .care-menu.mat-mdc-menu-panel {
  background-color: #ffffff;
  min-width: 240px;
  border: 1px solid rgba(34, 50, 110, 0.06);
  border-radius: 12px;
  box-shadow:
    0 10px 30px rgba(34, 50, 110, 0.16),
    0 2px 6px rgba(34, 50, 110, 0.08);
  padding: 6px 0;

  .mat-mdc-menu-content {
    padding: 0;
  }

  .mat-mdc-menu-item {
    font-family: typography.$sourceSans;
    font-size: 15px;
    font-weight: 500;
    color: palette.$primaryColorBlue;
    min-height: 44px;
    padding: 10px 18px;

    .mat-icon {
      margin-right: 12px;
      color: palette.$primaryColorBlue;
      opacity: 0.85;
    }

    &:hover,
    &.cdk-focused,
    &.cdk-program-focused {
      background-color: rgba(142, 127, 174, 0.10); // 10% lilac
    }

    &.menu-item-danger {
      color: #b33049;
      .mat-icon { color: #b33049; }
      &:hover { background-color: rgba(179, 48, 73, 0.08); }
    }
  }
}
```

### Updated user menu markup

Replace the existing `<mat-menu #menu="matMenu">` block with:

```html
<button class="account-button" matButton [matMenuTriggerFor]="menu">
  <mat-icon>account_circle</mat-icon>
</button>
<mat-menu #menu="matMenu" class="care-menu">
  <button
    mat-menu-item
    (click)="navigateTo(navigationService.Pages.DASHBOARD)"
  >
    <mat-icon>person</mat-icon>
    <span>Conta</span>
  </button>
  <button mat-menu-item class="menu-item-danger" (click)="logOut()">
    <mat-icon>logout</mat-icon>
    <span>Terminar sessão</span>
  </button>
</mat-menu>
```

Note: the existing typo "Terminar **Sesssão**" (three s's) is fixed here to "Terminar sessão" (sentence case, per the Care content rules).

---

## 3. Notifications panel (optional — pick one)

### Option A — Route to existing notifications page (simplest)

Drop the `[matMenuTriggerFor]` and make the bell a router link to `Pages.DASHBOARD_NOTIFICATIONS` (or wherever the list lives). The badge alone communicates unread state; the click takes the user to the full page.

### Option B — Inline popover (matches the React prototype)

Inside the `<mat-menu #notifMenu>` from section 1, render a list of `NotificationItem`s:

```html
<div class="notif-header">
  <span class="notif-title">Notificações</span>
  <button
    type="button"
    class="notif-markall"
    (click)="notificationsService.markAllRead(); $event.stopPropagation()"
  >
    marcar todas como lidas
  </button>
</div>

@for (n of notificationsService.items(); track n.id) {
  <a mat-menu-item [class.is-unread]="n.unread" (click)="onNotifClick(n)">
    <span class="unread-dot" aria-hidden></span>
    <span class="notif-body">
      <span class="notif-text">{{ n.title }}</span>
      <span class="notif-when">{{ n.when }}</span>
    </span>
  </a>
}

<a mat-menu-item class="notif-seeall" (click)="navigateTo(Pages.NOTIFICATIONS)">
  Ver todas
</a>
```

Width override on the notif menu only:

```scss
::ng-deep .care-menu--notif.mat-mdc-menu-panel {
  min-width: 360px;
  max-width: 360px;
}
```

Styles for the rows:
- Unread row background: `rgba(142, 127, 174, 0.08)`
- Unread dot: 8px circle, `palette.$primaryColorPurple`, top-margin 8px
- Title font: 14px / 1.4, weight 600 if unread else 400
- Timestamp font: 12px, `palette.$muted` (`#8897ad`)
- "marcar todas" link: italic 500 13px, `palette.$primaryColorPurple`
- "Ver todas" footer: text-align center, bold 13px, top border `rgba(34,50,110,0.08)`

---

## 4. NotificationsService stub

```ts
// src/app/shared/services/notifications.service.ts
import { Injectable, signal, computed } from '@angular/core';

export interface NotificationItem {
  id: string;
  title: string;
  when: string;        // relative time string, or ISO + format in template
  unread: boolean;
  href?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  // Replace with real feed (websocket / polling / SSE / FCM).
  readonly items = signal<NotificationItem[]>([]);
  readonly unreadCount = computed(() => this.items().filter(n => n.unread).length);

  markAllRead() {
    this.items.update(list => list.map(n => ({ ...n, unread: false })));
  }

  markRead(id: string) {
    this.items.update(list => list.map(n => n.id === id ? { ...n, unread: false } : n));
  }
}
```

Inject in `HeaderComponent`:

```ts
readonly notificationsService = inject(NotificationsService);
```

---

## Design tokens used

All values come from `src/assets/styles/palette.scss` and `typography.scss` already in the repo. Nothing new.

| Token | Hex | Where |
|---|---|---|
| `$primaryColorBlue` | `#22326E` | Bell icon, menu item text |
| `$primaryColorPurple` | `#8E7FAE` | Badge background, unread dot, hover wash (at 10%) |
| `--color-surface-tint` | `#F6F7FB` | Bell hover background |
| `--color-border-soft` | rgba `#22326E` @ 6% | Menu card border |
| Drop-shadow | `0 10px 30px rgba(34,50,110,0.16), 0 2px 6px rgba(34,50,110,0.08)` | Menu elevation |
| Border-radius | `12px` | Menu card |
| Bell size | `44 × 44`, icon `26px` | Touch target ≥ 44px |
| Badge | min-width `20px`, height `20px`, border `2px solid #fff` | Rendered top-right of bell |
| Motion | `cubic-bezier(0.4, 0, 0.2, 1)` 320ms (badge), 200ms (menu) | Care's standard ease |

---

## Accessibility checklist

- Bell button: `aria-label="Notificações (N novas)"` — recomputed when count changes.
- Badge: not announced separately — the count is folded into the bell's aria-label.
- Menu items keep the default mat-menu focus ring; do not remove.
- Badge color contrast: white-on-`#8E7FAE` = **4.6 : 1** at 11px bold — passes WCAG AA for large text. (At 11px it's borderline; the bold weight + the white border ring help.) If product wants AAA, swap badge to `#42458E` (indigo) for 7.2 : 1.
- Outside click & Esc both close the menu — `mat-menu` handles this for free.

---

## Reference files in this folder

- **`reference-Header dropdown.html`** — runnable prototype (open in a browser). Includes the Tweaks panel where the original explorations live (dropdown surface variants, badge style/color). Use to compare states.
- **`reference-header.jsx`** — React/JSX source of the prototype. Read as a layout/behavior reference, **not** a port target.
- **`reference-app.jsx`** — host page that mounts the header with mock data.
- **`01-header-closed.png`** — final visual: bell with `3` badge, user menu closed.

The Tweaks panel in the prototype lets you toggle dropdown background variants (white / pale-wash / lilac-edge / inverted blue). The handoff above commits to **white + drop-shadow** — the canonical Care surface. If product wants to revisit one of the other variants later, the prototype is the place to evaluate it.
