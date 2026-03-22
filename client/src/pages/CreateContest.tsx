import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateContest = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/contests', {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });

      if (res.data.success) {
        alert('Contest created successfully!');
        navigate(`/contest/${res.data.data.id}`); // Assuming backend returns created contest ID as res.data.data.id
      } else {
        setError(res.data.error || 'Failed to create contest');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create New Contest</h2>
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contest Title</label>
          <input
            type="text"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            required
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="datetime-local"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Contest'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateContest;
