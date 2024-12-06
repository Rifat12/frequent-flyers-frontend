import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  Airlines,
  Person
} from '@mui/icons-material';
import axios from 'axios';

export default function FlightDetails() {
  const { tripId, flightId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flightDetails, setFlightDetails] = useState(null);

  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/trips/${tripId}`, {
          withCredentials: true
        });
        const flight = response.data.flightOffers.find(f => f.flightID === parseInt(flightId));
        if (flight) {
          setFlightDetails({
            ...flight,
            offer: JSON.parse(flight.offer),
            passengers: JSON.parse(flight.passengers)
          });
        } else {
          setError('Flight not found');
        }
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch flight details');
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetails();
  }, [tripId, flightId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !flightDetails) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" align="center">{error || 'Flight not found'}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" onClick={() => navigate(`/trips/${tripId}`)}>
            Back to Trip
          </Button>
        </Box>
      </Box>
    );
  }

  const { offer, passengers, pnr, ticketNo } = flightDetails;

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Flight Details</Typography>
          <Box>
            <Typography variant="body1" color="textSecondary">PNR: {pnr}</Typography>
            <Typography variant="body1" color="textSecondary">Ticket: {ticketNo}</Typography>
          </Box>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Airlines sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  {offer.airline.name}
                </Typography>
              </Box>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {offer.totalPrice} {offer.currency}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FlightTakeoff sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    {offer.flights[0].departure.airportCode}
                    <Typography component="span" color="textSecondary" sx={{ ml: 1 }}>
                      {new Date(offer.flights[0].departure.time).toLocaleTimeString()}
                    </Typography>
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {offer.flights[0].departure.airportName}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <AccessTime sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {offer.isDirectFlight ? offer.flights[0].duration : offer.transitDetails.transitDuration}
                  </Typography>
                </Box>
                <Divider>
                  <Chip 
                    label={offer.isDirectFlight ? 'Direct Flight' : offer.transitInfo} 
                    size="small"
                    color={offer.isDirectFlight ? 'success' : 'default'}
                  />
                </Divider>
              </Box>

              <Box sx={{ flex: 1, textAlign: 'right' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}>
                  <Typography variant="body1">
                    {offer.flights[offer.flights.length - 1].arrival.airportCode}
                    <Typography component="span" color="textSecondary" sx={{ mr: 1 }}>
                      {new Date(offer.flights[offer.flights.length - 1].arrival.time).toLocaleTimeString()}
                    </Typography>
                  </Typography>
                  <FlightLand sx={{ ml: 1, color: 'primary.main' }} />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {offer.flights[offer.flights.length - 1].arrival.airportName}
                </Typography>
              </Box>
            </Box>

            {!offer.isDirectFlight && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Transit at {offer.transitDetails.transitLocation} • {offer.transitDetails.transitDuration} layover
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 2 }}>Passengers</Typography>
        <Grid container spacing={2}>
          {passengers.map((passenger, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {passenger.firstName} {passenger.lastName}
                    </Typography>
                  </Box>
                  <Typography color="textSecondary">
                    {passenger.travelerType === 'ADT' ? 'Adult' : 
                     passenger.travelerType === 'CHD' ? 'Child' : 'Infant'}
                  </Typography>
                  <Typography variant="body2">Date of Birth: {passenger.dateOfBirth}</Typography>
                  <Typography variant="body2">Email: {passenger.email}</Typography>
                  <Typography variant="body2">Phone: {passenger.phoneNumber}</Typography>
                  {passenger.frequentFlyerNumber && (
                    <Typography variant="body2">
                      Frequent Flyer: {passenger.frequentFlyerNumber}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          onClick={() => navigate(`/trips/${tripId}`)}
        >
          Back to Trip
        </Button>
      </Box>
    </Box>
  );
}
