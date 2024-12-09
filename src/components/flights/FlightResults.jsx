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
  Chip,
  Stack,
  IconButton,
  Collapse
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  Airlines,
  ArrowForward,
  ExpandMore,
  ExpandLess,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';

export default function FlightResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flightResults, setFlightResults] = useState([]);
  const [expandedFlights, setExpandedFlights] = useState({});

  function formatDuration(isoDuration) {
    const match = isoDuration.match(/P(T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)/);
    if (!match) return isoDuration;
    
    const hours = match[2] ? parseInt(match[2], 10) : 0;
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;
    
    return result.trim();
  }

  function formatDateTime(isoDateTime) {
    const date = new Date(isoDateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  }

  useEffect(() => {
    const searchFlights = async () => {
      if (!location.state?.searchParams) {
        navigate('/trips');
        return;
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/flights/search`,
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

  const toggleFlightDetails = (event, index) => {
    event.stopPropagation();
    setExpandedFlights(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const FlightSegment = ({ flight, isArrival = false }) => {
    const { date, time } = formatDateTime(
      isArrival ? flight.arrival.time : flight.departure.time
    );
    const Icon = isArrival ? FlightLand : FlightTakeoff;
    const airport = isArrival ? flight.arrival : flight.departure;

    return (
      <Box sx={{ flex: 1, textAlign: isArrival ? 'right' : 'left' }}>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent={isArrival ? 'flex-end' : 'flex-start'}>
          {!isArrival && <Icon sx={{ color: 'primary.main' }} />}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              {airport.airportCode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {time}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {date}
            </Typography>
          </Box>
          {isArrival && <Icon sx={{ color: 'primary.main' }} />}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {airport.airportName}
        </Typography>
      </Box>
    );
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
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Flight Results</Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            {location.state?.searchParams?.origin} 
            <ArrowForward sx={{ mx: 1 }} />
            {location.state?.searchParams?.destination}
          </Typography>
          <Chip 
            label={location.state?.searchParams?.travelClass} 
            color="primary" 
            variant="outlined"
          />
        </Box>
        <Typography color="text.secondary">
          {new Date(location.state?.searchParams?.departureDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} • 
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
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
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
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                      {flight.airline.name}
                    </Typography>
                  </Box>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                    {flight.totalPrice} {flight.currency}
                  </Typography>
                </Box>

                {/* Main Flight Information */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <FlightSegment flight={flight.flights[0]} />
                  
                  <Box sx={{ flex: 1, textAlign: 'center', mx: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <AccessTime sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Total Duration: {formatDuration(flight.flights.reduce((total, f) => {
                          const durationMatch = f.duration.match(/PT(\d+)H(\d+)M/);
                          if (!durationMatch) return total;
                          const hours = parseInt(durationMatch[1], 10);
                          const minutes = parseInt(durationMatch[2], 10);
                          return `PT${total.match(/PT(\d+)H(\d+)M/) ? 
                            parseInt(total.match(/PT(\d+)H(\d+)M/)[1], 10) + hours : hours}H${
                            total.match(/PT(\d+)H(\d+)M/) ? 
                            parseInt(total.match(/PT(\d+)H(\d+)M/)[2], 10) + minutes : minutes}M`;
                        }, 'PT0H0M'))}
                      </Typography>
                    </Box>
                    <Divider>
                      <Chip 
                        label={flight.isDirectFlight ? 'Direct Flight' : `1 Stop via ${flight.transitDetails.transitLocation}`}
                        size="small"
                        color={flight.isDirectFlight ? 'success' : 'warning'}
                        variant={flight.isDirectFlight ? 'filled' : 'outlined'}
                      />
                    </Divider>
                  </Box>

                  <FlightSegment flight={flight.flights[flight.flights.length - 1]} isArrival />
                </Box>

                {/* Expand/Collapse Button for Transit Flights */}
                {!flight.isDirectFlight && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <IconButton 
                        onClick={(e) => toggleFlightDetails(e, index)}
                        size="small"
                        sx={{ 
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'action.selected' }
                        }}
                      >
                        {expandedFlights[index] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    <Collapse in={expandedFlights[index]}>
                      <Box sx={{ mt: 2 }}>
                        {/* First Leg */}
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            First Leg
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                              {flight.flights[0].departure.airportCode} → {flight.flights[0].arrival.airportCode}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Duration: {formatDuration(flight.flights[0].duration)}
                            </Typography>
                          </Box>
                        </Paper>

                        {/* Layover Information */}
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ mr: 1, fontSize: 'small' }} />
                            Layover at {flight.transitDetails.transitLocation}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Connection time: {formatDuration(flight.transitDetails.transitDuration)}
                          </Typography>
                        </Paper>

                        {/* Second Leg */}
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Second Leg
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                              {flight.flights[1].departure.airportCode} → {flight.flights[1].arrival.airportCode}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Duration: {formatDuration(flight.flights[1].duration)}
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>
                    </Collapse>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {flightResults.length === 0 && !loading && !error && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
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
