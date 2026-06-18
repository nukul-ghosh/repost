/**
 * Basic content moderation filter (keyword-based for MVP)
 * In production, integrate with services like Perspective API or AWS Comprehend
 */

// Common profane/toxic keywords (abbreviated list for MVP)
const PROFANE_KEYWORDS = [
  // Add common profane words here (keeping list minimal for example)
  'badword1', 'badword2', 'offensive'
];

const SPAM_PATTERNS = [
  /\b(viagra|cialis|buy now|click here|limited time)\b/i,
  /\b\w+\.(com|net|org)\b/i, // URLs (basic detection)
  /(http|https):\/\//i,
  /\$\$\$/,
  /free money/i
];

/**
 * Check if content contains profanity
 * @param {string} content - Content to check
 * @returns {object} - { isProfane: boolean, confidence: number, matches: array }
 */
exports.checkProfanity = (content) => {
  const lowerContent = content.toLowerCase();
  const matches = PROFANE_KEYWORDS.filter(word =>
    lowerContent.includes(word.toLowerCase())
  );

  return {
    isProfane: matches.length > 0,
    confidence: matches.length > 0 ? 0.8 : 0,
    matches
  };
};

/**
 * Check if content is spam
 * @param {string} content - Content to check
 * @returns {object} - { isSpam: boolean, confidence: number, patterns: array }
 */
exports.checkSpam = (content) => {
  const matchedPatterns = [];

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.toString());
    }
  }

  // Check for excessive caps (>70% uppercase)
  const uppercaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (uppercaseRatio > 0.7 && content.length > 10) {
    matchedPatterns.push('excessive_caps');
  }

  return {
    isSpam: matchedPatterns.length > 0,
    confidence: matchedPatterns.length > 0 ? 0.7 : 0,
    patterns: matchedPatterns
  };
};

/**
 * Check if content is toxic (aggressive/hateful)
 * @param {string} content - Content to check
 * @returns {object} - { isToxic: boolean, confidence: number }
 */
exports.checkToxicity = (content) => {
  // Basic toxic keywords (very simplified for MVP)
  const toxicKeywords = ['hate', 'kill', 'die', 'stupid', 'idiot', 'loser'];
  const lowerContent = content.toLowerCase();

  const matches = toxicKeywords.filter(word =>
    lowerContent.includes(word)
  );

  // Check for excessive exclamation marks or question marks
  const excessivePunctuation = (content.match(/[!?]{3,}/g) || []).length > 0;

  return {
    isToxic: matches.length > 1 || (matches.length > 0 && excessivePunctuation),
    confidence: matches.length > 0 ? 0.6 : 0
  };
};

/**
 * Run full moderation check on content
 * @param {string} content - Content to check
 * @returns {object} - Combined moderation results
 */
exports.moderateContent = (content) => {
  const profanity = exports.checkProfanity(content);
  const spam = exports.checkSpam(content);
  const toxicity = exports.checkToxicity(content);

  return {
    isProfane: profanity.isProfane,
    isSpam: spam.isSpam,
    isToxic: toxicity.isToxic,
    confidence: Math.max(
      profanity.confidence,
      spam.confidence,
      toxicity.confidence
    ),
    shouldFlag: profanity.isProfane || spam.isSpam || toxicity.isToxic,
    details: {
      profanity: profanity.matches,
      spam: spam.patterns,
      toxicity: toxicity.confidence
    }
  };
};
