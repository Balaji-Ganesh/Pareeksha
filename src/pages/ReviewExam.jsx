import { useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function ReviewExam({ onBack }) {
  const { state } = useLocation();
  const { exam, results, answers } = state;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Summary */}
      <Card className="p-6 space-y-3">
        <h2 className="text-xl font-semibold">Exam Analysis</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <b>Score</b>
            <div>{results.percentage}%</div>
          </div>
          <div>
            <b>Correct</b>
            <div>{results.correct}</div>
          </div>
          <div>
            <b>Incorrect</b>
            <div>{results.incorrect}</div>
          </div>
          <div>
            <b>Unattempted</b>
            <div>{results.unattempted}</div>
          </div>
        </div>
      </Card>

      {/* Question Review */}
      {exam.questions.map((q, qIndex) => {
        const userAnswer = answers[qIndex] || [];
        const correct = q.correct || [];

        let status = "unattempted";
        let isCorrect = false;

        if (userAnswer.length > 0) {
          if (q.type === "NAT") {
            isCorrect = userAnswer[0] === correct[0];
          } else {
            isCorrect =
              JSON.stringify([...userAnswer].sort()) ===
              JSON.stringify([...correct].sort());
          }
          status = isCorrect ? "correct" : "incorrect";
        }

        return (
          <Card key={qIndex} className="p-6 space-y-4">
            <div>
              <Label className="text-base font-semibold">Q{qIndex + 1}</Label>
              <div className="mt-2">
                <MarkdownRenderer text={q.text} />
              </div>
            </div>

            {/* Options */}
            {q.type !== "NAT" && (
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => {
                  const isUser = userAnswer.includes(optIndex);
                  const isRight = correct.includes(optIndex);

                  return (
                    <div
                      key={optIndex}
                      className={[
                        "rounded-md border p-3",
                        isRight && "border-green-500 bg-green-50",
                        isUser && !isRight && "border-red-500 bg-red-50",
                        !isUser && !isRight && "border-border",
                      ].join(" ")}
                    >
                      <b>{String.fromCharCode(65 + optIndex)}.</b>{" "}
                      <MarkdownRenderer text={opt} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* NAT */}
            {q.type === "NAT" && (
              <div className="space-y-1 text-sm">
                <div>
                  <b>Your Answer:</b> {userAnswer[0] ?? "—"}
                </div>
                <div>
                  <b>Correct Answer:</b> {correct[0]}
                </div>
              </div>
            )}

            <div className="text-sm font-medium">
              Status: {status === "correct" && "✅ Correct"}
              {status === "incorrect" && "❌ Incorrect"}
              {status === "unattempted" && "⚪ Unattempted"}
            </div>
          </Card>
        );
      })}

      {/* Back */}
      <div className="pt-4">
        <Button variant="outline" className="w-full" onClick={onBack}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
