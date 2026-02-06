import { InterviewQuestion } from '../../types/interview.types';

export const javascriptQuestionsRu: InterviewQuestion[] = [
  {
    id: 'js-1',
    question: 'Что такое замыкание (closure)?',
    answer: `Замыкание — это функция, которая «помнит» переменные из того места, где была создана, даже когда выполняется в другом месте.

**Аналогия:** Рюкзак. Когда создаёшь функцию внутри другой функции, внутренняя забирает с собой все внешние переменные. Даже после завершения внешней функции внутренняя всё ещё имеет к ним доступ.

**Почему это важно:**
- Приватные переменные (инкапсуляция данных)
- Сохранение состояния между вызовами
- Фабрики функций с конфигурацией
- Частичное применение и каррирование`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// Счётчик с приватным состоянием
function createCounter() {
  let count = 0; // "замкнутая" переменная — приватная
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
console.log(counter.count); // undefined — приватная!`,
      },
      {
        language: 'javascript',
        code: `// Фабрика функций
function multiply(a) {
  return function(b) {
    return a * b; // 'a' запоминается
  };
}

const double = multiply(2);
const triple = multiply(3);

double(5); // 10
triple(5); // 15

// Классическая ловушка на собесе: цикл + замыкание
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Вывод: 3, 3, 3 (var — function-scoped)

// Исправление с let (block-scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Вывод: 0, 1, 2`,
      },
    ],
  },

  {
    id: 'js-2',
    question: 'Как работает Event Loop?',
    answer: `Event Loop позволяет JavaScript выполнять асинхронный код, оставаясь однопоточным.

**Компоненты:**

1. **Call Stack** — выполняет функции одну за другой, LIFO

2. **Web APIs** — браузер обрабатывает асинхронность (setTimeout, fetch, DOM-события)

3. **Task Queue (макротаски)** — колбэки из setTimeout, setInterval, I/O

4. **Microtask Queue** — Promise.then, queueMicrotask, MutationObserver

**Порядок выполнения:**
1. Выполнить весь синхронный код (call stack)
2. Выполнить ВСЕ микротаски
3. Выполнить ОДНУ макротаску
4. Повторить с шага 2

**Ключевое:** Микротаски всегда выполняются перед следующей макротаской.`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `console.log('1: sync');

setTimeout(() => console.log('2: макротаска'), 0);

Promise.resolve().then(() => console.log('3: микротаска'));

queueMicrotask(() => console.log('4: микротаска 2'));

console.log('5: sync');

// Вывод:
// 1: sync
// 5: sync
// 3: микротаска
// 4: микротаска 2
// 2: макротаска`,
      },
      {
        language: 'javascript',
        code: `// Вложенные микротаски — все выполняются до макротаски
Promise.resolve().then(() => {
  console.log('1: микротаска');
  Promise.resolve().then(() => console.log('2: вложенная микротаска'));
});

setTimeout(() => console.log('3: макротаска'), 0);

// Вывод:
// 1: микротаска
// 2: вложенная микротаска  ← всё ещё до макротаски!
// 3: макротаска

// Реальный пример: почему UI может зависнуть
button.addEventListener('click', () => {
  // Это блокирует event loop
  while (true) {} // UI заморожен — события не обрабатываются
  
  // Лучше: разбить работу на чанки
  function processChunk() {
    // делаем маленькую порцию работы
    if (moreWork) setTimeout(processChunk, 0); // отдаём управление event loop
  }
});`,
      },
    ],
  },

  {
    id: 'js-3',
    question: 'Объясни "this" в JavaScript',
    answer: `"this" определяется тем, КАК функция вызвана, а не ГДЕ она определена.

**Правила (в порядке приоритета):**

1. **new** — this = новый пустой объект
2. **call/apply/bind** — this = указанный объект
3. **Вызов как метод (obj.fn())** — this = объект перед точкой
4. **Обычный вызов (fn())** — this = undefined (strict) или window
5. **Стрелочная функция** — this = наследуется из внешней области (лексический)

**Стрелочные функции не имеют своего "this"** — они захватывают его из того места, где определены.`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `const user = {
  name: 'John',
  greet() {
    console.log(\`Привет, \${this.name}\`);
  },
  greetArrow: () => {
    console.log(\`Привет, \${this.name}\`); // this = внешняя область
  }
};

user.greet();       // "Привет, John" — вызов как метод
user.greetArrow();  // "Привет, undefined" — стрелка = внешний this

const greet = user.greet;
greet();            // "Привет, undefined" — потерян контекст

// Исправление через bind
const boundGreet = user.greet.bind(user);
boundGreet();       // "Привет, John"`,
      },
      {
        language: 'javascript',
        code: `// call, apply, bind
function introduce(greeting, punctuation) {
  console.log(\`\${greeting}, я \${this.name}\${punctuation}\`);
}

const person = { name: 'Alice' };

// call — аргументы по одному
introduce.call(person, 'Привет', '!');    // "Привет, я Alice!"

// apply — аргументы массивом
introduce.apply(person, ['Здравствуй', '.']); // "Здравствуй, я Alice."

// bind — возвращает новую функцию с фиксированным this
const aliceIntro = introduce.bind(person, 'Хей');
aliceIntro('?'); // "Хей, я Alice?"

// Стрелочная функция в классе — правильный this для колбэков
class Button {
  constructor(label) {
    this.label = label;
  }
  
  // Стрелка сохраняет 'this' в колбэках
  handleClick = () => {
    console.log(\`Нажато: \${this.label}\`);
  }
}

const btn = new Button('Submit');
document.addEventListener('click', btn.handleClick); // Работает!`,
      },
    ],
  },

  {
    id: 'js-4',
    question: 'Что такое прототипное наследование?',
    answer: `В JavaScript объекты наследуют от других объектов через цепочку прототипов.

**Каждый объект имеет [[Prototype]]** — скрытую ссылку на другой объект. При обращении к свойству JS идёт по цепочке вверх, пока не найдёт или не дойдёт до null.

**Способы задать прототип:**
- Object.create(proto)
- Функция-конструктор + new
- Class (синтаксический сахар над прототипами)
- Object.setPrototypeOf() (медленно, избегай)

**__proto__ vs prototype:**
- __proto__ — реальная ссылка на прототип объекта
- prototype — свойство функций, становится __proto__ экземпляров`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// Object.create — прямая ссылка на прототип
const animal = {
  eat() { console.log('ест'); }
};

const dog = Object.create(animal);
dog.bark = function() { console.log('гав'); };

dog.bark(); // "гав" — собственный метод
dog.eat();  // "ест" — унаследован от animal

// Цепочка прототипов
console.log(dog.__proto__ === animal);        // true
console.log(animal.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__);      // null — конец цепочки`,
      },
      {
        language: 'javascript',
        code: `// Функция-конструктор (ES5)
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(\`Привет, я \${this.name}\`);
};

const john = new Person('John');
john.greet(); // "Привет, я John"

// 'new' делает:
// 1. Создаёт пустой объект
// 2. Ставит его __proto__ на Person.prototype
// 3. Выполняет Person с this = новый объект
// 4. Возвращает объект (если функция не возвращает объект)

// Class (ES6) — то же самое, чище синтаксис
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(\`\${this.name} издаёт звук\`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(\`\${this.name} лает\`);
  }
}

const rex = new Dog('Rex');
rex.speak(); // "Rex лает"`,
      },
    ],
  },

  {
    id: 'js-5',
    question: 'Объясни Promises и async/await',
    answer: `Promise представляет будущее завершение (или ошибку) асинхронной операции.

**Состояния:**
- pending — начальное, ожидание
- fulfilled — завершено со значением
- rejected — ошибка с причиной

**Методы Promise:**
- then(onFulfilled, onRejected) — обработка результата
- catch(onRejected) — обработка ошибки
- finally(onFinally) — выполняется в любом случае

**async/await** — синтаксический сахар над Promises. Делает асинхронный код похожим на синхронный.

**Ключевое:** await приостанавливает выполнение функции до резолва Promise, но НЕ блокирует event loop.`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// Создание Promise
const fetchUser = (id) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (id > 0) {
      resolve({ id, name: 'John' });
    } else {
      reject(new Error('Невалидный ID'));
    }
  }, 1000);
});

