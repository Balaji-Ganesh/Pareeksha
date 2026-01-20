import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";
import AttemptExam from "./pages/AttemptExam";
import ReviewExam from "./pages/ReviewExam";

export default function App() {
  const [mode, setMode] = useState("dashboard");

  const [examToEdit, setExamToEdit] = useState(null);
  const [examToAttempt, setExamToAttempt] = useState(null);

  const [results, setResults] = useState(null);
  const [reviewExam, setReviewExam] = useState(null);
  const [reviewAnswers, setReviewAnswers] = useState(null);

  function handleCreate() {
    setExamToEdit(null);
    setMode("create");
  }

  function handleEdit(exam) {
    setExamToEdit(exam);
    setMode("create");
  }

  function handleAttempt(exam) {
    setExamToAttempt(exam);
    setMode("attempt");
  }

  function handleFinish(resultData, exam, answers) {
    setResults(resultData);
    setReviewExam(exam);
    setReviewAnswers(answers);
    setMode("review");
  }

  if (mode === "create") {
    return (
      <CreateExam editExam={examToEdit} onBack={() => setMode("dashboard")} />
    );
  }

  if (mode === "attempt") {
    return <AttemptExam exam={examToAttempt} onFinish={handleFinish} />;
  }

  if (mode === "review") {
    return (
      <ReviewExam
        exam={reviewExam}
        results={results}
        answers={reviewAnswers}
        onBack={() => setMode("dashboard")}
      />
    );
  }

  return (
    <Dashboard
      onCreate={handleCreate}
      onEdit={handleEdit}
      onAttempt={handleAttempt}
    />
  );
}
