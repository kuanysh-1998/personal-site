import { InterviewQuestion } from '../../types/interview.types';

export const typescriptQuestionsRu: InterviewQuestion[] = [
  {
    id: 'ts-1',
    question: 'В чём разница между interface и type?',
    answer: `Оба описывают форму данных, но с разными возможностями.

**interface:**
- Только для объектов и классов
- Можно расширять (extends) и объединять (declaration merging)
- Лучшие сообщения об ошибках, читабельнее

**type:**
- Для чего угодно: примитивы, объединения, кортежи, маппированные типы
- Нельзя переобъявить (нет мерджинга)
- Мощнее для сложных трансформаций типов

**Когда что использовать:**
- Форма объекта/класса → interface
- Union-типы, примитивы, сложные трансформации → type
- API библиотеки (пользователи могут расширить) → interface
- Внутренний код приложения → любой из двух, главное — единообразие`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// interface — для объектов, расширяемый
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}

// Declaration merging — уникально для interface
interface User {
  email: string; // Добавлено к существующему User
}

const user: User = {
  id: 1,
  name: 'John',
  email: 'john@example.com' // Обязательно после мерджа
};`,
      },
      {
        language: 'typescript',
        code: `// type — для всего
type ID = string | number; // Union — interface не может

type Status = 'pending' | 'success' | 'error'; // Литеральный union

type Point = [number, number]; // Кортеж

type Nullable<T> = T | null; // Обобщённый алиас

// Пересечение (аналог extends)
type Admin = User & { permissions: string[] };

// Маппированные типы
type Readonly<T> = { readonly [K in keyof T]: T[K] };`,
      },
    ],
  },

  {
    id: 'ts-2',
    question: 'Объясни Generics и ограничения (constraints)',
    answer: `Generics — это параметры типов, заполнители, которые заменяются реальными типами при использовании.

**Зачем generics:**
- Переиспользуемый код без потери типобезопасности
- Связывание типов входа и выхода
- Типобезопасные структуры данных

**Ограничения (extends):** Ограничивают допустимые типы.

**Значения по умолчанию:** Предоставляют запасной тип, если не указан.

**Именование:** T (Type), K (Key), V (Value), U (второй тип)`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Базовый generic — сохраняет тип
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = first([1, 2, 3]);       // number
const str = first(['a', 'b']);      // string

// Несколько параметров типа
function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b };
}

const result = merge({ name: 'John' }, { age: 30 });
// { name: string; age: number }`,
      },
      {
        language: 'typescript',
        code: `// Ограничение — T должен иметь 'length'
function logLength<T extends { length: number }>(item: T): void {
  console.log(item.length);
}

logLength('hello');     // OK — у string есть length
logLength([1, 2, 3]);   // OK — у массива есть length
logLength({ length: 5 }); // OK — объект с length
logLength(123);         // Ошибка — у number нет length

// Ограничение keyof — K должен быть ключом T
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'John', age: 30 };
getProperty(user, 'name'); // string
getProperty(user, 'age');  // number
getProperty(user, 'foo');  // Ошибка — 'foo' не в User`,
      },
      {
        language: 'typescript',
        code: `// Параметр типа по умолчанию
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

const res1: ApiResponse<User> = { data: user, status: 200 };
const res2: ApiResponse = { data: anything, status: 200 }; // T = unknown

// Обобщённый класс
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
    question: 'В чём разница между any, unknown и never?',
    answer: `Это «лазейки» TypeScript и нижний тип.

**any** — отключает проверку типов. Разрешает всё.
- Применение: миграция с JS, действительно динамические данные
- Риск: теряется вся типобезопасность

**unknown** — типобезопасный «any». Нужно сужать перед использованием.
- Применение: внешние данные (API, пользовательский ввод)
- Безопасно: заставляет сначала проверить тип

**never** — невозможный тип. Никакое значение не может быть never.
- Применение: исчерпывающие проверки, функции, которые никогда не возвращают
- Полезно для отлова необработанных случаев

**Правило:** Предпочитай unknown вместо any. Используй never для исчерпывающих проверок.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// any — нет проверки типов (опасно)
let dangerous: any = 'hello';
dangerous.foo.bar.baz(); // Нет ошибки — падение в рантайме!
dangerous = 42;
dangerous.toUpperCase(); // Нет ошибки — падение в рантайме!

// unknown — нужно проверить перед использованием (безопасно)
let safe: unknown = 'hello';
safe.toUpperCase();      // Ошибка — у unknown нет методов

if (typeof safe === 'string') {
  safe.toUpperCase();    // OK — сужено до string
}

// Утверждение типа (когда ты знаешь лучше)
const str = safe as string;
str.toUpperCase();       // OK — но ответственность на тебе`,
      },
      {
        language: 'typescript',
        code: `// never — для исчерпывающих проверок
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status): string {
  switch (status) {
    case 'pending': return 'Загрузка...';
    case 'success': return 'Готово!';
    case 'error': return 'Ошибка!';
    default:
      // Если добавим новый статус и забудем обработать,
      // TypeScript выдаст ошибку здесь
      const exhaustiveCheck: never = status;
      throw new Error(\`Необработанный статус: \${exhaustiveCheck}\`);
  }
}

// never — функция, которая никогда не возвращает
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
    question: 'Объясни Utility Types в TypeScript',
    answer: `Встроенные обобщённые типы для типичных трансформаций.

**Трансформации объектов:**
- Partial<T> — все свойства опциональны
- Required<T> — все свойства обязательны
- Readonly<T> — все свойства только для чтения
- Pick<T, K> — выбрать конкретные свойства
- Omit<T, K> — исключить конкретные свойства
- Record<K, V> — объект с ключами K и значениями V

**Трансформации объединений:**
- Exclude<T, U> — убрать типы из объединения
- Extract<T, U> — оставить только совпадающие типы
- NonNullable<T> — убрать null и undefined

**Типы функций:**
- ReturnType<T> — извлечь тип возвращаемого значения
- Parameters<T> — извлечь параметры как кортеж`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial — все опциональны (отлично для обновлений)
type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number }

function updateUser(id: number, updates: Partial<User>) {
  // Можно передать любое подмножество полей
}
updateUser(1, { name: 'John' }); // OK

// Required — все обязательны
type RequiredUser = Required<Partial<User>>;

// Readonly — неизменяемый
type ImmutableUser = Readonly<User>;
const user: ImmutableUser = { id: 1, name: 'John', email: '', age: 30 };
user.name = 'Jane'; // Ошибка — readonly`,
      },
      {
        language: 'typescript',
        code: `// Pick — выбрать поля
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit — исключить поля
type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string; age: number }

// Record — типизированный объект/словарь
type UserRoles = Record<string, 'admin' | 'user' | 'guest'>;
const roles: UserRoles = {
  john: 'admin',
  jane: 'user'
};

// Типизированный словарь
type UserById = Record<number, User>;`,
      },
      {
        language: 'typescript',
        code: `// Exclude/Extract — манипуляции с объединениями
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
    question: 'Что такое Type Guards и сужение типов?',
    answer: `Type guards — это проверки в рантайме, которые сужают типы внутри блока кода.

**Встроенные guards:**
- typeof — для примитивов
- instanceof — для классов
- 'property' in obj — для проверки наличия свойства
- Array.isArray() — для массивов

**Кастомные guards:** Функции, возвращающие предикат «x is Type».

**Сужение (narrowing):** TypeScript отслеживает изменения типов через control flow — после проверки тип становится более конкретным.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// typeof — примитивы
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // string
  }
  return value.toFixed(2); // number
}

