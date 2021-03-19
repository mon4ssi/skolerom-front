import React from 'react';
import './CreateButton.scss';

import classnames from 'classnames';

interface Props {
  light?: boolean;
  green?: boolean;
  disabled?: boolean;
  children: string | React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const CreateButton = (props: Props) => {
  const { light, green, disabled, children, className, onClick } = props;
  const classNames = classnames(
    'CreateButton',
    className && className,
    light && 'light',
    green && 'green'
  );

  return (
    <button
      className={classNames}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
