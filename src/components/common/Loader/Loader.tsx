import React, { Component } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';

const DEFAULT_COLOR = '#E2017B';
const DEFAULT_WIDTH = 6;
const DEFAULT_HEIGHT = 35;
const DEFAULT_RADIUS = 0;
const DEFAULT_MARGIN = 2;

interface Props {
  color?: string;
  width?: number;
  height?: number;
  radius?: number;
  margin?: number;
}

export class Loader extends Component<Props> {

  public render() {
    const {
      color = DEFAULT_COLOR,
      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,
      radius = DEFAULT_RADIUS,
      margin = DEFAULT_MARGIN
    } = this.props;

    return (
      <ScaleLoader
        color={color}
        width={width} // Width of the one part (6 parts at all)
        height={height}
        radius={radius}
        margin={margin} // Margin of the one part
      />
    );
  }
}
