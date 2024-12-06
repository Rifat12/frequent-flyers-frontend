import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  Airlines
} from '@mui/icons-material';
import axios from 'axios';

export default function FlightBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [passengers, setPassengers] = useState([]);

  const { flight, tripId, searchParams } = location.state || {};

  useEffect(() => {
    if (!flight || !tripId || !searchParams) {
      navigate('/trips');
      return;
    }

    // Initialize passenger forms based on search params
    const totalPassengers = (searchParams.adults || 0) + (searchParams.children || 0);
    const initialPassengers = Array(totalPassengers).fill(null).map((_, index) => ({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      gender: 'Male',
      nationality: '',
      email: '',
      dateOfBirth: '',
      travelerType: index < searchParams.adults ? 'ADT' : 'CHD'
    }));
    setPassengers(initialPassengers);
  }, [flight, tripId, searchParams, navigate]);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };

  const isPassengerFormValid = (passenger) => {
    return passenger.firstName && 
           passenger.lastName && 
           passenger.email && 
           passenger.phoneNumber && 
           passenger.nationality && 
           passenger.dateOfBirth;
  };

  const handleNext = () => {
    if (activeStep < passengers.length - 1) {
      if (isPassengerFormValid(passengers[activeStep])) {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleBookFlight = async () => {
    if (!passengers.every(isPassengerFormValid)) {
      setError('Please fill in all passenger information');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:4000/flights/book', {
        tripId: tripId,
        flightOfferInfo: flight,
        passengerInfo: passengers.map(passenger => ({
          ...passenger,
          dateOfBirth: passenger.dateOfBirth.split('-').join('/')
        }))
      }, {
        withCredentials: true
      });
      navigate(`/trips/${tripId}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to book flight');
    }
    setLoading(false);
  };

  if (!flight || !tripId || !searchParams || passengers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Selected Flight</Typography>
        <Card>
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
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Passenger Information</Typography>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {passengers.map((passenger, index) => (
            <Step key={index}>
              <StepLabel>
                Passenger {index + 1} ({passenger.travelerType === 'ADT' ? 'Adult' : 'Child'})
              </StepLabel>
              <StepContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      fullWidth
                      required
                      value={passenger.firstName}
                      onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      fullWidth
                      required
                      value={passenger.lastName}
                      onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      required
                      value={passenger.email}
                      onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      fullWidth
                      required
                      value={passenger.phoneNumber}
                      onChange={(e) => handlePassengerChange(index, 'phoneNumber', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={passenger.gender}
                        label="Gender"
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nationality"
                      fullWidth
                      required
                      value={passenger.nationality}
                      onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Date of Birth"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      value={passenger.dateOfBirth}
                      onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  {activeStep === passengers.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleBookFlight}
                      disabled={loading || !isPassengerFormValid(passenger)}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Book Flight'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isPassengerFormValid(passenger)}
                    >
                      Next Passenger
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
          >
            Back to Results
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
