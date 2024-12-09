import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Autocomplete,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Collapse,
  IconButton,
  CardActionArea,
  Stack,
  Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useParams, useNavigate } from 'react-router-dom';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
      {value === index && children}
    </div>
  );
}

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState([]);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', time: '' });
  const [openFlightDialog, setOpenFlightDialog] = useState(false);
  const [flightSearch, setFlightSearch] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: 'ECONOMY',
    tripType: 'one-way'
  });
  const [naturalQuery, setNaturalQuery] = useState('');
  const [showIntelligentSearchSuccess, setShowIntelligentSearchSuccess] = useState(false);
  const [airports, setAirports] = useState([]);
  const [originAirport, setOriginAirport] = useState(null);
  const [destinationAirport, setDestinationAirport] = useState(null);
  const [searchingAirports, setSearchingAirports] = useState(false);
  const [error, setError] = useState('');
  const [intelligentSearchLoading, setIntelligentSearchLoading] = useState(false);

  useEffect(() => {
    fetchTripDetails();
    fetchEvents();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/trips/${tripId}`, {
        withCredentials: true
      });
      setTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip details:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/trips/${tripId}/events`, {
        withCredentials: true
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/trips/${tripId}/events`,
        newEvent,
        { withCredentials: true }
      );
      setOpenEventDialog(false);
      setNewEvent({ name: '', date: '', time: '' });
      fetchEvents();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add event');
    }
  };

  const searchAirports = async (query) => {
    if (query.length < 2) {
      setAirports([]);
      return;
    }
    setSearchingAirports(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/airports/search?query=${query}`, {
        withCredentials: true
      });
      const airportsData = response.data.data || [];
      const formattedAirports = airportsData.map(airport => ({
        ...airport,
        displayName: `${airport.city} (${airport.iata}) - ${airport.name}`
      }));
      setAirports(formattedAirports);
    } catch (error) {
      console.error('Error searching airports:', error);
      setAirports([]);
    }
    setSearchingAirports(false);
  };

  const handleIntelligentSearch = async () => {
    if (!naturalQuery.trim()) return;

    setIntelligentSearchLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/flights/intelligent-search`, {
        tripId: parseInt(tripId),
        naturalQuery: naturalQuery
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        const searchData = response.data.data;
        
        setFlightSearch({
          origin: searchData.origin || '',
          destination: searchData.destination || '',
          departureDate: searchData.departureDate || '',
          adults: searchData.adults || 1,
          children: searchData.children || 0,
          infants: searchData.infants || 0,
          travelClass: searchData.travelClass || 'ECONOMY',
          tripType: searchData.tripType || 'one-way'
        });

        if (searchData.origin) {
          try {
            const originResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/airports/${searchData.origin}`, {
              withCredentials: true
            });
            if (originResponse.data.success) {
              const originData = originResponse.data.data;
              setOriginAirport({
                ...originData,
                displayName: `${originData.city} (${originData.iata}) - ${originData.name}`
              });
            }
          } catch (error) {
            console.error('Error fetching origin airport details:', error);
          }
        }

        if (searchData.destination) {
          try {
            const destResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/airports/${searchData.destination}`, {
              withCredentials: true
            });
            if (destResponse.data.success) {
              const destData = destResponse.data.data;
              setDestinationAirport({
                ...destData,
                displayName: `${destData.city} (${destData.iata}) - ${destData.name}`
              });
            }
          } catch (error) {
            console.error('Error fetching destination airport details:', error);
          }
        }

        setShowIntelligentSearchSuccess(true);
        setNaturalQuery('');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to process natural language query');
    } finally {
      setIntelligentSearchLoading(false);
    }
  };

  const handleFlightSearch = () => {
    if (!flightSearch.origin || !flightSearch.destination || !flightSearch.departureDate) {
      setError('Please fill in all required fields');
      return;
    }

    navigate('/flights/search', {
      state: {
        searchParams: {
          ...flightSearch,
          tripId: parseInt(tripId)
        }
      }
    });
  };

  const handleViewFlightDetails = (flightId) => {
    navigate(`/trips/${tripId}/flights/${flightId}`);
  };

  if (!trip) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>{trip.name}</Typography>
      <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
        {trip.destination} • {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="EVENTS" />
          <Tab label="FLIGHTS" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Button 
          variant="contained" 
          onClick={() => setOpenEventDialog(true)} 
          sx={{ mb: 3 }}
        >
          ADD EVENT
        </Button>
        
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{event.name}</Typography>
                  <Typography color="textSecondary">
                    {new Date(event.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">{event.time}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Button 
          variant="contained" 
          onClick={() => setOpenFlightDialog(true)} 
          sx={{ mb: 3 }}
        >
          SEARCH FLIGHTS
        </Button>

        <Grid container spacing={3}>
          {trip.flightOffers?.map((offer) => {
            const flightDetails = JSON.parse(offer.offer);
            return (
              <Grid item xs={12} key={offer.flightID}>
                <Card>
                  <CardActionArea onClick={() => handleViewFlightDetails(offer.flightID)}>
                    <CardContent>
                      <Typography variant="h6">
                        {flightDetails.airline.name} - {flightDetails.flights[0].departure.airportCode} to {flightDetails.flights[flightDetails.flights.length - 1].arrival.airportCode}
                      </Typography>
                      <Typography color="textSecondary">
                        PNR: {offer.pnr} • Ticket: {offer.ticketNo}
                      </Typography>
                      <Typography variant="body2">
                        {flightDetails.totalPrice} {flightDetails.currency}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>

      {/* Event Dialog */}
      <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)}>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Name"
            fullWidth
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEvent} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Flight Search Dialog */}
      <Dialog 
        open={openFlightDialog} 
        onClose={() => setOpenFlightDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Search Flights</Typography>
            <Chip 
              icon={<SmartToyIcon />} 
              label="Powered by AI" 
              color="primary" 
              size="small"
              sx={{ ml: 1 }}
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Use our AI-powered intelligent search to find flights naturally
            </Typography>
            <TextField
              fullWidth
              label="Describe your flight (e.g., 'economy flight from Chicago to NYC for me and my child on December 15th')"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: <SmartToyIcon sx={{ mr: 1, color: 'primary.main' }} />,
              }}
            />
            <Button 
              variant="outlined" 
              onClick={handleIntelligentSearch}
              disabled={!naturalQuery.trim() || intelligentSearchLoading}
              sx={{ mr: 1 }}
              startIcon={intelligentSearchLoading ? <CircularProgress size={20} /> : <SmartToyIcon />}
            >
              Search with AI
            </Button>
          </Box>

          <Collapse in={showIntelligentSearchSuccess}>
            <Alert
              severity="success"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setShowIntelligentSearchSuccess(false)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              AI has processed your search! The form below has been filled with your preferences.
            </Alert>
          </Collapse>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Or use the traditional search form below
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={airports}
                getOptionLabel={(option) => option.displayName || ''}
                loading={searchingAirports}
                value={originAirport}
                onChange={(e, value) => {
                  setOriginAirport(value);
                  setFlightSearch({ 
                    ...flightSearch, 
                    origin: value?.iata || '' 
                  });
                }}
                onInputChange={(e, value) => {
                  searchAirports(value);
                }}
                isOptionEqualToValue={(option, value) => option?.iata === value?.iata}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="From"
                    margin="dense"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searchingAirports ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={airports}
                getOptionLabel={(option) => option.displayName || ''}
                loading={searchingAirports}
                value={destinationAirport}
                onChange={(e, value) => {
                  setDestinationAirport(value);
                  setFlightSearch({ 
                    ...flightSearch, 
                    destination: value?.iata || '' 
                  });
                }}
                onInputChange={(e, value) => {
                  searchAirports(value);
                }}
                isOptionEqualToValue={(option, value) => option?.iata === value?.iata}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="To"
                    margin="dense"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searchingAirports ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Departure Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={flightSearch.departureDate}
                onChange={(e) => setFlightSearch({ 
                  ...flightSearch, 
                  departureDate: e.target.value 
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Travel Class</InputLabel>
                <Select
                  value={flightSearch.travelClass}
                  label="Travel Class"
                  onChange={(e) => setFlightSearch({
                    ...flightSearch,
                    travelClass: e.target.value
                  })}
                >
                  <MenuItem value="ECONOMY">Economy</MenuItem>
                  <MenuItem value="BUSINESS">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="number"
                label="Adults"
                fullWidth
                margin="dense"
                value={flightSearch.adults}
                onChange={(e) => setFlightSearch({
                  ...flightSearch,
                  adults: parseInt(e.target.value) || 0
                })}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="number"
                label="Children"
                fullWidth
                margin="dense"
                value={flightSearch.children}
                onChange={(e) => setFlightSearch({
                  ...flightSearch,
                  children: parseInt(e.target.value) || 0
                })}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="number"
                label="Infants"
                fullWidth
                margin="dense"
                value={flightSearch.infants}
                onChange={(e) => setFlightSearch({
                  ...flightSearch,
                  infants: parseInt(e.target.value) || 0
                })}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFlightDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              handleFlightSearch();
              setOpenFlightDialog(false);
            }} 
            color="primary"
            disabled={!flightSearch.origin || !flightSearch.destination || !flightSearch.departureDate}
          >
            Search
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
