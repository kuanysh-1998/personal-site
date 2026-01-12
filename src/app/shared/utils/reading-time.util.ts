/**
 * Calculates reading time for text content
 * Based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  if (!content || content.trim().length === 0) {
    return 0;
  }

  // Remove markdown syntax for more accurate word count
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links, keep text
    .replace(/[#*_~`]/g, '') // Remove markdown formatting
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  // Count words (split by whitespace and filter empty strings)
  const words = plainText.split(/\s+/).filter((word) => word.length > 0);

  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;
  const readingTime = Math.ceil(words.length / wordsPerMinute);

  // Minimum reading time is 1 minute
  return Math.max(1, readingTime);
}
