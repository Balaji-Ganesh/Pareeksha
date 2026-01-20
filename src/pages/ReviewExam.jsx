import MarkdownRenderer from "../components/MarkdownRenderer";
import ResultSummary from "../components/ResultSummary";
import Layout from "../components/Layout";

export default function ReviewExam({ exam, results, answers, onBack }) {
  return (
    <Layout title="📊 Exam Analysis">
      <ResultSummary results={results} />

      <h3>Question Review</h3>

      {exam.questions.map((q, index) => {
        const userAnswer = answers[index] || [];
        const correctAnswer = q.correct || [];

        let status = "unattempted";
        let isCorrect = false;

        if (userAnswer.length > 0) {
          if (q.type === "NAT") {
            isCorrect = userAnswer[0] === correctAnswer[0];
          } else {
            isCorrect =
              JSON.stringify([...userAnswer].sort()) ===
              JSON.stringify([...correctAnswer].sort());
          }

          status = isCorrect ? "correct" : "incorrect";
        }

        return (
          <div key={index} className="card">
            <div style={{ marginBottom: "10px" }}>
              <b>Q{index + 1}:</b>
              <div style={{ marginTop: "6px" }}>
                <MarkdownRenderer text={q.text} />
              </div>
            </div>

            {q.type !== "NAT" &&
              q.options.map((opt, i) => {
                const isUser = userAnswer.includes(i);
                const isRight = correctAnswer.includes(i);

                let style = {};

                if (isRight) {
                  style = {
                    color: "#4ade80",
                    fontWeight: "bold",
                  };
                } else if (isUser && !isRight) {
                  style = {
                    color: "#f87171",
                    fontWeight: "bold",
                  };
                }

                return (
                  <div key={i} className="option-container" style={style}>
                    <span>
                      <b>{String.fromCharCode(65 + i)}.</b>{" "}
                      <MarkdownRenderer text={opt} />
                    </span>
                  </div>
                );
              })}

            {q.type === "NAT" && (
              <div>
                <p>Your Answer: {userAnswer[0] ?? "Not Attempted"}</p>
                <p>Correct Answer: {correctAnswer[0]}</p>
              </div>
            )}

            <div style={{ marginTop: "10px" }}>
              Status: {status === "correct" && "✅ Correct"}
              {status === "incorrect" && "❌ Incorrect"}
              {status === "unattempted" && "⚪ Unattempted"}
            </div>
          </div>
        );
      })}

      <button className="btn" onClick={onBack}>
        Back to Dashboard
      </button>
    </Layout>
  );
}
