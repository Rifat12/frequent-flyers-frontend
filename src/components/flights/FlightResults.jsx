import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  Airlines
} from '@mui/icons-material';
import axios from 'axios';

export default function FlightResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flightResults, setFlightResults] = useState([]);

  useEffect(() => {
    const searchFlights = async () => {
      if (!location.state?.searchParams) {
        navigate('/trips');
        return;
      }

      try {
        const response = await axios.post(
          'http://localhost:4000/flights/search',
          location.state.searchParams,
          { withCredentials: true }
        );
        setFlightResults(response.data.data.simpliefiedRes || []);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to search flights');
      } finally {
        setLoading(false);
      }
    };

    searchFlights();
  }, [location.state, navigate]);

  const handleSelectFlight = (flight) => {
    navigate('/flight/book', {
      state: {
        flight,
        tripId: location.state.searchParams.tripId,
        searchParams: location.state.searchParams
      }
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" align="center">{error}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Flight Results</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            {location.state?.searchParams?.origin} → {location.state?.searchParams?.destination}
          </Typography>
          <Chip 
            label={location.state?.searchParams?.travelClass} 
            color="primary" 
            variant="outlined"
          />
        </Box>
        <Typography color="textSecondary">
          {new Date(location.state?.searchParams?.departureDate).toLocaleDateString()} • 
          {' '}{location.state?.searchParams?.adults} Adult(s)
          {location.state?.searchParams?.children > 0 && `, ${location.state?.searchParams?.children} Child(ren)`}
          {location.state?.searchParams?.infants > 0 && `, ${location.state?.searchParams?.infants} Infant(s)`}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {flightResults.map((flight, index) => (
          <Grid item xs={12} key={index}>
            <Card 
              sx={{ 
                '&:hover': {
                  boxShadow: 6,
                  cursor: 'pointer'
                }
              }}
              onClick={() => handleSelectFlight(flight)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Airlines sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {flight.airline.name}
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {flight.totalPrice} {flight.currency}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FlightTakeoff sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {flight.flights[0].departure.airportCode}
                        <Typography component="span" color="textSecondary" sx={{ ml: 1 }}>
                          {new Date(flight.flights[0].departure.time).toLocaleTimeString()}
                        </Typography>
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {flight.flights[0].departure.airportName}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <AccessTime sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        {flight.isDirectFlight ? flight.flights[0].duration : flight.transitDetails.transitDuration}
                      </Typography>
                    </Box>
                    <Divider>
                      <Chip 
                        label={flight.isDirectFlight ? 'Direct Flight' : flight.transitInfo} 
                        size="small"
                        color={flight.isDirectFlight ? 'success' : 'default'}
                      />
                    </Divider>
                  </Box>

                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}>
                      <Typography variant="body1">
                        {flight.flights[flight.flights.length - 1].arrival.airportCode}
                        <Typography component="span" color="textSecondary" sx={{ mr: 1 }}>
                          {new Date(flight.flights[flight.flights.length - 1].arrival.time).toLocaleTimeString()}
                        </Typography>
                      </Typography>
                      <FlightLand sx={{ ml: 1, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {flight.flights[flight.flights.length - 1].arrival.airportName}
                    </Typography>
                  </Box>
                </Box>

                {!flight.isDirectFlight && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Transit at {flight.transitDetails.transitLocation} • {flight.transitDetails.transitDuration} layover
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {flightResults.length === 0 && !loading && !error && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No flights found for your search criteria
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Modify Search
          </Button>
        </Box>
      )}
    </Box>
  );
}
