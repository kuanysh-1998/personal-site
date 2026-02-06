import { InterviewQuestion } from '../../types/interview.types';

export const typescriptQuestionsEn: InterviewQuestion[] = [
  {
    id: 'ts-1',
    question: 'What is the difference between interface and type?',
    answer: `Both describe the shape of data, but with different capabilities.

**interface:**
- Only for objects and classes
- Can be extended (extends) and merged (declaration merging)
- Better error messages, more readable

**type:**
- For anything: primitives, unions, tuples, mapped types
- Cannot be redeclared (no merging)
- More powerful for complex type transformations

**When to use what:**
- Object/class shape → interface
- Union types, primitives, complex transformations → type
- Library API (users can extend) → interface
- Internal app code → either, be consistent`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// interface — for objects, extendable
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}

// Declaration merging — unique to interface
interface User {
  email: string; // Added to existing User
}

const user: User = {
  id: 1,
  name: 'John',
  email: 'john@example.com' // Required after merge
};`,
      },
      {
        language: 'typescript',
        code: `// type — for everything
type ID = string | number; // Union — interface can't

type Status = 'pending' | 'success' | 'error'; // Literal union

type Point = [number, number]; // Tuple

type Nullable<T> = T | null; // Generic alias

// Intersection (similar to extends)
type Admin = User & { permissions: string[] };

// Mapped types
type Readonly<T> = { readonly [K in keyof T]: T[K] };`,
      },
    ],
  },

  {
    id: 'ts-2',
    question: 'Explain Generics and constraints',
    answer: `Generics are type parameters — placeholders replaced with real types at usage.

**Why generics:**
- Reusable code without losing type safety
- Link input/output types
- Type-safe data structures

**Constraints (extends):** Limit what types are allowed.

**Defaults:** Provide fallback type if not specified.

**Naming:** T (Type), K (Key), V (Value), U (second type)`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Basic generic — preserves type
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = first([1, 2, 3]);       // number
const str = first(['a', 'b']);      // string

// Multiple type params
function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b };
}

const result = merge({ name: 'John' }, { age: 30 });
// { name: string; age: number }`,
      },
      {
        language: 'typescript',
        code: `// Constraint — T must have 'length'
function logLength<T extends { length: number }>(item: T): void {
  console.log(item.length);
}

logLength('hello');     // OK — string has length
logLength([1, 2, 3]);   // OK — array has length
logLength({ length: 5 }); // OK — object with length
logLength(123);         // Error — number has no length

// keyof constraint — K must be key of T
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'John', age: 30 };
getProperty(user, 'name'); // string
getProperty(user, 'age');  // number
getProperty(user, 'foo');  // Error — 'foo' not in User`,
      },
      {
        language: 'typescript',
        code: `// Default type parameter
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

const res1: ApiResponse<User> = { data: user, status: 200 };
const res2: ApiResponse = { data: anything, status: 200 }; // T = unknown

// Generic class
class Container<T> {
  private value: T;
  
  constructor(value: T) {
    this.value = value;
  }
  
  getValue(): T {
    return this.value;
  }
}

const numContainer = new Container(42);    // Container<number>
const strContainer = new Container('hi');  // Container<string>`,
      },
    ],
  },

  {
    id: 'ts-3',
    question: 'What is the difference between any, unknown, and never?',
    answer: `These are TypeScript's "escape hatches" and bottom type.

**any** — disables type checking. Anything goes.
- Use: migration from JS, truly dynamic data
- Risk: loses all type safety

**unknown** — type-safe "any". Must narrow before use.
- Use: external data (API, user input)
- Safe: forces you to check type first

**never** — impossible type. No value can be never.
- Use: exhaustive checks, functions that never return
- Useful for catching unhandled cases

**Rule:** Prefer unknown over any. Use never for exhaustiveness.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// any — no type checking (dangerous)
let dangerous: any = 'hello';
dangerous.foo.bar.baz(); // No error — runtime crash!
dangerous = 42;
dangerous.toUpperCase(); // No error — runtime crash!

// unknown — must check before use (safe)
let safe: unknown = 'hello';
safe.toUpperCase();      // Error — unknown has no methods

if (typeof safe === 'string') {
  safe.toUpperCase();    // OK — narrowed to string
}

// Type assertion (when you know better)
const str = safe as string;
str.toUpperCase();       // OK — but you take responsibility`,
      },
      {
        language: 'typescript',
        code: `// never — for exhaustive checks
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status): string {
  switch (status) {
    case 'pending': return 'Loading...';
    case 'success': return 'Done!';
    case 'error': return 'Failed!';
    default:
      // If we add new status and forget to handle it,
      // TypeScript will error here
      const exhaustiveCheck: never = status;
      throw new Error(\`Unhandled status: \${exhaustiveCheck}\`);
  }
}

// never — function that never returns
function fail(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}`,
      },
    ],
  },

  {
    id: 'ts-4',
    question: 'Explain TypeScript Utility Types',
    answer: `Built-in generic types for common transformations.

**Object transformations:**
- Partial<T> — all properties optional
- Required<T> — all properties required
- Readonly<T> — all properties readonly
- Pick<T, K> — select specific properties
- Omit<T, K> — exclude specific properties
- Record<K, V> — object with keys K and values V

**Union transformations:**
- Exclude<T, U> — remove types from union
- Extract<T, U> — keep only matching types
- NonNullable<T> — remove null and undefined

**Function types:**
- ReturnType<T> — extract return type
- Parameters<T> — extract parameters as tuple`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial — all optional (great for updates)
type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number }

