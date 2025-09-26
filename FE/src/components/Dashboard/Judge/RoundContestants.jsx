import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";

const RoundContestants = () => {
  const { token, judge } = useContext(AuthContext);
  const { roundId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [round, setRound] = useState(null);
  const [contestants, setContestants] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `http://localhost:5000/api/v1/judges/rounds/${roundId}/contestants`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg?.message || `Failed to load contestants (${res.status})`);
        }
        const data = await res.json();
        setRound(data.round || null);
        setContestants(Array.isArray(data.contestants) ? data.contestants : []);
      } catch (err) {
        setError(err.message || "Error fetching round contestants");
      } finally {
        setLoading(false);
      }
    };

    if (token && judge && roundId) fetchData();
  }, [token, judge, roundId]);

  if (!token || !judge) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-600">Please log in as a judge to view contestants.</p>
      </div>
    );
  }

  if (loading) return <p className="p-6">Loading contestants...</p>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Round Contestants</h2>
          {round && (
            <p className="text-sm text-gray-500">
              Round: <strong>{round.name}</strong> • Event: <strong>{round.event?.name}</strong>
            </p>
          )}
        </div>
        <Link to="/judge" className="text-blue-600 text-sm font-medium hover:underline">
          Back to Judges
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-800 px-4 py-2">
          {error}
        </div>
      )}

      {contestants.length === 0 ? (
        <p className="text-gray-600">No contestants for this round.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contestants.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{c.contestant_number}</td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{c.event?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoundContestants;


