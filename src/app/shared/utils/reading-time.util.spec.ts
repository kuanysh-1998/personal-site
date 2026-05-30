import { describe, expect, it } from 'vitest';
import { calculateReadingTime } from './reading-time.util';

describe('calculateReadingTime', () => {
  it('returns 0 for empty or whitespace-only content', () => {
    expect(calculateReadingTime('')).toBe(0);
    expect(calculateReadingTime('   \n  ')).toBe(0);
  });

  it('returns a minimum of 1 minute for short content', () => {
    expect(calculateReadingTime('Just a few words here')).toBe(1);
  });

  it('rounds up based on 200 words per minute', () => {
    const words = Array.from({ length: 450 }, () => 'word').join(' ');
    // 450 / 200 = 2.25 -> ceil -> 3
    expect(calculateReadingTime(words)).toBe(3);
  });

  it('ignores markdown syntax when counting words', () => {
    const plain = Array.from({ length: 200 }, () => 'word').join(' ');
    const withMarkdown = `# Heading\n\n\`\`\`ts\nconst dead = code;\n\`\`\`\n\n**${plain}** [link](https://example.com)`;
    // code block stripped, "link" text kept -> ~201 words -> ceil(201/200) = 2
    expect(calculateReadingTime(withMarkdown)).toBe(2);
  });
});
