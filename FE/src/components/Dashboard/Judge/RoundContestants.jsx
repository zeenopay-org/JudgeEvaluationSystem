import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";

const RoundScoring = () => {
  const { token, judge } = useContext(AuthContext);
  const { roundId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [round, setRound] = useState(null);
  const [contestants, setContestants] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
const [errorMessage, setErrorMessage] = useState("");
  const [questionsUsed, setQuestionsUsed] = useState([]); // to track used questions
  const [scores, setScores] = useState({}); // form state per contestant

  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/judges/rounds/${roundId}/contestants`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to load round data");

        const data = await res.json();
        setRound(data.round);
        setContestants(data.contestants);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && judge && roundId) fetchRoundData();
  }, [token, judge, roundId]);

  const handleInputChange = (id, field, value) => {
    setScores((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSubmitScore = async (contestantId) => {
    try {
      const { score, question, comment } = scores[contestantId] || {};

      if (!score) {
        setErrorMessage("Please enter a score");
       return;
      }

       if (score > round.max_score) {
        setErrorMessage(`Max score is ${round.max_score}`);
        return;
      }
      

      // for qna type, question is required
      if (round.type === "qna" && !question) {
        setErrorMessage("Please select a question");
        return;
      }
      

      const res = await fetch("http://localhost:5000/api/v1/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          round: roundId,
          contestant: contestantId,
          score: Number(score),
          question: question || null,
          comment: comment || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit score");

      setSuccessMessage("Score submitted successfully!");
      setErrorMessage(""); 

      // Mark question as used if qna
      if (round.type === "qna" && question) {
        setQuestionsUsed((prev) => [...prev, question]);
      }

      // Disable after submission
      setScores((prev) => ({
        ...prev,
        [contestantId]: { ...prev[contestantId], submitted: true },
      }));
    } catch (err) {
      setErrorMessage(err.message);
      setSuccessMessage("");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {round?.name} - {round?.type.toUpperCase()} Round
          </h2>
          <p className="text-gray-500 text-sm">
            Max Score: {round?.max_score}
          </p>
        </div>
        <Link
          to="/judge"
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          Back
        </Link>
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-2 rounded mb-4">{error}</div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
      {successMessage && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">
            {errorMessage}
          </div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contestant #
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              {round?.type === "qna" && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
              )}
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contestants.map((c) => {
              const form = scores[c._id] || {};
              return (
                <tr key={c._id}>
                  <td className="px-4 py-2">{c.contestant_number}</td>
                  <td className="px-4 py-2">{c.name}</td>
                  {round?.type === "qna" && (
                    <td className="px-4 py-2">
                      <select
                        value={form.question || ""}
                        onChange={(e) =>
                          handleInputChange(c._id, "question", e.target.value)
                        }
                        disabled={form.submitted}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="">Select</option>
                        {round.questions.map((q) => (
                          <option
                            key={q._id}
                            value={q._id}
                            disabled={questionsUsed.includes(q._id)}
                          >
                            {q.question_text}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={form.score || ""}
                      onChange={(e) =>
                        handleInputChange(c._id, "score", e.target.value)
                      }
                      disabled={form.submitted}
                      min="0"
                      max={round.max_score}
                      className="border rounded px-2 py-1 w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={form.comment || ""}
                      onChange={(e) =>
                        handleInputChange(c._id, "comment", e.target.value)
                      }
                      disabled={form.submitted}
                      placeholder="Optional"
                      className="border rounded px-2 py-1 w-full text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleSubmitScore(c._id)}
                      disabled={form.submitted}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        form.submitted
                          ? "bg-gray-300 text-gray-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {form.submitted ? "Submitted" : "Submit"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoundScoring;
