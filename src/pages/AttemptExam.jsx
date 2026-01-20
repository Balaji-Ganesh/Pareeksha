import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import MarkdownRenderer from "../components/MarkdownRenderer";
import Layout from "../components/Layout";
import { useLocation } from "react-router-dom";

export default function AttemptExam({ onFinish }) {
  const { state } = useLocation();
  const exam = state;
  const [timeLeft, setTimeLeft] = useState((exam.duration || 90) * 60);

  const [answers, setAnswers] = useState({});

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else {
      submitExam();
    }
  }, [timeLeft]);

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  async function submitExam() {
    const result = exam.questions.reduce(
      (acc, q, index) => {
        const userAnswer = answers[index] || [];
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
      {
        correct: 0,
        attempted: 0,
        total: exam.questions.length,
      }
    );

    const results = {
      attempted: result.attempted,
      correct: result.correct,
      incorrect: result.attempted - result.correct,
      unattempted: result.total - result.attempted,
      total: result.total,
      percentage: Math.round((result.correct / result.total) * 100),
    };

    await supabase.from("exams").update({ score: results }).eq("id", exam.id);

    onFinish(results, exam, answers);
  }

  return (
    <Layout title={exam.name}>
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h3>Time Left</h3>
        <h3>{formatTime(timeLeft)}</h3>
      </div>

      {exam.questions.map((question, qIndex) => (
        <div key={qIndex} className="card">
          <div style={{ marginBottom: "10px" }}>
            <b>Q{qIndex + 1}:</b>
            <div style={{ marginTop: "6px" }}>
              <MarkdownRenderer text={question.text} />
            </div>
          </div>

          {question.type !== "NAT" &&
            question.options.map((option, optIndex) => (
              <label key={optIndex} className="option-container">
                <input
                  type={question.type === "MSQ" ? "checkbox" : "radio"}
                  name={`q${qIndex}`}
                  checked={answers[qIndex]?.includes(optIndex) || false}
                  onChange={(e) => {
                    const newAnswers = {
                      ...answers,
                    };

                    if (!newAnswers[qIndex]) newAnswers[qIndex] = [];

                    if (question.type === "MCQ") {
                      newAnswers[qIndex] = e.target.checked ? [optIndex] : [];
                    } else {
                      if (e.target.checked) newAnswers[qIndex].push(optIndex);
                      else
                        newAnswers[qIndex] = newAnswers[qIndex].filter(
                          (i) => i !== optIndex
                        );
                    }

                    setAnswers(newAnswers);
                  }}
                />

                <span className="option-text">
                  <b>{String.fromCharCode(65 + optIndex)}.</b>{" "}
                  <MarkdownRenderer text={option} />
                </span>
              </label>
            ))}

          {question.type === "NAT" && (
            <input
              type="number"
              placeholder="Enter answer"
              value={answers[qIndex]?.[0] || ""}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [qIndex]: [Number(e.target.value)],
                })
              }
            />
          )}
        </div>
      ))}

      <button className="btn btn-green" onClick={submitExam}>
        Submit Exam
      </button>
    </Layout>
  );
}
