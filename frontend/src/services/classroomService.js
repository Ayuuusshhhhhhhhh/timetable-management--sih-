import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const classroomService = {
  getAll: (params = {}) => {
    return axios.get(`${API_BASE_URL}/classrooms`, { params });
  },

  getById: (id) => {
    return axios.get(`${API_BASE_URL}/classrooms/${id}`);
  },

  create: (classroomData) => {
    return axios.post(`${API_BASE_URL}/classrooms`, classroomData);
  },

  update: (id, classroomData) => {
    return axios.put(`${API_BASE_URL}/classrooms/${id}`, classroomData);
  },

  delete: (id) => {
    return axios.delete(`${API_BASE_URL}/classrooms/${id}`);
  },

  search: (query) => {
    return axios.get(`${API_BASE_URL}/classrooms/search`, { params: { q: query } });
  },

  getStats: () => {
    return axios.get(`${API_BASE_URL}/classrooms/stats`);
  },

  getAvailable: (timeSlotId, academicYear, type = null) => {
    const params = { time_slot_id: timeSlotId, academic_year: academicYear };
    if (type) params.type = type;
    return axios.get(`${API_BASE_URL}/classrooms/available`, { params });
  },

  getSchedule: (id, academicYear) => {
    return axios.get(`${API_BASE_URL}/classrooms/${id}/schedule`, {
      params: { academic_year: academicYear }
    });
  }
};

export default classroomService;
