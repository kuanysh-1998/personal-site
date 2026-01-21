import { InterviewCategory } from '../types/interview.types';
import { angularQuestions } from './angular.data';
import { javascriptQuestions } from './javascript.data';
import { typescriptQuestions } from './typescript.data';

export const interviewCategories: InterviewCategory[] = [
  {
    id: 'angular',
    name: 'Angular',
    questions: angularQuestions,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    questions: typescriptQuestions,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    questions: javascriptQuestions,
  },
];
