export default function ExamCard({ exam, onAttempt, onEdit, onDelete }) {
  return (
    <div className="card">
      <h3>{exam.name}</h3>

      <p style={{ fontSize: "14px", opacity: 0.8 }}>
        📅 {new Date(exam.date).toLocaleDateString()}
      </p>

      <p style={{ fontSize: "14px" }}>
        ⏱ Duration: {exam.duration || 90} minutes
      </p>

      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <button className="btn" onClick={() => onAttempt(exam)}>
          Attempt Exam
        </button>

        <button className="btn" onClick={() => onEdit(exam)}>
          Edit
        </button>

        <button className="btn" onClick={() => onDelete(exam.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
