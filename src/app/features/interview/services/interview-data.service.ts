import { Injectable, inject } from '@angular/core';
import { InterviewCategory } from '../types/interview.types';
import { LocaleService } from '@app/core/services/locale/locale.service';
import { angularQuestionsEn } from '../data/en/angular.data';
import { angularQuestionsRu } from '../data/ru/angular.data';
import { javascriptQuestionsEn } from '../data/en/javascript.data';
import { javascriptQuestionsRu } from '../data/ru/javascript.data';
import { typescriptQuestionsEn } from '../data/en/typescript.data';
import { typescriptQuestionsRu } from '../data/ru/typescript.data';

@Injectable({
  providedIn: 'root',
})
export class InterviewDataService {
  private readonly _localeService = inject(LocaleService);

  public getCategories(): InterviewCategory[] {
    const lang = this._localeService.getActiveLang();

    const angularQuestions = lang === 'ru' ? angularQuestionsRu : angularQuestionsEn;

    return [
      {
        id: angularQuestions.id,
        name: angularQuestions.name,
        icon: angularQuestions.icon,
        questions: angularQuestions.questions,
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        questions: lang === 'ru' ? typescriptQuestionsRu : typescriptQuestionsEn,
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        questions: lang === 'ru' ? javascriptQuestionsRu : javascriptQuestionsEn,
      },
    ];
  }
}