// Использование с then/catch
fetchUser(1)
  .then(user => console.log(user))
  .catch(err => console.error(err))
  .finally(() => console.log('Готово'));

// Цепочка — каждый then возвращает новый Promise
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => console.log(posts))
  .catch(err => console.error(err)); // Ловит любую ошибку в цепочке`,
      },
      {
        language: 'javascript',
        code: `// async/await — более чистый синтаксис
async function loadUserData(id) {
  try {
    const user = await fetchUser(id);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (err) {
    console.error('Ошибка:', err);
    throw err; // Пробросить если нужно
  }
}

// Параллельное выполнение — Promise.all
async function loadDashboard() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);
  return { users, posts, comments };
}

// Promise.allSettled — не падает из-за одного реджекта
const results = await Promise.allSettled([
  fetchUser(1),
  fetchUser(-1) // Этот упадёт
]);
// [{ status: 'fulfilled', value: {...} }, 
//  { status: 'rejected', reason: Error }]

// Promise.race — первый завершившийся побеждает
const fastest = await Promise.race([
  fetch('/api1'),
  fetch('/api2')
]);`,
      },
    ],
  },

  {
    id: 'js-6',
    question: 'Объясни операторы Spread и Rest (...)',
    answer: `Оператор ... имеет два назначения в зависимости от контекста.

**Spread (развёртывание):**
- Раскладывает массив/объект на отдельные элементы
- Применение: копирование, слияние, аргументы функций

**Rest (сбор):**
- Собирает несколько элементов в массив/объект
- Применение: параметры функций, деструктуризация

**Ключевое отличие:** Spread используется в литералах массивов, объектов, вызовах функций. Rest — в параметрах функций и паттернах деструктуризации.`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// SPREAD — развёртывание

// Копия массива (поверхностная)
const arr = [1, 2, 3];
const copy = [...arr];
copy.push(4);
console.log(arr);  // [1, 2, 3] — оригинал не изменён

// Слияние массивов
const merged = [...arr, 4, 5, ...[6, 7]];
// [1, 2, 3, 4, 5, 6, 7]

// Копия объекта (поверхностная)
const user = { name: 'John', age: 30 };
const copy2 = { ...user };

// Слияние объектов — поздние значения перезаписывают
const updated = { ...user, age: 31, city: 'NYC' };
// { name: 'John', age: 31, city: 'NYC' }

// Вызов функции
const nums = [1, 5, 3, 9, 2];
Math.max(...nums); // 9 — то же что Math.max(1, 5, 3, 9, 2)`,
      },
      {
        language: 'javascript',
        code: `// REST — сбор

// Параметры функции
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10

// Совмещение с обычными параметрами
function greet(greeting, ...names) {
  return names.map(n => \`\${greeting}, \${n}!\`);
}
greet('Привет', 'John', 'Jane'); // ['Привет, John!', 'Привет, Jane!']

// Деструктуризация массива
const [first, second, ...others] = [1, 2, 3, 4, 5];
console.log(others); // [3, 4, 5]

// Деструктуризация объекта
const { name, ...rest } = { name: 'John', age: 30, city: 'NYC' };
console.log(rest); // { age: 30, city: 'NYC' }

// ПОДВОХ: spread — поверхностная копия
const nested = { a: { b: 1 } };
const shallowCopy = { ...nested };
shallowCopy.a.b = 2;
console.log(nested.a.b); // 2 — оригинал изменился!

// Глубокая копия
const deep = JSON.parse(JSON.stringify(nested));
// Или: structuredClone(nested) — современный способ`,
      },
    ],
  },

  {
    id: 'js-7',
    question: 'Объясни Debounce и Throttle',
    answer: `Оба ограничивают частоту вызова функции, но по-разному.

**Debounce:** Ждёт, пока активность ПРЕКРАТИТСЯ на X мс, затем выполняет один раз.
- Применение: поле поиска, обработчик resize, автосохранение

**Throttle:** Выполняется максимум раз в X мс, регулярно.
- Применение: обработчик scroll, mousemove, ограничение частоты запросов

**Аналогия:**
- Debounce: дверь лифта — ждёт, пока люди перестанут заходить
- Throttle: метроном — срабатывает через равные интервалы`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// Debounce — ждёт паузу
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Использование: поле поиска
const search = debounce((query) => {
  console.log('Ищем:', query);
  // API-запрос здесь
}, 300);

input.addEventListener('input', (e) => search(e.target.value));
// Быстрый набор "hello": только ОДИН поиск после паузы 300мс

// Debounce с опцией немедленного вызова
function debounceImmediate(fn, delay, immediate = false) {
  let timeoutId;
  return function(...args) {
    const callNow = immediate && !timeoutId;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) fn.apply(this, args);
    }, delay);
    if (callNow) fn.apply(this, args);
  };
}`,
      },
      {
        language: 'javascript',
        code: `// Throttle — максимум раз в интервал
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Использование: обработчик scroll
const onScroll = throttle(() => {
  console.log('Позиция скролла:', window.scrollY);
}, 100);

window.addEventListener('scroll', onScroll);
// Срабатывает максимум 10 раз в секунду, а не сотни

// Throttle с завершающим вызовом
function throttleTrailing(fn, limit) {
  let lastCall = 0;
  let timeoutId;
  return function(...args) {
    const now = Date.now();
    const remaining = limit - (now - lastCall);
    
    clearTimeout(timeoutId);
    
    if (remaining <= 0) {
      fn.apply(this, args);
      lastCall = now;
    } else {
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
        lastCall = Date.now();
      }, remaining);
    }
  };
}`,
      },
    ],
  },
];
