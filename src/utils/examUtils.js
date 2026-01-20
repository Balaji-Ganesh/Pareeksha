export function evaluateExam(showExam, answers) {
  return showExam.questions.reduce(
    (acc, q, qIndex) => {
      const userAnswer = answers[qIndex] || [];
      let isCorrect = false;

      if (q.type === "NAT") {
        isCorrect = userAnswer[0] === q.correct[0];
      } else {
        isCorrect =
          JSON.stringify([...userAnswer].sort()) ===
          JSON.stringify([...q.correct].sort());
      }

      return {
        correct: acc.correct + (isCorrect ? 1 : 0),
        attempted: acc.attempted + (userAnswer.length > 0 ? 1 : 0),
        total: acc.total + 1,
      };
    },
    { correct: 0, attempted: 0, total: showExam.questions.length }
  );
}
