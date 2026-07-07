# Plan: General Component Migration Guide — Nebular

This guide covers every recurring pattern found in `src/framework/theme/components/`. Apply each phase in order. Phases 1 and 2 are non-breaking; Phase 3 changes the public API and requires call-site verification. Phase 4 is a non-breaking style enforcement pass that can be applied alongside any other phase.

---

## Phase 1 — Migrate to Standalone

### 1.1 — Convert `@Component` / `@Directive` / `@Pipe`

In every `.ts` file:

- Replace `standalone: false` with `standalone: true`.
- Add an `imports: []` array to the decorator.

The `imports` array must list everything the template directly references. Use this lookup to decide what to add:

| Template uses                                | Add to `imports`                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| `*ngIf`, `@if`, `AsyncPipe`, `NgClass`, etc. | `CommonModule` (or individual standalone equivalents like `NgIf`, `NgFor`, `AsyncPipe`) |
| `[(ngModel)]`, `[formControl]`               | `FormsModule` / `ReactiveFormsModule`                                                   |
| `[routerLink]`, `<router-outlet>`            | `RouterModule`                                                                          |
| `<nb-icon>`                                  | `NbIconModule` (or `NbIconComponent` if already standalone)                             |
| Another Nebular component `<nb-xxx>`         | That component's module or standalone component class                                   |
| A structural directive from `NbSharedModule` | Import the specific module/directive instead of `NbSharedModule`                        |

`NbSharedModule` was a convenient shortcut in NgModule-land; it must **not** be added to a standalone `imports` array because it is itself not standalone. Replace it with only the symbols actually used.

### 1.2 — Update the companion `NbXxxModule`

Every feature module follows this pattern:

```
imports:      [NbSharedModule, NbIconModule, …]
declarations: [ComponentA, ComponentB, …]
exports:      [ComponentA, ComponentB, …]
```

After making each component standalone:

- Move every converted component/directive/pipe from `declarations` to `imports`.
- Keep them in `exports` — this preserves backwards compatibility for consumers who import `NbXxxModule`.
- Remove each peer-module entry (e.g. `NbIconModule`, `NbSharedModule`) from the module's `imports`; those are now imported directly by the standalone components.
- The module's `imports` array will end up empty or close to it — leave it present to avoid a compile error, or delete it if Angular allows.

### 1.3 — Modules with `forRoot()` / `forChild()`

Applies to: `NbMenuModule`, `NbSidebarModule`, `NbDialogModule`, `NbToastrModule`.

These modules exist primarily to register services. The `forRoot()` / `forChild()` pattern can be replaced by marking services with `{ providedIn: 'root' }` or `{ providedIn: 'platform' }`, but for a low-risk migration it is acceptable to keep these static methods and update only the component declarations inside the module (Step 1.2).

### 1.4 — Internal-only components

Some components are never added to `exports` (e.g. `NbTooltipComponent`, `NbDialogContainerComponent`). These work correctly as standalone components and simply don't need to be re-exported through the module.

### 1.5 — Update `public_api.ts`

`public_api.ts` already re-exports individual component files. No changes are required unless a component or module is renamed.

### 1.6 — Update JSDoc installation comments

Many component and directive classes carry a JSDoc comment above the `@Component` / `@Directive` / `@Injectable` decorator with a `### Installation` section. These currently describe only the `NbXxxModule` approach. After the component is standalone, rewrite the section so that:

1. **Primary option — standalone import** comes first and is the recommended path.
2. **Secondary option — NgModule** follows, clearly labelled as the legacy / backwards-compatible path.

**Before (module-only):**

````ts
/**
 * Alert component.
 *
 * ### Installation
 *
 * Import `NbAlertModule` to your feature module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbAlertModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 */
````

**After (standalone first, module second):**

