// Utility function to safely convert "DD/MM/YYYY" → "YYYY-MM-DD"
export function convertToISODate(dobString) {
  if (!dobString) return null;

  // Handle both "DD/MM/YYYY" and "DD-MM-YYYY"
  const parts = dobString.split(/[\/-]/);

  if (parts.length !== 3) return null; // malformed string

  const [day, month, year] = parts.map((p) => p.trim());

  // Basic validation
  if (!day || !month || !year) return null;
  if (day.length > 2 || month.length > 2 || year.length !== 4) return null;

  // Return ISO format
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}