function updateUser(id: number, updates: Partial<User>) {
  // Can pass any subset of fields
}
updateUser(1, { name: 'John' }); // OK

// Required — all required
type RequiredUser = Required<Partial<User>>;

// Readonly — immutable
type ImmutableUser = Readonly<User>;
const user: ImmutableUser = { id: 1, name: 'John', email: '', age: 30 };
user.name = 'Jane'; // Error — readonly`,
      },
      {
        language: 'typescript',
        code: `// Pick — select fields
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit — exclude fields
type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string; age: number }

// Record — typed object/map
type UserRoles = Record<string, 'admin' | 'user' | 'guest'>;
const roles: UserRoles = {
  john: 'admin',
  jane: 'user'
};

// Typed dictionary
type UserById = Record<number, User>;`,
      },
      {
        language: 'typescript',
        code: `// Exclude/Extract — union manipulation
type AllStatus = 'pending' | 'success' | 'error' | 'cancelled';

type ActiveStatus = Exclude<AllStatus, 'cancelled'>;
// 'pending' | 'success' | 'error'

type ErrorStatus = Extract<AllStatus, 'error' | 'cancelled'>;
// 'error' | 'cancelled'

// NonNullable
type MaybeString = string | null | undefined;
type DefinitelyString = NonNullable<MaybeString>; // string

// ReturnType / Parameters
function createUser(name: string, age: number): User {
  return { id: 1, name, age, email: '' };
}

type CreateUserReturn = ReturnType<typeof createUser>; // User
type CreateUserParams = Parameters<typeof createUser>; // [string, number]`,
      },
    ],
  },

  {
    id: 'ts-5',
    question: 'What are Type Guards and narrowing?',
    answer: `Type guards are runtime checks that narrow types within a code block.

**Built-in guards:**
- typeof — for primitives
- instanceof — for classes
- 'property' in obj — for property existence
- Array.isArray() — for arrays

**Custom guards:** Functions returning "x is Type" predicate.

**Narrowing:** TypeScript tracks type changes through control flow — after a check, the type is more specific.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// typeof — primitives
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // string
  }
  return value.toFixed(2); // number
}

// instanceof — classes
class Dog { bark() {} }
class Cat { meow() {} }

function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // Dog
  } else {
    animal.meow(); // Cat
  }
}

// in — property check
interface Fish { swim(): void }
interface Bird { fly(): void }

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim(); // Fish
  } else {
    animal.fly(); // Bird
  }
}`,
      },
      {
        language: 'typescript',
        code: `// Custom type guard — "is" predicate
interface User { type: 'user'; name: string }
interface Admin { type: 'admin'; name: string; permissions: string[] }

function isAdmin(person: User | Admin): person is Admin {
  return person.type === 'admin';
}

function greet(person: User | Admin) {
  if (isAdmin(person)) {
    console.log(\`Admin \${person.name} with \${person.permissions.length} permissions\`);
  } else {
    console.log(\`User \${person.name}\`);
  }
}

// Asserting type guard — throws if wrong
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Not a string!');
  }
}

function process(input: unknown) {
  assertIsString(input);
  // After assertion, input is string
  console.log(input.toUpperCase());
}`,
      },
      {
        language: 'typescript',
        code: `// Discriminated unions — best pattern
interface LoadingState { status: 'loading' }
interface SuccessState { status: 'success'; data: string }
interface ErrorState { status: 'error'; error: Error }

type State = LoadingState | SuccessState | ErrorState;

function render(state: State) {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return state.data; // TypeScript knows data exists
    case 'error':
      return state.error.message; // TypeScript knows error exists
  }
}`,
      },
    ],
  },

  {
    id: 'ts-7',
    question: 'What are Conditional Types and infer?',
    answer: `Conditional types choose type based on condition: T extends U ? X : Y

**infer:** Captures part of a type during condition check. Works only inside extends clause.

**Distributive behavior:** When T is union, condition applies to each member separately.

**Use cases:** Extract return types, unwrap promises, filter unions.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Basic conditional
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// Practical: extract array element type
type ElementOf<T> = T extends (infer E)[] ? E : never;

type NumArr = ElementOf<number[]>;    // number
type StrArr = ElementOf<string[]>;    // string
type NotArr = ElementOf<number>;      // never

// Unwrap Promise
type Awaited<T> = T extends Promise<infer U> ? U : T;

type P1 = Awaited<Promise<string>>;           // string
type P2 = Awaited<Promise<Promise<number>>>; // Promise<number>
type P3 = Awaited<string>;                    // string`,
      },
      {
        language: 'typescript',
        code: `// infer — extract function parts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function createUser(name: string, age: number): { id: number; name: string } {
  return { id: 1, name };
}

type Return = ReturnType<typeof createUser>;    // { id: number; name: string }
type Params = Parameters<typeof createUser>;    // [string, number]

// Extract first parameter
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

type First = FirstParam<typeof createUser>; // string`,
      },
      {
        language: 'typescript',
        code: `// Distributive conditionals — applies to each union member
type ToArray<T> = T extends any ? T[] : never;

type Distributed = ToArray<string | number>;
// string[] | number[]  (not (string | number)[])

// Prevent distribution with tuple
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type NonDistributed = ToArrayNonDist<string | number>;
// (string | number)[]

// Filter union
type OnlyStrings<T> = T extends string ? T : never;

type Mixed = 'a' | 'b' | 1 | 2;
type Strings = OnlyStrings<Mixed>; // 'a' | 'b'`,
      },
    ],
  },

  {
    id: 'ts-9',
    question: 'What is "as const" and const assertions?',
    answer: `"as const" creates the narrowest possible type — literal types instead of general types.

**Effects:**
- Strings become literal types
- Arrays become readonly tuples
- Objects become readonly with literal property types

**Use cases:** 
- Constants that shouldn't change
- Discriminated unions
- Tuple types
- Config objects`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Without as const
const config = {
  endpoint: '/api',
  timeout: 5000
};
// Type: { endpoint: string; timeout: number }

// With as const
const config = {
  endpoint: '/api',
  timeout: 5000
} as const;
// Type: { readonly endpoint: '/api'; readonly timeout: 5000 }

// Array → readonly tuple
const colors = ['red', 'green', 'blue'];        // string[]
const colors = ['red', 'green', 'blue'] as const; // readonly ['red', 'green', 'blue']

// Useful for getting literal union from array
type Color = typeof colors[number]; // 'red' | 'green' | 'blue'`,
      },
      {
        language: 'typescript',
        code: `// Practical: action types (Redux-style)
const Actions = {
  ADD_USER: 'ADD_USER',
  DELETE_USER: 'DELETE_USER',
  UPDATE_USER: 'UPDATE_USER'
} as const;

type ActionType = typeof Actions[keyof typeof Actions];
// 'ADD_USER' | 'DELETE_USER' | 'UPDATE_USER'

// Without as const, ActionType would be just 'string'

// Enum alternative — const object
const Status = {
  Pending: 0,
  Success: 1,
  Error: 2
} as const;

type StatusValue = typeof Status[keyof typeof Status]; // 0 | 1 | 2`,
      },
      {
        language: 'typescript',
        code: `// Function returning tuple
function useToggle() {
  const [state, setState] = useState(false);
  return [state, () => setState(!state)]; // (boolean | (() => void))[]
}

// With as const — proper tuple
function useToggle() {
  const [state, setState] = useState(false);
  return [state, () => setState(!state)] as const;
  // readonly [boolean, () => void]
}

const [isOpen, toggle] = useToggle();
// isOpen: boolean (not boolean | (() => void))
// toggle: () => void`,
      },
    ],
  },

  {
    id: 'ts-11',
    question: 'What is strict mode and its flags?',
    answer: `Strict mode enables stricter type checking. Set "strict": true in tsconfig.json to enable all.

**Individual flags:**
- strictNullChecks — null/undefined are separate types
- strictFunctionTypes — stricter function param checking
- strictBindCallApply — typed bind/call/apply
- strictPropertyInitialization — class props must be initialized
- noImplicitAny — error on implicit any
- noImplicitThis — error on implicit this

**Recommendation:** Always use strict mode. It catches bugs at compile time.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// strictNullChecks — most important
// OFF: null can be assigned to any type (dangerous)
let name: string = null; // OK but wrong

// ON: null is separate type
let name: string = null;           // Error
let name: string | null = null;    // OK — explicit

function getUser(id: number): User | undefined {
  return users.find(u => u.id === id);
}

const user = getUser(1);
user.name;       // Error — might be undefined
user?.name;      // OK — optional chaining
user!.name;      // OK — non-null assertion (you guarantee)

if (user) {
  user.name;     // OK — narrowed
}`,
      },
      {
        language: 'typescript',
        code: `// noImplicitAny
// OFF:
function process(data) { } // data is implicitly 'any'

// ON:
function process(data) { } // Error — must specify type
function process(data: unknown) { } // OK

// strictPropertyInitialization
class User {
  name: string;  // Error — not initialized
  
  // Fix options:
  name: string = '';           // Default value
  name!: string;               // Definite assignment assertion
  name: string | undefined;    // Allow undefined
  
  constructor(name: string) {
    this.name = name;          // Initialize in constructor
  }
}`,
      },
      {
        language: 'typescript',
        code: `// strictFunctionTypes — contravariance for params
interface Animal { name: string }
interface Dog extends Animal { breed: string }

type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

// OFF: allows unsafe assignments
let handler: AnimalHandler = (dog: Dog) => console.log(dog.breed);
handler({ name: 'Cat' }); // Runtime error — no breed!

// ON: prevents unsafe assignments
let handler: AnimalHandler = (dog: Dog) => {}; // Error

// Safe direction:
let dogHandler: DogHandler = (animal: Animal) => {}; // OK

// tsconfig.json
{
  "compilerOptions": {
    "strict": true,  // Enables all strict flags
    // Or individual:
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}`,
      },
    ],
  },

  {
    id: 'ts-12',
    question: 'What are Declaration Files (.d.ts)?',
    answer: `Declaration files describe the shape of JavaScript code for TypeScript. They contain only type information, no runtime code.

**When needed:**
- Using JS library without types
- Publishing library for TS users
- Extending existing types (module augmentation)

**Sources of types:**
1. Bundled — library includes .d.ts
2. DefinitelyTyped — @types/library-name
3. Custom — write your own .d.ts

**Key concepts:**
- declare — tells TS "this exists at runtime"
- ambient declarations — describe external code
- module augmentation — extend existing modules`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// global.d.ts — declare global variables
declare const API_URL: string;
declare const DEBUG: boolean;

// Declare global function
declare function gtag(command: string, ...args: any[]): void;

// Extend Window
declare global {
  interface Window {
    analytics: {
      track(event: string, data?: object): void;
    };
  }
}

// Usage in code
window.analytics.track('click', { button: 'submit' }); // Typed!`,
      },
      {
        language: 'typescript',
        code: `// Typing untyped JS library
// legacy-lib.d.ts
declare module 'legacy-lib' {
  export function doSomething(input: string): number;
  export const VERSION: string;
  
  export interface Config {
    debug: boolean;
    timeout: number;
  }
  
  export default class LegacyClient {
    constructor(config: Config);
    connect(): Promise<void>;
    disconnect(): void;
  }
}

// Now you can import with types
import LegacyClient, { doSomething, Config } from 'legacy-lib';`,
      },
      {
        language: 'typescript',
        code: `// Module augmentation — extend existing types
// Extend Express Request
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: 'admin' | 'user';
    };
  }
}

// Now in your middleware
app.use((req, res, next) => {
  req.user = { id: '123', role: 'admin' }; // Typed!
  next();
});

// Extend third-party library
declare module 'axios' {
  interface AxiosRequestConfig {
    retry?: number;
    retryDelay?: number;
  }
}`,
      },
    ],
  },
];
