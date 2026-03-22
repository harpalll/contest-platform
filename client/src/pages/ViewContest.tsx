import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const ViewContest = () => {
  const { id } = useParams<{ id: string }>();
  const [contest, setContest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqResults, setMcqResults] = useState<Record<string, { isCorrect: boolean; pointsEarned: number }>>({});

  useEffect(() => {
    fetchContest();
  }, [id]);

  const fetchContest = async () => {
    try {
      const res = await api.get(`/contests/${id}`);
      if (res.data.success) {
        setContest(res.data.data);
        if (res.data.data.mcqSubmissions && res.data.data.mcqSubmissions.length > 0) {
          const resultsMap: Record<string, { isCorrect: boolean; pointsEarned: number }> = {};
          const answersMap: Record<string, number> = {};
          res.data.data.mcqSubmissions.forEach((sub: any) => {
            resultsMap[sub.question_id] = { isCorrect: sub.is_correct, pointsEarned: sub.points_earned };
            answersMap[sub.question_id] = sub.selected_option_index;
          });
          setMcqResults(resultsMap);
          setMcqAnswers(answersMap);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMCQSubmit = async (questionId: string) => {
    const selectedOption = mcqAnswers[questionId];
    if (selectedOption === undefined) {
      alert('Please select an option first');
      return;
    }

    try {
      const res = await api.post(`/contests/${id}/mcq/${questionId}/submit`, {
        selectedOptionIndex: selectedOption
      });
      if (res.data.success) {
        setMcqResults((prev) => ({
          ...prev,
          [questionId]: res.data.data
        }));
      } else {
        alert(res.data.error || 'Failed to submit MCQ');
      }
    } catch (err: any) {
      if (err.message === 'ALREADY_SUBMITTED') {
        alert('You have already submitted an answer for this question.');
      } else {
        alert(err.message || 'Error occurred');
      }
    }
  };

  if (loading) return <div className="text-center p-8">Loading contest...</div>;
  if (!contest) return <div className="text-center p-8">Contest not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Header Info */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{contest.title}</h2>
        <p className="text-gray-600 mb-4">{contest.description}</p>
        <Link to={`/leaderboard/${id}`} className="text-blue-600 hover:underline font-medium">
          View Leaderboard
        </Link>
      </div>

      {/* MCQs */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4 border-b pb-2">Multiple Choice Questions</h3>
        {contest.mcqs && contest.mcqs.length > 0 ? (
          <div className="space-y-6">
            {contest.mcqs.map((mcq: any, i: number) => (
              <div key={mcq.id || i} className="p-4 border rounded-lg bg-gray-50">
                <p className="font-medium text-lg mb-3">{i + 1}. {mcq.questionText} <span className="text-sm text-gray-500">({mcq.points} pts)</span></p>
                <div className="space-y-2 mb-4">
                  {mcq.options.map((opt: string, optIdx: number) => (
                    <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`mcq-${mcq.id}`}
                        checked={mcqAnswers[mcq.id] === optIdx}
                        onChange={() => setMcqAnswers({ ...mcqAnswers, [mcq.id]: optIdx })}
                        disabled={!!mcqResults[mcq.id]}
                        className="text-blue-600 disabled:opacity-50"
                      />
                      <span className={mcqResults[mcq.id] ? 'opacity-60' : ''}>{opt}</span>
                    </label>
                  ))}
                </div>
                {!mcqResults[mcq.id] ? (
                  <button
                    onClick={() => handleMCQSubmit(mcq.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className={`p-3 rounded text-sm font-medium ${mcqResults[mcq.id].isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {mcqResults[mcq.id].isCorrect ? '✓ Correct Answer!' : '✗ Incorrect Answer'} 
                    <span className="ml-2 font-bold">(+{mcqResults[mcq.id].pointsEarned} pts)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No MCQs available yet.</p>
        )}
      </div>

      {/* DSA Problems */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4 border-b pb-2">DSA Problems</h3>
        {contest.dsaProblems && contest.dsaProblems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {contest.dsaProblems.map((prob: any) => (
              <div key={prob.id} className="border p-4 rounded-lg hover:shadow-md transition">
                <h4 className="font-bold text-lg mb-1">{prob.title}</h4>
                <div className="flex gap-2 mb-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Pts: {prob.points}</span>
                  {prob.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
                <Link
                  to={`/problem/${prob.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
                >
                  Solve Problem →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No DSA problems available yet.</p>
        )}
      </div>
    </div>
  );
};

export default ViewContest;
