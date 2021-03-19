import React, { Component } from 'react';

import closeCross from 'assets/images/close-cross.svg';
import './ImageViewer.scss';

interface IProps {
  src: string;
  description?: string;
  onClose(): void;
}

interface IMouseInfo {
  mouseX: number;
  mouseY: number;
  mouseDownTime: number;
  isMouseDown: boolean;
  isZoomed: boolean;
}

interface IImageState {
  x: number;
  y: number;
}

const TIME_TO_ELAPSE = 200;

export class ImageViewer extends Component<IProps> {
  private mouseInfo: IMouseInfo = {
    mouseX: 0,
    mouseY: 0,
    mouseDownTime: 0,
    isMouseDown: false,
    isZoomed: false,
  };
  private imageState: IImageState = {
    x: 0,
    y: 0,
  };
  private image = React.createRef<HTMLImageElement>();

  private handleZoom = (e: React.MouseEvent<HTMLImageElement>) => {
    const timeElapsed = Date.now() - this.mouseInfo.mouseDownTime;

    if (timeElapsed < TIME_TO_ELAPSE) {
      this.mouseInfo.isZoomed = !this.mouseInfo.isZoomed;
      this.applyTransformations(0, 0, this.mouseInfo.isZoomed, true);
      this.saveImagePosition(0, 0);
    } else {
      this.saveImagePosition(
        this.imageState.x + e.pageX - this.mouseInfo.mouseX,
        this.imageState.y + e.pageY - this.mouseInfo.mouseY,
      );
    }
    this.clearMouseInfo();
  }

  private captureInitialMouseInfo = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    this.mouseInfo.mouseX = e.pageX;
    this.mouseInfo.mouseY = e.pageY;
    this.mouseInfo.mouseDownTime = Date.now();
    this.mouseInfo.isMouseDown = true;
  }

  private performMove = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    if (this.mouseInfo.isMouseDown && this.mouseInfo.isZoomed) {
      const x = this.imageState.x + e.pageX - this.mouseInfo.mouseX;
      const y = this.imageState.y + e.pageY - this.mouseInfo.mouseY;

      this.applyTransformations(x, y, this.mouseInfo.isZoomed);
    }
  }

  private applyTransformations(x: number, y: number, isZoomed: boolean, isAnimated: boolean = false) {
    const translateValue = `translate(${x}px, ${y}px) ${isZoomed ? 'scale(2)' : ''}`;
    if (isAnimated) {
      this.image.current!.animate(
        [
          {
            transform: this.image.current!.style.transform || 'translate(0px, 0px)',
          },
          {
            transform: translateValue,
          }
        ],
        {
          duration: 150,
          easing: 'ease-in-out'
        }
      );
    }
    this.image.current!.style.transform = translateValue;
    this.image.current!.style.cursor = isZoomed ? 'zoom-out' : '';
  }

  private clearMouseInfo() {
    this.mouseInfo.mouseX = 0;
    this.mouseInfo.mouseY = 0;
    this.mouseInfo.mouseDownTime = 0;
    this.mouseInfo.isMouseDown = false;
  }

  private saveImagePosition(x: number, y: number) {
    this.imageState.x = x;
    this.imageState.y = y;
  }

  public render() {
    return (
      <div className="ImageViewer">
        <div className="ImageViewer__overlay">
          <button className="fw500 fs17 ImageViewer__button">
            Close image
            <img
              src={closeCross}
              alt="Image"
              className="ImageViewer__buttonImage"
            />
          </button>
          <img
            ref={this.image}
            src={this.props.src}
            alt="Image"
            className="ImageViewer__image"
            onClick={this.handleZoom}
            onMouseMove={this.performMove}
            onMouseDown={this.captureInitialMouseInfo}
          />
          <div className="fw500 fs17 ImageViewer__description">
            {this.props.description}
          </div>
        </div>
      </div>
    );
  }
}
