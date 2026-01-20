import { Routes, Route, useNavigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";
import AttemptExam from "./pages/AttemptExam";
import ReviewExam from "./pages/ReviewExam";

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Dashboard
            onCreate={() => navigate("/create")}
            onEdit={(exam) => navigate(`/edit/${exam.id}`, { state: exam })}
            onAttempt={(exam) =>
              navigate(`/attempt/${exam.id}`, { state: exam })
            }
          />
        }
      />

      <Route
        path="/create"
        element={<CreateExam onBack={() => navigate("/")} />}
      />

      <Route
        path="/edit/:id"
        element={<CreateExam onBack={() => navigate("/")} />}
      />

      <Route
        path="/attempt/:id"
        element={
          <AttemptExam
            onFinish={(results, exam, answers) =>
              navigate(`/review/${exam.id}`, {
                state: { results, exam, answers },
              })
            }
          />
        }
      />

      <Route
        path="/review/:id"
        element={<ReviewExam onBack={() => navigate("/")} />}
      />
    </Routes>
  );
}
