import { useState } from "react";
import { supabase } from "../services/supabaseClient";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";

export default function CreateExam({ onBack, editExam = null }) {
  const [examName, setExamName] = useState(editExam?.name || "");
  const [examDate, setExamDate] = useState(editExam?.date?.split("T")[0] || "");
  const [examDuration, setExamDuration] = useState(editExam?.duration || 90);

  const [questions, setQuestions] = useState(editExam?.questions || []);

  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    type: "MCQ",
    options: ["", "", "", ""],
    correct: [],
  });

  const [editingIndex, setEditingIndex] = useState(null);

  function addQuestion() {
    if (!currentQuestion.text.trim()) {
      alert("Question text cannot be empty");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = { ...currentQuestion };
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, { ...currentQuestion }]);
    }

    setCurrentQuestion({
      text: "",
      type: "MCQ",
      options: ["", "", "", ""],
      correct: [],
    });
  }

  async function saveExam() {
    if (questions.length === 0) {
      alert("Add at least one question!");
      return;
    }

    const examData = {
      name: examName,
      date: examDate,
      duration: examDuration,
      creator: "Person A",
      questions,
    };

    let error;

    if (editExam) {
      const res = await supabase
        .from("exams")
        .update(examData)
        .eq("id", editExam.id);

      error = res.error;
    } else {
      const res = await supabase.from("exams").insert([examData]);

      error = res.error;
    }

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    alert(editExam ? "Exam updated!" : "Exam saved!");
    onBack();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">
        {editExam ? "Edit Exam" : "Create Exam"}
      </h2>

      <Card className="p-6 space-y-5">
        <div className="space-y-2">
          <Label>Exam Name</Label>
          <Input
            placeholder="Enter exam name"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={examDuration}
              onChange={(e) => setExamDuration(Number(e.target.value))}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Question Editor</h3>

        <div className="space-y-2">
          <Label>Question Text (Markdown Supported)</Label>
          <Textarea
            placeholder="Type your question here..."
            value={currentQuestion.text}
            onChange={(e) =>
              setCurrentQuestion({
                ...currentQuestion,
                text: e.target.value,
              })
            }
          />
        </div>

        <select
          className="border p-2 rounded"
          value={currentQuestion.type}
          onChange={(e) =>
            setCurrentQuestion({
              ...currentQuestion,
              type: e.target.value,
            })
          }
        >
          <option value="MCQ">MCQ</option>
          <option value="MSQ">MSQ</option>
          <option value="NAT">NAT</option>
        </select>

        {currentQuestion.type !== "NAT" &&
          currentQuestion.options.map((opt, index) => (
            <Input
              key={index}
              placeholder={`Option ${index + 1}`}
              value={opt}
              onChange={(e) => {
                const newOpts = [...currentQuestion.options];
                newOpts[index] = e.target.value;

                setCurrentQuestion({
                  ...currentQuestion,
                  options: newOpts,
                });
              }}
            />
          ))}

        {currentQuestion.type !== "NAT" && (
          <div>
            <b>Select Correct Answer:</b>

            {currentQuestion.options.map((_, index) => (
              <label key={index} className="ml-3">
                <input
                  type={currentQuestion.type === "MSQ" ? "checkbox" : "radio"}
                  checked={currentQuestion.correct.includes(index)}
                  onChange={() => {
                    if (currentQuestion.type === "MCQ") {
                      setCurrentQuestion({
                        ...currentQuestion,
                        correct: [index],
                      });
                    } else {
                      let newCorrect = [...currentQuestion.correct];

                      if (newCorrect.includes(index))
                        newCorrect = newCorrect.filter((i) => i !== index);
                      else newCorrect.push(index);

                      setCurrentQuestion({
                        ...currentQuestion,
                        correct: newCorrect,
                      });
                    }
                  }}
                />
                {String.fromCharCode(65 + index)}
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={addQuestion}>
            {editingIndex !== null ? "Update Question" : "Add Question"}
          </Button>

          <Button onClick={saveExam}>Save Exam</Button>

          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
        </div>
      </Card>

      {questions.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold">Questions Added: {questions.length}</h3>

          {questions.map((q, i) => (
            <div key={i} className="flex justify-between mt-2">
              <span>
                Q{i + 1}: {q.text.substring(0, 50)}...
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentQuestion({
                      ...q,
                    });
                    setEditingIndex(i);
                  }}
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  onClick={() =>
                    setQuestions(questions.filter((_, index) => index !== i))
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
