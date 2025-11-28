import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const createRound = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [max_score, setMaxScore] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [questions, setQuestions] = useState([""]);

  const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const response = await fetch(`${BACKEND_URL}/events`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data.events || data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events. Please refresh the page.");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const validateForm = () => {
    // Round Name
    if (!name.trim()) {
      toast.error("Round name is required");
      return false;
    }
    if (name.length < 3 || name.length > 50) {
      toast.error("Round name must be 3–50 characters long");
      return false;
    }

    // Type
    if (!type) {
      toast.error("Select round type");
      return false;
    }

    // QNA Questions
    if (type === "qna") {
      const filled = questions.filter((q) => q.trim() !== "");

      if (filled.length === 0) {
        toast.error("At least one question is required");
        return false;
      }

      for (let q of filled) {
        if (q.length < 5) {
          toast.error("Each question must be at least 5 characters");
          return false;
        }
      }
    }

    // Max score
    if (!max_score) {
      toast.error("Max score is required");
      return false;
    }
    if (!/^[0-9]+$/.test(max_score)) {
      toast.error("Max score must be a positive number");
      return false;
    }
    if (Number(max_score) <= 0) {
      toast.error("Max score must be greater than 0");
      return false;
    }

    // Event
    if (!eventId) {
      toast.error("Please select an event");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/rounds/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          type,
          max_score,
          eventId,
          questions:
            type === "qna" ? questions.filter((q) => q.trim() !== "") : [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create round");
      }

      toast.success("Round created successfully!");

      setName("");
      setType("");
      setMaxScore("");
      setEventId("");
      setQuestions([""]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-900">Create New Round</h1>
          <p className="text-gray-600 text-sm mt-2">
            Add a new round to the evaluation system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Round Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Round Name
            </label>
            <input
              type="text"
              placeholder="Enter round name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Select round type</option>
              <option value="normal">normal</option>
              <option value="qna">qna</option>
            </select>

            {type === "qna" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questions
                </label>
                {questions.map((q, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      placeholder={`Question ${index + 1}`}
                      value={q}
                      onChange={(e) =>
                        handleQuestionChange(index, e.target.value)
                      }
                      className="flex-grow text-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Question
                </button>
              </div>
            )}
          </div>

          {/* Max Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Score
            </label>
            <input
              type="number"
              placeholder="Enter max score"
              value={max_score}
              onChange={(e) => setMaxScore(e.target.value)}
              className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Event */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Select Event
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">
                {isLoadingEvents ? "Loading events..." : "Select an event"}
              </option>

              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${
              isLoading
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-blue-500"
            }`}
          >
            {isLoading ? "Creating Round..." : "Create Round"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default createRound;
