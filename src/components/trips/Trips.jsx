import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

export default function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get("http://localhost:4000/trips", {
        withCredentials: true,
      });
      setTrips(response.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const handleCreateTrip = async () => {
    try {
      await axios.post("http://localhost:4000/trips", newTrip, {
        withCredentials: true,
      });
      setOpenDialog(false);
      setNewTrip({ name: "", destination: "", startDate: "", endDate: "" });
      fetchTrips();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create trip");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        mb: 4,
        width: '100%'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>My Trips</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          New Trip
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
        {trips.map((trip) => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <Card 
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {trip.name}
                </Typography>
                <Typography 
                  color="primary" 
                  sx={{ 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 500,
                    fontSize: '1.1rem'
                  }}
                >
                  {trip.destination}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    From: {formatDate(trip.startDate)}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                  >
                    To: {formatDate(trip.endDate)}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  color="primary"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1
                  }}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 'sm',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, px: 3 }}>Create New Trip</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Trip Name"
            fullWidth
            value={newTrip.name}
            onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Destination"
            fullWidth
            value={newTrip.destination}
            onChange={(e) =>
              setNewTrip({ ...newTrip, destination: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTrip.startDate}
            onChange={(e) =>
              setNewTrip({ ...newTrip, startDate: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTrip.endDate}
            onChange={(e) =>
              setNewTrip({ ...newTrip, endDate: e.target.value })
            }
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ 
              textTransform: 'none',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTrip} 
            variant="contained"
            sx={{ 
              textTransform: 'none',
              px: 3
            }}
          >
            Create Trip
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
