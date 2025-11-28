import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";
// const BACKEND_URL = "http://localhost:5000/api/v1";

const EditContestant = () => {
  const { id } = useParams(); // contestant id from URL
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [contestantName, setContestantName] = useState("");
  const [contestantNumber, setContestantNumber] = useState("");
  const [eventId, setEventId] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing contestant data
  useEffect(() => {
    const fetchContestant = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/contestants/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok && data.contestant) {
          const { name, contestant_number, image, event } = data.contestant;
          setContestantName(name);
          setContestantNumber(contestant_number);
          setEventId(event?._id || event); // event might be populated or just an ID
          setPreview(image);
        } else {
          toast.error("Failed to load contestant details");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching contestant");
      }
    };

    fetchContestant();
  }, [id, token]);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit edit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contestantName || !contestantNumber || !eventId) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", contestantName);
    formData.append("contestant_number", contestantNumber);
    formData.append("eventId", eventId);
    if (image) {
      formData.append("file", image); // file field name must match backend multer field
    }

    try {
      const res = await fetch(`${BACKEND_URL}/contestants/edit/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log("Edit response:", data);

      if (res.ok) {
        toast.success("Contestant updated successfully");
        navigate("/contestant");
      } else {
        toast.error(data.error || "Failed to update contestant");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while updating contestant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Contestant</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="contestant-name"
            className="block text-sm font-medium text-gray-700"
          >
            Contestant Name
          </label>
          <input
            type="text"
            id="contestant-name"
            value={contestantName}
            onChange={(e) => setContestantName(e.target.value)}
            className="mt-1 text-sm block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="contestant-number"
            className="block text-sm font-medium text-gray-700"
          >
            Contestant Number
          </label>
          <input
            type="number"
            id="contestant-number"
            value={contestantNumber}
            onChange={(e) => setContestantNumber(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Contestant Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 h-32 w-32 object-cover rounded-md border"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white transition ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isLoading ? "Updating..." : "Update Contestant"}
        </button>
      </form>
    </div>
  );
};

export default EditContestant;
