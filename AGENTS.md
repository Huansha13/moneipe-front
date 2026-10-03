# AGENTS.md — Referencia del proyecto `moneipe`

> Guía de convenciones para no tener que re-explorar el repo. Úsala antes de tocar código;
> si algo cambia, actualiza este archivo.

## Stack y comandos

- Angular **22** (zoneless, standalone por defecto, `strict: true` + `strictTemplates`), Material **22**, SCSS, `@ngx-translate/core`.
- Keycloak para auth (`core/auth`: `authGuard`, `roleGuard(['manage-users'])`), `HttpClient` con interceptor Bearer.
- Comandos: `npm start` (dev server), `npm run build`, `npx ng build --configuration development` (build de verificación, ~1.4s).
- **No hay ESLint ni script de lint.** Verificación = build (incluye type-check de plantillas).
- Prettier: config en `package.json` (`"prettier"` → parser `angular` para `*.html`). `.editorconfig`: 2 espacios, comillas simples en `*.ts`.
- Schematics (`angular.json`): prefijo `app`, `skipTests: true` (**no genera `.spec.ts`**), estilos `scss`. Presupuesto de estilos por componente: warn 4kB / error 8kB.

## Estructura

```
src/app/
├── core/
│   ├── auth/            auth.guard.ts, role.guard.ts, auth.service.ts
│   ├── interceptors/    bearer.interceptor.ts
│   └── layout/main-layout/  main-layout.ts|html|scss
├── features/            páginas lazy (una carpeta por feature)
│   ├── <feature>/       <feature>.ts|html|scss + service(s)/ + components/<hijo>/
├── shared/
│   ├── components/      confirm-dialog, language-switcher, loading
│   ├── models/          interfaces compartidas (casi sin uso; los modelos viven en su feature)
│   ├── pipes/           pipes puros (ej. initials.pipe.ts)
│   ├── services/        language, password-validator, responsive, settings
│   └── ui/              (vacío, previsto para dumb components)
└── app.routes.ts        TODAS las rutas (no hay *.routes.ts por feature)
```

## Convenciones de componentes

- Archivos **sin sufijo `.component`**: `group.ts` + `group.html` + `group.scss`; en el decorador
  `templateUrl: './x.html'`, **`styleUrl`** (singular). Selector `app-*`.
- Standalone **no se declara** (implícito). Los módulos Material/Forms van en `imports: [...]`.
- Inyección solo con `private readonly x = inject(Servicio)` (nunca constructor).
- Control flow de plantilla: `@if` / `@for ... @empty` (no `*ngIf`/`*ngFor`), salvo APIs de Material
  (`*matHeaderCellDef`).
- Métodos/propiedades usados en plantilla: `protected`.
- Estado local: `signal(...)`, derivado: `computed(...)`, observable → signal: `toSignal(obs, {initialValue})`.
- Hijos de feature: `features/<feature>/components/<nombre>/<nombre>.ts|html|scss`.
- Diálogos: `dialog.open(Comp, {width: '480px', data})`, interfaz `XDialogData` exportada en el mismo archivo,
  plantilla con `mat-dialog-title/content/actions` y `inject(MAT_DIALOG_DATA)` + `inject(MatDialogRef)`.
- Pipes: `@Pipe({name: 'x'})` standalone, en `shared/pipes/x.pipe.ts` y añadido a `imports`.

## Rutas (`src/app/app.routes.ts`)

- Ruta raíz con `canActivate: [authGuard]` → `loadComponent` de `MainLayout` y `children` con las features:
  `dashboard`, `user-account`, `groups`, `users` (con `roleGuard`), `investments`. Cierre `** → ''`.
- Lazy **por componente**: `loadComponent: () => import('./features/x/x').then(m => m.X)`.
- Sin `title:`, sin `children` internos, sin resolvers.

## i18n

- Archivos: `src/assets/i18n/es.json` y `en.json` (**siempre espejados**). Setup en `app.config.ts`
  (`lang: 'es'`, prefix `./assets/i18n/`, suffix `.json`).
