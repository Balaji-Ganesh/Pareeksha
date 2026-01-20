import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import Layout from "../components/Layout";
import { useLocation } from "react-router-dom";

export default function CreateExam({ onBack }) {
  const { state } = useLocation();
  const editExam = state || null;

  const [examName, setExamName] = useState(editExam?.name || "");
  const [examDate, setExamDate] = useState(editExam?.date?.split("T")[0] || "");
  const [examDuration, setExamDuration] = useState(editExam?.duration || 90);

  const [questions, setQuestions] = useState(editExam?.questions || []);

  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    type: "MCQ",
    options: ["", "", "", ""],
    correct: [],
  });

  const [editingIndex, setEditingIndex] = useState(null);

  function addQuestion() {
    if (!currentQuestion.text.trim()) {
      alert("Question text cannot be empty");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = { ...currentQuestion };
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, { ...currentQuestion }]);
    }

    setCurrentQuestion({
      text: "",
      type: "MCQ",
      options: ["", "", "", ""],
      correct: [],
    });
  }

  async function saveExam() {
    if (questions.length === 0) {
      alert("Add at least one question!");
      return;
    }

    const examData = {
      name: examName,
      date: examDate,
      duration: examDuration,
      creator: "Person A",
      questions,
    };

    let error;

    if (editExam) {
      const res = await supabase
        .from("exams")
        .update(examData)
        .eq("id", editExam.id);

      error = res.error;
    } else {
      const res = await supabase.from("exams").insert([examData]);

      error = res.error;
    }

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    alert(editExam ? "Exam updated!" : "Exam saved!");
    onBack();
  }

  return (
    <Layout title={editExam ? "Edit Exam" : "Create Exam"}>
      <input
        type="text"
        placeholder="Exam Name"
        value={examName}
        onChange={(e) => setExamName(e.target.value)}
      />

      <input
        type="date"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
      />

      <input
        type="number"
        placeholder="Duration in minutes"
        value={examDuration}
        onChange={(e) => setExamDuration(Number(e.target.value))}
      />

      <textarea
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
        value={currentQuestion.type}
        onChange={(e) =>
          setCurrentQuestion({
            ...currentQuestion,
            type: e.target.value,
          })
        }
      >
        <option value="MCQ">MCQ</option>
        <option value="MSQ">MSQ</option>
        <option value="NAT">NAT</option>
      </select>

      {currentQuestion.type !== "NAT" &&
        currentQuestion.options.map((opt, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={opt}
            onChange={(e) => {
              const newOpts = [...currentQuestion.options];
              newOpts[index] = e.target.value;

              setCurrentQuestion({
                ...currentQuestion,
                options: newOpts,
              });
            }}
          />
        ))}

      <button className="btn btn-green" onClick={addQuestion}>
        {editingIndex !== null ? "Update Question" : "Add Question"}
      </button>

      <button className="btn" style={{ marginLeft: "10px" }} onClick={saveExam}>
        Save Exam
      </button>

      <button className="btn" style={{ marginLeft: "10px" }} onClick={onBack}>
        Cancel
      </button>

      {questions.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Questions Added: {questions.length}</h3>

          {questions.map((q, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                Q{i + 1}: {q.text.substring(0, 50)}...
              </span>

              <div>
                <button
                  className="btn"
                  onClick={() => {
                    setCurrentQuestion({ ...q });
                    setEditingIndex(i);
                  }}
                >
                  Edit
                </button>

                <button
                  className="btn"
                  onClick={() => {
                    setQuestions(questions.filter((_, index) => index !== i));
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
