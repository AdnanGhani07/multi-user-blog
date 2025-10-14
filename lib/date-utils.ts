import { format as formatFns, parseISO } from 'date-fns';

/**
 * Parses an ISO date string into a Date object.
 * Returns null if the input is not a valid date string.
 */
export const toDate = (dateString: string | Date | null | undefined): Date | null => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  try {
    const date = parseISO(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error("Failed to parse date string:", dateString, error);
    return null;
  }
};

/**
 * Formats a date string or Date object into a readable format.
 * @param dateInput An ISO date string or Date object.
 * @param formatString The format string (e.g., 'MMMM dd, yyyy', 'PP').
 * @returns Formatted date string or an empty string if invalid.
 */
export const formatDate = (dateInput: string | Date | null | undefined, formatString: string = 'MMMM dd, yyyy'): string => {
  const date = toDate(dateInput);
  return date ? formatFns(date, formatString) : '';
};