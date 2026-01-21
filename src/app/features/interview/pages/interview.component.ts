import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from '@app/shared/components/accordion/accordion.component';
import { TabsComponent } from '@app/shared/components/tab/tabs.component';
import { MarkdownComponent } from 'ngx-markdown';
import { CopyCodeDirective } from '@app/shared/directives/copy-code.directive';
import { Tab } from '@app/shared/components/tab/tabs.types';
import { InterviewCategory, InterviewQuestion } from '../types/interview.types';
import { interviewCategories } from '../data';

@Component({
  selector: 'app-interview',
  imports: [CommonModule, AccordionComponent, TabsComponent, MarkdownComponent, CopyCodeDirective],
  templateUrl: './interview.component.html',
  styleUrl: './interview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterviewComponent {
  protected readonly categories = interviewCategories;

  protected readonly tabs: Tab[] = this.categories.map((category: InterviewCategory) => ({
    id: category.id,
    text: category.name,
  }));

  protected readonly selectedCategoryId = signal<string>(this.categories[0]?.id || '');

  protected getSelectedCategory(): InterviewCategory | undefined {
    return this.categories.find(
      (category: InterviewCategory) => category.id === this.selectedCategoryId(),
    );
  }

  protected onCategoryChanged(tab: Tab): void {
    this.selectedCategoryId.set(tab.id);
  }

  protected getFullAnswer(question: InterviewQuestion): string {
    let content = question.answer;

    if (question.codeSnippets?.length) {
      for (const snippet of question.codeSnippets) {
        content += `\n\n\`\`\`${snippet.language}\n${snippet.code}\n\`\`\``;
      }
    }

    return content;
  }
}
