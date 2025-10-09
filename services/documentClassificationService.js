/**
 * Simple keyword-based document classifier
 * (Later replace with ML model or Google Document AI)
 */
export const classifyDocument = (text) => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('passport') || lowerText.includes('identity') || lowerText.includes('aadhaar')|| lowerText.includes('pan')) {
    return 'ID_PROOF';
  }

  if (
    lowerText.includes('address') &&
    lowerText.includes('electricity') ||
    lowerText.includes('residence') ||
    lowerText.includes('gas') ||
    lowerText.includes('water bill')
  ) {
    return 'ADDRESS_PROOF';
  }

  return 'UNKNOWN';
};