import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalPoints: number;
}

const Leaderboard = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [contestId]);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get(`/contests/${contestId}/leaderboard`);
      if (res.data.success) {
        setEntries(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading leaderboard...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Leaderboard</h2>
        <Link to={`/contest/${contestId}`} className="text-blue-600 hover:underline">
          Back to Contest
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.length > 0 ? (
              entries.map((entry, idx) => (
                <tr key={entry.userId || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{entry.rank || idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {entry.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono font-bold">
                    {entry.totalPoints}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No participants yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
