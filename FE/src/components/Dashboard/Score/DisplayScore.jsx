import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaDownload } from "react-icons/fa";
import { toJpeg } from "html-to-image";
import Pagination from "../../../utils/Pagination";
import usePagination from "../../../hooks/usePagination";
//  import { initSocket } from "../../../utils/socketClient";
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
// const BACKEND_URL = "http://localhost:5000/api/v1";

const DisplayScore = () => {
  const { token } = useContext(AuthContext);
  const tableRef = useRef(null);

  const [scores, setScores] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [perRound, setPerRound] = useState([]);
  const [judgeBreakdown, setJudgeBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("scores");

  const [page, setPage] = useState(1);
  // const scorePerPage = 3;

  if (!token) return <Navigate to="/login" replace />;

 // SINGLE data loading function - ADD THIS
const loadAllData = async () => {
  try {
    setLoading(true);
    
    // Make all API calls in parallel
    const [scoreRes, analyticRes, perContestantRes, judgeBreakdownRes] = 
      await Promise.all([
        fetch(`${BACKEND_URL}/scores/`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch(`${BACKEND_URL}/scores/getanalytics`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch(`${BACKEND_URL}/scores/per-contestant-round`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch(`${BACKEND_URL}/scores/judge-breakdown`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);

    // Process all responses in parallel
    const [scoresData, analyticsData, perRoundData, judgeData] = 
      await Promise.all([
        scoreRes.ok ? scoreRes.json() : Promise.resolve([]),
        analyticRes.ok ? analyticRes.json() : Promise.resolve([]),
        perContestantRes.ok ? perContestantRes.json() : Promise.resolve([]),
        judgeBreakdownRes.ok ? judgeBreakdownRes.json() : Promise.resolve([])
      ]);

    // Update all state
    setScores(scoresData);
    setAnalytics(analyticsData);
    setPerRound(perRoundData);
    setJudgeBreakdown(judgeData);
    
  } catch (error) {
    console.error("Error loading data:", error);
    toast.error("Failed to load data");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadAllData();
}, [token]);

  useEffect(() => {
    const wsUrl = 'wss://judgeevaluationsystem.onrender.com/ws';


    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("websocket CONNECTED in React component!");
    };

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
        console.error(" Parse error:", err, "Raw data:", msg.data);
      }
    };

    ws.onerror = (error) => {
      console.error(" WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [token]);

  const {
    page: scorePage,
    pages: scorePages,
    currentData: currentScores,
    setPage: setScorePage,
  } = usePagination(scores, 3);
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
    page:analyticsPage,
    pages:analyticsPages,
    currentData:currentAnalytics,
    setPage:setAnalyticsPage,
  } =usePagination(analytics,5)


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
                {currentScores.map((score, index) => (
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
            <div className="mt-8 flex justify-center">
              <Pagination
                page={scorePage}
                pages={scorePages}
                onPageChange={setScorePage}
              />
            </div>
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
                {currentAnalytics.map((a, i) => (
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
             <Pagination
                page={analyticsPage}
                pages={analyticsPages}
                onPageChange={setAnalyticsPage}
              />
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
      )}

      {/* === JUDGE BREAKDOWN === */}
      {activeTab === "judge" && (
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
            <div className="mt-8 flex justify-center">
              <Pagination
                page={judgePage}
                pages={judgePages}
                onPageChange={setJudgePage}
              />
            </div>
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
                {[...currentAnalytics]
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((a, i) => (
                    <tr key={i}>
                      <td className="rank">{(analyticsPage - 1) * 5 + i + 1}</td>
                      <td>{a.name}</td>
                      <td>{a.totalScore}</td>
                      <td className="highlight">{a.averageScore}</td>
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
      )}
    </div>
  );
};

export default DisplayScore;
