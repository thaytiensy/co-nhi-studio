const GENERIC_TOPIC_WORDS = new Set([
  'bai', 'cac', 'cach', 'cho', 'chu', 'co', 'con', 'cung', 'de', 'duoc', 'em',
  'giup', 'hoc', 'hoi', 'khi', 'khoi', 'khong', 'la', 'lam', 'lop', 'ma', 'minh',
  'mi', 'muon', 'my', 'nao', 'nen', 'neu', 'nhu', 'nhung', 'sang', 'sao', 'sinh',
  'tao', 'the', 'theo', 'thuat', 'toi', 'trong', 'tu', 've', 'voi', 'va', 'y',
]);

function normalizeText(value) {
  return String(value || '')
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function findRelevantPedagogyTheme(query, themesByGrade, preferredGrade) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  const queryTokens = new Set(normalizedQuery.split(/\s+/));
  const explicitGrade = normalizedQuery.match(/\b(?:lop|khoi)\s*([1-5])\b/)?.[1];
  let bestMatch = null;

  for (const [grade, themes] of Object.entries(themesByGrade || {})) {
    if (explicitGrade && grade !== explicitGrade) continue;

    for (const theme of themes || []) {
      const normalizedTitle = normalizeText(theme?.title)
        .replace(/^chu de \d+\s*/, '')
        .trim();
      if (!normalizedTitle) continue;

      const titleTokens = [...new Set(normalizedTitle.split(/\s+/))]
        .filter((token) => token.length > 2 && !/^\d+$/.test(token) && !GENERIC_TOPIC_WORDS.has(token));
      const matchedTokens = titleTokens.filter((token) => queryTokens.has(token));
      const fullTitleMatch = normalizedQuery.includes(normalizedTitle);

      // A single generic word is not enough to switch the answer to a curriculum theme.
      if (!fullTitleMatch && matchedTokens.length < 2) continue;

      const score = matchedTokens.length + (fullTitleMatch ? 3 : 0)
        + (String(preferredGrade) === grade ? 0.5 : 0);
      if (!bestMatch || score > bestMatch.score) bestMatch = { grade, theme, score };
    }
  }

  return bestMatch ? { grade: bestMatch.grade, theme: bestMatch.theme } : null;
}
