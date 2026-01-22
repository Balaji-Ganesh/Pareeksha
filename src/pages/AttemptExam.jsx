import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function AttemptExam() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  // const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    async function loadExam() {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId);

      if (error || !data || data.length === 0) {
        return;
      }

      setExam(data[0]);
      setTimeLeft((data[0].duration || 90) * 60);
    }

    loadExam();
  }, [examId]);

  /* ---------------- Timer ---------------- */
  useEffect(() => {
    if (!exam) return;

    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, timeLeft]);

  // if (loading) return null;
  if (!exam)
    return (
      <div className="p-6 text-muted-foreground">
        Please wait, loading exam..!!
      </div>
    );

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  /* ---------------- Submit ---------------- */
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
      { correct: 0, attempted: 0, total: exam.questions.length },
    );

    const results = {
      ...result,
      incorrect: result.attempted - result.correct,
      unattempted: result.total - result.attempted,
      percentage: Math.round((result.correct / result.total) * 100),
    };

    // Save attempt later (next phase)
    navigate(`/review/${examId}`, {
      state: { results, answers },
    });
  }

  /* ---------------- UI ---------------- */
  // return <div className="p-6 text-white">ATTEMPT EXAM PAGE LOADED</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Sticky Header Wrapper */}
      <div className="sticky top-0 z-20 bg-background border-b">
        <div className="p-6">
          <Card className="p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{exam.name}</h2>

            <div className="text-2xl font-mono text-red-500 font-bold">
              ⏱ {formatTime(timeLeft)}
            </div>
          </Card>
        </div>
      </div>

      {/* Questions */}
      {exam.questions.map((q, qIndex) => (
        <Card key={qIndex} className="p-6 space-y-4">
          <div>
            <Label className="text-base font-semibold">Q{qIndex + 1}</Label>
            <div className="mt-2">
              <MarkdownRenderer text={q.text} />
            </div>
          </div>

          {/* MCQ / MSQ */}
          {q.type !== "NAT" && (
            <div className="space-y-2">
              {q.options.map((opt, optIndex) => {
                const checked = answers[qIndex]?.includes(optIndex) || false;

                return (
                  <label
                    key={optIndex}
                    className={[
                      "flex items-start gap-3 rounded-md border p-3 cursor-pointer",
                      "transition-colors",
                      checked
                        ? "border-blue-500 ring-1 ring-blue-500/40"
                        : "border-border hover:border-muted-foreground",
                    ].join(" ")}
                  >
                    <input
                      type={q.type === "MSQ" ? "checkbox" : "radio"}
                      name={`q-${qIndex}`}
                      checked={checked}
                      onChange={(e) => {
                        const newAnswers = { ...answers };
                        if (!newAnswers[qIndex]) newAnswers[qIndex] = [];

                        if (q.type === "MCQ") {
                          newAnswers[qIndex] = e.target.checked
                            ? [optIndex]
                            : [];
                        } else {
                          if (e.target.checked)
                            newAnswers[qIndex].push(optIndex);
                          else
                            newAnswers[qIndex] = newAnswers[qIndex].filter(
                              (i) => i !== optIndex,
                            );
                        }
                        setAnswers(newAnswers);
                      }}
                    />

                    <div>
                      <b>{String.fromCharCode(65 + optIndex)}.</b>{" "}
                      <MarkdownRenderer text={opt} />
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* NAT */}
          {q.type === "NAT" && (
            <input
              type="number"
              className="border rounded-md p-2 w-40"
              placeholder="Enter answer"
              value={answers[qIndex]?.[0] ?? ""}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [qIndex]: [Number(e.target.value)],
                })
              }
            />
          )}
        </Card>
      ))}

      {/* Submit */}
      <div className="pt-6">
        <Button
          variant="primary"
          className="w-full text-lg"
          onClick={submitExam}
        >
          Submit Exam
        </Button>
      </div>
    </div>
  );
}