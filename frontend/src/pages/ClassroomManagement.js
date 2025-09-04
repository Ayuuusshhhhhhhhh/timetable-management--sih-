import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const ClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [formData, setFormData] = useState({
    room_number: '',
    building: '',
    capacity: '',
    type: '',
    equipment: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/classrooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClassrooms(response.data.classrooms || []);
    } catch (error) {
      setError('Failed to fetch classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingClassroom) {
        await axios.put(`/api/classrooms/${editingClassroom.id}`, formData, config);
      } else {
        await axios.post('/api/classrooms', formData, config);
      }
      
      fetchClassrooms();
      handleClose();
    } catch (error) {
      setError('Failed to save classroom');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this classroom?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/classrooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchClassrooms();
      } catch (error) {
        setError('Failed to delete classroom');
      }
    }
  };

  const handleOpen = (classroom = null) => {
    setEditingClassroom(classroom);
    setFormData(classroom || {
      room_number: '',
      building: '',
      capacity: '',
      type: '',
      equipment: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingClassroom(null);
    setFormData({
      room_number: '',
      building: '',
      capacity: '',
      type: '',
      equipment: ''
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Classroom Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Classroom
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Room Number</TableCell>
              <TableCell>Building</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classrooms.map((classroom) => (
              <TableRow key={classroom.id}>
                <TableCell>{classroom.room_number}</TableCell>
                <TableCell>{classroom.building}</TableCell>
                <TableCell>{classroom.capacity}</TableCell>
                <TableCell>
                  <Chip 
                    label={classroom.type} 
                    color={classroom.type === 'lab' ? 'secondary' : 'primary'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={classroom.is_available ? 'Available' : 'Unavailable'} 
                    color={classroom.is_available ? 'success' : 'error'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(classroom)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(classroom.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Add/Edit */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingClassroom ? 'Edit Classroom' : 'Add Classroom'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Room Number"
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Building"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="lecture">Lecture Hall</MenuItem>
                <MenuItem value="lab">Laboratory</MenuItem>
                <MenuItem value="seminar">Seminar Room</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Equipment (JSON)"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder='{"projector": true, "computers": 30}'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClassroom ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassroomManagement;
