import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";
// const BACKEND_URL = "http://localhost:5000/api/v1";

const CreateJudge = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const response = await fetch(`${BACKEND_URL}/events`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events || data);
    } catch (error) {
      toast.error("Failed to load events. Please refresh the page.");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const validateForm = () => {
    if (!username || !email || !password || !contact || !eventId) {
      toast.error("Please fill out all fields");
      return false;
    }

    // Username
    if (username.length < 5 || username.length > 25) {
      toast.error("Username must be between 5-25 characters");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error("Username can contain letters, numbers, underscores only");
      return false;
    }

    // STRONG EMAIL VALIDATION
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format");
      return false;
    }

    // STRONG PASSWORD VALIDATION
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must include uppercase, lowercase, number, special character (min 8 chars)"
      );
      return false;
    }

    // Contact
    if (!/^[0-9]{10}$/.test(contact)) {
      toast.error("Contact must be exactly 10 digits and should contain numeric values only");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valid = validateForm();
    console.log("VALIDATION:", valid);
    if (!valid) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/judges/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ username, email, password, contact, eventId }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to create judge");
      } else {
        toast.success("Judge created successfully!");
        setUserName("");
        setEmail("");
        setPassword("");
        setContact("");
        setEventId("");
      }
    } catch (error) {
      toast.error("Network error. Please try again.", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl lg:max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-md sm:text-xl  font-bold text-gray-900">
            Create New Judge
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Add a new judge to the evaluation system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Username */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter judge username"
              className="w-full text-sm sm:text-base px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter judge email"
              className="w-full text-sm sm:text-base px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full text-sm sm:text-base px-4 py-2 sm:py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none text-base sm:text-lg"
              >
                <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Enter contact number"
              className="w-full text-sm sm:text-base px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Event Dropdown */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Select Event
            </label>
            <div className="relative">
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                disabled={isLoadingEvents}
                className="w-full text-sm sm:text-base px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition appearance-none"
                required
              >
                <option value="">
                  {isLoadingEvents
                    ? "Loading events..."
                    : "Select an event to assign judge"}
                </option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            {isLoadingEvents && (
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                Loading events...
              </p>
            )}
            {events.length === 0 && !isLoadingEvents && (
              <p className="mt-2 text-xs sm:text-sm text-amber-600">
                No events available. Please create an event first.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 sm:pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base text-white transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              }`}
            >
              {isLoading ? "Creating Judge..." : "Create Judge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJudge;
