import React, { Component } from 'react';
import intl from 'react-intl-universal';

import userPlaceholderImage from 'assets/images/user-placeholder.png';

import './StudentOverviewHeader.scss';

interface Props {
  userName: string;
  currentTab: string;
  userPhoto: string;
}

export class StudentOverviewHeader extends Component<Props> {

  public render() {
    const { userName, currentTab, userPhoto } = this.props;

    return (
      <div className="StudentOverviewHeader">
        <div className="StudentOverviewHeader__text">{userName} {intl.get(`students_list.students_overview.tabs.${currentTab}`)}</div>
        <img className="StudentOverviewHeader__image" src={userPhoto || userPlaceholderImage} alt="student_photo" />
      </div>
    );
  }
}
