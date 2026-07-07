## Angular Best Practices

> **Note:** This section references and extends the standards defined in `.github/copilot-instructions.md`. Always consult that file as the primary source of truth.

### Component Development

**Standalone Components (Required):**

```typescript
// ✅ CORRECT - Standalone is default, don't specify it
@Component({
  selector: 'app-my-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-component.html',
  styleUrl: './my-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // REQUIRED
})
export class MyComponent {
  // Component logic
}

// ❌ WRONG - Don't explicitly set standalone
@Component({
  standalone: true, // REMOVE THIS
  selector: 'app-my-component',
  // ...
})
```

**Change Detection Strategy (Required):**

```typescript
// ✅ ALWAYS include OnPush
@Component({
  // ...
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

**Input/Output with Signals:**

```typescript
// ✅ CORRECT - Use input()/output() functions
export class MyComponent {
  userId = input.required<string>();
  userName = input<string>('Guest');
  userChanged = output<User>();

  protected handleUpdate(user: User) {
    this.userChanged.emit(user);
  }
}

// ❌ WRONG - Don't use decorators
export class MyComponent {
  @Input() userId!: string; // NEVER USE
  @Output() userChanged = new EventEmitter<User>(); // NEVER USE
}
```

**Signal-Based State Management:**

```typescript
// ✅ CORRECT - Use signals and computed
export class CounterComponent {
  protected count = signal(0);
  protected doubleCount = computed(() => this.count() * 2);
  protected isEven = computed(() => this.count() % 2 === 0);

  protected increment() {
    this.count.update((value) => value + 1); // Use update
  }

  protected reset() {
    this.count.set(0); // Use set
  }
}

// ❌ WRONG - Don't use mutate or imperative state
export class CounterComponent {
  protected count = signal(0);

  protected increment() {
    this.count.mutate((value) => value++); // NEVER USE mutate
  }
}
```

**Host Bindings:**

```typescript
// ✅ CORRECT - Use host object
@Component({
  selector: 'app-button',
  host: {
    '[class.active]': 'isActive()',
    '(click)': 'handleClick()',
    '[attr.aria-pressed]': 'isActive()',
  },
})
// ❌ WRONG - Don't use decorators
@Component({
  selector: 'app-button',
})
export class ButtonComponent {
  @HostBinding('class.active') isActive = false; // NEVER USE
  @HostListener('click') onClick() {} // NEVER USE
}
```

### Template Best Practices

**Control Flow Syntax:**

```html
<!-- ✅ CORRECT - Use new control flow -->
@if (user()) {
<div>Welcome, {{ user().name }}</div>
} @else {
<div>Please log in</div>
} @for (item of items(); track item.id) {
<div>{{ item.name }}</div>
} @switch (status()) { @case ('loading') {
<app-spinner />
} @case ('error') {
<app-error />
} @default {
<app-content />
} }

<!-- ❌ WRONG - Don't use structural directives -->
<div *ngIf="user">Welcome</div>
<!-- NEVER USE -->
<div *ngFor="let item of items">{{ item }}</div>
<!-- NEVER USE -->
<div [ngSwitch]="status">...</div>
<!-- NEVER USE -->
```

**Class and Style Bindings:**

```html
<!-- ✅ CORRECT - Use property bindings -->
<div
  [class.active]="isActive()"
  [class.disabled]="isDisabled()"
  [style.color]="textColor()"
  [style.font-size.px]="fontSize()"
></div>

<!-- ❌ WRONG - Don't use ngClass/ngStyle -->
<div [ngClass]="{'active': isActive}"></div>
<!-- NEVER USE -->
<div [ngStyle]="{'color': textColor}"></div>
<!-- NEVER USE -->
```

**Image Optimization:**

```html
<!-- ✅ CORRECT - Use NgOptimizedImage for static images -->
<img ngSrc="/assets/logo.png" alt="Company Logo" width="200" height="100" priority />

<!-- ❌ WRONG - Plain img for static assets -->
<img src="/assets/logo.png" alt="Logo" />
<!-- Avoid for static images -->

<!-- ⚠️ EXCEPTION - NgOptimizedImage doesn't work for base64 -->
<img [src]="base64Image" alt="Dynamic" />
<!-- OK for base64 data -->
```

### Service Development

**Dependency Injection:**

```typescript
// ✅ CORRECT - Use inject() function
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  getUser(id: string) {
    return this.http.get<User>(`/api/users/${id}`);
  }
}

// ❌ WRONG - Don't use constructor injection
export class UserService {
  constructor(
    private http: HttpClient, // AVOID
    private router: Router, // AVOID
  ) {}
}
```

**Service Registration:**

```typescript
// ✅ CORRECT - Use providedIn for singletons
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Service logic
}
```

### Forms

**Prefer Reactive Forms:**

```typescript
// ✅ CORRECT - Reactive forms
export class LoginComponent {
  private readonly fb = inject(FormBuilder);

  protected loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected onSubmit() {
    if (this.loginForm.valid) {
      // Handle submission
    }
  }
}

// ❌ AVOID - Template-driven forms (use only for simple cases)
```

### Routing

**Lazy Loading (Required):**

```typescript
// ✅ CORRECT - Lazy load with loadComponent
export const routes: Routes = [
  {
    path: 'feature',
    loadComponent: () => import('./pages/feature/feature.component').then((m) => m.FeatureComponent),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
];

// ❌ WRONG - Eager loading for features
export const routes: Routes = [
  { path: 'feature', component: FeatureComponent }, // AVOID
];
```

## TypeScript Best Practices

### Strict Type Checking

**All TypeScript strict rules are enforced:**

```typescript
// ✅ CORRECT - Explicit types, no any
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ CORRECT - Use unknown when type is uncertain
function parseJson(json: string): unknown {
  return JSON.parse(json);
}

// ❌ WRONG - Never use any
function processData(data: any): any {
  // NEVER USE
  return data;
}
```

**Type Inference:**

```typescript
// ✅ CORRECT - Let TypeScript infer obvious types
const count = signal(0); // Type inferred as WritableSignal<number>
const doubled = computed(() => count() * 2); // Type inferred

// ⚠️ ACCEPTABLE - Explicit when needed for clarity
const items = signal<Product[]>([]); // Explicit generic needed
```

**Null Safety:**

```typescript
// ✅ CORRECT - Handle null/undefined explicitly
function getUserName(user: User | null): string {
  return user?.name ?? 'Guest';
}

// ❌ WRONG - Non-null assertion without proper checks
function getUserName(user: User | null): string {
  return user!.name; // AVOID - use optional chaining and nullish coalescing
}
```
