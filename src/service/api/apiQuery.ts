'use-client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { axiosClient } from '../axios';

export const defaultHeader = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

function responseBody<T>(res: AxiosResponse<T>) {
  return { data: res.data, code: res.status };
}

export default class ApiQuery {
  root: string;
  config: AxiosRequestConfig;

  constructor(rootUrl: string, config?: AxiosRequestConfig) {
    this.root = rootUrl;
    if (config) {
      this.config = config;
      if (!this.config?.headers) this.config.headers = {};
      this.config['headers'] = { ...this.config['headers'], ...defaultHeader };
    } else this.config = { headers: defaultHeader };
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return await axiosClient.get(`${this.root}${url}`, { ...config, ...this.config }).then<{
      data: T;
      code: number;
    }>(responseBody);
  }

  async post<T = any, B = any>(url: string, data?: B, config?: AxiosRequestConfig) {
    return await axiosClient.post(`${this.root}${url}`, data, { ...config, ...this.config }).then<{
      data: T;
      code: number;
    }>(responseBody);
  }

  async put<T = any, B = any>(url: string, data?: B, config?: AxiosRequestConfig) {
    return await axiosClient.put(`${this.root}${url}`, data, { ...config, ...this.config }).then<{
      data: T;
      code: number;
    }>(responseBody);
  }

  async del<T = any>(url: string, config?: AxiosRequestConfig) {
    return await axiosClient.delete(`${this.root}${url}`, { ...config, ...this.config }).then<{
      data: T;
      code: number;
    }>(responseBody);
  }
}
