import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:4000/api/user/",
    // withCredentials: true,
});

export const googleAuth = (code) => api.post(`/google?code=${code}`);