- Plantilla: `{{ 'CLAVE.SUBCLAVE' | translate }}` (importar `TranslatePipe`); TS: `translate.instant(...)`.
- Namespaces top-level: `APP, NAV, MENU, ACCOUNT, DASHBOARD, GROUP, USERS, LOADING, LANGUAGE, INVESTMENTS`
  (singular para features plurales). Interpolación con `{{variable}}` (ej. `USERS.CONFIRM_DELETE_MESSAGE`).

## Estilos

- **No hay Bootstrap.** Utilidades propias tipo Tailwind en `src/styles/_utilities.scss` (clases con `!important`):
  flex/grid (`.d-flex .gap-2 .justify-content-between .align-items-center`), spacing `.p-/.m-/.px- 0..5`,
  `.rounded .rounded-circle .rounded-pill .border .border-bottom`, `.text-muted` (opacity .65),
  `.text-truncate .fw-semibold .fs-xs/.fs-sm/.lh-base`, `.overflow-y-auto .flex-1 .min-vh-100`, `.cursor-pointer`.
  Breakpoints: 576 / **768** / 992 / 1200 / 1400 (el mismo de `ResponsiveService`, cuyo mobile es `(max-width: 768px)`).
- Colores en `src/styles/_colors.scss`: `--color-*` mapeados a `--mat-sys-*` + utilidades
  `.bg-primary .bg-surface .text-primary .text-on-surface .bg-secondary-container ...` (todas `!important`).
  **No existen** variantes `text-on-primary-container` ni `bg-on-*`.
- En SCSS de componente se usan **tokens Material**: `var(--mat-sys-surface-container-low)`,
  `--mat-sys-outline-variant`, `--mat-sys-primary-container`, `--mat-list-active-indicator-color`, etc.
- Sin mixins ni variables Sass de color; sin dark mode real (`color-scheme: light` en `styles.scss`).
- **No hay estilos de scrollbar** globales; si se quiere, se hace en el componente
  (`scrollbar-width: thin` + `::-webkit-scrollbar` de 6px).

## Angular Material — patrones usados (v22)

- **Encapsulación:** los componentes Material usan `ViewEncapsulation.None` → sus estilos son globales y
  compiten por especificidad/orden. Para sobreescribir: subir especificidad
  (`.padre .hijo`, nunca `&__hijo` suelto), o usar utilidades globales con `!important`, o **custom properties**
  (ej. `--mat-list-list-item-container-shape` en el elemento) que ganan sin pelear por orden.
- **Inputs nuevos de Material** (`subscriptSizing`, `matIconButton`, `matSuffix`, `matListItemTitle`…) sí existen
  en v22 aunque no aparezcan en `fesm2022/form-field.mjs` (están en `_form-field-chunk.mjs`); verificar con grep
  sobre `node_modules/@angular/material/fesm2022/*.mjs`.
- Búsqueda / input: `mat-form-field` + `mat-label` + `input matInput` + `[formControl]` + botón `matSuffix matIconButton`
  para limpiar (formularios reactivos, **no** `[(ngModel)]`). `subscriptSizing="dynamic"` para no reservar espacio.
- Listas: `mat-list` + `mat-list-item` con `matListItemAvatar`, `matListItemTitle`, `matListItemLine`, `matListItemMeta`
  (`matListItemIcon` para `mat-icon`). OJO: esos elementos reciben pseudo-elementos `::before` de MDC (20-32px)
  para alineación vertical → **añadirles `d-flex align-items-center`** (el flex los convierte en items de 0px de
  ancho y anula el desplazamiento); en `matListItemLine` con `gap` hace falta ocultar el `::before`
  (`.hijo .linea::before { display: none }`), y en `matListItemMeta` de items de 2 líneas añadir
  `align-self-center` (MDC fuerza `flex-start`).
- El avatar (`matListItemAvatar`) ya trae 40×40 + márgenes 16px + bg `primary-container` de fábrica:
  solo centrar el contenido, no redimensionar.
