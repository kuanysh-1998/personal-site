import { InterviewQuestion } from '../../types/interview.types';

export const javascriptQuestionsEn: InterviewQuestion[] = [
  {
    id: 'js-1',
    question: 'What is a closure?',
    answer: `A closure is a function that "remembers" variables from where it was created, even when executed elsewhere.

**Analogy:** A backpack. When you create a function inside another function, the inner function takes all outer variables with it. Even after the outer function finishes, the inner function still has access.

**Why it matters:**
- Private variables (data encapsulation)
- Preserving state between calls
- Function factories with configuration
- Partial application and currying`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// Counter with private state
function createCounter() {
  let count = 0; // "closed over" — private
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
console.log(counter.count); // undefined — private!`,
      },
      {
        language: 'javascript',
        code: `// Function factory
function multiply(a) {
  return function(b) {
    return a * b; // 'a' is remembered
  };
}

const double = multiply(2);
const triple = multiply(3);

double(5); // 10
triple(5); // 15

// Classic interview trap: loop + closure
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 (var is function-scoped)

// Fix with let (block-scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2`,
      },
    ],
  },

  {
    id: 'js-2',
    question: 'How does the Event Loop work?',
    answer: `The Event Loop allows JavaScript to execute async code while being single-threaded.

**Components:**

1. **Call Stack** — executes functions one by one, LIFO

2. **Web APIs** — browser handles async (setTimeout, fetch, DOM events)

3. **Task Queue (Macrotasks)** — callbacks from setTimeout, setInterval, I/O

4. **Microtask Queue** — Promise.then, queueMicrotask, MutationObserver

**Execution order:**
1. Execute all synchronous code (call stack)
2. Drain ALL microtasks
3. Execute ONE macrotask
4. Repeat from step 2

**Key:** Microtasks always run before next macrotask.`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `console.log('1: sync');

setTimeout(() => console.log('2: macrotask'), 0);

Promise.resolve().then(() => console.log('3: microtask'));

queueMicrotask(() => console.log('4: microtask 2'));

console.log('5: sync');

// Output:
// 1: sync
// 5: sync
// 3: microtask
// 4: microtask 2
// 2: macrotask`,
      },
      {
        language: 'javascript',
        code: `// Nested microtasks — all run before macrotask
Promise.resolve().then(() => {
  console.log('1: microtask');
  Promise.resolve().then(() => console.log('2: nested microtask'));
});

setTimeout(() => console.log('3: macrotask'), 0);

// Output:
// 1: microtask
// 2: nested microtask  ← still before macrotask!
// 3: macrotask

// Real example: why UI can freeze
button.addEventListener('click', () => {
  // This blocks the event loop
  while (true) {} // UI frozen — no events processed
  
  // Better: break work into chunks
  function processChunk() {
    // do small work
    if (moreWork) setTimeout(processChunk, 0); // yield to event loop
  }
});`,
      },
    ],
  },

  {
    id: 'js-3',
    question: 'Explain "this" in JavaScript',
    answer: `"this" is determined by HOW a function is called, not WHERE it's defined.

**Rules (in order of precedence):**

1. **new** — this = new empty object
2. **call/apply/bind** — this = specified object
3. **Method call (obj.fn())** — this = object before dot
4. **Regular call (fn())** — this = undefined (strict) or window
5. **Arrow function** — this = inherited from outer scope (lexical)

**Arrow functions don't have their own "this"** — they capture it from where they're defined.`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `const user = {
  name: 'John',
  greet() {
    console.log(\`Hello, \${this.name}\`);
  },
  greetArrow: () => {
    console.log(\`Hello, \${this.name}\`); // this = outer scope
  }
};

user.greet();       // "Hello, John" — method call
user.greetArrow();  // "Hello, undefined" — arrow = outer this

const greet = user.greet;
greet();            // "Hello, undefined" — lost context

// Fix with bind
const boundGreet = user.greet.bind(user);
boundGreet();       // "Hello, John"`,
      },
      {
        language: 'javascript',
        code: `// call, apply, bind
function introduce(greeting, punctuation) {
  console.log(\`\${greeting}, I'm \${this.name}\${punctuation}\`);
}

const person = { name: 'Alice' };

// call — args one by one
introduce.call(person, 'Hi', '!');    // "Hi, I'm Alice!"

// apply — args as array
introduce.apply(person, ['Hello', '.']); // "Hello, I'm Alice."

// bind — returns new function with fixed this
const aliceIntro = introduce.bind(person, 'Hey');
aliceIntro('?'); // "Hey, I'm Alice?"

// Arrow in class — correct this for callbacks
class Button {
  constructor(label) {
    this.label = label;
  }
  
  // Arrow preserves 'this' in callbacks
  handleClick = () => {
    console.log(\`Clicked: \${this.label}\`);
  }
}

const btn = new Button('Submit');
document.addEventListener('click', btn.handleClick); // Works!`,
      },
    ],
  },

  {
    id: 'js-4',
    question: 'What is Prototypal Inheritance?',
    answer: `In JavaScript, objects inherit from other objects via prototype chain.

**Every object has [[Prototype]]** — a hidden link to another object. When you access a property, JS looks up the chain until found or reaches null.

**Ways to set prototype:**
- Object.create(proto)
- Constructor function + new
- Class (syntactic sugar over prototypes)
- Object.setPrototypeOf() (slow, avoid)

**__proto__ vs prototype:**
- __proto__ — object's actual prototype link
- prototype — property on functions, becomes __proto__ of instances`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// Object.create — direct prototype link
const animal = {
  eat() { console.log('eating'); }
};

const dog = Object.create(animal);
dog.bark = function() { console.log('woof'); };

dog.bark(); // "woof" — own method
dog.eat();  // "eating" — inherited from animal

// Prototype chain
console.log(dog.__proto__ === animal);        // true
console.log(animal.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__);      // null — end of chain`,
      },
      {
        language: 'javascript',
        code: `// Constructor function (ES5 way)
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(\`Hi, I'm \${this.name}\`);
};

const john = new Person('John');
john.greet(); // "Hi, I'm John"

// 'new' does:
// 1. Create empty object
// 2. Set its __proto__ to Person.prototype
// 3. Execute Person with this = new object
// 4. Return object (unless function returns object)

// Class (ES6) — same thing, cleaner syntax
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(\`\${this.name} makes sound\`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(\`\${this.name} barks\`);
  }
}

const rex = new Dog('Rex');
rex.speak(); // "Rex barks"`,
      },
    ],
  },

  {
    id: 'js-5',
    question: 'Explain Promises and async/await',
    answer: `Promises represent eventual completion (or failure) of async operation.

**States:**
- pending — initial, waiting
- fulfilled — completed with value
- rejected — failed with reason

**Promise methods:**
- then(onFulfilled, onRejected) — handle result
- catch(onRejected) — handle error
- finally(onFinally) — runs regardless

**async/await** — syntactic sugar over Promises. Makes async code look synchronous.

**Key:** await pauses function execution until Promise resolves, but doesn't block event loop.`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// Creating Promise
const fetchUser = (id) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (id > 0) {
      resolve({ id, name: 'John' });
    } else {
      reject(new Error('Invalid ID'));
    }
  }, 1000);
});

