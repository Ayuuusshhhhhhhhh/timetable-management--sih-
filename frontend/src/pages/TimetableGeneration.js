import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem,
  Alert, CircularProgress, Stepper, Step, StepLabel, Card, CardContent,
  List, ListItem, ListItemText, Chip
} from '@mui/material';
import { PlayArrow as GenerateIcon, Check as ApproveIcon, Publish as PublishIcon } from '@mui/icons-material';
import axios from 'axios';

const TimetableGeneration = () => {
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const academicYears = ['2024-25', '2023-24', '2025-26'];
  const steps = ['Generate', 'Review', 'Approve', 'Publish'];

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/timetable/generate', {
        academic_year: academicYear,
        options: {
          optimization: 'balanced',
          allowConflicts: false
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResult(response.data);
      setActiveStep(1);
    } catch (error) {
      setError('Failed to generate timetable: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put('/api/timetable/approve', {
        academic_year: academicYear
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActiveStep(2);
    } catch (error) {
      setError('Failed to approve timetable');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put('/api/timetable/publish', {
        academic_year: academicYear
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActiveStep(3);
    } catch (error) {
      setError('Failed to publish timetable');
    } finally {
      setLoading(false);
    }
  };

  const validateTimetable = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/timetable/validate?academic_year=${academicYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Validation error:', error);
      return { isValid: false, conflicts: [] };
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Timetable Generation</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              label="Academic Year"
            >
              {academicYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <GenerateIcon />}
            onClick={handleGenerate}
            disabled={loading}
          >
            Generate Timetable
          </Button>
        </Box>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {result && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Generation Results</Typography>
            <Box display="flex" gap={2} mb={2}>
              <Chip label={`${result.entriesCreated} Classes Scheduled`} color="success" />
              <Chip 
                label={`${result.conflicts?.length || 0} Conflicts`} 
                color={result.conflicts?.length > 0 ? 'error' : 'success'} 
              />
            </Box>
            
            {result.conflicts && result.conflicts.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Conflicts to Resolve:</Typography>
                <List dense>
                  {result.conflicts.slice(0, 5).map((conflict, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${conflict.batch} - ${conflict.subject}`}
                        secondary={conflict.reason}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            <Typography color="textSecondary" variant="body2">
              {result.message}
            </Typography>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<ApproveIcon />}
            onClick={handleApprove}
            disabled={loading}
            color="success"
          >
            Approve Timetable
          </Button>
        </Box>
      )}

      {activeStep === 2 && (
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={handlePublish}
            disabled={loading}
            color="primary"
          >
            Publish Timetable
          </Button>
        </Box>
      )}

      {activeStep === 3 && (
        <Alert severity="success">
          Timetable has been successfully published for academic year {academicYear}!
        </Alert>
      )}
    </Box>
  );
};

export default TimetableGeneration;
