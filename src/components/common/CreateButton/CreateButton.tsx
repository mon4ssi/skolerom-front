import React from 'react';
import './CreateButton.scss';

import classnames from 'classnames';

interface Props {
  light?: boolean;
  green?: boolean;
  disabled?: boolean;
  children: string | React.ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
  pink?: boolean;
}

export const CreateButton = (props: Props) => {
  const { light, green, disabled, children, className, onClick, title, pink } = props;
  const classNames = classnames(
    'CreateButton',
    className && className,
    light && 'light',
    green && 'green',
    pink && 'pink'
  );

  return (
    <button
      className={classNames}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
};
