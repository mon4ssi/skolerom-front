import React, { Component } from 'react';
import intl from 'react-intl-universal';

import closeButton from 'assets/images/close-button.svg';

import './Notification.scss';

export class Notification extends Component {
  public render() {
    return (
      <div className="Notification flexBox alignCenter justifyCenter fw500">
        <img src={closeButton} alt="Close" />
        {intl.get('current_assignment_page.Notification')}
      </div>
    );
  }
}