````ts
/**
 * Alert component.
 *
 * ### Installation
 *
 * Add `NbAlertComponent` to the `imports` array of your standalone component or `NgModule`.
 *
 * **Standalone component (recommended):**
 * ```ts
 * @Component({
 *   standalone: true,
 *   imports: [
 *     // ...
 *     NbAlertComponent,
 *   ],
 * })
 * export class MyComponent { }
 * ```
 *
 * **NgModule (legacy):**
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbAlertModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 */
````

#### Rules for this step

- The standalone snippet imports the **component class** (e.g. `NbAlertComponent`), not the module.
- When a feature is represented by more than one exported symbol (e.g. `NbTabsetComponent` + `NbTabComponent`), list all symbols that a consumer commonly needs in the standalone `imports` array.
- For directives that decorate a host element (e.g. `[nbSpinner]`, `[nbTooltip]`), the standalone snippet imports the **directive class** (e.g. `NbSpinnerDirective`).
- For services registered via `forRoot()` (e.g. `NbMenuService`), the installation comment should additionally show `provideNbMenu()` (or the equivalent provider function) in the standalone snippet alongside the component import, if such a provider function has been introduced. If no standalone provider function exists yet, note the `NbXxxModule.forRoot()` alternative under the NgModule section.
- The NgModule block must be kept verbatim for backwards compatibility documentation; do not remove it.
- All other content in the JSDoc comment (examples, `@styles`, `@stacked-example` tags, etc.) remains unchanged.

---

## Phase 2 — Migrate to New Control Flow Syntax

Angular's block-based control flow (`@if`, `@for`, `@switch`) replaces structural directives. All template files and inline templates in the project need to be updated.

### 2.1 — `*ngIf` → `@if`

| Old                                        | New                                                                                          |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `*ngIf="expr"`                             | `@if (expr) { … }`                                                                           |
| `*ngIf="expr; else tplRef"`                | `@if (expr) { … } @else { … }` (inline the template content, remove `<ng-template #tplRef>`) |
| `*ngIf="expr; then thenTpl; else elseTpl"` | `@if (expr) { … } @else { … }`                                                               |

After removing all `*ngIf` usages from a template, remove `NgIf` (or `CommonModule`) from the component's `imports` if it was the only directive needed from that module.

### 2.2 — `*ngFor` → `@for`

| Old                                     | New                                               |
| --------------------------------------- | ------------------------------------------------- |
| `*ngFor="let x of list"`                | `@for (x of list; track x) { … }`                 |
| `*ngFor="let x of list; let i = index"` | `@for (x of list; track x; let i = $index) { … }` |
| `*ngFor="let x of list; trackBy: fn"`   | `@for (x of list; track fn($index, x)) { … }`     |

The `track` expression is **mandatory** in `@for`. If the old template used `trackBy`, translate the function call directly. If no `trackBy` existed, use `track $index` as a safe default, or `track item.id` if the item has a unique identifier.

Add an `@empty { … }` block to replace any `*ngIf` that was guarding an "empty state" message alongside a `*ngFor`.

After migration, remove `NgFor` / `CommonModule` from `imports` if no longer needed.

### 2.3 — `[ngSwitch]` / `*ngSwitchCase` → `@switch`

Applies to: `base-calendar.component.html` and similar.

| Old                         | New                              |
| --------------------------- | -------------------------------- |
| `<div [ngSwitch]="expr">`   | `@switch (expr) {`               |
| `<tag *ngSwitchCase="val">` | `@case (val) { <tag> … </tag> }` |
| `<tag *ngSwitchDefault>`    | `@default { <tag> … </tag> }`    |
| closing `</div>`            | `}`                              |

Remove `NgSwitch` / `CommonModule` from `imports` when done.

### 2.4 — `AsyncPipe` (`| async`) — no syntax change needed

The `async` pipe syntax is unchanged in the new template engine. Keep `AsyncPipe` in the component's `imports` array; it is just no longer inherited through `CommonModule`. Import `AsyncPipe` directly from `@angular/common`.

---

## Phase 3 — Migrate to Signals

Phase 3 touches the **public API** of every migrated component. Verify all template call-sites after each sub-step.

### 3.1 — `@Input()` Plain field → `input()`

**Before:**

