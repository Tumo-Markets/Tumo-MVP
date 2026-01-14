'use client';

import axios from 'axios';

export const axiosClient = axios.create();

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config) {
    if (typeof window === 'undefined') return config;
    // Do something before request is sent
    const token = JSON.parse(localStorage.getItem('userData') || '{}')?.jwtToken?.access_token;

    if (config.headers) {
      config.headers.Authorization = token ? `Bearer ${token}` : '';
    }

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);
