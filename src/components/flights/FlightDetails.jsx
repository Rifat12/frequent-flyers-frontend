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
  CircularProgress,
  Container,
  Stack,
  IconButton,
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  Airlines,
  Person,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';

export default function FlightDetails() {
  const { tripId, flightId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flightDetails, setFlightDetails] = useState(null);

  function formatDuration(isoDuration) {
    // ISO 8601 duration format generally looks like: PT#H#M#S
    // For example: PT2H30M means 2 hours and 30 minutes.
    
    // Extract hours, minutes, and seconds using a regex.
    const match = isoDuration.match(/P(T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)/);
  
    if (!match) return isoDuration; // return original if not matched
  
    const hours = match[2] ? parseInt(match[2], 10) : 0;
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    const seconds = match[4] ? parseInt(match[4], 10) : 0;
  
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0) result += `${seconds}s`;
  
    return result.trim();
  }
  

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
      <Container sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            {error || 'Flight not found'}
          </Typography>
          <Button variant="contained" onClick={() => navigate(`/trips/${tripId}`)}>
            Back to Trip
          </Button>
        </Paper>
      </Container>
    );
  }

  const { offer, passengers, pnr, ticketNo } = flightDetails;

  return (
    <Container sx={{ py: 4 }}>
      {/* Top navigation and heading */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton color="primary" onClick={() => navigate(`/trips/${tripId}`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 2, fontWeight: 'bold' }}>
          Flight Details
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {/* PNR and Ticket info */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          spacing={2} 
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: '600' }}>Your Flight</Typography>
          </Box>
          <Box>
            <Typography variant="body1" color="textSecondary">PNR: {pnr}</Typography>
            <Typography variant="body1" color="textSecondary">Ticket: {ticketNo}</Typography>
          </Box>
        </Stack>

        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Airlines sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {offer.airline.name}
                </Typography>
              </Stack>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {offer.totalPrice} {offer.currency}
              </Typography>
            </Stack>

            {/* Flight itinerary */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              {/* Departure */}
              <Box flex={1}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <FlightTakeoff sx={{ color: 'primary.main' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {offer.flights[0].departure.airportCode}
                    <Typography component="span" color="textSecondary" sx={{ ml: 1, fontSize: '0.9rem' }}>
                      {new Date(offer.flights[0].departure.time).toLocaleTimeString()}
                    </Typography>
                  </Typography>
                </Stack>
                <Typography variant="body2" color="textSecondary">
                  {offer.flights[0].departure.airportName}
                </Typography>
              </Box>

              {/* Duration & Transit */}
              <Box flex={1} textAlign="center">
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" mb={1}>
                  <AccessTime sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {offer.isDirectFlight 
                      ? formatDuration(offer.flights[0].duration) 
                      : formatDuration(offer.transitDetails.transitDuration)}
                  </Typography>
                </Stack>
                <Divider flexItem>
                  <Chip
                    label={offer.isDirectFlight ? 'Direct Flight' : offer.transitInfo}
                    size="small"
                    color={offer.isDirectFlight ? 'success' : 'default'}
                  />
                </Divider>
              </Box>

              {/* Arrival */}
              <Box flex={1} textAlign={{ xs: 'left', md: 'right' }}>
                <Stack direction="row" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" spacing={1} mb={1}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {offer.flights[offer.flights.length - 1].arrival.airportCode}
                    <Typography component="span" color="textSecondary" sx={{ ml: 1, fontSize: '0.9rem' }}>
                      {new Date(offer.flights[offer.flights.length - 1].arrival.time).toLocaleTimeString()}
                    </Typography>
                  </Typography>
                  <FlightLand sx={{ color: 'primary.main' }} />
                </Stack>
                <Typography variant="body2" color="textSecondary">
                  {offer.flights[offer.flights.length - 1].arrival.airportName}
                </Typography>
              </Box>
            </Stack>

            {!offer.isDirectFlight && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {formatDuration(offer.transitDetails.transitDuration)} layover
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Passengers Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: '600' }}>Passengers</Typography>
        <Grid container spacing={2}>
          {passengers.map((passenger, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Person sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: '500' }}>
                      {passenger.firstName} {passenger.lastName}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {passenger.travelerType === 'ADT' ? 'Adult' : 
                     passenger.travelerType === 'CHD' ? 'Child' : 'Infant'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Date of Birth: {passenger.dateOfBirth}</Typography>
                  <Typography variant="body2" color="textSecondary">Email: {passenger.email}</Typography>
                  <Typography variant="body2" color="textSecondary">Phone: {passenger.phoneNumber}</Typography>
                  {passenger.frequentFlyerNumber && (
                    <Typography variant="body2" color="textSecondary">
                      Frequent Flyer: {passenger.frequentFlyerNumber}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => navigate(`/trips/${tripId}`)}
          startIcon={<ArrowBack />}
        >
          Back to Trip
        </Button>
      </Box>
    </Container>
  );
}
