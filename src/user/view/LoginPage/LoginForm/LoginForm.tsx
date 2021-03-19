import React, { ChangeEvent, Component, createRef, FormEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { LoginStore } from 'user/view/LoginStore';
import { Loader } from 'components/common/Loader/Loader';
import { RightClickMenu } from './RightClickMenu';

import loginBtnIcon from 'assets/images/login-btn-icon.svg';

import './LoginForm.scss';

interface LoginFormProps {
  loginStore?: LoginStore;
}

interface State {
  email: string;
  password: string;
}

@inject('loginStore')
@observer
export class LoginForm extends Component<LoginFormProps, State> {
  private rightClickMenuRef = createRef<HTMLUListElement>();

  public state = {
    email: '',
    password: ''
  };

  public hideMenu = () => {
    this.rightClickMenuRef.current!.classList.remove('active');
  }

  public handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    e.currentTarget.name === 'email' ?
      this.setState({ email: e.currentTarget.value }) :
      this.setState({ password: e.currentTarget.value });
  }

  public submitLoginWithLogPass = (e: FormEvent<HTMLFormElement>) => {
    const { email, password } = this.state;

    e.preventDefault();
    if (!email || !password) {
      return;
    }
    this.props.loginStore!.getUserWithTokenFromLogPass(this.state.email, this.state.password);
  }

  // tslint:disable-next-line:no-any
  public rightClickFeide = (e: any) => {
    e.preventDefault();
    this.rightClickMenuRef.current!.style.top = `${e.clientY}px`;
    this.rightClickMenuRef.current!.style.left = `${e.clientX}px`;
    this.rightClickMenuRef.current!.classList.add('active');
  }

  public render() {
    const { isCurrentUserFetching } = this.props.loginStore!;
    const { email, password } = this.state;

    if (isCurrentUserFetching) {
      return (
        <div className="flexBox dirColumn justifyCenter alignCenter LoginFormContainer">
          {/* tslint:disable-next-line: no-magic-numbers */}
          <Loader height={100} width={20} margin={3} />
        </div>
      );
    }

    return (
      <div className="flexBox dirColumn justifyCenter alignCenter LoginFormContainer">
        <div className="flexBox dirColumn justifyCenter alignCenter">
          <h1 className="formTitle fw500">{intl.get('login_page.Log in to Skolerom')}</h1>

          <p className="formSubtitle fw500 upp">{intl.get('login_page.Log in with Feide')}</p>

          <a
            className="loginButton flexBox justifyCenter alignCenter rightClickArea"
            onContextMenu={this.rightClickFeide}
            href={`${process.env.REACT_APP_BASE_URL}/api/dataporten/auth`}
          >
            <img src={loginBtnIcon} alt="Login" />
            <span>{intl.get('login_page.Feide')}</span>
          </a>

          <RightClickMenu reference={this.rightClickMenuRef} hideMenu={this.hideMenu}/>

        </div>

        <p className="or">{intl.get('login_page.Or')}</p>

        <form
          className="logInForm flexBox dirColumn alignCenter"
          onSubmit={this.submitLoginWithLogPass}
        >
          <p className="title">{intl.get('login_page.Log in with user')}</p>

          <div className="inputs flexBox">
            <input
              type="email"
              name="email"
              placeholder={intl.get('login_page.Username')}
              value={email}
              onChange={this.handleChangeInput}
              pattern="*"
            />
            <input
              type="password"
              name="password"
              placeholder={intl.get('login_page.Password')}
              value={password}
              onChange={this.handleChangeInput}
              pattern="*"
            />
          </div>

          <button className="logInSubmit">
            {intl.get('login_page.Log in')}
          </button>

          <p className="forgotPassword">
            {intl.get('login_page.Forgot password')}
          </p>
        </form>
      </div>
    );
  }
}
