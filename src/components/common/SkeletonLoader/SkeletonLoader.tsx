import React, { Component } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

interface Props {
  className: string;
  color?: string;
  highlightColor?: string;
  duration?: number;
  height?: number;
  width?: number;
}

export class SkeletonLoader extends Component<Props> {

  public render() {
    const {
      className,
      color,
      highlightColor,
      duration,
      height,
      width
    } = this.props;

    return (
      <SkeletonTheme baseColor={color} highlightColor={highlightColor}>
        <Skeleton
          className={className}
          duration={duration}
          height={height}
          width={width}
        />
      </SkeletonTheme>
    );
  }
}
