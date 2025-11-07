import React, { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BACKEND_URL = "http://localhost:5000/api/v1"; 

const CreateEvent = () => {
  const [eventName, setEventName] = useState("");
  const [image, setImage] = useState(null);
  const [organizer, setOrganizer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!eventName || !organizer || !image) {
    toast.error("Please fill out all fields.");
    return;
  }

  setIsLoading(true);

  const formData = new FormData();
  formData.append("name", eventName);
  formData.append("created_by", organizer);
  formData.append("image", image); 

  try {
    const res = await fetch(`${BACKEND_URL}/events/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
           },
      body: formData,
    });

    const data = await res.json();
    console.log("Response:", data);

    if (res.ok) {
      localStorage.setItem("eventCreated", "true");
      navigate("/event");
    } else {
      toast.error(data.message || data.error || "Failed to create event");
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Network error. Please check if the server is running.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="event-name"
            className="block text-sm font-medium text-gray-700"
          >
            Event Name
          </label>
          <input
            type="text"
            id="event-name"
            name="event-name"
            placeholder="enter the name of the event"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="mt-1 text-sm block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
              accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="mt-1 text-sm block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="organizer"
            className="block text-sm font-medium text-gray-700"
          >
            Organizer
          </label>
          <input
            type="text"
            id="organizer"
            name="organizer"
            placeholder="enter the name of organizer "
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            className="mt-1 text-sm block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {isLoading ? "Creating Event..." : "Create Event"}
          </button>

          </div>
      </form>
    </div>
  );
};

export default CreateEvent;
