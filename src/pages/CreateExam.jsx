import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

export default function CreateExam() {
  /* ---------------- Routing ---------------- */
  const { examId } = useParams(); // present -means→ edit mode
  const isEdit = Boolean(examId);
  const navigate = useNavigate();

  /* ---------------- Exam State ---------------- */
  const [exam, setExam] = useState(null);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(90);
  const [questions, setQuestions] = useState([]);

  /* ---------------- Question Editor State ---------------- */
  const emptyQuestion = {
    text: "",
    type: "MCQ",
    options: ["", "", "", ""],
    correct: [],
  };

  const [currentQuestion, setCurrentQuestion] = useState(emptyQuestion);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

  /* ---------------- Load Exam (Edit Mode) ---------------- */
  useEffect(() => {
    if (!isEdit) return;

    async function loadExam() {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId);

      if (error || !data || data.length === 0) {
        navigate("/dashboard", { replace: true });
        return;
      }

      const e = data[0];
      setExam(e);
      setName(e.name || "");
      setDate(e.date?.slice(0, 10) || "");
      setDuration(e.duration || 90);
      setQuestions(e.questions || []);
    }

    loadExam();
  }, [examId, isEdit, navigate]);

  /* ---------------- Question Actions ---------------- */
  function saveQuestion() {
    if (!currentQuestion.text.trim()) {
      alert("Question text cannot be empty.");
      return;
    }

    if (
      currentQuestion.type !== "NAT" &&
      currentQuestion.correct.length === 0
    ) {
      alert("Select at least one correct option.");
      return;
    }

    if (editingQuestionIndex !== null) {
      const updated = [...questions];
      updated[editingQuestionIndex] = currentQuestion;
      setQuestions(updated);
    } else {
      setQuestions([...questions, currentQuestion]);
    }

    resetEditor();
  }

  function editQuestion(index) {
    setCurrentQuestion(questions[index]);
    setEditingQuestionIndex(index);
  }

  function deleteQuestion(index) {
    if (!window.confirm("Delete this question?")) return;

    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);

    if (editingQuestionIndex === index) {
      resetEditor();
    }
  }

  function resetEditor() {
    setCurrentQuestion(emptyQuestion);
    setEditingQuestionIndex(null);
  }

  /* ---------------- Save Exam ---------------- */
async function saveExam() {
  if (!name || questions.length === 0) {
    alert("Exam name and at least one question are required.");
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    name,
    date,
    duration,
    questions,
    creator: user.id,
  };

  if (isEdit) {
    const { error } = await supabase
      .from("exams")
      .update(payload)
      .eq("id", examId);

    if (error) {
      console.error("Update failed:", error);
      alert(error.message);
      return;
    }
  } else {
    const { data, error } = await supabase
      .from("exams")
      .insert([payload])
      .select();

    console.log("Insert response:", data, error);

    if (error) {
      console.error("Insert failed:", error);
      alert(error.message);
      return;
    }
  }

  navigate("/dashboard");
}


  /* ---------------- Guard (Edit Mode) ---------------- */
  if (isEdit && !exam) {
    return <div className="p-6 text-muted-foreground">Loading exam…</div>;
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">
        {isEdit ? "Edit Exam" : "Create Exam"}
      </h2>

      {/* Exam Meta */}
      <Card className="p-4 space-y-3">
        <Input
          placeholder="Exam Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(+e.target.value)}
        />
      </Card>

      {/* Question Editor */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">
          {editingQuestionIndex !== null
            ? `Edit Question ${editingQuestionIndex + 1}`
            : "Add Question"}
        </h3>

        <Textarea
          placeholder="Question text"
          value={currentQuestion.text}
          onChange={(e) =>
            setCurrentQuestion({
              ...currentQuestion,
              text: e.target.value,
            })
          }
        />

        <select
          className="border rounded p-2 w-fit"
          value={currentQuestion.type}
          onChange={(e) =>
            setCurrentQuestion({
              ...currentQuestion,
              type: e.target.value,
              correct: [],
            })
          }
        >
          <option value="MCQ">MCQ</option>
          <option value="MSQ">MSQ</option>
          <option value="NAT">NAT</option>
        </select>

        {currentQuestion.type !== "NAT" &&
          currentQuestion.options.map((opt, i) => (
            <Input
              key={i}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const options = [...currentQuestion.options];
                options[i] = e.target.value;
                setCurrentQuestion({
                  ...currentQuestion,
                  options,
                });
              }}
            />
          ))}

        {currentQuestion.type !== "NAT" && (
          <div className="flex gap-4 flex-wrap">
            {currentQuestion.options.map((_, i) => (
              <label key={i} className="flex items-center gap-1">
                <input
                  type={currentQuestion.type === "MSQ" ? "checkbox" : "radio"}
                  checked={currentQuestion.correct.includes(i)}
                  onChange={() => {
                    if (currentQuestion.type === "MCQ") {
                      setCurrentQuestion({
                        ...currentQuestion,
                        correct: [i],
                      });
                    } else {
                      setCurrentQuestion({
                        ...currentQuestion,
                        correct: currentQuestion.correct.includes(i)
                          ? currentQuestion.correct.filter((c) => c !== i)
                          : [...currentQuestion.correct, i],
                      });
                    }
                  }}
                />
                {String.fromCharCode(65 + i)}
              </label>
            ))}
          </div>
        )}

        {currentQuestion.type === "NAT" && (
          <Input
            type="number"
            placeholder="Correct numeric answer"
            value={currentQuestion.correct[0] ?? ""}
            onChange={(e) =>
              setCurrentQuestion({
                ...currentQuestion,
                correct: [Number(e.target.value)],
              })
            }
          />
        )}

        <div className="flex gap-2">
          <Button variant="primary" onClick={saveQuestion}>
            {editingQuestionIndex !== null ? "Update Question" : "Add Question"}
          </Button>

          {editingQuestionIndex !== null && (
            <Button variant="outline" onClick={resetEditor}>
              Cancel Edit
            </Button>
          )}
        </div>
      </Card>

      {/* Question List */}
      <Card className="p-4 space-y-2">
        <h3 className="font-semibold">Questions ({questions.length})</h3>

        {questions.map((q, i) => (
          <div
            key={i}
            className="flex justify-between items-center border rounded p-2"
          >
            <span>
              Q{i + 1}: {q.text.slice(0, 60)}…
            </span>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => editQuestion(i)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => deleteQuestion(i)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="primary" onClick={saveExam}>
          {isEdit ? "Update Exam" : "Save Exam"}
        </Button>

        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
