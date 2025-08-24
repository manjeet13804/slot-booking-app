const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, addDoc, Timestamp } = require('firebase/firestore');

const app = express();
const port = 5000;

const firebaseConfig = {
    apiKey: "AIzaSyA7wnHzzk64YhUFfnJW25IU3i6372Zd4jw",
    authDomain: "slot-booking-app-7b408.firebaseapp.com",
    projectId: "slot-booking-app-7b408",
    storageBucket: "slot-booking-app-7b408.firebasestorage.app",
    messagingSenderId: "140643209738",
    appId: "1:140643209738:web:d54d69d2a5c8c8d830c5f3",
    measurementId: "G-LQRL41P0SX"
  };

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

app.use(cors());
app.use(express.json());

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

app.get('/api/slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const allSlots = generateTimeSlots();
    
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);
    
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookedSlots = new Set();
    
    bookingsSnapshot.forEach(doc => {
      bookedSlots.add(doc.data().time);
    });
    
    const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot));
    
    res.json({
      success: true,
      slots: availableSlots
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots'
    });
  }
});

app.post('/api/book', async (req, res) => {
  try {
    const { date, time } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }
    
    const bookingDate = new Date(`${date}T${time}:00`);
    
    const existingBookingQuery = query(
      collection(db, 'bookings'),
      where('date', '==', Timestamp.fromDate(new Date(`${date}T00:00:00`))),
      where('time', '==', time)
    );
    
    const existingBookings = await getDocs(existingBookingQuery);
    
    if (!existingBookings.empty) {
      return res.status(409).json({
        success: false,
        message: 'This slot is already booked'
      });
    }
    
    const booking = {
      date: Timestamp.fromDate(new Date(`${date}T00:00:00`)),
      time: time,
      bookedAt: Timestamp.now()
    };
    
    await addDoc(collection(db, 'bookings'), booking);
    
    res.json({
      success: true,
      message: 'Slot booked successfully'
    });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book slot'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});