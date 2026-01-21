export interface CodeSnippet {
  code: string;
  language: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  codeSnippets?: CodeSnippet[];
}

export interface InterviewCategory {
  id: string;
  name: string;
  icon?: string;
  questions: InterviewQuestion[];
}
