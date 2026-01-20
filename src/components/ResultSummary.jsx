export default function ResultSummary({ results }) {
  return (
    <div className="card">
      <h3>Score: {results.percentage}%</h3>

      <p>🟢 Attempted: {results.attempted}</p>
      <p>✅ Correct: {results.correct}</p>
      <p>❌ Incorrect: {results.incorrect}</p>
      <p>⚪ Not Attempted: {results.unattempted}</p>

      <p>Total Questions: {results.total}</p>
    </div>
  );
}
