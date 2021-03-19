import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { injector } from 'Injector';
import { StorageInteractor, STORAGE_INTERACTOR_KEY } from 'utils/storageInteractor';
import { STATUS_UNAUTHORIZED, LOCALES_MAPPING_FOR_BACKEND } from 'utils/constants';
import { Locales } from './enums';

const API = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    'content-type': 'application/json'
  }
});

API.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig> => {
    if (!config.headers.Authorization) {
      const storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
      const token = storageInteractor.getToken();
      const locale = storageInteractor.getCurrentLocale() as Locales;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (LOCALES_MAPPING_FOR_BACKEND[locale]) {
        config.headers['Accept-Language'] = LOCALES_MAPPING_FOR_BACKEND[locale];
      }
    }

    return config;
  },
  error => Promise.reject(error)
);

API.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response!.status === STATUS_UNAUTHORIZED) {
      injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY).logOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { API };
