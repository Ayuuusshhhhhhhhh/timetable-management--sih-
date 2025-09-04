import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Chip, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    subject_code: '', subject_name: '', department: '', credits: '', type: '', duration_minutes: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data.subjects || []);
    } catch (error) {
      setError('Failed to fetch subjects');
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingSubject) {
        await axios.put(`/api/subjects/${editingSubject.id}`, formData, config);
      } else {
        await axios.post('/api/subjects', formData, config);
      }
      
      fetchSubjects();
      handleClose();
    } catch (error) {
      setError('Failed to save subject');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/subjects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSubjects();
      } catch (error) {
        setError('Failed to delete subject');
      }
    }
  };

  const handleOpen = (subject = null) => {
    setEditingSubject(subject);
    setFormData(subject || { subject_code: '', subject_name: '', department: '', credits: '', type: '', duration_minutes: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSubject(null);
    setFormData({ subject_code: '', subject_name: '', department: '', credits: '', type: '', duration_minutes: '' });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Subject Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Subject
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Department</TableCell>
              <TableCell>Credits</TableCell><TableCell>Type</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>{subject.subject_code}</TableCell>
                <TableCell>{subject.subject_name}</TableCell>
                <TableCell>{subject.department}</TableCell>
                <TableCell>{subject.credits}</TableCell>
                <TableCell><Chip label={subject.type} size="small" /></TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(subject)} color="primary"><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(subject.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Subject Code" value={formData.subject_code} 
              onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })} fullWidth required />
            <TextField label="Subject Name" value={formData.subject_name}
              onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })} fullWidth required />
            <TextField label="Department" value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })} fullWidth required />
            <TextField label="Credits" type="number" value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })} fullWidth required />
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} label="Type">
                <MenuItem value="theory">Theory</MenuItem>
                <MenuItem value="lab">Lab</MenuItem>
                <MenuItem value="practical">Practical</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Duration (minutes)" type="number" value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} fullWidth required />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingSubject ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectManagement;
