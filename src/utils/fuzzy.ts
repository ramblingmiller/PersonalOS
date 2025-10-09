export function fuzzyMatch(query: string, target: string): number {
  query = query.toLowerCase();
  target = target.toLowerCase();

  let score = 0;
  let queryIndex = 0;

  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] === query[queryIndex]) {
      score += target.length - i; // Earlier matches score higher
      queryIndex++;
    }
  }

  return queryIndex === query.length ? score : 0;
}

export function highlightMatches(text: string, query: string): string {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let result = '';
  let queryIndex = 0;

  for (let i = 0; i < text.length; i++) {
    if (queryIndex < query.length && lowerText[i] === lowerQuery[queryIndex]) {
      result += `<mark class="bg-yellow-200 dark:bg-yellow-700">${text[i]}</mark>`;
      queryIndex++;
    } else {
      result += text[i];
    }
  }

  return result;
}

