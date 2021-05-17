import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { LoginStore } from '../LoginStore';
import { Loader } from 'components/common/Loader/Loader';

interface LogOutPageProps {
  loginStore?: LoginStore;
}
@inject('loginStore')
@observer
export class LogOutPage extends Component<LogOutPageProps> {
  public componentDidMount() {
    const timeWait:number = 1000;
    setTimeout(
      () => {
        this.props.loginStore!.logOut();
      },
      timeWait
    );
  }
  public render() {
    return (
      <div className="LoginPage flexBox spaceBetween alignCenter">
        <div className="flexBox dirColumn justifyCenter alignCenter LoginPage">
          {/* tslint:disable-next-line: no-magic-numbers */}
          <Loader height={100} width={20} margin={3} />
        </div>
      </div>
    );
  }
}
