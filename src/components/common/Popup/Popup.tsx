import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';
import intl from 'react-intl-universal';

import closeCross from 'assets/images/close-cross.svg';

import './Popup.scss';

const ANIMATION_TIMEOUT = 200;

interface IPopupProps {
  visible: boolean;
  onClose(): void;
}

export class Popup extends Component<IPopupProps> {
  public render(): React.ReactNode {
    return (
      <CSSTransition
        in={this.props.visible}
        unmountOnExit
        classNames="Popup_animated"
        timeout={ANIMATION_TIMEOUT}
      >
        <div className="Popup">
          <div className="Popup__overlay">
            <button
              className="Popup__button"
              onClick={this.props.onClose}
            >
              {intl.get('evaluation_page.Close')}
              <img
                src={closeCross}
                alt="popup"
                className="Popup__buttonImage"
              />
            </button>
            <div className="Popup__content">
              {this.props.children}
            </div>
          </div>
        </div>
      </CSSTransition>
    );
  }
}
