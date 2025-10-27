import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

const AssignTitleModal = ({ titleId, eventId, onClose, onAssignSuccess }) => {
  const { token } = useContext(AuthContext);
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch contestants for the given event
  useEffect(() => {
    const fetchContestants = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "http://localhost:5000/api/v1/contestants/event/?eventId=${eventId",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setContestants(data.contestants || data);
      } catch (err) {
        console.erroe("failed to fetch contestants", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContestants();
  }, [eventId, token]);

  const handleAssign = async (contestantId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/titleassignment/assign-title`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ titleId, contestantId }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage(" Title assigned successfully!");
        onAssignSuccess && onAssignSuccess();
      } else {
        setMessage(data.message || "Failed to assign title");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error assigning title");
    }
  };

  return <></>;
};

export default AssignTitleModal;
