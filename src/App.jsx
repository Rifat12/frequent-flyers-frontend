import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Trips from './components/trips/Trips';
import TripDetails from './components/trips/TripDetails';
import FlightResults from './components/flights/FlightResults';
import FlightBooking from './components/flights/FlightBooking';
import FlightDetails from './components/flights/FlightDetails';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <Trips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId/flights/:flightId"
          element={
            <ProtectedRoute>
              <FlightDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flights/search"
          element={
            <ProtectedRoute>
              <FlightResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flight/book"
          element={
            <ProtectedRoute>
              <FlightBooking />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/trips" replace />} />
      </Routes>
    </>
  );
}

export default App;