// instanceof — классы
class Dog { bark() {} }
class Cat { meow() {} }

function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // Dog
  } else {
    animal.meow(); // Cat
  }
}

// in — проверка свойства
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
        code: `// Кастомный type guard — предикат «is»
interface User { type: 'user'; name: string }
interface Admin { type: 'admin'; name: string; permissions: string[] }

function isAdmin(person: User | Admin): person is Admin {
  return person.type === 'admin';
}

function greet(person: User | Admin) {
  if (isAdmin(person)) {
    console.log(\`Админ \${person.name} с \${person.permissions.length} правами\`);
  } else {
    console.log(\`Пользователь \${person.name}\`);
  }
}

// Утверждающий type guard — выбрасывает ошибку если не подходит
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Не строка!');
  }
}

function process(input: unknown) {
  assertIsString(input);
  // После утверждения input — string
  console.log(input.toUpperCase());
}`,
      },
      {
        language: 'typescript',
        code: `// Дискриминированные объединения — лучший паттерн
interface LoadingState { status: 'loading' }
interface SuccessState { status: 'success'; data: string }
interface ErrorState { status: 'error'; error: Error }

type State = LoadingState | SuccessState | ErrorState;

function render(state: State) {
  switch (state.status) {
    case 'loading':
      return 'Загрузка...';
    case 'success':
      return state.data; // TypeScript знает, что data есть
    case 'error':
      return state.error.message; // TypeScript знает, что error есть
  }
}`,
      },
    ],
  },

  {
    id: 'ts-6',
    question: 'Объясни Mapped Types',
    answer: `Mapped types трансформируют свойства существующих типов. Они итерируют по ключам и создают новые свойства.

**Синтаксис:** { [K in Keys]: NewType }

**Модификаторы:**
- readonly / -readonly — добавить/убрать readonly
- ? / -? — добавить/убрать опциональность

**Ремаппинг ключей (as):** Трансформация имён ключей.

**Кейсы:** Сделать все свойства опциональными, readonly, nullable, фильтрация свойств.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Базовый mapped type — как работает Partial
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Как работает Readonly
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Nullable — все свойства могут быть null
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface User {
  id: number;
  name: string;
}

type NullableUser = Nullable<User>;
// { id: number | null; name: string | null }`,
      },
      {
        language: 'typescript',
        code: `// Модификаторы — добавить или убрать
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]; // Убрать readonly
};

type Concrete<T> = {
  [K in keyof T]-?: T[K]; // Убрать optional (как работает Required)
};

// Трансформация значений
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }`,
      },
      {
        language: 'typescript',
        code: `// Фильтрация свойств по типу
type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Mixed {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

type StringProps = OnlyStrings<Mixed>;
// { name: string; email: string }

// Фильтрация по имени ключа
type OmitStartingWithUnderscore<T> = {
  [K in keyof T as K extends \`_\${string}\` ? never : K]: T[K];
};

interface WithPrivate {
  id: number;
  _internal: string;
  name: string;
}

type PublicOnly = OmitStartingWithUnderscore<WithPrivate>;
// { id: number; name: string }`,
      },
    ],
  },

  {
    id: 'ts-7',
    question: 'Что такое Conditional Types и infer?',
    answer: `Условные типы выбирают тип на основе условия: T extends U ? X : Y

**infer:** Захватывает часть типа во время проверки условия. Работает только внутри extends.

**Дистрибутивное поведение:** Когда T — объединение, условие применяется к каждому члену отдельно.

**Кейсы:** Извлечение типа возврата, разворачивание промисов, фильтрация объединений.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Базовый условный тип
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// Практика: извлечение типа элемента массива
type ElementOf<T> = T extends (infer E)[] ? E : never;

type NumArr = ElementOf<number[]>;    // number
type StrArr = ElementOf<string[]>;    // string
type NotArr = ElementOf<number>;      // never

// Разворачивание Promise
type Awaited<T> = T extends Promise<infer U> ? U : T;

type P1 = Awaited<Promise<string>>;           // string
type P2 = Awaited<Promise<Promise<number>>>; // Promise<number>
type P3 = Awaited<string>;                    // string`,
      },
      {
        language: 'typescript',
        code: `// infer — извлечение частей функции
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function createUser(name: string, age: number): { id: number; name: string } {
  return { id: 1, name };
}

type Return = ReturnType<typeof createUser>;    // { id: number; name: string }
type Params = Parameters<typeof createUser>;    // [string, number]

// Извлечение первого параметра
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

type First = FirstParam<typeof createUser>; // string`,
      },
      {
        language: 'typescript',
        code: `// Дистрибутивные условные типы — применяются к каждому члену union
type ToArray<T> = T extends any ? T[] : never;

type Distributed = ToArray<string | number>;
// string[] | number[]  (не (string | number)[])

// Предотвращение дистрибуции с кортежем
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type NonDistributed = ToArrayNonDist<string | number>;
// (string | number)[]

// Фильтрация union
type OnlyStrings<T> = T extends string ? T : never;

type Mixed = 'a' | 'b' | 1 | 2;
type Strings = OnlyStrings<Mixed>; // 'a' | 'b'`,
      },
    ],
  },

  {
    id: 'ts-8',
    question: 'Объясни Template Literal Types',
    answer: `Template literal types строят строковые типы из других типов с помощью шаблонного синтаксиса.

**Синтаксис:** \`prefix\${Type}suffix\`

**Встроенные строковые типы:**
- Uppercase<S>, Lowercase<S>
- Capitalize<S>, Uncapitalize<S>

**Кейсы:** Имена событий, CSS-свойства, паттерны маршрутов, API-эндпоинты.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Базовый template literal
type Greeting = \`Hello, \${string}\`;

const g1: Greeting = 'Hello, World';  // OK
const g2: Greeting = 'Hi, World';     // Ошибка

// Расширение union — все комбинации
type Color = 'red' | 'green' | 'blue';
type Size = 'sm' | 'md' | 'lg';

type ColorSize = \`\${Color}-\${Size}\`;
// 'red-sm' | 'red-md' | 'red-lg' | 'green-sm' | ... (9 комбинаций)

// Обработчики событий
type Events = 'click' | 'focus' | 'blur';
type EventHandlers = \`on\${Capitalize<Events>}\`;
// 'onClick' | 'onFocus' | 'onBlur'`,
      },
      {
        language: 'typescript',
        code: `// Практика: типизированный CSS
type CSSUnit = 'px' | 'em' | 'rem' | '%';
type CSSValue = \`\${number}\${CSSUnit}\`;

function setWidth(value: CSSValue) { }

setWidth('100px');   // OK
setWidth('1.5rem');  // OK
setWidth('100');     // Ошибка — нет единицы
setWidth('100vw');   // Ошибка — vw нет в union

// API-маршруты
type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = \`/api/\${string}\`;
type Route = \`\${Methods} \${Endpoint}\`;

const route: Route = 'GET /api/users';     // OK
const bad: Route = 'PATCH /api/users';     // Ошибка`,
      },
      {
        language: 'typescript',
        code: `// Извлечение частей с infer
type GetRouteParams<T> = T extends \`\${string}:\${infer Param}/\${infer Rest}\`
  ? Param | GetRouteParams<\`/\${Rest}\`>
  : T extends \`\${string}:\${infer Param}\`
  ? Param
  : never;

type Params = GetRouteParams<'/users/:userId/posts/:postId'>;
// 'userId' | 'postId'

// Getter/Setter из имён свойств
type PropEventSource<T> = {
  on<K extends string & keyof T>(
    eventName: \`\${K}Changed\`,
    callback: (newValue: T[K]) => void
  ): void;
};

interface User { name: string; age: number; }

declare const user: PropEventSource<User>;
user.on('nameChanged', (v) => {}); // v — string
user.on('ageChanged', (v) => {});  // v — number`,
      },
    ],
  },

  {
    id: 'ts-9',
    question: 'Что такое "as const" и const assertions?',
    answer: `"as const" создаёт максимально узкий тип — литеральные типы вместо общих.

**Эффекты:**
- Строки становятся литеральными типами
- Массивы становятся readonly-кортежами
- Объекты становятся readonly с литеральными типами свойств

**Кейсы:**
- Константы, которые не должны меняться
- Дискриминированные объединения
- Типы кортежей
- Объекты конфигурации`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Без as const
const config = {
  endpoint: '/api',
  timeout: 5000
};
// Тип: { endpoint: string; timeout: number }

// С as const
const config = {
  endpoint: '/api',
  timeout: 5000
} as const;
// Тип: { readonly endpoint: '/api'; readonly timeout: 5000 }

// Массив → readonly-кортеж
const colors = ['red', 'green', 'blue'];        // string[]
const colors = ['red', 'green', 'blue'] as const; // readonly ['red', 'green', 'blue']

// Полезно для получения литерального union из массива
type Color = typeof colors[number]; // 'red' | 'green' | 'blue'`,
      },
      {
        language: 'typescript',
        code: `// Практика: типы действий (стиль Redux)
const Actions = {
  ADD_USER: 'ADD_USER',
  DELETE_USER: 'DELETE_USER',
  UPDATE_USER: 'UPDATE_USER'
} as const;

type ActionType = typeof Actions[keyof typeof Actions];
// 'ADD_USER' | 'DELETE_USER' | 'UPDATE_USER'

// Без as const ActionType был бы просто 'string'

// Альтернатива enum — const-объект
const Status = {
  Pending: 0,
  Success: 1,
  Error: 2
} as const;

type StatusValue = typeof Status[keyof typeof Status]; // 0 | 1 | 2`,
      },
      {
        language: 'typescript',
        code: `// Функция, возвращающая кортеж
function useToggle() {
  const [state, setState] = useState(false);
  return [state, () => setState(!state)]; // (boolean | (() => void))[]
}

// С as const — правильный кортеж
function useToggle() {
  const [state, setState] = useState(false);
  return [state, () => setState(!state)] as const;
  // readonly [boolean, () => void]
}

const [isOpen, toggle] = useToggle();
// isOpen: boolean (не boolean | (() => void))
// toggle: () => void`,
      },
    ],
  },

  {
    id: 'ts-10',
    question: 'Объясни перегрузку функций (Function Overloads)',
    answer: `Перегрузки определяют несколько сигнатур для одной функции. TypeScript выбирает правильную на основе аргументов.

**Структура:**
1. Сигнатуры перегрузки (объявления) — то, что видят вызывающие
2. Сигнатура реализации — должна обработать все случаи

**Правила:**
- Сигнатура реализации должна быть совместима со всеми перегрузками
- Перегрузки проверяются сверху вниз — ставь конкретные первыми
- Сигнатура реализации НЕ видна вызывающим

**Кейсы:** Разные типы возврата в зависимости от входа, опциональные параметры с разным поведением.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Проблема: тип возврата зависит от входа
function process(input: string): string;
function process(input: number): number;
function process(input: string | number): string | number {
  if (typeof input === 'string') {
    return input.toUpperCase();
  }
  return input * 2;
}

const str = process('hello'); // string (не string | number)
const num = process(42);      // number (не string | number)

// Без перегрузок оба были бы string | number`,
      },
      {
        language: 'typescript',
        code: `// Практика: API в стиле createElement
interface DivElement { tagName: 'div'; click(): void }
interface SpanElement { tagName: 'span'; textContent: string }
interface InputElement { tagName: 'input'; value: string }

function createElement(tag: 'div'): DivElement;
function createElement(tag: 'span'): SpanElement;
function createElement(tag: 'input'): InputElement;
function createElement(tag: string): DivElement | SpanElement | InputElement {
  // Реализация обрабатывает все случаи
  switch (tag) {
    case 'div': return { tagName: 'div', click() {} };
    case 'span': return { tagName: 'span', textContent: '' };
    case 'input': return { tagName: 'input', value: '' };
    default: throw new Error('Неизвестный тег');
  }
}

const div = createElement('div');     // DivElement
const input = createElement('input'); // InputElement`,
      },
      {
        language: 'typescript',
        code: `// Перегрузка с разным числом параметров
function find(id: number): User;
function find(name: string, age: number): User[];
function find(idOrName: number | string, age?: number): User | User[] {
  if (typeof idOrName === 'number') {
    return users.find(u => u.id === idOrName)!;
  }
  return users.filter(u => u.name === idOrName && u.age === age);
}

const single = find(1);           // User
const multiple = find('John', 30); // User[]

// Обобщённая перегрузка
function parse(input: string): string;
function parse<T>(input: string, reviver: (val: string) => T): T;
function parse<T>(input: string, reviver?: (val: string) => T): string | T {
  const parsed = JSON.parse(input);
  return reviver ? reviver(parsed) : parsed;
}`,
      },
    ],
  },

  {
    id: 'ts-11',
    question: 'Что такое strict mode и его флаги?',
    answer: `Strict mode включает более строгую проверку типов. Установи "strict": true в tsconfig.json для включения всех флагов.

**Отдельные флаги:**
- strictNullChecks — null/undefined — отдельные типы
- strictFunctionTypes — более строгая проверка параметров функций
- strictBindCallApply — типизированные bind/call/apply
- strictPropertyInitialization — свойства классов должны быть инициализированы
- noImplicitAny — ошибка на неявный any
- noImplicitThis — ошибка на неявный this

**Рекомендация:** Всегда используй strict mode. Он ловит баги на этапе компиляции.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// strictNullChecks — самый важный
// ВЫКЛ: null можно присвоить любому типу (опасно)
let name: string = null; // OK, но неправильно

// ВКЛ: null — отдельный тип
let name: string = null;           // Ошибка
let name: string | null = null;    // OK — явно указано

function getUser(id: number): User | undefined {
  return users.find(u => u.id === id);
}

const user = getUser(1);
user.name;       // Ошибка — может быть undefined
user?.name;      // OK — опциональная цепочка
user!.name;      // OK — non-null assertion (ты гарантируешь)

if (user) {
  user.name;     // OK — сужено
}`,
      },
      {
        language: 'typescript',
        code: `// noImplicitAny
// ВЫКЛ:
function process(data) { } // data — неявный 'any'

// ВКЛ:
function process(data) { } // Ошибка — нужно указать тип
function process(data: unknown) { } // OK

// strictPropertyInitialization
class User {
  name: string;  // Ошибка — не инициализировано
  
  // Варианты исправления:
  name: string = '';           // Значение по умолчанию
  name!: string;               // Утверждение определённого присваивания
  name: string | undefined;    // Разрешить undefined
  
  constructor(name: string) {
    this.name = name;          // Инициализация в конструкторе
  }
}`,
      },
      {
        language: 'typescript',
        code: `// strictFunctionTypes — контравариантность параметров
interface Animal { name: string }
interface Dog extends Animal { breed: string }

type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

// ВЫКЛ: разрешает небезопасные присваивания
let handler: AnimalHandler = (dog: Dog) => console.log(dog.breed);
handler({ name: 'Cat' }); // Ошибка в рантайме — нет breed!

// ВКЛ: предотвращает небезопасные присваивания
let handler: AnimalHandler = (dog: Dog) => {}; // Ошибка

// Безопасное направление:
let dogHandler: DogHandler = (animal: Animal) => {}; // OK

// tsconfig.json
{
  "compilerOptions": {
    "strict": true,  // Включает все strict-флаги
    // Или по отдельности:
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}`,
      },
    ],
  },

  {
    id: 'ts-12',
    question: 'Что такое файлы деклараций (.d.ts)?',
    answer: `Файлы деклараций описывают форму JavaScript-кода для TypeScript. Содержат только информацию о типах, без рантайм-кода.

**Когда нужны:**
- Используешь JS-библиотеку без типов
- Публикуешь библиотеку для TS-пользователей
- Расширяешь существующие типы (module augmentation)

**Источники типов:**
1. Встроенные — библиотека включает .d.ts
2. DefinitelyTyped — @types/library-name
3. Кастомные — пишешь свой .d.ts

**Ключевые концепции:**
- declare — говорит TS «это существует в рантайме»
- ambient declarations — описывают внешний код
- module augmentation — расширяют существующие модули`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// global.d.ts — объявление глобальных переменных
declare const API_URL: string;
declare const DEBUG: boolean;

// Объявление глобальной функции
declare function gtag(command: string, ...args: any[]): void;

// Расширение Window
declare global {
  interface Window {
    analytics: {
      track(event: string, data?: object): void;
    };
  }
}

// Использование в коде
window.analytics.track('click', { button: 'submit' }); // Типизировано!`,
      },
      {
        language: 'typescript',
        code: `// Типизация нетипизированной JS-библиотеки
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

// Теперь можно импортировать с типами
import LegacyClient, { doSomething, Config } from 'legacy-lib';`,
      },
      {
        language: 'typescript',
        code: `// Module augmentation — расширение существующих типов
// Расширение Express Request
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: 'admin' | 'user';
    };
  }
}

// Теперь в мидлваре
app.use((req, res, next) => {
  req.user = { id: '123', role: 'admin' }; // Типизировано!
  next();
});

// Расширение сторонней библиотеки
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
