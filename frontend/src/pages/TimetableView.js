import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import axios from 'axios';

const TimetableView = ({ user }) => {
  const [timetable, setTimetable] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const academicYears = ['2024-25', '2023-24', '2022-23'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];

  useEffect(() => {
    setSelectedAcademicYear(getCurrentAcademicYear());
    if (user.role === 'admin' || user.role === 'faculty') {
      fetchBatches();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchTimetable();
    }
  }, [selectedBatch, selectedAcademicYear]);

  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 6) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  };

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/batches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBatches(response.data.batches || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let url = `/api/timetable?academic_year=${selectedAcademicYear}`;
      
      if (user.role === 'student' && user.batch_id) {
        url += `&batch_id=${user.batch_id}`;
      } else if (selectedBatch) {
        url += `&batch_id=${selectedBatch}`;
      }

      const response = await axios.get(url, config);
      setTimetable(response.data.timetable || []);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `/api/timetable/export/pdf?academic_year=${selectedAcademicYear}`;
      
      if (selectedBatch) {
        url += `&batch_id=${selectedBatch}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `timetable-${selectedAcademicYear}.pdf`;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `/api/timetable/export/excel?academic_year=${selectedAcademicYear}`;
      
      if (selectedBatch) {
        url += `&batch_id=${selectedBatch}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `timetable-${selectedAcademicYear}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'approved': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const groupTimetableByDay = () => {
    const grouped = {};
    daysOfWeek.forEach(day => {
      grouped[day] = {};
      timeSlots.forEach(slot => {
        grouped[day][slot] = null;
      });
    });

    timetable.forEach(entry => {
      const timeSlot = `${entry.start_time}-${entry.end_time}`;
      if (grouped[entry.day_of_week] && grouped[entry.day_of_week][timeSlot] !== undefined) {
        grouped[entry.day_of_week][timeSlot] = entry;
      }
    });

    return grouped;
  };

  const groupedTimetable = groupTimetableByDay();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Timetable View</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            sx={{ mr: 1 }}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                label="Academic Year"
              >
                {academicYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {(user.role === 'admin' || user.role === 'faculty') && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Batch</InputLabel>
                <Select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  label="Batch"
                >
                  <MenuItem value="">All Batches</MenuItem>
                  {batches.map(batch => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.batch_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Timetable Grid */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                Time
              </TableCell>
              {daysOfWeek.map(day => (
                <TableCell key={day} align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map(timeSlot => (
              <TableRow key={timeSlot}>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                  {timeSlot}
                </TableCell>
                {daysOfWeek.map(day => {
                  const entry = groupedTimetable[day][timeSlot];
                  return (
                    <TableCell key={day} align="center" sx={{ minHeight: 80, verticalAlign: 'top', p: 1 }}>
                      {entry ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {entry.subject_code}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {entry.faculty_first_name} {entry.faculty_last_name}
                          </Typography>
                          <Typography variant="caption" display="block" color="textSecondary">
                            {entry.room_number}
                          </Typography>
                          {user.role === 'admin' && (
                            <>
                              <Typography variant="caption" display="block" color="textSecondary">
                                {entry.batch_name}
                              </Typography>
                              <Chip 
                                label={entry.status} 
                                size="small" 
                                color={getStatusColor(entry.status)}
                                sx={{ mt: 0.5 }}
                              />
                            </>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {timetable.length === 0 && !loading && (
        <Box textAlign="center" mt={4}>
          <Typography color="textSecondary">
            No timetable data found for the selected criteria.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TimetableView;
