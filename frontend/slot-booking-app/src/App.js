import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

const App = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

   const fetchAvailableSlots = async (date) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/slots/${date}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.slots);
      } else {
        setError('Failed to fetch available slots');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSuccess('');
    setError('');
    
    if (date) {
      fetchAvailableSlots(date);
    } else {
      setAvailableSlots([]);
    }
  };

  const bookSlot = async (time) => {
    setBooking(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:5000/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          time: time
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Successfully booked slot at ${time}`);
        setAvailableSlots(prev => prev.filter(slot => slot !== time));
      } else {
        setError(data.message || 'Failed to book slot');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setBooking(false);
    }
  };

  const formatTimeDisplay = (time) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              Slot Booking System
            </h1>
            <p className="text-blue-100 mt-2">Book your 30-minute time slot between 9:00 AM - 5:00 PM</p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-3">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={today}
                onChange={handleDateChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-600 font-medium">{success}</p>
              </div>
            )}

            {selectedDate && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Available Slots for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h2>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-3 text-gray-600">Loading available slots...</p>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => bookSlot(slot)}
                        disabled={booking}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                          {formatTimeDisplay(slot)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          30 minutes
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No slots available for this date</p>
                    <p className="text-gray-500 text-sm mt-1">All slots have been booked</p>
                  </div>
                )}
              </div>
            )}

            {!selectedDate && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Select a date to view available slots</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;