import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  // ---------- CORE DATA STATE ----------
  const [exams, setExams] = useState([]);

  // ---------- UI MODE STATE ----------
  const [showCreator, setShowCreator] = useState(false);
  const [showExam, setShowExam] = useState(null);

  // ---------- EXAM ATTEMPT STATE ----------
  const [timeLeft, setTimeLeft] = useState(0); // [Default] 90 minutes in seconds
  const [answers, setAnswers] = useState({}); // user answers
  const [results, setResults] = useState(null); // final result summary
  const [reviewExam, setReviewExam] = useState(null);

  // ---------- EXAM CREATION STATE ----------
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [questions, setQuestions] = useState([]);
  const [examDuration, setExamDuration] = useState(90); // Default 90 minutes

  // ---------- EXAM EDITING STATE ----------
  const [editExam, setEditExam] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // Current question being designed
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    type: "MCQ",
    options: ["", "", "", ""],
    correct: [],
  });

  // Load exams from DB on first render
  useEffect(() => {
    fetchExams();
  }, []);

  // ---------- TIMER LOGIC ----------
  useEffect(() => {
    // Only run timer when an exam is active
    if (!showExam) return;

    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);

      return () => clearInterval(timer);
    }

    // Auto-submit when timer hits zero
    if (timeLeft === 0) {
      submitExam();
    }
  }, [showExam, timeLeft]);

  // Fetch all exams from Supabase
  async function fetchExams() {
    const { data } = await supabase.from("exams").select("*").order("date");

    setExams(data || []);
  }

  // Add the current question to exam being created
  function addQuestion() {
    if (!currentQuestion.text.trim()) {
      alert("Question text cannot be empty");
      return;
    }

    if (editingIndex !== null) {
      // UPDATE existing question
      const updated = [...questions];
      updated[editingIndex] = { ...currentQuestion };
      setQuestions(updated);

      setEditingIndex(null);
    } else {
      // ADD new question
      setQuestions([...questions, { ...currentQuestion }]);
    }

    // Reset editor
    setCurrentQuestion({
      text: "",
      type: "MCQ",
      options: ["", "", "", ""],
      correct: [],
    });
  }

  // Save newly created exam to database
  async function saveExam() {
    if (questions.length === 0) {
      alert("Add at least one question!");
      return;
    }

    const examData = {
      name: examName || `Mock ${exams.length + 1}`,
      date: examDate,
      duration: examDuration,
      creator: "Person A",
      questions,
    };
    let error;

    if (editExam) {
      // UPDATE existing exam
      const res = await supabase
        .from("exams")
        .update(examData)
        .eq("id", editExam.id);

      error = res.error;
    } else {
      // CREATE new exam
      const res = await supabase.from("exams").insert([examData]);

      error = res.error;
    }

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    alert(editExam ? "Exam updated!" : "Exam saved!");

    await fetchExams();

    // Reset all states
    setShowCreator(false);
    setExamDuration(90);
    setEditExam(null);
    setExamName("");
    setQuestions([]);
    setEditingIndex(null);
  }

  // ---------- CREATED EXAM ATTEMPT FUNCTIONS ----------
  // Editing functionality of created exam.
  function openEditExam(exam) {
    setEditExam(exam);
    setExamDuration(exam.duration || 90); // with default of 90
    setExamName(exam.name);
    setExamDate(exam.date.split("T")[0]);
    setQuestions([...exam.questions]);
    setShowCreator(true);
  }

  // Deleting of created exam
  async function deleteExam(id) {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    await supabase.from("exams").delete().eq("id", id);

    alert("Exam deleted successfully!");
    fetchExams();
  }

  // ---------- EXAM ATTEMPT FUNCTIONS ----------

  // Start attempting a particular exam
  function startExam(exam) {
    setShowExam(exam);

    const minutes = exam.duration || 90;
    setTimeLeft(minutes * 60);

    setAnswers({});
    setResults(null);
  }

  // Core evaluation logic
  function evaluateExam() {
    if (!showExam) return null;

    let attempted = 0;
    let correct = 0;
    const total = showExam.questions.length;

    showExam.questions.forEach((q, index) => {
      const userAnswer = answers[index] || [];

      if (userAnswer.length > 0) {
        attempted++;
      }

      let isCorrect = false;

      // NAT questions: direct value match
      if (q.type === "NAT") {
        isCorrect = userAnswer[0] === q.correct[0];
      } else {
        // MCQ/MSQ: compare sorted arrays
        isCorrect =
          JSON.stringify([...userAnswer].sort()) ===
          JSON.stringify([...q.correct].sort());
      }

      if (isCorrect) correct++;
    });

    return {
      attempted,
      correct,
      incorrect: attempted - correct,
      unattempted: total - attempted,
      total,
      percentage: Math.round((correct / total) * 100),
    };
  }

  // Submit current exam and calculate results
  async function submitExam() {
    if (!showExam) return;

    const resultData = evaluateExam();

    // Store exam separately for review
    setReviewExam(showExam);

    setResults(resultData);

    await supabase
      .from("exams")
      .update({ score: resultData })
      .eq("id", showExam.id);

    await fetchExams();

    // Clear attempt mode but keep reviewExam intact
    setShowExam(null);
  }

  // Convert seconds to MM:SS format
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  // ---------- EXAM ATTEMPT UI ----------
  if (showExam) {
    return (
      <div className="container">
        <div
          className="card"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <h2>{showExam.name}</h2>
          <h2 style={{ color: "#f87171" }}>⏱ {formatTime(timeLeft)}</h2>
        </div>
        {showExam.questions.map((question, qIndex) => (
          <div key={qIndex} className="card">
            <div>
              <b>Q{qIndex + 1}:</b> {question.text}
            </div>

            {/* Render MCQ/MSQ Options Only */}
            {question.type !== "NAT" &&
              question.options.map((option, optIndex) => (
                <div key={optIndex} className="option-row">
                  <label>
                    <input
                      type={question.type === "MSQ" ? "checkbox" : "radio"}
                      name={`q${qIndex}`}
                      checked={answers[qIndex]?.includes(optIndex) || false}
                      onChange={(e) => {
                        const newAnswers = { ...answers };

                        if (!newAnswers[qIndex]) {
                          newAnswers[qIndex] = [];
                        }

                        if (question.type === "MCQ") {
                          newAnswers[qIndex] = e.target.checked
                            ? [optIndex]
                            : [];
                        } else {
                          if (e.target.checked) {
                            newAnswers[qIndex].push(optIndex);
                          } else {
                            newAnswers[qIndex] = newAnswers[qIndex].filter(
                              (i) => i !== optIndex,
                            );
                          }
                        }

                        setAnswers(newAnswers);
                      }}
                    />
                    {String.fromCharCode(65 + optIndex)}: {option}
                  </label>
                </div>
              ))}

            {/* Render Numeric Input for NAT */}
            {question.type === "NAT" && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="number"
                  placeholder="Enter numerical answer"
                  value={answers[qIndex]?.[0] || ""}
                  onChange={(e) => {
                    setAnswers({
                      ...answers,
                      [qIndex]: [Number(e.target.value)],
                    });
                  }}
                  style={{
                    padding: "8px",
                    width: "200px",
                  }}
                />
              </div>
            )}
          </div>
        ))}

        <button className="btn btn-green" onClick={submitExam}>
          Submit Exam
        </button>

        <button
          className="btn"
          onClick={() => setShowExam(null)}
          style={{ marginLeft: "10px" }}
        >
          Exit Exam
        </button>
      </div>
    );
  }

  // ---------- RESULT SCREEN ----------
  if (results) {
    return (
      <div className="container">
        <h2 style={{ textAlign: "center" }}>📊 Exam Analysis</h2>

        {/* Summary Card */}
        <div className="card">
          <h3>Score: {results.percentage}%</h3>

          <p>🟢 Attempted: {results.attempted}</p>
          <p>✅ Correct: {results.correct}</p>
          <p>❌ Incorrect: {results.incorrect}</p>
          <p>⚪ Not Attempted: {results.unattempted}</p>

          <p>Total Questions: {results.total}</p>
        </div>

        {/* Detailed Question Review */}
        <h3>Question Review</h3>

        {reviewExam?.questions.map((q, index) => {
          const userAnswer = answers[index] || [];
          const correctAnswer = q.correct || [];

          let status = "unattempted";
          let isCorrect = false;

          if (userAnswer.length > 0) {
            status = "attempted";

            if (q.type === "NAT") {
              isCorrect = userAnswer[0] === correctAnswer[0];
            } else {
              isCorrect =
                JSON.stringify([...userAnswer].sort()) ===
                JSON.stringify([...correctAnswer].sort());
            }

            if (isCorrect) status = "correct";
            else status = "incorrect";
          }

          return (
            <div key={index} className="card">
              <div>
                <b>Q{index + 1}:</b> {q.text}
              </div>

              {q.type !== "NAT" &&
                q.options.map((opt, i) => {
                  const isUser = userAnswer.includes(i);
                  const isRight = correctAnswer.includes(i);

                  let style = {};

                  if (isRight) {
                    style = { color: "#4ade80", fontWeight: "bold" };
                  } else if (isUser && !isRight) {
                    style = { color: "#f87171", fontWeight: "bold" };
                  }

                  return (
                    <div key={i} style={style}>
                      {String.fromCharCode(65 + i)}: {opt}
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

        <button
          className="btn"
          onClick={() => {
            setResults(null);
            setReviewExam(null);
            fetchExams();
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ---------- DASHBOARD + EXAM CREATOR UI ----------
  return (
    <div className="container">
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        🎯 GATE-Duel Dashboard
      </h1>

      {!showCreator && (
        <>
          <button
            className="btn btn-green"
            onClick={() => setShowCreator(true)}
          >
            + Create New Exam
          </button>

          {exams.map((exam) => (
            <div key={exam.id} className="card">
              <h3>{exam.name}</h3>

              <p style={{ fontSize: "14px", opacity: 0.8 }}>
                📅 {new Date(exam.date).toLocaleDateString()}
              </p>
              <p style={{ fontSize: "14px", opacity: 0.8 }}>
                ⏱ Duration: {exam.duration || 90} minutes
              </p>

              {exam.score && (
                <p style={{ fontSize: "14px", marginTop: "6px" }}>
                  🏆 Last Score: {exam.score.percentage}%
                </p>
              )}

              <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                <button className="btn" onClick={() => startExam(exam)}>
                  Attempt Exam
                </button>

                <button className="btn" onClick={() => openEditExam(exam)}>
                  Edit
                </button>

                <button className="btn" onClick={() => deleteExam(exam.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {showCreator && (
        <div className="card">
          <h2>Create Exam</h2>

          {/* Exam basic details */}
          <input
            type="text"
            placeholder="Exam Name"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />

          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <input
            type="number"
            placeholder="Duration in minutes"
            value={examDuration}
            onChange={(e) => setExamDuration(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
            }}
          />

          <hr style={{ margin: "10px 0" }} />

          {/* Question Designer */}
          <h3>Add Question</h3>

          <textarea
            placeholder="Enter question text"
            value={currentQuestion.text}
            onChange={(e) =>
              setCurrentQuestion({
                ...currentQuestion,
                text: e.target.value,
              })
            }
            style={{
              width: "100%",
              height: "100px",
              padding: "8px",
              marginBottom: "10px",
            }}
          />

          {/* Question Type */}
          <select
            value={currentQuestion.type}
            onChange={(e) =>
              setCurrentQuestion({
                ...currentQuestion,
                type: e.target.value,
              })
            }
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          >
            <option value="MCQ">MCQ</option>
            <option value="MSQ">MSQ</option>
            <option value="NAT">NAT</option>
          </select>

          {/* Options (Only for MCQ/MSQ) */}
          {currentQuestion.type !== "NAT" && (
            <div style={{ marginBottom: "10px" }}>
              {currentQuestion.options.map((opt, index) => (
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
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "5px",
                  }}
                />
              ))}
            </div>
          )}

          {/* Correct Answer Selection */}
          {currentQuestion.type !== "NAT" && (
            <div style={{ marginBottom: "10px" }}>
              <b>Select Correct Answer:</b>

              {currentQuestion.options.map((_, index) => (
                <label key={index} style={{ marginLeft: "10px" }}>
                  <input
                    type={currentQuestion.type === "MSQ" ? "checkbox" : "radio"}
                    name="correct"
                    checked={currentQuestion.correct.includes(index)}
                    onChange={() => {
                      if (currentQuestion.type === "MCQ") {
                        setCurrentQuestion({
                          ...currentQuestion,
                          correct: [index],
                        });
                      } else {
                        let newCorrect = [...currentQuestion.correct];

                        if (newCorrect.includes(index)) {
                          newCorrect = newCorrect.filter((i) => i !== index);
                        } else {
                          newCorrect.push(index);
                        }

                        setCurrentQuestion({
                          ...currentQuestion,
                          correct: newCorrect,
                        });
                      }
                    }}
                  />
                  {String.fromCharCode(65 + index)}
                </label>
              ))}
            </div>
          )}

          {/* For NAT type: correct numeric answer */}
          {currentQuestion.type === "NAT" && (
            <div style={{ marginBottom: "10px" }}>
              <input
                type="number"
                placeholder="Correct numeric answer"
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    correct: [Number(e.target.value)],
                  })
                }
                style={{ padding: "8px", width: "100%" }}
              />
            </div>
          )}

          <button className="btn btn-green" onClick={addQuestion}>
            {editingIndex !== null ? "Update Question" : "Add Question"}
          </button>

          <button
            className="btn"
            style={{ marginLeft: "10px" }}
            onClick={saveExam}
          >
            Save Exam
          </button>

          <button
            className="btn"
            style={{ marginLeft: "10px" }}
            onClick={() => setShowCreator(false)}
          >
            Cancel
          </button>

          {/* Preview of questions added so far */}
          {questions.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Questions Added: {questions.length}</h3>

              {questions.map((q, i) => (
                <div
                  key={i}
                  style={{
                    marginTop: "5px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    Q{i + 1}: {q.text.substring(0, 50)}...
                  </span>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="btn"
                      onClick={() => {
                        // Load selected question into editor
                        setCurrentQuestion({ ...q });
                        setEditingIndex(i);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="btn"
                      onClick={() => {
                        const updated = questions.filter(
                          (_, index) => index !== i,
                        );
                        setQuestions(updated);

                        // Reset editor if deleting the one being edited
                        if (editingIndex === i) {
                          setCurrentQuestion({
                            text: "",
                            type: "MCQ",
                            options: ["", "", "", ""],
                            correct: [],
                          });
                          setEditingIndex(null);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