```ts
@Input() title: string = '';
```

**After:**

```ts
title = input('');
```

- Import `input` from `@angular/core`.
- Remove the `@Input()` decorator.
- In the template and class body, read the value by calling `this.title()`.
- Remove `static ngAcceptInputType_title` if present.

### 3.2 — `@Input()` Boolean getter/setter + `convertToBoolProperty` → `input()` with `booleanAttribute` transform

This is the most common pattern in the codebase (toggle, checkbox, accordion, layout, etc.).

**Before:**

```ts
@Input()
get disabled(): boolean { return this._disabled; }
set disabled(val: boolean) { this._disabled = convertToBoolProperty(val); }
private _disabled = false;
static ngAcceptInputType_disabled: NbBooleanInput;
```

**After:**

```ts
import { input, booleanAttribute } from '@angular/core';

disabled = input(false, { transform: booleanAttribute });
```

- Remove the getter, setter, backing private field, `static ngAcceptInputType_` field, `NbBooleanInput` import, and `convertToBoolProperty` call.
- Read via `this.disabled()` throughout the class.
- If `convertToBoolProperty` and `NbBooleanInput` are no longer used anywhere in the file, remove their imports.

### 3.3 — Two-way binding pair (`@Input` + `@Output xyzChange`) → `model()`

Found on: `collapsed`/`collapsedChange` (accordion-item), `checked`/`checkedChange` (toggle), `value`/`valueChange` (radio-group, select), and similar.

**Before:**

```ts
@Input() checked = false;
@Output() checkedChange = new EventEmitter<boolean>();
```

**After:**

```ts
import { model } from '@angular/core';

checked = model(false);
```

- Remove both `@Input`, `@Output`, and `EventEmitter`.
- Write the value with `this.checked.set(val)` — the `model()` signal automatically emits the two-way binding update, so no `.emit()` call is needed.
- Read the value with `this.checked()`.
- Template consumers using `[(checked)]` syntax require no changes.
- Template consumers binding `[checked]="x"` or `(checkedChange)="fn($event)"` separately also require no changes.

### 3.4 — `@Output()` standalone → `output()`

**Before:**

```ts
@Output() destroy = new EventEmitter<void>();
```

**After:**

```ts
import { output } from '@angular/core';

destroy = output<void>();
```

- Remove `@Output()` and `EventEmitter`.
- Emit via `this.destroy.emit()` — the call API is identical.
- Template `(destroy)="fn()"` bindings require no changes.

### 3.5 — `@ContentChildren` / `@ContentChild` → `contentChildren()` / `contentChild()`

**Before:**

```ts
@ContentChildren(NbStepComponent) steps: QueryList<NbStepComponent>;
@ContentChild(NbTagInputDirective) tagInput: NbTagInputDirective;
```

**After:**

```ts
import { contentChildren, contentChild } from '@angular/core';

steps = contentChildren(NbStepComponent);
tagInput = contentChild(NbTagInputDirective);
```

- The result is a readonly signal (`Signal<readonly T[]>` for `contentChildren`, `Signal<T | undefined>` for `contentChild`).
- Replace all `this.steps.changes.subscribe(…)` with `effect(() => { const s = this.steps(); … })`.
- Replace `.toArray()` calls with direct signal reads `this.steps()`.
- For queries that used `{ read: TemplateRef }`, pass it as: `contentChild(NbSortHeaderIconDirective, { read: TemplateRef })`.

### 3.6 — `@ViewChild` / `@ViewChildren` → `viewChild()` / `viewChildren()`

**Before:**

```ts
@ViewChild('viewContainerRef', { read: ViewContainerRef, static: true }) vcr: ViewContainerRef;
```

**After:**

```ts
import { viewChild } from '@angular/core';

vcr = viewChild.required('viewContainerRef', { read: ViewContainerRef });
```

- Use `viewChild.required(…)` when the element is always present; it returns `Signal<T>` (never undefined).
- Use `viewChild(…)` when optional; it returns `Signal<T | undefined>`.
- Remove `{ static: true }` — signal queries are always available before `ngOnInit` by default.

