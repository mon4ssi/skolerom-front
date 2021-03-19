import React, { ChangeEvent } from 'react';
import './TextArea.scss';

interface Props {
  name: string;
  style?: object | undefined;
  htmlClass?: string;
  cols?: number;
  rows?: number;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

export const TextArea: React.FC<Props> = ({
  name,
  style,
  htmlClass,
  cols,
  rows,
  placeholder,
  defaultValue,
  value,
  onChange,
}) => (
  <textarea
    name={name}
    style={style}
    className={`textarea ${htmlClass}`}
    cols={cols}
    rows={rows}
    placeholder={placeholder}
    defaultValue={defaultValue}
    value={value}
    onChange={onChange}
  />
);
