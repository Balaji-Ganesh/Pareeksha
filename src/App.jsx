import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

function App() {
  const [exams, setExams] = useState([])
  const [showCreator, setShowCreator] = useState(false)
  const [examName, setExamName] = useState('')
  const [examDate, setExamDate] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '', type: 'MCQ', options: ['', '', '', ''], correct: [], image: null
  })

  useEffect(() => {
    fetchExams()
  }, [])

  async function fetchExams() {
    const { data } = await supabase.from('exams').select('*').order('date')
    setExams(data || [])
  }

  function addQuestion() {
    if (currentQuestion.text.trim()) {
      setQuestions([...questions, { ...currentQuestion }])
      setCurrentQuestion({ text: '', type: 'MCQ', options: ['', '', '', ''], correct: [] })
    }
  }

  async function saveExam() {
    if (questions.length === 0) return alert('Add at least 1 question!')
    
    const newExam = {
      name: examName || `Mock ${exams.length + 1}`,
      date: new Date(examDate || Date.now() + 14*24*60*60*1000),
      creator: 'Person A',
      questions
    }
    
    const { error } = await supabase.from('exams').insert([newExam])
    if (!error) {
      alert('✅ Exam saved successfully!')
      fetchExams()
      setShowCreator(false)
      setExamName(''); setQuestions([])
    } else {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            🚀 GATE-Duel
          </h1>
          <p className="text-xl text-slate-300">Peer-to-peer GATE CS CBT platform</p>
        </div>
        
        {/* Main Content */}
        {!showCreator ? (
          <div>
            {/* Create Button */}
            <div className="flex justify-center mb-12">
              <button 
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-4 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                + Create New Exam
              </button>
            </div>

            {/* Exams Dashboard */}
            <div className="grid gap-6">
              {exams.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-2xl text-slate-400 mb-4">No exams yet</p>
                  <p className="text-slate-500">Create your first mock exam above!</p>
                </div>
              ) : (
                exams.map(exam => (
                  <div key={exam.id} className="group">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] shadow-2xl hover:shadow-3xl">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                            {exam.name}
                          </h2>
                          <p className="text-slate-300 text-lg">
                            By <span className="font-semibold text-blue-300">{exam.creator}</span> • 
                            {new Date(exam.date).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          new Date(exam.date) > new Date() 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {new Date(exam.date) > new Date() ? 'Upcoming' : 'Ready'}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                          Attempt Exam ({exam.questions.length} Qs)
                        </button>
                        <button className="px-8 py-4 border-2 border-slate-400/50 text-slate-300 hover:bg-slate-700/50 rounded-2xl font-semibold transition-all duration-300">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Exam Creator */
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  Create New Exam
                </h2>
                <button 
                  onClick={() => setShowCreator(false)}
                  className="text-3xl hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Exam Details */}
              <div className="space-y-6 mb-8">
                <input
                  type="text"
                  placeholder="Exam Name (e.g., Algorithms Mock 1)"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full p-5 bg-white/20 border border-white/30 rounded-2xl text-xl placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 backdrop-blur-lg"
                />
                
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full p-5 bg-white/20 border border-white/30 rounded-2xl text-lg placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 backdrop-blur-lg"
                />
              </div>

              {/* Question Editor */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 backdrop-blur-lg">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Question {questions.length + 1}
                </h3>
                
                <textarea
                  placeholder="Enter question here&#10;Supports markdown and code blocks (```cpp ... ```)"
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
                  className="w-full p-5 bg-white/10 border border-white/20 rounded-xl h-32 mb-6 resize-vertical text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-lg"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <select 
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value})}
                    className="p-4 bg-white/10 border border-white/20 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-lg"
                  >
                    <option>MCQ</option>
                    <option>MSQ</option>
                    <option>NAT</option>
                  </select>
                  
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="w-5 h-5 text-blue-600" />
                      <span className="text-lg text-slate-300">Image upload</span>
                    </label>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {currentQuestion.options.map((opt, i) => (
                    <input
                      key={i}
                      placeholder={`Option ${String.fromCharCode(65+i)}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...currentQuestion.options]
                        newOpts[i] = e.target.value
                        setCurrentQuestion({...currentQuestion, options: newOpts})
                      }}
                      className="p-4 bg-white/10 border border-white/20 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-lg"
                    />
                  ))}
                </div>

                {/* Correct Answer Selector */}
                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-xl font-semibold text-white mb-4">Correct Answer(s):</h4>
                  <div className="flex flex-wrap gap-4">
                    {currentQuestion.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                        <input
                          type={currentQuestion.type === 'MSQ' ? 'checkbox' : 'radio'}
                          name="correct"
                          checked={currentQuestion.correct.includes(i)}
                          onChange={(e) => {
                            let newCorrect = [...currentQuestion.correct]
                            if (currentQuestion.type === 'MCQ') newCorrect = [i]
                            else if (e.target.checked) newCorrect.push(i)
                            else newCorrect = newCorrect.filter(idx => idx !== i)
                            setCurrentQuestion({...currentQuestion, correct: newCorrect})
                          }}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-lg font-medium text-slate-200">
                          {String.fromCharCode(65+i)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={addQuestion}
                    disabled={!currentQuestion.text.trim()}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add Question
                  </button>
                  <button
                    onClick={saveExam}
                    disabled={questions.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    💾 Save Exam ({questions.length} Qs)
                  </button>
                </div>
              </div>

              {/* Questions Preview */}
              {questions.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
                  <h4 className="text-2xl font-bold text-white mb-4">
                    Preview ({questions.length} questions)
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {questions.map((q, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl text-slate-300 text-sm">
                        Q{i+1}: {q.text.slice(0, 60)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

