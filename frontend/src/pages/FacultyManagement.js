import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Chip, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '', department: '', phone: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => { fetchFaculty(); }, []);

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/users?role=faculty', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaculty(response.data.users || []);
    } catch (error) {
      setError('Failed to fetch faculty');
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingFaculty) {
        await axios.put(`/api/auth/users/${editingFaculty.id}`, formData, config);
      } else {
        await axios.post('/api/auth/register', { ...formData, role: 'faculty' }, config);
      }
      
      fetchFaculty();
      handleClose();
    } catch (error) {
      setError('Failed to save faculty');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchFaculty();
      } catch (error) {
        setError('Failed to delete faculty');
      }
    }
  };

  const handleOpen = (facultyMember = null) => {
    setEditingFaculty(facultyMember);
    setFormData(facultyMember || { email: '', password: '', first_name: '', last_name: '', department: '', phone: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingFaculty(null);
    setFormData({ email: '', password: '', first_name: '', last_name: '', department: '', phone: '' });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Faculty Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Faculty
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Department</TableCell>
              <TableCell>Phone</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faculty.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.first_name} {member.last_name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>
                  <Chip label={member.is_active ? 'Active' : 'Inactive'} 
                        color={member.is_active ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(member)} color="primary"><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(member.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFaculty ? 'Edit Faculty' : 'Add Faculty'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Email" value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth required />
            {!editingFaculty && (
              <TextField label="Password" type="password" value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} fullWidth required />
            )}
            <TextField label="First Name" value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} fullWidth required />
            <TextField label="Last Name" value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} fullWidth required />
            <TextField label="Department" value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })} fullWidth required />
            <TextField label="Phone" value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingFaculty ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacultyManagement;
