import { InterviewQuestion } from '../types/interview.types';

export const typescriptQuestions: InterviewQuestion[] = [
  {
    id: 'ts-1',
    question: 'What is the difference between interface and type?',
    answer: `Both describe the shape of data, but with different capabilities.

**interface:**
- Only for objects and classes
- Can be extended (extends) and merged (declaration merging)
- More readable for object shapes

**type:**
- For anything: primitives, unions, tuples, mapped types
- Cannot be redeclared after creation
- More powerful for complex type transformations

**When to use what:**
- Describing object/class shape → interface
- Union types, primitives, complex transformations → type
- Library API (so users can extend) → interface`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// interface — for objects, can be extended
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}

// Declaration merging — unique interface feature
interface User {
  email: string; // Gets added to existing User
}

const user: User = {
  id: 1,
  name: 'John',
  email: 'john@example.com' // Required after merge
};`,
      },
      {
        language: 'typescript',
        code: `// type — for everything else
type ID = string | number; // Union — interface can't do this

type Status = 'pending' | 'success' | 'error'; // Literal union

type Point = [number, number]; // Tuple

type Nullable<T> = T | null; // Generic utility

// Mapped types — powerful transformations
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Optional<T> = {
  [K in keyof T]?: T[K];
};`,
      },
    ],
  },
  {
    id: 'ts-2',
    question: 'What are generics?',
    answer: `Generics are parameterized types. Instead of a specific type, you provide a "placeholder" that gets replaced with a real type when used.

**Analogy:** A generic is like a baking mold. One mold (function), but the result depends on what you put in it (the type).

**Why they matter:**
- Code reuse without losing type safety
- Linking input and output types of functions
- Type-safe data structures

**Naming conventions:** T (Type), K (Key), V (Value), E (Element)`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Without generics — we lose type information
function firstElement(arr: any[]): any {
  return arr[0];
}
const num = firstElement([1, 2, 3]); // any — we don't know what's inside

// With generics — type is preserved
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = firstElement([1, 2, 3]);       // number
const str = firstElement(['a', 'b', 'c']); // string
const user = firstElement([{ id: 1 }]);    // { id: number }`,
      },
      {
        language: 'typescript',
        code: `// Practical example: type-safe API client
interface ApiResponse<T> {
  data: T;
  status: number;
  timestamp: Date;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  const data = await response.json();
  return {
    data: data as T,
    status: response.status,
    timestamp: new Date()
  };
}

// Usage — TypeScript knows the exact type
interface User { id: number; name: string; }

const result = await fetchData<User>('/api/user/1');
result.data.name; // string — autocomplete works!
result.data.age;  // Compile error — no such field`,
      },
    ],
  },
];
