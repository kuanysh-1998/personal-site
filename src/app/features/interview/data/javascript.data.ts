import { InterviewQuestion } from '../types/interview.types';

export const javascriptQuestions: InterviewQuestion[] = [
  {
    id: 'js-1',
    question: 'What is a closure?',
    answer: `A closure is a function that "remembers" variables from where it was created, even when executed elsewhere.

Think of it as a backpack. When you create a function inside another function, the inner function takes all outer variables with it in its backpack. Even after the outer function finishes, the inner function still has access to those variables.

**Why it matters:**
- Creating private variables (inaccessible from outside)
- Preserving state between function calls
- Function factories with configuration`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `// Example: counter with private state
function createCounter() {
  let count = 0; // This variable is "closed over"
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2

// count is not directly accessible — it's private
console.log(counter.count); // undefined`,
      },
    ],
  },
  {
    id: 'js-2',
    question: 'How does the Event Loop work?',
    answer: `The Event Loop is a mechanism that allows JavaScript to execute asynchronous code while remaining single-threaded.

**How it works:**

1. **Call Stack** — a stack of executing functions. JavaScript executes code top-down, pushing functions onto the stack.

2. **Web APIs** — browser APIs (setTimeout, fetch, DOM events). When an async operation is encountered, it's handed off here.

3. **Callback Queue** — queue for callbacks. When an async operation completes, its callback goes here.

4. **Event Loop** — constantly checks: "Is the Call Stack empty? Is there something in the queue? Move it to the stack."

**Important nuance:** Microtasks (Promise.then, queueMicrotask) execute before macrotasks (setTimeout, setInterval). After each task, the Event Loop first drains the microtask queue.`,
    codeSnippets: [
      {
        language: 'javascript',
        code: `console.log('1: Start');

setTimeout(() => {
  console.log('2: setTimeout (macrotask)');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Promise (microtask)');
});

console.log('4: End');

// Output order:
// 1: Start
// 4: End
// 3: Promise (microtask)  ← before setTimeout!
// 2: setTimeout (macrotask)`,
      },
    ],
  },
];
