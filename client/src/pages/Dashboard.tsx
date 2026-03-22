import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setErrorMsg(null);
      const res = await api.get('/contests');
      if (res.data.success) {
        setContests(res.data.data);
      } else {
        setErrorMsg(res.data.error || 'Failed to fetch contests');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while fetching contests.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user.name}!</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-blue-800">
            You are logged in as a <span className="font-semibold capitalize">{user.role}</span>.
          </p>
        </div>

        {user.role === 'creator' ? (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Creator Actions</h2>
            <Link
              to="/contest/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Create New Contest
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Available Actions</h2>
            <p className="text-gray-600 mb-4">
              Select a contest below to view its details and participate.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Contests</h2>
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p className="font-semibold">Error Loading Contests</p>
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}
        {loading ? (
          <p className="text-gray-600">Loading contests...</p>
        ) : contests.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contests.map((contest: any) => (
              <div key={contest.id} className="border rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{contest.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{contest.description}</p>
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <p>Starts: {new Date(contest.start_time).toLocaleString()}</p>
                    <p>Ends: {new Date(contest.end_time).toLocaleString()}</p>
                  </div>
                </div>
                <Link
                  to={`/contest/${contest.id}`}
                  className="mt-4 text-center w-full px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition text-sm font-medium"
                >
                  {user.role === 'creator' ? 'Manage Contest' : 'View Contest'}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No contests available right now.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
