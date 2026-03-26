// utils/aiService.js
const analyzeResume = async (jobSkills, resumeText) => {
  // Mock analysis
  const matched = jobSkills.filter(() => Math.random() > 0.3);
  const missing = jobSkills.filter(skill => !matched.includes(skill));
  const keywordScore = (matched.length / jobSkills.length) * 100;
  const semanticScore = Math.floor(Math.random() * (100 - keywordScore)) + keywordScore;
  const finalScore = Math.floor((semanticScore + keywordScore) / 2);

  return {
    final_score: finalScore,
    semantic_score: semanticScore,
    keyword_score: keywordScore,
    matched_keywords: matched,
    missing_keywords: missing,
    feedback: missing.map(m => `Add ${m}`)
  };
};

module.exports = { analyzeResume };