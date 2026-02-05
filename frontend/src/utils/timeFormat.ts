/**
 * Time formatting utilities for GMT+3 timezone (Africa/Nairobi)
 * Formats times to HH:MM format
 */

const GMT_PLUS_3_TIMEZONE = "Africa/Nairobi";

/**
 * Format a date/time string to HH:MM format in GMT+3 timezone
 * @param value - ISO date string or null/undefined
 * @returns Formatted time string (HH:MM) or "--" if invalid
 */
export function formatTime(value?: string | null): string {
  if (!value) return "--";
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "--";
    
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: GMT_PLUS_3_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    
    return formatter.format(date);
  } catch (error) {
    return "--";
  }
}

/**
 * Format a date/time string to full date and time in GMT+3 timezone
 * @param value - ISO date string or null/undefined
 * @returns Formatted date-time string or "--" if invalid
 */
export function formatDateTime(value?: string | null): string {
  if (!value) return "--";
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "--";
    
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: GMT_PLUS_3_TIMEZONE,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    
    return formatter.format(date);
  } catch (error) {
    return "--";
  }
}
