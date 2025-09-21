import React from 'react'

const sampleContestants = [
  { id: 'c1', name: 'Alice Johnson', contestant_number: 1, event: 'Tech Summit 2025' },
  { id: 'c2', name: 'Brian Smith', contestant_number: 2, event: 'Tech Summit 2025' },
  { id: 'c3', name: 'Chinwe Okafor', contestant_number: 3, event: 'Tech Summit 2025' },
  { id: 'c4', name: 'Diego Martinez', contestant_number: 4, event: 'Innovation Expo' },
  { id: 'c5', name: 'Ella Fitzgerald', contestant_number: 5, event: 'Innovation Expo' },
  { id: 'c6', name: 'Farouk Ahmed', contestant_number: 6, event: 'Hack Week' },
]

const DisplayContestant = () => {
  return (
    <div className='p-6'>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Contestants</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sampleContestants.map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-semibold">
                  {c.contestant_number}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{c.name}</h3>
                  <p className="text-xs text-gray-500">Event: {c.event}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                  Contestant #{c.contestant_number}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DisplayContestant
