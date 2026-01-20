import Dashboard from "./pages/Dashboard";

export default function App() {
  function handleCreate() {
    alert("Create page will be connected next");
  }

  function handleEdit(exam) {
    alert("Edit page will be connected next");
  }

  function handleAttempt(exam) {
    alert("Attempt page will be connected next");
  }

  return (
    <Dashboard
      onCreate={handleCreate}
      onEdit={handleEdit}
      onAttempt={handleAttempt}
    />
  );
}
