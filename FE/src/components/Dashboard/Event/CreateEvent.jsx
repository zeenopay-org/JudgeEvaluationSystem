import React, { useState } from 'react';

const CreateEvent = () => {
  const [eventName, setEventName] = useState('');
  const [image, setImage] = useState(null);
  const [organizer, setOrganizer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!eventName || !organizer || !image) {
      alert('Please fill out all fields.');
      return;
    }

    // form submission 
    console.log({ eventName, image, organizer });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="event-name" className="block text-sm font-medium text-gray-700">
            Event Name
          </label>
          <input
            type="text"
            id="event-name"
            name="event-name"
            placeholder='enter the name of the event'
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={(e) => setImage(e.target.files[0])}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            accept="image/*"
            required
          />
        </div>

        <div>
          <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">
            Organizer
          </label>
          <input
            type="text"
            id="organizer"
            name="organizer"
            placeholder='enter the name of organizer '
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;