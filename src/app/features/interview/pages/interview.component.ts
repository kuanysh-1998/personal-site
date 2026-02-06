import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { AccordionComponent } from '@app/shared/components/accordion/accordion.component';
import { TabsComponent } from '@app/shared/components/tab/tabs.component';
import { MarkdownComponent } from 'ngx-markdown';
import { CopyCodeDirective } from '@app/shared/directives/copy-code.directive';
import { Tab } from '@app/shared/components/tab/tabs.types';
import { InterviewCategory, InterviewQuestion } from '../types/interview.types';
import { InterviewDataService } from '../services/interview-data.service';

@Component({
  selector: 'app-interview',
  imports: [
    CommonModule,
    TranslocoModule,
    AccordionComponent,
    TabsComponent,
    MarkdownComponent,
    CopyCodeDirective,
  ],
  templateUrl: './interview.component.html',
  styleUrl: './interview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterviewComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly interviewDataService = inject(InterviewDataService);

  protected readonly categories = this.interviewDataService.getCategories();

  protected readonly tabs: Tab[] = this.categories.map((category: InterviewCategory) => ({
    id: category.id,
    text: category.name,
  }));

  protected readonly selectedCategoryId = signal<string>(this.getInitialCategoryId());

  private getInitialCategoryId(): string {
    const tabFromUrl = this.route.snapshot.queryParamMap.get('tab');
    const isValidCategory = this.categories.some(
      (category: InterviewCategory) => category.id === tabFromUrl,
    );
    return isValidCategory ? tabFromUrl! : (this.categories[0]?.id ?? '');
  }

  protected getSelectedCategory(): InterviewCategory | undefined {
    return this.categories.find(
      (category: InterviewCategory) => category.id === this.selectedCategoryId(),
    );
  }

  protected onCategoryChanged(tab: Tab): void {
    this.selectedCategoryId.set(tab.id);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab.id },
      replaceUrl: true,
    });
  }

  protected getFullAnswer(question: InterviewQuestion): string {
    let content = this.dedent(question.answer);

    if (question.codeSnippets?.length) {
      for (const snippet of question.codeSnippets) {
        content += `\n\n\`\`\`${snippet.language}\n${snippet.code}\n\`\`\``;
      }
    }

    return content;
  }

  private dedent(text: string): string {
    const lines = text.split('\n');
    const indentedLines = lines.filter((line) => line.trim().length > 0 && line.match(/^\s+/));

    if (!indentedLines.length) return text;

    const minIndent = Math.min(...indentedLines.map((line) => line.match(/^\s+/)![0].length));

    if (minIndent === 0) return text;

    return lines.map((line) => (line.startsWith(' ') ? line.slice(minIndent) : line)).join('\n');
  }
}
