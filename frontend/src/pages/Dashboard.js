import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  Groups as GroupsIcon,
  Subject as SubjectIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch different data based on user role
      const promises = [];

      if (user.role === 'admin') {
        promises.push(
          axios.get('/api/subjects/stats', config),
          axios.get('/api/batches/stats', config),
          axios.get('/api/classrooms/stats', config)
        );
      }

      // Fetch today's schedule for all users
      const today = new Date().toISOString().split('T')[0];
      const currentAcademicYear = getCurrentAcademicYear();
      
      if (user.role === 'faculty') {
        promises.push(
          axios.get(`/api/timetable/faculty/${user.id}?academic_year=${currentAcademicYear}`, config)
        );
      } else if (user.role === 'student' && user.batch_id) {
        promises.push(
          axios.get(`/api/batches/${user.batch_id}/timetable?academic_year=${currentAcademicYear}`, config)
        );
      } else if (user.role === 'admin') {
        promises.push(
          axios.get(`/api/timetable?academic_year=${currentAcademicYear}`, config)
        );
      }

      const results = await Promise.allSettled(promises);
      
      // Process results based on user role
      if (user.role === 'admin' && results.length >= 3) {
        setStats({
          subjects: results[0].status === 'fulfilled' ? results[0].value.data.stats : null,
          batches: results[1].status === 'fulfilled' ? results[1].value.data.stats : null,
          classrooms: results[2].status === 'fulfilled' ? results[2].value.data.stats : null,
        });
        
        if (results[3] && results[3].status === 'fulfilled') {
          setTodaySchedule(results[3].value.data.timetable || []);
        }
      } else if (results[0] && results[0].status === 'fulfilled') {
        const scheduleData = results[0].value.data;
        setTodaySchedule(scheduleData.schedule || scheduleData.timetable || []);
      }

      // Mock recent activity (in a real app, this would come from an API)
      setRecentActivity([
        { id: 1, type: 'info', message: 'Timetable generated for 2024-25', time: '2 hours ago' },
        { id: 2, type: 'success', message: 'New subject "Advanced Algorithms" added', time: '1 day ago' },
        { id: 3, type: 'warning', message: 'Classroom A-101 marked unavailable', time: '2 days ago' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Academic year typically starts in July/August
    if (month >= 6) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  };

  const getTodayDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'approved': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user.first_name}!
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Stats Cards for Admin */}
        {user.role === 'admin' && stats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <SubjectIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Subjects
                      </Typography>
                      <Typography variant="h4">
                        {stats.subjects?.total_subjects || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <GroupsIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Active Batches
                      </Typography>
                      <Typography variant="h4">
                        {stats.batches?.total_batches || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <RoomIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Available Rooms
                      </Typography>
                      <Typography variant="h4">
                        {stats.classrooms?.available_rooms || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <ScheduleIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Scheduled Classes
                      </Typography>
                      <Typography variant="h4">
                        {todaySchedule.length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Today's Schedule */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Schedule ({getTodayDay()})
              </Typography>
              {todaySchedule.length > 0 ? (
                <List>
                  {todaySchedule
                    .filter(item => item.day_of_week === getTodayDay())
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .slice(0, 5)
                    .map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ScheduleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">
                              {item.subject_name || item.subject_code}
                            </Typography>
                            <Chip 
                              label={item.status} 
                              size="small" 
                              color={getStatusColor(item.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            {item.start_time} - {item.end_time} | 
                            {item.room_number} | 
                            {user.role !== 'faculty' && `${item.faculty_first_name} ${item.faculty_last_name}`}
                            {user.role === 'admin' && ` | ${item.batch_name}`}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">
                  No classes scheduled for today
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id}>
                    <ListItemIcon>
                      {activity.type === 'success' && <CheckCircleIcon color="success" />}
                      {activity.type === 'warning' && <WarningIcon color="warning" />}
                      {activity.type === 'error' && <ErrorIcon color="error" />}
                      {activity.type === 'info' && <PersonIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.message}
                      secondary={activity.time}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
