import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const ProblemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ status: string; pointsEarned: number; testCasesPassed: number; totalTestCases: number } | null>(null);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      const res = await api.get(`/problems/${id}`);
      if (res.data.success) {
        setProblem(res.data.data);
        if (res.data.data.submission) {
          setSubmissionResult(res.data.data.submission);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/problems/${id}/submit`, {
        code,
        language
      });
      if (res.data.success) {
        setSubmissionResult(res.data.data);
      } else {
        alert(res.data.error || 'Failed to submit code');
      }
    } catch (err: any) {
      if (err.message === 'ALREADY_SUBMITTED') {
        alert('You have already submitted a solution for this problem. Multiple submissions are not allowed.');
      } else {
        alert(err.message || 'Error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading problem...</div>;
  if (!problem) return <div className="text-center p-8">Problem not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col lg:flex-row gap-6">
      {/* Problem Description */}
      <div className="flex-1 bg-white shadow p-6 rounded-lg overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
        <div className="flex gap-4 mb-6 text-sm text-gray-500">
          <span>Points: {problem.points}</span>
          <span>Time Limit: {problem.timeLimit}s</span>
          <span>Memory Limit: {problem.memoryLimit}MB</span>
        </div>
        <div className="prose max-w-none text-gray-800">
          <p className="whitespace-pre-wrap">{problem.description}</p>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 bg-white shadow p-6 rounded-lg flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Code Editor</h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border p-1 rounded text-sm bg-gray-50"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>
        <textarea
          className="flex-1 w-full border border-gray-300 rounded p-4 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`// Write your ${language} code here...`}
          spellCheck={false}
        />
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            {submissionResult && (
              <div className={`p-3 rounded-md text-sm border flex flex-col gap-1 w-full ${submissionResult.testCasesPassed === submissionResult.totalTestCases ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                <p className="font-bold uppercase tracking-wider text-xs">Status: {submissionResult.status}</p>
                <div className="flex gap-4">
                  <span><strong>{submissionResult.pointsEarned}</strong> Points Earned</span>
                  <span><strong>{submissionResult.testCasesPassed}/{submissionResult.totalTestCases}</strong> Test Cases Passed</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleCodeSubmit}
            disabled={submitting || !!submissionResult}
            className={`px-6 py-2 rounded font-medium text-white shrink-0 disabled:opacity-50 ${!!submissionResult ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {!!submissionResult ? 'Already Submitted' : submitting ? 'Submitting...' : 'Submit Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
