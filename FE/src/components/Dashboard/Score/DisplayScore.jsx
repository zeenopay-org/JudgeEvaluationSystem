import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Navigate } from "react-router-dom";

const DisplayScore = () => {
  const { token } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [scores, setScores] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  const [loading, setLoading] = useState(true);

  if (!token) return <Navigate to="/login" replace />;

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/scores/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to load scores (${res.status})`);
        const data = await res.json();
        if (data.length > 0) {
          setScores(data);
        }
      } catch (err) {
        setError(err.message || "Error fetching scores");
      } finally {
        setLoading(false);
      }
    };
    fetchScores();

    const fetchanalytics = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/v1/scores/getanalytics",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok)
          throw new Error(`Failed to load analytics (${res.status})`);
        const data = await res.json();

        if (data.length > 0) {
          setAnalytics(data);
        }
      } catch (err) {
        setError(err.message || "Error fetching analytics");
      }
    };
    fetchanalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading scores...</div>
    );
  }

  return (
    <>
      <div className="py-3">
        <div className="text-3xl font-bold text-gray-900 space-y-3 p-6">
          Scores
        </div>

        {error && <div className="p-6 text-red-500 text-center">{error}</div>}

        {!loading && scores.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No scores available.
          </div>
        )}

        {scores.length > 0 && (
          <div className="p-6 overflow-auto rounded-lg shadow-md">
            <table className="w-full">
              <thead className="bg-gray-300 border b-2 border-gray-200 p-3">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contestant
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judge
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Round Name
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scores.map((score, index) => (
                  <tr
                    key={score._id || index}
                    className="hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {score.contestant?.contestant_number}.
                      {score.contestant?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      {score.score}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {score.comment || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {score.judge?.user?.username || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {score.judge?.event?.[0]?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {score.round?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      {score.round?.max_score}
                    </td>
                  </tr>
                ))}
                
              </tbody>

            </table>
            

          </div>
        )}
      </div>
    </>
  );
};

export default DisplayScore;
