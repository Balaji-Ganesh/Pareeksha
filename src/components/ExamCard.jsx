import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export default function ExamCard({ exam, onAttempt, onEdit, onDelete }) {
  return (
    <Card className="mb-4">
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{exam.name}</h3>

          <span className="text-sm text-gray-400">
            {new Date(exam.date).toLocaleDateString()}
          </span>
        </div>

        <div className="text-sm text-gray-300">
          Duration: {exam.duration || 90} minutes
        </div>

        <div className="flex gap-2 mt-3">
          <Button onClick={() => onAttempt(exam)}>Attempt Exam</Button>

          <Button variant="outline" onClick={() => onEdit(exam)}>
            Edit
          </Button>

          <Button variant="destructive" onClick={() => onDelete(exam.id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
