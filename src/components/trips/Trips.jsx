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

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">My Trips</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Trip
        </Button>
      </Box>

      <Grid container spacing={3}>
        {trips.map((trip) => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{trip.name}</Typography>
                <Typography color="textSecondary">
                  {trip.destination}
                </Typography>
                <Typography variant="body2">
                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Trip</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Trip Name"
            fullWidth
            value={newTrip.name}
            onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Destination"
            fullWidth
            value={newTrip.destination}
            onChange={(e) =>
              setNewTrip({ ...newTrip, destination: e.target.value })
            }
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
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTrip} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
