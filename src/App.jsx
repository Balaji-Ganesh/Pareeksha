import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";
import AttemptExam from "./pages/AttemptExam";

export default function App() {
  const [mode, setMode] = useState("dashboard");
  const [examToEdit, setExamToEdit] = useState(null);
  const [examToAttempt, setExamToAttempt] = useState(null);

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

  function handleFinish() {
    setMode("dashboard");
  }

  if (mode === "create") {
    return (
      <CreateExam editExam={examToEdit} onBack={() => setMode("dashboard")} />
    );
  }

  if (mode === "attempt") {
    return <AttemptExam exam={examToAttempt} onFinish={handleFinish} />;
  }

  return (
    <Dashboard
      onCreate={handleCreate}
      onEdit={handleEdit}
      onAttempt={handleAttempt}
    />
  );
}
