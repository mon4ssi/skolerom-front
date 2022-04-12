import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ReturnUrl } from 'utils/enums';
import { LoginStore } from './LoginStore';
import { inject } from 'mobx-react';

interface RedirectPageProps {
  loginStore?: LoginStore;
}
@inject('loginStore')
export class RedirectPage extends Component<RouteComponentProps & RedirectPageProps>
{
  public componentDidMount() {
    if (this.props.location.search.includes('return_url=')) {
      this.props.loginStore!.isCurrentUserFetching = true;

      const queryParams = new URLSearchParams(this.props.location.search);
      const rUrl: any = queryParams.get('return_url');
      const dDateNow = new Date().valueOf();

      window.localStorage.setItem(ReturnUrl.RETURN_URL, rUrl);
      window.localStorage.setItem(ReturnUrl.TIME_EXPIRED, dDateNow.toString());
    }

    window.location.href = `${process.env.REACT_APP_BASE_URL}/api/dataporten/auth`;
  }

  public render() {
    return (<></>);
  }
}
