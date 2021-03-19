import React, { Component } from 'react';

import './StatisticBlock.scss';

interface IStatisticBlockProps {
  value: number;
  imageSrc: string;
  title: string;
  buttonLabel: string;
  hasButton: boolean;
  small: boolean;
  onClick(): void;
}

export class StatisticBlock extends Component<IStatisticBlockProps> {
  public static defaultProps = {
    hasButton: true,
  };

  private renderButtonIfNeeded() {
    const {
      buttonLabel,
      onClick,
      hasButton,
      small
    } = this.props;

    if (hasButton && !small) {
      return (
        <button className="StatisticBlock__button" onClick={onClick}>
          {buttonLabel}
        </button>
      );
    }
  }

  public render() {
    const {
      value,
      title,
      imageSrc
    } = this.props;

    return (
      <div className="StatisticBlock">
        <div className="StatisticBlock__info">
          <img src={imageSrc} alt="statistic_image" className={'StatisticBlock__image'}/>
          <div className={'StatisticBlock__value'}>{value}</div>
        </div>
        <div className={'StatisticBlock__title'}>{title}</div>
        {this.renderButtonIfNeeded()}
      </div>
    );
  }
}
