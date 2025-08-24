# Slot Booking App

A simple slot booking application with a React frontend and a Node.js/Express backend backed by Firebase Firestore.

## Repository Structure

- `backend/` — Express server exposing booking APIs and connecting to Firestore
- `frontend/slot-booking-app/` — React app (Create React App) for selecting and booking time slots

## Tech Stack

- Backend: Node.js, Express, Firebase Firestore, CORS
- Frontend: React (Create React App), Tailwind CSS, lucide-react

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### 1) Backend

Path: `backend/`

- Install dependencies:
  ```bash
  npm install
  ```
- Start in dev (auto-restart with nodemon):
  ```bash
  npm run dev
  ```
- Or start normally:
  ```bash
  npm start
  ```
- Default URL: `http://localhost:5000`

The backend uses Firebase Firestore. Sample configuration is defined in `backend/server.js` under `firebaseConfig`.

### 2) Frontend

Path: `frontend/slot-booking-app/`

- Install dependencies:
  ```bash
  npm install
  ```
- Start the app:
  ```bash
  npm start
  ```
- Default URL: `http://localhost:3000`

Make sure the backend is running on port 5000 if the frontend expects it.

## API Reference (Backend)

Base URL: `http://localhost:5000`

- GET `/api/slots/:date`
  - Params: `date` (YYYY-MM-DD)
  - Returns available 30-min slots between 09:00–16:30 for the given date.
  - Response example:
    ```json
    {
      "success": true,
      "slots": ["09:00", "09:30", "10:00", "10:30", "..."]
    }
    ```

- POST `/api/book`
  - Body (JSON):
    ```json
    { "date": "YYYY-MM-DD", "time": "HH:MM" }
    ```
  - Confirms a free slot and creates a booking document in Firestore.
  - Responses:
    - 200:
      ```json
      { "success": true, "message": "Slot booked successfully" }
      ```
    - 400/409/500 with an explanatory `message`.

## Development Notes

- Time slots are generated in 30-minute intervals from 09:00 to 16:30.
- Bookings are stored in Firestore collection `bookings` with fields: `date` (Timestamp at start of day), `time` (HH:MM), `bookedAt` (Timestamp).
- For production, consider moving Firebase config to environment variables and securing write rules in Firestore.

## Author

- Manjeet
