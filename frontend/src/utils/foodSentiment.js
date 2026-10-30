/**
 * Food sentiment analysis utilities.
 * Extracts food-quality signals from free-text PG review comments using
 * keyword matching (English + Hinglish). Extend the lists below to tune detection.
 */

const FOOD_KEYWORDS = [
  'food', 'meal', 'meals', 'tiffin', 'breakfast', 'lunch', 'dinner', 'cook',
  'cooked', 'cooking', 'kitchen', 'taste', 'menu', 'mess', 'canteen', 'thali',
  'curry', 'roti', 'chapati', 'dal', 'daal', 'sabzi', 'sabji', 'rice', 'paneer',
  'chicken', 'egg', 'curd', 'chai', 'tea', 'coffee', 'snack', 'snacks', 'rasoi',
  'khana', 'khaana', 'nashta', 'tiffinwala', 'food quality', 'food was',
];

const POSITIVE_KEYWORDS = [
  'delicious', 'tasty', 'yummy', 'yum', 'fresh', 'hygienic', 'homely',
  'homemade', 'home made', 'home style', 'home-style', 'variety', 'flavorful',
  'flavourful', 'swadisht', 'swaadisht', 'ghar jaisa', 'ghar ka', 'mast',
  'best', 'loved', 'perfect', 'awesome', 'amazing', 'superb', 'excellent',
  'finger licking', 'mouth watering', 'hot and fresh', 'worth it',
];

const NEGATIVE_KEYWORDS = [
  'bad', 'worst', 'terrible', 'awful', 'horrible', 'disgusting', 'stale',
  'oily', 'greasy', 'bland', 'tasteless', 'no taste', 'repetitive', 'monotonous',
  'same every day', 'every day same', 'unhygienic', 'unclean', 'cold', 'raw',
  'burnt', 'overcooked', 'over cooked', 'undercooked', 'under cooked',
  'not tasty', 'not good', 'not fresh', 'not hygienic', 'poor food',
  'bakwas', 'bekar', 'bekaar', 'ghatiya', 'waste', 'sick', 'stomach',
];

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const countMatches = (text, keyword) => {
  const re = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'gi');
  return (text.match(re) || []).length;
};

const buildRegex = (keyword) => new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'gi');

/**
 * Analyses an array of reviews and extracts food-quality sentiment.
 * @param {Array<{rating: number, comment: string|null}>} reviews
 * @returns {{
 *   totalMentions: number,
 *   positive: number, neutral: number, negative: number,
 *   score: number|null,
 *   positiveKeywords: Array<{word: string, count: number}>,
 *   negativeKeywords: Array<{word: string, count: number}>
 * }}
 */
export function analyzeFoodQuality(reviews = []) {
  const keywordCounts = { positive: {}, negative: {} };
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let scoreSum = 0;
  let totalMentions = 0;

  for (const review of reviews) {
    let text = (review.comment || '').toLowerCase();
    if (!text) continue;

    // Google-scraped reviews embed the reviewer name as a "[Name] " prefix — strip it.
    text = text.replace(/^\[[^\]]+\]\s*/, '');

    const foodHits = FOOD_KEYWORDS.reduce((sum, kw) => sum + countMatches(text, kw), 0);
    if (foodHits === 0) continue;

    totalMentions += 1;

    let negHits = 0;
    let posText = text;
    for (const kw of NEGATIVE_KEYWORDS) {
      const count = countMatches(text, kw);
      if (count > 0) {
        negHits += count;
        keywordCounts.negative[kw] = (keywordCounts.negative[kw] || 0) + count;
        // Remove negative phrases (e.g. "not tasty") so they don't also count as positive.
        posText = posText.replace(buildRegex(kw), ' ');
      }
    }

    let posHits = 0;
    for (const kw of POSITIVE_KEYWORDS) {
      const count = countMatches(posText, kw);
      if (count > 0) {
        posHits += count;
        keywordCounts.positive[kw] = (keywordCounts.positive[kw] || 0) + count;
      }
    }

    let sentiment;
    let sentimentValue;
    if (posHits > negHits) {
      sentiment = 'positive';
      sentimentValue = posHits - negHits >= 2 ? 5 : 4;
      positive += 1;
    } else if (negHits > posHits) {
      sentiment = 'negative';
      sentimentValue = negHits - posHits >= 2 ? 1 : 2;
      negative += 1;
    } else if (posHits > 0) {
      // Mixed signals (equal positive & negative words)
      sentiment = 'neutral';
      sentimentValue = 3;
      neutral += 1;
    } else {
      // No sentiment words — fall back to the review's star rating
      sentiment = 'neutral';
      const rating = Number(review.rating) || 3;
      if (rating >= 4) {
        sentiment = 'positive';
        sentimentValue = Math.max(4, rating);
        positive += 1;
      } else if (rating <= 2) {
        sentiment = 'negative';
        sentimentValue = Math.min(2, rating);
        negative += 1;
      } else {
        sentimentValue = 3;
        neutral += 1;
      }
    }

    // Blend food-sentiment with the review's own star rating for a nuanced score.
    const rating = Number(review.rating) || 3;
    scoreSum += 0.55 * sentimentValue + 0.45 * rating;
  }

  const toSortedKeywords = (map, limit) =>
    Object.entries(map)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
      .slice(0, limit);

  return {
    totalMentions,
    positive,
    neutral,
    negative,
    score: totalMentions > 0 ? Math.round((scoreSum / totalMentions) * 10) / 10 : null,
    positiveKeywords: toSortedKeywords(keywordCounts.positive, 4),
    negativeKeywords: toSortedKeywords(keywordCounts.negative, 3),
  };
}
