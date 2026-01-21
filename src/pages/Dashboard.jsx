import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import ExamCard from "../components/ExamCard";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">GATE-Duel Dashboard</h2>

        <Button onClick={onCreate}>+ Create New Exam</Button>
      </div>
      
      <div className="space-y-4">
        {exams.length === 0 && (
          <p className="text-gray-400">
            No exams created yet. Start by creating one!
          </p>
        )}

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
    </div>
  );
}
