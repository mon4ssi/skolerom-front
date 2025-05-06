import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { injector } from 'Injector';
import { storage } from 'utils/storage';
import { StorageInteractor, STORAGE_INTERACTOR_KEY } from 'utils/storageInteractor';
import { STATUS_UNAUTHORIZED, LOCALES_MAPPING_FOR_BACKEND } from 'utils/constants';
import { Locales } from './enums';

const SKOLEROM_SSO_AUTH_COOKIE = 'sso-authcookie-skolerom';

const API = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    'content-type': 'application/json'
  }
});

const WORDPRESS_API = axios.create({
  baseURL: process.env.REACT_APP_WP_URL,
  headers: {
    'content-type': 'application/json'
  }
});

const ARTICLE_API = axios.create({
  baseURL: process.env.REACT_ARTICLE_APP_BASE_URL,
  headers: {
    'content-type': 'application/json'
  }
});

const logoutUserIfSessionCookieIsNotPresent = (session: StorageInteractor) => {
  if (storage.local.isDevelopment()) return;
  if (window.location.pathname === '/logout') return;
  if (document.cookie.split(SKOLEROM_SSO_AUTH_COOKIE).length > 1) return;

  session.logOut();

  window.location.reload();
};

const onRequestFulfilled = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
  if (config.headers && !config.headers.Authorization) {
    const storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
    const locale = storageInteractor.getCurrentLocale() as Locales;
    const token = storageInteractor.getToken();

    if (token) {
      logoutUserIfSessionCookieIsNotPresent(storageInteractor);

      config.headers.Authorization = `Bearer ${token}`;
    }

    if (LOCALES_MAPPING_FOR_BACKEND[locale]) {
      config.headers['Accept-Language'] = LOCALES_MAPPING_FOR_BACKEND[locale];
    }
  }

  return config;
};

const onRequestRejected = (error: any) => Promise.reject(error);

const onResponseFulfilled = (response: AxiosResponse) => response;

const onResponseRejected = async (error: any) => {
  const { response } = error;

  if (response && response.status === STATUS_UNAUTHORIZED) {
    injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY).logOut();
    window.location.href = '/login';
  }

  return Promise.reject(error);
};

API.interceptors.request.use(onRequestFulfilled, onRequestRejected);

API.interceptors.response.use(onResponseFulfilled, onResponseRejected);

export { API, ARTICLE_API, WORDPRESS_API };
