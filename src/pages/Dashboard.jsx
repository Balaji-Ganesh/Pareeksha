import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import ExamCard from "../components/ExamCard";
import Layout from "../components/Layout";

export default function Dashboard({ onCreate, onEdit, onAttempt }) {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    const { data } = await supabase.from("exams").select("*").order("date");

    setExams(data || []);
  }

  async function deleteExam(id) {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    await supabase.from("exams").delete().eq("id", id);

    alert("Exam deleted successfully!");
    fetchExams();
  }

  return (
    <Layout title="🎯 GATE-Duel Dashboard">
      <button
        className="btn btn-green"
        style={{ marginBottom: "20px" }}
        onClick={onCreate}
      >
        + Create New Exam
      </button>

      <div className="grid">
        {exams.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            onAttempt={onAttempt}
            onEdit={onEdit}
            onDelete={deleteExam}
          />
        ))}
      </div>
    </Layout>
  );
}