// Using with then/catch
fetchUser(1)
  .then(user => console.log(user))
  .catch(err => console.error(err))
  .finally(() => console.log('Done'));

// Chaining — each then returns new Promise
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => console.log(posts))
  .catch(err => console.error(err)); // Catches any error in chain`,
      },
      {
        language: 'javascript',
        code: `// async/await — cleaner syntax
async function loadUserData(id) {
  try {
    const user = await fetchUser(id);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (err) {
    console.error('Failed:', err);
    throw err; // Re-throw if needed
  }
}

// Parallel execution — Promise.all
async function loadDashboard() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);
  return { users, posts, comments };
}

// Promise.allSettled — don't fail on single rejection
const results = await Promise.allSettled([
  fetchUser(1),
  fetchUser(-1) // This fails
]);
// [{ status: 'fulfilled', value: {...} }, 
//  { status: 'rejected', reason: Error }]

// Promise.race — first to settle wins
const fastest = await Promise.race([
  fetch('/api1'),
  fetch('/api2')
]);`,
      },
    ],
  },

  {
    id: 'js-6',
    question: 'Explain Spread and Rest operators (...)',
    answer: `The ... operator has two uses depending on context.

**Spread (expanding):**
- Expands array/object into individual elements
- Use: copying, merging, function arguments

**Rest (collecting):**
- Collects multiple elements into array/object
- Use: function parameters, destructuring

**Key difference:** Spread appears in array literals, object literals, function calls. Rest appears in function parameters and destructuring patterns.`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// SPREAD — expanding

// Copy array (shallow)
const arr = [1, 2, 3];
const copy = [...arr];
copy.push(4);
console.log(arr);  // [1, 2, 3] — original unchanged

// Merge arrays
const merged = [...arr, 4, 5, ...[6, 7]];
// [1, 2, 3, 4, 5, 6, 7]

// Copy object (shallow)
const user = { name: 'John', age: 30 };
const copy2 = { ...user };

// Merge objects — later values override
const updated = { ...user, age: 31, city: 'NYC' };
// { name: 'John', age: 31, city: 'NYC' }

// Function call
const nums = [1, 5, 3, 9, 2];
Math.max(...nums); // 9 — same as Math.max(1, 5, 3, 9, 2)`,
      },
      {
        language: 'javascript',
        code: `// REST — collecting

// Function parameters
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10

// Mixed with regular params
function greet(greeting, ...names) {
  return names.map(n => \`\${greeting}, \${n}!\`);
}
greet('Hi', 'John', 'Jane'); // ['Hi, John!', 'Hi, Jane!']

// Destructuring arrays
const [first, second, ...others] = [1, 2, 3, 4, 5];
console.log(others); // [3, 4, 5]

// Destructuring objects
const { name, ...rest } = { name: 'John', age: 30, city: 'NYC' };
console.log(rest); // { age: 30, city: 'NYC' }

// GOTCHA: spread is shallow copy
const nested = { a: { b: 1 } };
const shallowCopy = { ...nested };
shallowCopy.a.b = 2;
console.log(nested.a.b); // 2 — original changed!

// Deep copy
const deep = JSON.parse(JSON.stringify(nested));
// Or: structuredClone(nested) — modern`,
      },
    ],
  },

  {
    id: 'js-7',
    question: 'Explain Debounce and Throttle',
    answer: `Both limit how often a function executes, but differently.

**Debounce:** Waits until activity STOPS for X ms, then executes once.
- Use: search input, resize handler, auto-save

**Throttle:** Executes at most once per X ms, regularly.
- Use: scroll handler, mousemove, rate limiting

**Analogy:**
- Debounce: elevator door — waits until people stop entering
- Throttle: metronome — fires at regular intervals`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// Debounce — wait until pause
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Usage: search input
const search = debounce((query) => {
  console.log('Searching:', query);
  // API call here
}, 300);

input.addEventListener('input', (e) => search(e.target.value));
// Typing "hello" fast: only ONE search after 300ms pause

// Debounce with immediate option
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
        code: `// Throttle — max once per interval
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

// Usage: scroll handler
const onScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 100);

window.addEventListener('scroll', onScroll);
// Fires max 10 times per second, not hundreds

// Throttle with trailing call
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
