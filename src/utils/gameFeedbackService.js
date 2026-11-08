const POSITIVE_PREFIX = /^(?:đúng rồi|chính xác|tuyệt vời|rất giỏi|hoàn toàn chính xác)\s*[!.,…]?\s*/i;

export function buildAnswerFeedback(question, selectedOption) {
  const correctIndex = Number(question?.correctAnswer);
  const explanation = String(question?.explanation || '').trim();

  if (selectedOption === correctIndex) return explanation;

  const neutralExplanation = explanation.replace(POSITIVE_PREFIX, '').trim();
  const correctAnswer = question?.options?.[correctIndex];
  const correction = correctAnswer
    ? `Đáp án đúng là “${correctAnswer}”.`
    : 'Hãy xem đáp án được đánh dấu đúng.';

  return `Chưa đúng. ${correction}${neutralExplanation ? ` ${neutralExplanation}` : ''}`;
}
