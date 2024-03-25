import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { LoginStore } from '../LoginStore';
import { inject, observer } from 'mobx-react';

interface FeideCodeGetterWrapper extends RouteComponentProps {
  loginStore?: LoginStore;
}

@inject('loginStore')
@observer
class FeideCodeGetterWrapper extends Component<FeideCodeGetterWrapper> {
  public componentDidMount = async () => {
    const code = this.props.location.search.replace('?code=', '');

    try {
      this.props.loginStore!.getUserWithToken(code);
    } catch (error : any) {
      if (this.props.loginStore!.needRedirect) {
        return this.props.history.replace('/login');
      }
      throw new Error(error);
    }
  }

  public render() {
    return (
      <></>
    );
  }
}

export const FeideCodeGetter = withRouter(FeideCodeGetterWrapper);
