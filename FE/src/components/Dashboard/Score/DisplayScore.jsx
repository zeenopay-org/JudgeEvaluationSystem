import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaDownload } from "react-icons/fa";
import { toJpeg } from "html-to-image";
import Pagination from "../../../utils/Pagination";
import usePagination from "../../../hooks/usePagination";
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
  const [selectedRound, setSelectedRound] = useState("all");

  if (!token) return <Navigate to="/login" replace />;

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [scoreRes, analyticRes, perContestantRes, judgeBreakdownRes] =
        await Promise.all([
          fetch(`${BACKEND_URL}/scores/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND_URL}/scores/getanalytics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND_URL}/scores/per-contestant-round`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND_URL}/scores/judge-breakdown`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      const [scoresData, analyticsData, perRoundData, judgeData] =
        await Promise.all([
          scoreRes.ok ? scoreRes.json() : Promise.resolve([]),
          analyticRes.ok ? analyticRes.json() : Promise.resolve([]),
          perContestantRes.ok ? perContestantRes.json() : Promise.resolve([]),
          judgeBreakdownRes.ok ? judgeBreakdownRes.json() : Promise.resolve([]),
        ]);

      setScores(scoresData || []);
      setAnalytics(analyticsData || []);
      setPerRound(perRoundData || []);
      setJudgeBreakdown(judgeData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const roundOptions = [
    "all",
    ...Array.from(new Set(scores.map((s) => s.roundName))),
  ];

  const filteredScores =
    selectedRound === "all"
      ? scores
      : scores.filter((s) => s.roundName === selectedRound);

  useEffect(() => {
    loadAllData();
  }, [token]);

  useEffect(() => {
    const ws = new WebSocket("wss://judgeevaluationsystem.onrender.com/ws");

    ws.onopen = () => console.log("WebSocket connected!");

    ws.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data);
        if (parsed.type === "new_score") {
          toast.success(
            `New score submitted: ${parsed.data.contestantName} - ${parsed.data.score}`
          );
          loadAllData();
        }
      } catch (err) {
        console.error("Parse error:", err, msg.data);
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = (event) =>
      console.log("WebSocket closed:", event.code, event.reason);

    return () => ws.readyState === WebSocket.OPEN && ws.close();
  }, [token]);

  // Pagination
  const {
    page: scorePage,
    pages: scorePages,
    currentData: currentScores,
    setPage: setScorePage,
  } = usePagination(filteredScores, 3);

  const {
    page: judgePage,
    pages: judgePages,
    currentData: currentJudgeBreakdown,
    setPage: setJudgePage,
  } = usePagination(judgeBreakdown, 5);

  const {
    page: perRoundPage,
    pages: perRoundPages,
    currentData: currentPerRound,
    setPage: setPerRoundPage,
  } = usePagination(perRound, 5);

  const {
    page: analyticsPage,
    pages: analyticsPages,
    currentData: currentAnalytics,
    setPage: setAnalyticsPage,
  } = usePagination(analytics, 5);

  if (loading) return <div className="loading-text">Loading data...</div>;

  const handleDownload = async () => {
    const node = tableRef.current;
    if (!node) return;
    try {
      node.classList.add("force-desktop");
      await new Promise((r) => setTimeout(r, 100));
      const dataUrl = await toJpeg(node, {
        quality: 1.0,
        cacheBust: true,
        useCors: true,
        crossOrigin: "anonymous",
      });
      const link = document.createElement("a");
      link.download = "JudgeWiseReport.jpg";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error downloading report:", err);
      toast.error("Failed to download report");
    } finally {
      node.classList.remove("force-desktop");
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
              className={activeTab === tab.key ? "tab tab-active" : "tab"}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SCORES TAB */}
      {activeTab === "scores" &&
        (currentScores.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No scores available
          </div>
        ) : (
          <div className="card" ref={tableRef}>
            {/* Scores table */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="card-title">Total Score</h2>
              <div className="flex justify-end mb-4">
                <select
                  className="border border-gray-300 bg-white text-gray-600 px-4 py-2 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors duration-200"
                  value={selectedRound}
                  onChange={(e) => {
                    setSelectedRound(e.target.value);
                    setScorePage(1);
                  }}
                >
                  {roundOptions.map((round, i) => (
                    <option key={i} value={round}>
                      {round === "all" ? "All Rounds" : round}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="table-wrapper overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="table">
                  <thead>
                    <tr>
                      {[
                        "Contestant",
                        "Round",
                        "Total Score",
                        "Average",
                        "Judge Count",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentScores.map((score, index) => (
                      <tr key={index}>
                        <td>{`${score.contestantNumber} - ${score.contestantName}`}</td>
                        <td>{score.roundName}</td>
                        <td>{score.totalScore}</td>
                        <td>{Number(score.averageScore).toFixed(2)}</td>
                        <td>{score.judgeCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={scorePage}
                pages={scorePages}
                onPageChange={setScorePage}
              />
            </div>
          </div>
        ))}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" &&
        (currentAnalytics.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No analytics available
          </div>
        ) : (
          <div className="card">
            <h2 className="card-title">Contestant Analytics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentAnalytics}>
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
                  {currentAnalytics.map((a, i) => (
                    <tr key={i}>
                      <td>{a.contestant_number}</td>
                      <td>{a.name}</td>
                      <td>{a.totalScore}</td>
                      <td>{a.averageScore}</td>
                      <td>{a.scoreCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={analyticsPage}
                pages={analyticsPages}
                onPageChange={setAnalyticsPage}
              />
            </div>
          </div>
        ))}

      {/* PER ROUND TAB */}
      {activeTab === "round" &&
        (currentPerRound.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No rounds data available
          </div>
        ) : (
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
                  {currentPerRound.map((round, i) => (
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
              <Pagination
                page={perRoundPage}
                pages={perRoundPages}
                onPageChange={setPerRoundPage}
              />
            </div>
          </div>
        ))}

      {/* JUDGE BREAKDOWN TAB */}
      {activeTab === "judge" &&
        (currentJudgeBreakdown.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No judge breakdown available
          </div>
        ) : (
          <div className="card">
            <h2 className="card-title">Judge Breakdown</h2>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    {[
                      "Contestant",
                      "Round",
                      "Judge",
                      "Score",
                      "Comment",
                      "Max Score",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentJudgeBreakdown.map((jb, index) => (
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
              <Pagination
                page={judgePage}
                pages={judgePages}
                onPageChange={setJudgePage}
              />
            </div>
          </div>
        ))}

      {/* LEADERBOARD TAB */}
      {activeTab === "leaderboard" &&
        (currentAnalytics.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No leaderboard available
          </div>
        ) : (
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
                  {[...currentAnalytics]
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((a, i) => (
                      <tr key={i}>
                        <td>{(analyticsPage - 1) * 5 + i + 1}</td>
                        <td>{a.name}</td>
                        <td>{a.totalScore}</td>
                        <td>{a.averageScore}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Pagination
                page={analyticsPage}
                pages={analyticsPages}
                onPageChange={setAnalyticsPage}
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default DisplayScore;
