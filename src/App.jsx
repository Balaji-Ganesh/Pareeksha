import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AttemptExam from "./pages/AttemptExam";
import ReviewExam from "./pages/ReviewExam";
import CreateExam from "./pages/CreateExam";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateExam />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attempt"
        element={
          <ProtectedRoute>
            <AttemptExam />
          </ProtectedRoute>
        }
      />

      <Route
        path="/review"
        element={
          <ProtectedRoute>
            <ReviewExam />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
