import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    batch_name: '', department: '', year: '', semester: '', academic_year: '', student_count: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/batches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBatches(response.data.batches || []);
    } catch (error) {
      setError('Failed to fetch batches');
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingBatch) {
        await axios.put(`/api/batches/${editingBatch.id}`, formData, config);
      } else {
        await axios.post('/api/batches', formData, config);
      }
      
      fetchBatches();
      handleClose();
    } catch (error) {
      setError('Failed to save batch');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/batches/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBatches();
      } catch (error) {
        setError('Failed to delete batch');
      }
    }
  };

  const handleOpen = (batch = null) => {
    setEditingBatch(batch);
    setFormData(batch || { batch_name: '', department: '', year: '', semester: '', academic_year: '', student_count: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBatch(null);
    setFormData({ batch_name: '', department: '', year: '', semester: '', academic_year: '', student_count: '' });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Batch Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Batch
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Batch Name</TableCell><TableCell>Department</TableCell><TableCell>Year</TableCell>
              <TableCell>Semester</TableCell><TableCell>Academic Year</TableCell><TableCell>Students</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>{batch.batch_name}</TableCell>
                <TableCell>{batch.department}</TableCell>
                <TableCell>{batch.year}</TableCell>
                <TableCell>{batch.semester}</TableCell>
                <TableCell>{batch.academic_year}</TableCell>
                <TableCell>{batch.student_count}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(batch)} color="primary"><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(batch.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBatch ? 'Edit Batch' : 'Add Batch'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Batch Name" value={formData.batch_name} 
              onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })} fullWidth required />
            <TextField label="Department" value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })} fullWidth required />
            <TextField label="Year" type="number" value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })} fullWidth required />
            <TextField label="Semester" type="number" value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })} fullWidth required />
            <TextField label="Academic Year" value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })} fullWidth required />
            <TextField label="Student Count" type="number" value={formData.student_count}
              onChange={(e) => setFormData({ ...formData, student_count: e.target.value })} fullWidth required />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingBatch ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchManagement;
