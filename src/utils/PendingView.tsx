import React from 'react';
import intl from 'react-intl-universal';

interface IProps {
  isFetching?: boolean | false;
  message?: string | 'There are no data yet!';
  items: Array<Object>;
  children: JSX.Element;
}

export const PendingView: React.FC<IProps> = ({
  isFetching,
  message,
  items,
  children,
}) => {
  if (isFetching) return <div><span>{intl.get('loading')}</span></div>;
  if (items.length === 0) return <div><span>{message}</span></div>;

  return children;
};