- Chips: `mat-chip-set` > `mat-chip` (con `[disabled]="true"` para verse apagado).
- El item de lista es `display:flex` con `overflow:hidden`; clic en los hijos burbujea (no hace falta poner
  `(click)` en cada hijo).

## Feature `group` (lista + detalle tipo WhatsApp)

- `group.ts|html|scss` = lista izquierda + `<app-group-detail>` a la derecha (misma vista, **sin ruta `:id`**).
  Selección en `selectedGroup = signal<Group|null>()`, búsqueda en `searchControl = new FormControl('')` +
  `toSignal(valueChanges)` + `filteredGroups = computed(...)`. Clase `Group` choca con la interfaz `Group`
  → importar como `import {Group as GroupModel, GroupService} from './service/group.service'`.
- `components/group-detail/`: `input<Group|null>(null)` + `output<void>() back`; **body = chat de texto**
  (mensajes + composer con `<form (submit)="send($event)">` y botón `matIconButton` `send`); header con chip de
  rol + botón `info` (modal de detalle) + botón `groups` (modal de miembros). En móvil (≤768px) se oculta la
  lista y aparece el botón de volver. El avatar (`| initials`) está **comentado** en el template: si se
  descomenta, reañadir `InitialsPipe` a `imports` (el import se quitó para dejar el build sin warnings).
- Chat: `service/group-chat.service.ts` → `GroupMessage {id, author, text, mine, time}` + `signal<Record<number, GroupMessage[]>>`
  (mock para grupos 1-3; 4 y 5 vacíos) + `send(groupId, text)` con `time` vía `toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})`.
  En el detalle: `messageControl = new FormControl('', {nonNullable:true})`, `draft = toSignal(valueChanges)`,
  `canSend = computed(...)`, `messages`/`reversedMessages` computed. Scroll sin JS: `.chat-messages` usa
  `flex-direction: column-reverse` y se itera `reversedMessages()` (`.chat-messages--empty { flex-direction: column }`
  para el estado vacío). Inputs con `[formControl]` + `<form (submit)>` → **sin** `ngSubmit` (no hay FormDirective).
- `components/group-info-dialog/`: modal `GroupInfoDialog` con `GroupInfoDialogData {group}`; título, descripción,
  lista (`ID`, `Tu rol`, `Miembros`) y acciones "Ver miembros" (abre `MembersDialog` encima, no cierra el suyo) + "Cerrar".
- `components/members-dialog/`: modal con `MembersDialogData {group}`; lista de miembros (`mat-list`, avatar con
  pipe `| initials`, rol como texto `text-primary`/`text-muted`).
- Altura del panel: `.row-group { height: calc(100vh - 13.5rem); min-height: 24rem }`
  (toolbar 80 + card 64 + header de página ≈ 13.5rem). Ajustar si cambia `main-layout`.
- Datos mock en `service/group.service.ts` (signals, **sin HttpClient**); interfaces
  `Group {id, title, description, role: 'ADMIN'|'MIEMBRO', members: GroupMember[]}` y
  `GroupMember {id, name, email, role: 'ADMIN'|'MIEMBRO'}`.
- Iconos: Material Symbols Rounded (ligaduras) cargado en `index.html` → nombres libres
  (`search`, `close`, `groups`, `search_off`, `arrow_back`, `info`, `tag`, `shield_person`, `touch_app`, `wallet`,
  `forum`, `send`, `chevron_right`).

## Gotchas rápidos

- App **zoneless**: nada de `ChangeDetectorRef`/`NgZone`; reflejar estado con signals.
- El título del sidenav/título de toolbar se calcula por **igualdad exacta de URL** en `main-layout.ts`
  (`NAV_ITEMS` de `shared/models/nav-items.model.ts`); una ruta nueva no aparecerá ahí salvo que se registre.
- `estructura.carpeta.txt` es diseño aspiracional (routes por feature, `shared/ui`), **no** está implementado.
- No documentación previa (README mínimo); este archivo es la referencia.