### 3.7 — `@HostBinding` / `@HostListener` → `host` metadata

`@HostBinding` cannot reference signal calls; move all host bindings to the `host` object in the `@Component` or `@Directive` decorator.

**Before:**

```ts
@HostBinding('class.disabled') get isDisabled() { return this.disabled; }
@HostBinding('attr.aria-disabled') get ariaDisabled() { return this.disabled; }
@HostListener('click') onClick() { this.toggle(); }
```

**After (in decorator metadata):**

```ts
@Component({
  …
  host: {
    '[class.disabled]':     'disabled()',
    '[attr.aria-disabled]': 'disabled()',
    '(click)':              'toggle()',
  },
})
```

For `@HostBinding('class')` getters that return a `string[]` (custom status classes), keep a plain getter and reference it:

```ts
host: { '[class]': 'additionalClasses' }
get additionalClasses(): string[] { … }
```

### 3.8 — Constructor injection → `inject()` function

**Before:**

```ts
constructor(
  @Host() private accordion: NbAccordionComponent,
  @Optional() @Inject(NB_DATE_SERVICE_OPTIONS) private options: any,
  private cd: ChangeDetectorRef,
) {}
```

**After:**

```ts
import { inject } from '@angular/core';

private accordion = inject(NbAccordionComponent, { host: true });
private options   = inject(NB_DATE_SERVICE_OPTIONS, { optional: true });
private cd        = inject(ChangeDetectorRef);
```

Decorator → option mapping:

| Old decorator    | `inject()` option                                     |
| ---------------- | ----------------------------------------------------- |
| `@Host()`        | `{ host: true }`                                      |
| `@Optional()`    | `{ optional: true }`                                  |
| `@SkipSelf()`    | `{ skipSelf: true }`                                  |
| `@Self()`        | `{ self: true }`                                      |
| `@Inject(TOKEN)` | use `inject(TOKEN)` directly — no extra option needed |

### 3.9 — Remove `ChangeDetectorRef.markForCheck()` where signals make it redundant

All components use `ChangeDetectionStrategy.OnPush`. Manual `markForCheck()` calls inside Observable subscriptions are needed when Angular cannot detect the change automatically. Once inputs are signals and reactive state is in signals, Angular tracks them without manual scheduling.

- Remove `markForCheck()` calls that fire after writing a signal value — writing to a signal already schedules change detection.
- Keep `markForCheck()` calls that react to non-signal Observables until those are also converted to signals.
- Remove `ChangeDetectorRef` injection entirely once all its call sites are gone.

### 3.10 — Replace `ngOnChanges` with `effect()`

Signal inputs do not trigger `ngOnChanges`. Any logic in an `ngOnChanges` handler that reacts to input changes must be moved to `effect()`:

**Before:**

```ts
ngOnChanges(changes: SimpleChanges) {
  if (changes.disabled) { this.updateState(); }
}
```

**After:**

```ts
constructor() {
  effect(() => {
    this.disabled(); // read to establish dependency
    this.updateState();
  });
}
```

Remove `implements OnChanges` and the `SimpleChanges` import when no other `ngOnChanges` logic remains.

---

## Phase 4 — Explicit Access Modifiers

Every class member (field, property, method, getter, setter) must carry an explicit visibility modifier. TypeScript's default of "public when omitted" is insufficient for a codebase that requires self-documenting, lint-enforceable code; the modifier must always be written out.

### 4.1 — Visibility modifier rules

| Modifier    | When to use                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `public`    | Part of the component's intended external API (template bindings, parent components, test harnesses). |
| `protected` | Used only by the class and its subclasses (e.g. abstract base-component helpers).                     |
| `private`   | Internal implementation detail; not accessed outside the class.                                       |

Write the modifier **before** any other modifiers (`static`, `readonly`, `override`, `abstract`, `declare`).

### 4.2 — Apply to every member kind

Go through every class member and annotate it:

