import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const ContestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [contest, setContest] = useState<any>(null);
  
  // MCQ Form State
  const [mcqText, setMcqText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [mcqPoints, setMcqPoints] = useState(10);
  
  // DSA Form State
  const [dsaTitle, setDsaTitle] = useState('');
  const [dsaDesc, setDsaDesc] = useState('');
  const [dsaTags, setDsaTags] = useState('');
  const [dsaPoints, setDsaPoints] = useState(50);
  const [dsaTimeLimit, setDsaTimeLimit] = useState(2);
  const [dsaMemoryLimit, setDsaMemoryLimit] = useState(256);
  const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '', isHidden: false }]);

  useEffect(() => {
    fetchContest();
  }, [id]);

  const fetchContest = async () => {
    try {
      const res = await api.get(`/contests/${id}`);
      if (res.data.success) {
        setContest(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMCQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/contests/${id}/mcq`, {
        questionText: mcqText,
        options,
        correctOptionIndex,
        points: mcqPoints
      });
      if (res.data.success) {
        alert('MCQ Added successfully!');
        setMcqText('');
        setOptions(['', '', '', '']);
      } else {
        alert(res.data.error || 'Failed to add MCQ');
      }
    } catch (err: any) {
        alert(err.message || 'Error occurred');
    }
  };

  const handleAddDSA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (testCases.length === 0) {
        alert('Please add at least one test case.');
        return;
      }

      const res = await api.post(`/contests/${id}/dsa`, {
        title: dsaTitle,
        description: dsaDesc,
        tags: dsaTags.split(',').map(t => t.trim()),
        points: dsaPoints,
        timeLimit: dsaTimeLimit,
        memoryLimit: dsaMemoryLimit,
        testCases
      });
      if (res.data.success) {
        alert('DSA Problem Added successfully!');
        setDsaTitle('');
        setDsaDesc('');
        setTestCases([{ input: '', expectedOutput: '', isHidden: false }]);
      } else {
        alert(res.data.error || 'Failed to add DSA Problem');
      }
    } catch (err: any) {
        alert(err.message || 'Error occurred');
    }
  };

  const updateOption = (index: number, val: string) => {
    const newOptions = [...options];
    newOptions[index] = val;
    setOptions(newOptions);
  };

  const updateTestCase = (index: number, field: string, val: any) => {
    const newTcs = [...testCases];
    newTcs[index] = { ...newTcs[index], [field]: val };
    setTestCases(newTcs);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
  };

  const removeTestCase = (index: number) => {
    const newTcs = testCases.filter((_, i) => i !== index);
    setTestCases(newTcs);
  };

  if (!contest && user?.role === 'creator') return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-2">Contest: {contest?.title || 'Unknown'}</h2>
        <p className="text-gray-600 mb-4">{contest?.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ADD MCQ FORM */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Add MCQ Question</h3>
          <form onSubmit={handleAddMCQ} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Question Text</label>
              <textarea
                required
                className="mt-1 w-full border p-2 rounded"
                value={mcqText}
                onChange={e => setMcqText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Options</label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOptionIndex === idx}
                    onChange={() => setCorrectOptionIndex(idx)}
                    title="Mark as correct"
                  />
                  <input
                    type="text"
                    required
                    className="flex-1 border p-1 rounded text-sm"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={e => updateOption(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium">Points</label>
              <input
                type="number"
                required
                className="mt-1 w-full border p-2 rounded"
                value={mcqPoints}
                onChange={e => setMcqPoints(Number(e.target.value))}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Add MCQ
            </button>
          </form>
        </div>

        {/* ADD DSA FORM */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Add DSA Problem</h3>
          <form onSubmit={handleAddDSA} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Problem Title</label>
              <input type="text" required className="mt-1 w-full border p-2 rounded" value={dsaTitle} onChange={e => setDsaTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea required className="mt-1 w-full border p-2 rounded" value={dsaDesc} onChange={e => setDsaDesc(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Tags (comma separated)</label>
              <input type="text" className="mt-1 w-full border p-2 rounded" value={dsaTags} onChange={e => setDsaTags(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium">Points</label>
                <input type="number" required className="w-full border p-1 rounded" value={dsaPoints} onChange={e => setDsaPoints(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium">Time (s)</label>
                <input type="number" required className="w-full border p-1 rounded" value={dsaTimeLimit} onChange={e => setDsaTimeLimit(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium">Mem (MB)</label>
                <input type="number" required className="w-full border p-1 rounded" value={dsaMemoryLimit} onChange={e => setDsaMemoryLimit(Number(e.target.value))} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Test Cases</label>
                <button type="button" onClick={addTestCase} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                  + Add Test Case
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                {testCases.map((tc, idx) => (
                  <div key={idx} className="border p-3 rounded bg-gray-50 text-sm relative">
                    <button type="button" onClick={() => removeTestCase(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Input</label>
                        <input required type="text" className="w-full border p-1 rounded mt-1" placeholder="e.g. 1 2" value={tc.input} onChange={e => updateTestCase(idx, 'input', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Expected Output</label>
                        <input required type="text" className="w-full border p-1 rounded mt-1" placeholder="e.g. 3" value={tc.expectedOutput} onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestCase(idx, 'isHidden', e.target.checked)} />
                      Hidden Test Case
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
              Add DSA Problem
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContestDetail;
