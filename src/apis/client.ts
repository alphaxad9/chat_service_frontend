import axios from "axios";

const API_BASE_URL = 'http://localhost:8000/zedvye_one';

export const client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})