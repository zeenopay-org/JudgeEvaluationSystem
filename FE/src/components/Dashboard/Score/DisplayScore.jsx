import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaDownload } from "react-icons/fa";
import { toJpeg } from "html-to-image";
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

import "./displayScore.css"; 

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";

const DisplayScore = () => {
  const { token } = useContext(AuthContext);
  const tableRef = useRef(null);

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

        const scoreRes = await fetch(`${BACKEND_URL}/scores/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!scoreRes.ok) {
          toast.error(`Failed to load scores (${scoreRes.status})`);
          return;
        }
        const scoreData = await scoreRes.json();
        setScores(scoreData || []);

        const analyticRes = await fetch(`${BACKEND_URL}/scores/getanalytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!analyticRes.ok)
          toast.error(`Failed to load analytics (${analyticRes.status})`);
        const analyticData = await analyticRes.json();
        setAnalytics(analyticData || []);

        const perContestantRes = await fetch(
          `${BACKEND_URL}/scores/per-contestant-round`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!perContestantRes.ok)
          toast.error(
            `Failed to score per contestant per round (${perContestantRes.status})`
          );
        const perContestantData = await perContestantRes.json();
        setPerRound(perContestantData);

        const judgeBreakdownRes = await fetch(
          `${BACKEND_URL}/scores/judge-breakdown`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!judgeBreakdownRes.ok)
          throw new Error(
            `Failed to breakdown(${judgeBreakdownRes.status})`
          );
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
    return <div className="loading-text">Loading data...</div>;

const handleDownload = async () => {
  const node = tableRef.current;
  if (!node) return;

  try {
    node.classList.add('force-desktop');
    await new Promise((r) => setTimeout(r, 100));

    const dataUrl = await toJpeg(node, {
      quality: 1.0,
      cacheBust: true,
      useCors: true,
      crossOrigin: 'anonymous',
    });

    const link = document.createElement('a');
    link.download = 'JudgeWiseReport.jpg';
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Error downloading report:', err);
    toast.error('Failed to download report');
  } finally {
    node.classList.remove('force-desktop');
    setLoading(false);
  }
};




  return (
    <div className="page-wrapper">
      <div className="header-container">
        <h1 className="header-title">Score Panel</h1>

        <button onClick={handleDownload} className="download-btn">
          <FaDownload className="download-icon" />
          <span className="download-label">Download Score</span>
        </button>

        <div className="tabs">
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
              className={
                activeTab === tab.key ? "tab tab-active" : "tab"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* === SCORES TAB === */}
       {/* === SCORES TAB === */}
      {activeTab === "scores" && (
        <div className="card" ref={tableRef}>
          <h2 className="card-title">Total Score</h2>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {[
                    "Contestant",
                    "Round",
                    "Score by Judges",
                    "Total Score",
                    "Average",
                    "Total Possible Score",
                    "Judge Count",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {scores.map((score, index) => (
                  <tr key={index}>
                    <td>{`${score.contestantNumber}-${score.contestantName}`}</td>
                    <td>{score.roundName}</td>
                    <td>
                      <ul className="judge-list">
                        {score.judges.map((j, i) => (
                          <li key={i}>
                            <span className="judge-name">{j.judgeName}</span>-
                            <span className="judge-score">{j.score}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>{score.totalScore}</td>
                    <td>{Number(score.averageScore).toFixed(2)}</td>
                    <td>{score.totalPossibleScore}</td>
                    <td>{score.judgeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === ANALYTICS TAB === */}
      {activeTab === "analytics" && (
        <div className="card">
          <h2 className="card-title">Contestant Analytics</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="contestant_number" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageScore" fill="#3B82F6" name="Average Score" />
              <Bar dataKey="totalScore" fill="#A78BFA" name="Total Score" />
            </BarChart>
          </ResponsiveContainer>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {[
                    "Contestant Number",
                    "Contestant",
                    "Total",
                    "Average",
                    "Scores Count",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analytics.map((a, i) => (
                  <tr key={i}>
                    <td>{a.contestant_number}</td>
                    <td>{a.name}</td>
                    <td>{a.totalScore}</td>
                    <td className="highlight">{a.averageScore}</td>
                    <td>{a.scoreCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === PER ROUND === */}
      {activeTab === "round" && (
        <div className="card">
          <h2 className="card-title">Contestant per Round</h2>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {[
                    "Contestant Number",
                    "Contestant",
                    "Round",
                    "Total Score",
                    "Average Score",
                    "Scores Count",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {perRound.map((round, i) => (
                  <tr key={i}>
                    <td>{round.contestantNumber}</td>
                    <td>{round.contestantName}</td>
                    <td>{round.roundName}</td>
                    <td>{round.totalScore}</td>
                    <td>{round.averageScore}</td>
                    <td>{round.scoreCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === JUDGE BREAKDOWN === */}
      {activeTab === "judge" && (
        <div className="card">
          <h2 className="card-title">Judge Breakdown</h2>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {["Contestant", "Round", "Judge", "Score", "Comment", "Max Score"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {judgeBreakdown.map((jb, index) => (
                  <tr key={index}>
                    <td>
                      {jb.contestant?.contestant_number
                        ? `${jb.contestant.contestant_number}. ${jb.contestant.name}`
                        : jb.contestant?.name || "N/A"}
                    </td>
                    <td>{jb.round?.name || "N/A"}</td>
                    <td>{jb.judge?.user?.username || "N/A"}</td>
                    <td>{jb.score}</td>
                    <td>{jb.comment || "-"}</td>
                    <td>{jb.round?.max_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === LEADERBOARD === */}
      {activeTab === "leaderboard" && (
        <div className="card">
          <h2 className="card-title">Final Leaderboard</h2>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {["Rank", "Contestant", "Total Score", "Average Score"].map(
                    (h) => (
                      <th key={h}>{h}</th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {[...analytics]
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((a, i) => (
                    <tr key={i}>
                      <td className="rank">{i + 1}</td>
                      <td>{a.name}</td>
                      <td>{a.totalScore}</td>
                      <td className="highlight">{a.averageScore}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayScore;
