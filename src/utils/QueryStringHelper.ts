import isNaN from 'lodash/isNaN';

import { updateQueryString, parseQueryString } from './queryString';
import { History } from 'history';

export function set(history: History, key: string, value: string | number): void {
  const newQueryString = updateQueryString(history.location.search, key, value.toString());
  history.push(`${history.location.pathname}${newQueryString}`, { ...history.location.state });
}

export function remove(history: History, ...keys: Array<string>): void {
  const newQueryString = keys.reduce(
    (acc, key) => updateQueryString(acc, key),
    history.location.search
  );
  history.push(`${history.location.pathname}${newQueryString}`, { ...history.location.state });
}

export function getString(history: History, key: string, defaultValue?: string): string | null | undefined {
  const queryStringObject = parseQueryString(history.location.search);
  const value = queryStringObject[key];
  if (value) {
    return value;
  }

  return defaultValue;
}

export function getNumber(history: History, key: string, defaultValue?: number): number | null | undefined {
  const queryStringObject = parseQueryString(history.location.search);
  const value = Number(queryStringObject[key]);
  if (!isNaN(value)) {
    return value;
  }

  return defaultValue;
}
