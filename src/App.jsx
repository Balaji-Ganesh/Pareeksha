import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";

export default function App() {
  const [mode, setMode] = useState("dashboard");
  const [examToEdit, setExamToEdit] = useState(null);

  function handleCreate() {
    setExamToEdit(null);
    setMode("create");
  }

  function handleEdit(exam) {
    setExamToEdit(exam);
    setMode("create");
  }

  function handleAttempt() {
    alert("Attempt page coming next");
  }

  return mode === "dashboard" ? (
    <Dashboard
      onCreate={handleCreate}
      onEdit={handleEdit}
      onAttempt={handleAttempt}
    />
  ) : (
    <CreateExam editExam={examToEdit} onBack={() => setMode("dashboard")} />
  );
}
