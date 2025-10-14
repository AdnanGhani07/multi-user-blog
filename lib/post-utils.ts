// lib/post-utils.ts

/**
 * Calculates the word count of a given text.
 * @param text The input string.
 * @returns The number of words.
 */
export const calculateWordCount = (text: string | null | undefined): number => {
  if (!text) return 0;
  // Trim leading/trailing whitespace and split by any whitespace character (space, tab, newline, etc.)
  const words = text.trim().split(/\s+/);
  // Filter out any empty strings that might result from multiple spaces/newlines
  return words.filter(word => word.length > 0).length;
};

/**
 * Calculates the estimated reading time for a given word count.
 * Assumes an average reading speed of 200 words per minute.
 * @param wordCount The number of words in the text.
 * @returns The estimated reading time in minutes (rounded up).
 */
export const calculateReadingTime = (wordCount: number): number => {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
};