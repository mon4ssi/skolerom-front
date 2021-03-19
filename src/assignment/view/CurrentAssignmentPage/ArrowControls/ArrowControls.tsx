import React, { Component } from 'react';
import intl from 'react-intl-universal';

import arrowRight from 'assets/images/arrow-right-bold.svg';
import exitIcon from 'assets/images/arrow-left-purple.svg';

import './ArrowControls.scss';

interface Props {
  shouldRenderNextButton: boolean;
  shouldRenderPrevButton: boolean;
  onExit(): void;
  onNext(): void;
  onPrev(): void;
}

export class ArrowControls extends Component<Props> {
  private exitAssignment = () => {
    this.props.onExit();
  }

  private goNextQuestion = () => {
    this.props.onNext();
  }

  private goPreviousQuestion  = () => {
    this.props.onPrev();
  }

  private renderPrevQuestionButton = () => (
    <button
      className="ArrowControls__button"
      onClick={this.goPreviousQuestion}
    >
      <div className="ArrowControls__imageContainer">
        <img src={arrowRight} alt="Previous" className="ArrowControls__image ArrowControls__image_previous"/>
      </div>
      {intl.get('pagination.Previous page')}
      {this.renderTooltip(intl.get('current_assignment_page.Press Shift + Arrow Left for prev question'))}
    </button>
  )

  private renderNextQuestionButton = () => (
    <button
      className="ArrowControls__button"
      onClick={this.goNextQuestion}
    >
      <div className="ArrowControls__imageContainer">
        <img src={arrowRight} alt="Previous" className="ArrowControls__image ArrowControls__image_next"/>
      </div>
      {intl.get('pagination.Next page')}
      {this.renderTooltip(intl.get('current_assignment_page.Press Shift + Arrow Right for next question'))}
    </button>
  )

  private renderTooltip(text: string) {
    return (
      <div className="ArrowControls__tooltip">
        <div className="ArrowControls__tooltipText">{text}</div>
      </div>
    );
  }

  private renderNavigationButtonsIfNeeded() {
    const { shouldRenderPrevButton, shouldRenderNextButton } = this.props;
    const hasSomeButtonsToRender = shouldRenderPrevButton || shouldRenderNextButton;

    if (hasSomeButtonsToRender) {
      return (
        <div className="ArrowControls__buttonsBlock">
          {shouldRenderPrevButton && this.renderPrevQuestionButton()}
          {shouldRenderNextButton && this.renderNextQuestionButton()}
        </div>
      );
    }

    return null;
  }

  private renderExitButton = () => (
    <button
      name="prev"
      className="ArrowControls__button ArrowControls__button_exit"
      onClick={this.exitAssignment}
    >
      <div className="ArrowControls__imageContainer ArrowControls__imageContainer_exit">
        <img src={exitIcon} alt="Previous" className="ArrowControls__image"/>
      </div>
      {intl.get('current_assignment_page.Exit assignment')}
    </button>
  )

  public render() {
    return (
      <div className="ArrowControls">
        {this.renderNavigationButtonsIfNeeded()}
        {this.renderExitButton()}
      </div>
    );
  }
}
