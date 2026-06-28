import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers['x-admin-token'] = token;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const getStudents = ({ page = 1, limit = 15, search = '', std = '', group = '', medium = '' } = {}) =>
  api.get('/students', { params: { page, limit, search: search || undefined, std: std || undefined, group: group || undefined, medium: medium || undefined } })
     .then((r) => r.data); // returns { data, total, page, pages }
export const addStudent = (data) => api.post('/students', data).then((r) => r.data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data).then((r) => r.data);
export const deleteStudent = (id) => api.delete(`/students/${id}`).then((r) => r.data);
export const getGroups = () => api.get('/students/groups').then((r) => r.data);
export const getStudentsByGroup = (g) => api.get(`/students/group/${g}`).then((r) => r.data);
export const deleteGroup = (g) => api.delete(`/students/group/${g}`).then((r) => r.data);

export const getAttendance = (date) => api.get(`/attendance/${date}`).then((r) => r.data);
export const saveAttendance = (date, records) =>
  api.post('/attendance/bulk', { date, records }).then((r) => r.data);
export const markAttendanceNotified = (id) =>
  api.patch(`/attendance/notified/${id}`).then((r) => r.data);
export const getMonthlyAttendance = (month, year) =>
  api.get(`/attendance/monthly?month=${month}&year=${year}`).then((r) => r.data);

export const getFees = ({ page = 1, limit = 15, status = '', month = '', year = '' } = {}) =>
  api.get('/fees', { params: { page, limit, status: status || undefined, month: month || undefined, year: year || undefined } })
     .then((r) => r.data); // returns { data, total, page, pages }
export const getDueFees = () => api.get('/fees/due').then((r) => r.data);
export const addFee = (data) => api.post('/fees', data).then((r) => r.data);
export const payFee = (id, data) => api.patch(`/fees/pay/${id}`, data).then((r) => r.data);
export const markFeeNotified = (id) => api.patch(`/fees/notified/${id}`).then((r) => r.data);
export const updateFeeComments = (id, comments) => api.patch(`/fees/comments/${id}`, { comments }).then((r) => r.data);
export const deleteFee    = (id) => api.delete(`/fees/${id}`).then((r) => r.data);
export const generateFees = (data) => api.post('/fees/generate', data).then((r) => r.data);

export const getDashboard = () => api.get('/dashboard').then((r) => r.data);

export const sendWhatsApp = (mobile, message) => {
  const cleaned = mobile.replace(/\D/g, '');
  const num = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
};
