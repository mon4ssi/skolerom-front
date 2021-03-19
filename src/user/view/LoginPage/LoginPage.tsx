import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { LoginStore } from '../LoginStore';
import { UserType } from 'user/User';
import { LoginForm } from './LoginForm/LoginForm';

import './LoginPage.scss';

interface LoginPageProps {
  loginStore?: LoginStore;
}

@inject('loginStore')
@observer
export class LoginPage extends Component<LoginPageProps> {
  public redirectToDashboard = () => {
    const { loginStore } = this.props;
    const currentUser = loginStore!.currentUser;
    const postID = loginStore!.getPostID();
    const assignmentReferralToken = loginStore!.getAssignmentReferralToken();
    const assignmentId = loginStore!.getAssignmentId();

    const teachingPathReferralToken = loginStore!.getTeachingPathReferralToken();
    const teachingPathID = loginStore!.getTeachingPathId();

    if (currentUser) {
      let redirectPath;
      switch (currentUser!.type) {
        case UserType.Teacher:
          if (postID) {
            loginStore!.removePostID();
            redirectPath = `/assignments/edit?post_id=${postID}`;
          } else {
            redirectPath = '/activity';
          }

          return window.location.href = redirectPath;
        case UserType.ContentManager:
          redirectPath = '/activity';

          return window.location.href = redirectPath;
        case UserType.Student:
          if (assignmentReferralToken) {
            loginStore!.removeAssignmentId();
            loginStore!.removeAssignmentRefferalToken();
            redirectPath = `/assignments/${assignmentId}/invitation?referral_token=${assignmentReferralToken}`;
          } else if (teachingPathReferralToken) {
            loginStore!.removeTeachingPathId();
            loginStore!.removeTeachingPathRefferalToken();
            redirectPath = `/teaching-path/${teachingPathID}/invitation?referral_token=${teachingPathReferralToken}`;
          } else {
            redirectPath = '/activity';
          }

          return window.location.href = redirectPath;
        default:
          return '';
      }
    }
  }

  public render() {
    const { currentUser } = this.props.loginStore!;

    if (currentUser) {
      return this.redirectToDashboard();
    }

    return (
      <div
        className="LoginPage flexBox spaceBetween alignCenter"
        id="loginPage"
      >
        <LoginForm />
        <div className="flexBox loginRightSide">
          <div className="mobileFormTitle">{intl.get('login_page.Log in to Skolerom')}</div>
          <div className="loginBgImage" />
        </div>
      </div>
    );
  }
}
