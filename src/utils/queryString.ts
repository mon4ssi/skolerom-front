import reduce from 'lodash/reduce';

interface QueryStringObject {
  [key: string]: string;
}

export const parseQueryString = (url: string | undefined | null): QueryStringObject => {
  if (url) {
    const queryString: string = url.split('?')[1];
    if (queryString) {
      const pairs = queryString.split('&');

      return reduce<string, QueryStringObject>(
        pairs,
        (acc: QueryStringObject, value: string): QueryStringObject => {
          const pair = value.split('=');
          acc[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
          return acc;
        },
        {}
      );
    }
  }

  return {};
};

export const createQueryString = (object: QueryStringObject): string => (
  reduce<QueryStringObject, string>(
    object,
    (acc: string, value: string, key: string): string => {
      const sign = acc ? '&' : '?';
      if (!value || !key) {
        return acc;
      }
      return `${acc}${sign}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    },
    ''
  )
);

export const updateQueryString = (queryString: string, key: string, value?: string): string => {
  const query = parseQueryString(queryString);
  if (value) {
    query[key] = value;
  } else {
    // tslint:disable-next-line:no-dynamic-delete
    delete query[key];
  }

  return createQueryString(query);
};
