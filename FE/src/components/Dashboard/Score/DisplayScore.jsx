import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const DisplayScore = () => {
  const { token } = useContext(AuthContext);
   const [scores, setScores] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [perRound, setPerRound] = useState([]);
  const [judgeBreakdown, setJudgeBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("scores");

  if (!token) return <Navigate to="/login" replace />;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        //fetch overall scores
        const scoreRes = await fetch("http://localhost:5000/api/v1/scores/", {
          headers: { Authorization: `Bearer ${token}` },
        });

      if (!scoreRes.ok) {
        toast.error(`Failed to load scores (${scoreRes.status})`);
        return;
      }
        const scoreData = await scoreRes.json();
        setScores(scoreData || []);

        //fetch analysis
        const analyticRes = await fetch(
          "http://localhost:5000/api/v1/scores/getanalytics",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!analyticRes.ok)
         toast.error(`Failed to load analytics (${analyticRes.status})`);
        const analyticData = await analyticRes.json();
        setAnalytics(analyticData || []);

        //per contestant per round
        const perContestantRes = await fetch(
          "http://localhost:5000/api/v1/scores/per-contestant-round",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!perContestantRes.ok)
          toast.error(
            `Failed to score per contestant per round (${perContestantRes.status})`
          );
        const perContestantData = await perContestantRes.json();
        setPerRound(perContestantData);

        //judge Breakdown
        const judgeBreakdownRes = await fetch(
          "http://localhost:5000/api/v1/scores/judge-breakdown",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!judgeBreakdownRes.ok)
          throw new Error(`Failed to breakdown(${judgeBreakdownRes.status})`);
        const judgeBreakdownData = await judgeBreakdownRes.json();
        setJudgeBreakdown(judgeBreakdownData);
      } catch (err) {
        toast.error(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);
  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        Loading data...
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-gray-800">Score Panel</h1>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "scores", label: "Scores" },
              { key: "analytics", label: "Contestant Analytics" },
              { key: "round", label: "Contestant Per Round" },
              { key: "judge", label: "Judge Breakdown" },
              { key: "leaderboard", label: "Leaderboard" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        
        {/* === Scores Tab === */}
        {activeTab === "scores" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-auto border border-gray-200">
            <h2 className="text-md font-bold mb-4">All Scores</h2>
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Contestant",
                    "Round",
                    "Judge",
                    "Score",
                    "Comment",
                    "Max Score",
                  ].map((headers) => (
                    <th
                      key={headers}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide border-b"
                    >
                      {headers}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scores.map((score, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    <td className="px-6 py-4">
                      {score.contestant?.contestant_number
                        ? `${score.contestant.contestant_number}. ${score.contestant.name}`
                        : score.contestant?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">{score.round?.name || "N/A"}</td>
                    <td className="px-6 py-4">
                      {score.judge?.user?.username || "N/A"}
                    </td>
                    <td className="px-6 py-4">{score.score}</td>
                    <td className="px-6 py-4">{score.comment || "-"}</td>
                    <td className="px-6 py-4">{score.round?.max_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* === Analytics Tab === */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-md font-bold mb-4">Contestant Analytics</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="contestant_number" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="averageScore"
                  fill="#3B82F6"
                  name="Average Score"
                />
                <Bar dataKey="totalScore" fill="#A78BFA" name="Total Score" />
              </BarChart>
            </ResponsiveContainer>
            <table className="w-full border-collapse mt-6">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Contestant Number",
                    "Contestant",
                    "Total",
                    "Average",
                    "Scores Count",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide border-b"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {analytics.map((a, i) => (
                  <tr key={i} className="hover:bg-blue-50">
                    <td className="px-6 py-4">{a.contestant_number}</td>
                    <td className="px-6 py-4">{a.name}</td>
                    <td className="px-6 py-4">{a.totalScore}</td>
                    <td className="px-6 py-4 text-blue-600 font-semibold">
                      {a.averageScore}
                    </td>
                    <td className="px-6 py-4 ">{a.scoreCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* === Contestant per Round === */}
        {activeTab === "round" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-auto border border-gray-200">
            <h2 className="text-md font-bold mb-4">Contestant per Round</h2>
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Contestant Number",
                    "Contestant",
                    "Round",
                    "Total Score",
                    "Average Score",
                    "Scores Count",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-sm font-semibold  text-gray-700 uppercase tracking-wide border-b"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {perRound.map((round, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    <td className="py-3 px-3">{round.contestantNumber}</td>
                    <td className="px-6 py-4">{round.contestantName}</td>
                    <td className="py-6 px-3">{round.roundName}</td>
                    <td className="py-6 px-3">{round.totalScore}</td>
                    <td className="py-6 px-3">{round.averageScore}</td>
                    <td className="py-6 px-3">{round.scoreCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* === Judge Breakdown === */}
        {activeTab === "judge" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-md font-bold mb-4"> Judge Breakdown</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={judgeBreakdown}>
                <CartesianGrid strokeDasharray={3} />
                <XAxis dataKey="judgeName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="averageScore"
                  fill="#3B82F6"
                  name="Average Score"
                />
                <Bar dataKey="totalScore" fill="#A78BFA" name="Total Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

          {/* === Leaderboard === */}
      {activeTab === "leaderboard" && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-md font-bold mb-4">Final Leaderboard</h2>
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                {["Rank", "Contestant", "Total Score", "Average Score"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide border-b">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...analytics]
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((a, i) => (
                  <tr key={i} className="hover:bg-blue-50">
                    <td className="px-6 py-4 font-bold text-gray-800">{i + 1}</td>
                    <td className="px-6 py-4">{a.name}</td>
                    <td className="px-6 py-4">{a.totalScore}</td>
                    <td className="px-6 py-4 text-blue-600 font-semibold">{a.averageScore}</td>
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