```ts
// Fields
private destroyed$ = new Subject<void>();
protected hostElement = inject(ElementRef);
public tabIndex = 0;

// Signal inputs / outputs / models (Phase 3 results)
public  title     = input('');
private _log      = input(false);
public  checked   = model(false);
public  pressed   = output<void>();

// Injected services
private cd          = inject(ChangeDetectorRef);
private router      = inject(Router);

// Static members
public static readonly defaultOptions = { … };

// Methods
public toggle(): void { … }
protected updateState(): void { … }
private recalculate(): void { … }

// Getters / setters
public get isDisabled(): boolean { return this.disabled(); }
private set _value(v: string) { … }

// Lifecycle hooks — always public (Angular calls them from outside)
public ngOnInit(): void { … }
public ngOnDestroy(): void { … }
```

### 4.3 — Template-visible members must be `public`

Angular's template compiler accesses members from outside the class. Any field, getter, or method referenced in the template (`{{ value }}`, `[prop]="method()"`, `(event)="handler($event)"`) must be `public`.

> **Tip:** Enable `strictTemplates` and the TypeScript compiler will flag template references to non-public members.

### 4.4 — `host` metadata expressions must reference `public` members

Members referenced inside the `host` object (Section 3.7 strings) are evaluated by the template engine and must also be `public`:

```ts
@Component({
  host: {
    '[class.disabled]': 'disabled()',   // disabled must be public
    '(click)':          'onClick()',    // onClick must be public
  },
})
class NbButtonComponent {
  public disabled = input(false, { transform: booleanAttribute });
  public onClick(): void { … }
}
```

### 4.5 — Angular lifecycle hooks

All Angular lifecycle hook methods (`ngOnInit`, `ngOnChanges`, `ngAfterViewInit`, `ngOnDestroy`, etc.) must be declared `public` because Angular's runtime calls them from outside the class instance via the interface contract.

### 4.6 — `static` modifier

`static` members are not tied to an instance. The visibility modifier still applies:

```ts
public  static readonly defaultConfig = { … };
private static nextId = 0;
```

Legacy `static ngAcceptInputType_*` fields removed in Phase 3 (§ 3.2) require no action here.

---

## Verification Checklist (per component)

1. **Compile** — `ng build` with no errors or warnings about the migrated component.
2. **Unit tests** — run `ng test --include=**/component-name/**`; all specs green.
3. **Template type-check** — `ng build --configuration production` enables strict template checking.
4. **Module consumers** — search for usages of `NbXxxModule` in `src/playground`, `docs/`, and `packages-smoke/` to confirm the re-exporting module still works.
5. **Two-way bindings** — search for `[(xxx)]` usages of any `model()` signal converted from an `@Input`/`@Output` pair and confirm the syntax still binds correctly.
6. **E2E** — run the relevant spec in `e2e/` for the component.
7. **Explicit modifiers** — every class member in the migrated file carries an explicit `public`, `protected`, or `private` modifier; no bare member declarations remain.

---

## Decisions

- **Keep `NbXxxModule` wrappers** — they preserve backwards compatibility; the internal `declarations` array simply moves to `imports`.
- **`booleanAttribute` replaces `convertToBoolProperty`** — built-in Angular transform, equivalent behaviour, no helper needed.
- **`model()` for two-way pairs** — canonical replacement for `@Input`/`@Output xyzChange` pairs; template syntax `[(xyz)]` is unchanged.
- **`host` metadata over `@HostBinding`/`@HostListener` decorators** — required when referencing signal calls; also reduces decorator count.
- **`inject()` over constructor injection** — optional but consistent with modern Angular style; safe to apply incrementally.
- **Do not remove `NbSharedModule`** — it is still used by unconverted modules; remove it from a module's `imports` only after all its declared components are standalone.
- **Explicit access modifiers always** — TypeScript's implicit `public` is intentionally avoided; every member must declare `public`, `protected`, or `private` so intent is clear and a lint rule (`@typescript-eslint/explicit-member-accessibility`) can enforce it automatically.
