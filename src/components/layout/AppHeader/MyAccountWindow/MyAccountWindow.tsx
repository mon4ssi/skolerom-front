import React, { Component, ReactNode, SyntheticEvent } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import onClickOutside from 'react-onclickoutside';

import closeIcon from 'assets/images/close.svg';
import backIcon from 'assets/images/back.svg';
import logOutIcon from 'assets/images/logout.svg';

import { UIStore } from 'locales/UIStore';

import './MyAccountWindow.scss';
import { LoginStore } from 'user/view/LoginStore';
import { Locales } from 'utils/enums';

const ANIMATION_TIMEOUT = 200;

interface INavigationItem {
  name: string;
  url: string;
}

enum Screen {
  MAIN,
  LOCALE,
  FONTS
}

interface MyAccountWindowProps {
  uiStore?: UIStore;
  loginStore?: LoginStore;
  navigation: Array<INavigationItem>;
  onLogIn: () => void;
  closeMyAccountWindow(e: SyntheticEvent): void;
}

interface IMyAccountWindowState {
  currentScreen: Screen;
}

type keys = {
  [key: string]: boolean
};

@inject('uiStore', 'loginStore')
@observer
class MyAccountWindow extends Component<MyAccountWindowProps, IMyAccountWindowState> {
  private containerRef = React.createRef<HTMLDivElement>();
  public state = {
    currentScreen: Screen.MAIN,
  };

  private goToMainScreen = () => {
    this.setState({ currentScreen: Screen.MAIN });
  }

  private goToLocaleScreen = () => {
    this.setState({ currentScreen:Screen.LOCALE });
  }

  private goToFontsScreen = () => {
    this.setState({ currentScreen:Screen.FONTS });
  }

  private logOut = () => {
    const { loginStore } = this.props;

    loginStore!.logOut();
  }

  private renderLocaleChooserIfNeeded() {
    const { uiStore, loginStore } = this.props;
    return loginStore!.currentUser
    && (
      <ul className="MyAccountWindow__list MyAccountWindow__list_separated">
        <li className="MyAccountWindow__item" onClick={this.goToLocaleScreen}>
          <div className="MyAccountWindow__itemText">
            {intl.get('header.Change Language')} (<span style={{ textTransform: 'uppercase' }}>{uiStore!.currentLocale})</span>
          </div>
        </li>
      </ul>
    );
  }

  private handleElementExit = () => {
    const rect = this.containerRef.current!.getBoundingClientRect();
    this.containerRef.current!.style.height = `${rect.height}px`;
  }

  private handleElementEntering = (node: HTMLElement) => {
    const rect = node.getBoundingClientRect();
    this.containerRef.current!.style.height = `${rect.height}px`;
  }

  private handleElementEntered = (node: HTMLElement) => {
    this.containerRef.current!.style.height = 'auto';
  }

  private renderNavigation = (link: INavigationItem) => (
    <li key={link.url} className="MyAccountWindow__item">
      <div className="MyAccountWindow__itemText">
        <a href={link.url} className="MyAccountWindow__link">{intl.get(`header.${link.name}`)}</a>
      </div>
    </li>
  )

  private renderLogOutButtonIfNeeded() {
    return this.props.loginStore!.currentUser
    && (
      <ul className="MyAccountWindow__list">
        <li className="MyAccountWindow__item" onClick={this.logOut}>
          <img className="MyAccountWindow__itemImage" src={logOutIcon} alt={intl.get('header.Log out')} />
          <div className="MyAccountWindow__itemText">
            {intl.get('header.Log out')}
          </div>
        </li>
      </ul>
    );
  }

  private renderLogInButtonIfNeeded() {
    return !this.props.loginStore!.currentUser
      && (
        <ul className="MyAccountWindow__list">
          <li className="MyAccountWindow__item" onClick={this.props.onLogIn}>
            <img className="MyAccountWindow__itemImage" src={logOutIcon} alt={intl.get('header.Log out')} />
            <div className="MyAccountWindow__itemText">
              {intl.get('header.Log in')}
            </div>
          </li>
        </ul>
      );
  }

  private renderUserNameIfPossible() {
    const { loginStore, closeMyAccountWindow } = this.props;
    return loginStore!.currentUser
    && (
      <ul className="MyAccountWindow__list MyAccountWindow__list_separated">
        <li className="MyAccountWindow__item">
          <div className="MyAccountWindow__itemText_selected MyAccountWindow__title">
            {loginStore!.currentUser && loginStore!.currentUser.name}
          </div>
        </li>

        <img className="MyAccountWindow__closeButton" src={closeIcon} alt="Close" onClick={closeMyAccountWindow} />
      </ul>
    );
  }

  private renderChangeFontSize() {
    const { loginStore, uiStore } = this.props;
    return loginStore!.currentUser
    && (
      <ul className="MyAccountWindow__list MyAccountWindow__list_separated">
        <li className="MyAccountWindow__item"  onClick={this.goToFontsScreen}>
          <div className="MyAccountWindow__itemText">
            {intl.get('header.change_font_size')}
          </div>
        </li>
      </ul>
    );
  }

  private renderMainScreen = () => {
    const { navigation } = this.props;
    return (
      <>
        {this.renderUserNameIfPossible()}
        <ul className="MyAccountWindow__list MyAccountWindow__list_separated MyAccountWindow__list_mobile">
          {navigation.map(this.renderNavigation)}
        </ul>
        {this.renderLocaleChooserIfNeeded()}
        {this.renderChangeFontSize()}
        {this.renderLogOutButtonIfNeeded()}
        {this.renderLogInButtonIfNeeded()}
      </>
    );
  }

  private renderLanguageChangeScreen = () => {
    const { uiStore, closeMyAccountWindow, loginStore } = this.props;
    const languages = [
      {
        language: 'English',
        shortName: Locales.EN
      },
      {
        language: 'Norwegian Bokmål',
        shortName: Locales.NB
      },
      {
        language: 'Norwegian Nynorsk',
        shortName: Locales.NN
      }
      // {
      //   language: 'Sámi',
      //   shortName: ''
      // },
      // {
      //   language: 'Danish',
      //   shortName: ''
      // },
      // {
      //   language: 'Swedish',
      //   shortName: ''
      // }
    ];
    const setCurrentLocale = async (language: string) => {
      if (uiStore!.currentLocale === language) {
        return null;
      }
      uiStore!.setCurrentLocale(language);
      await loginStore!.getLocaleData(language as Locales);
      window.location.reload();
    };

    const renderLanguage = (language: { language: string, shortName: string }) => (
      <li
        className="MyAccountWindow__item"
        // tslint:disable-next-line: jsx-no-lambda
        onClick={() => setCurrentLocale(language.shortName)}
        key={language.language}
      >
        <div
          className={classnames('MyAccountWindow__itemText', { MyAccountWindow__itemText_selected: uiStore!.currentLocale === language.shortName })}
        >
          {language.language} {uiStore!.currentLocale === language.shortName && `(${intl.get('header.selected')})`}
        </div>
      </li>
    );

    return (
      <>
        <ul className="MyAccountWindow__list MyAccountWindow__list_separated">
          <li className="MyAccountWindow__item MyAccountWindow__item_centered">
            <img className="MyAccountWindow__backButton" src={backIcon} alt={intl.get('header.Back')} onClick={this.goToMainScreen} />

            <div className="MyAccountWindow__itemText MyAccountWindow__itemText_selected">
              {intl.get('header.Change Language')}
            </div>

            <img className="MyAccountWindow__closeButton" src={closeIcon} alt="Close" onClick={closeMyAccountWindow} />
          </li>
        </ul>

        <ul className="MyAccountWindow__list">
          {languages.map(renderLanguage)}
        </ul>
      </>
    );
  }

  private renderFontsChangeScreen = () => {
    const { uiStore, closeMyAccountWindow, loginStore } = this.props;
    const fontsStore = [
      {
        name: '100%',
        classname: 'zoom100'
      },
      {
        name: '150%',
        classname: 'zoom150'
      },
      {
        name: '200%',
        classname: 'zoom200'
      }
    ];
    const setCurrentFonts = (font: string) => {
      if (uiStore!.currentFont === font) {
        return null;
      }
      uiStore!.setCurrentFont(font);
      document.querySelectorAll('.App')[0].classList.remove('zoom100');
      document.querySelectorAll('.App')[0].classList.remove('zoom150');
      document.querySelectorAll('.App')[0].classList.remove('zoom200');
      document.querySelectorAll('.App')[0].classList.add(font);
    };
    const renderFont = (fontstore: { name: string, classname: string }) => (
      <li
        className="MyAccountWindow__item"
        // tslint:disable-next-line: jsx-no-lambda
        onClick={() => setCurrentFonts(fontstore.classname)}
      >
        <div
          className={classnames('MyAccountWindow__itemText', { MyAccountWindow__itemText_selected: uiStore!.currentFont === fontstore.classname })}
        >
          {fontstore.name}
        </div>
      </li>
    );

    return (
      <>
        <ul className="MyAccountWindow__list MyAccountWindow__list_separated">
          <li className="MyAccountWindow__item MyAccountWindow__item_centered">
            <img className="MyAccountWindow__backButton" src={backIcon} alt={intl.get('header.Back')} onClick={this.goToMainScreen} />

            <div className="MyAccountWindow__itemText MyAccountWindow__itemText_selected">
              {intl.get('header.change_font_size')}
            </div>

            <img className="MyAccountWindow__closeButton" src={closeIcon} alt="Close" onClick={closeMyAccountWindow} />
          </li>
        </ul>

        <ul className="MyAccountWindow__list">
        {fontsStore.map(renderFont)}
        </ul>
      </>
    );
  }

  private renderAnimationWrapper = (className: string, children: ReactNode) => (
    <CSSTransition
      key={this.state.currentScreen}
      classNames={className}
      timeout={ANIMATION_TIMEOUT}
      onEntering={this.handleElementEntering}
      onEntered={this.handleElementEntered}
      onExit={this.handleElementExit}
    >
      <div className="MyAccountWindow__container">
        {children}
      </div>
    </CSSTransition>
  )

  public render() {
    const { currentScreen } = this.state;
    const localeScreen = this.renderAnimationWrapper('MyAccountWindow__secondaryContainer_animated', this.renderLanguageChangeScreen());
    const fontsScreen = this.renderAnimationWrapper('MyAccountWindow__secondaryContainer_animated', this.renderFontsChangeScreen());
    const mainScreen = this.renderAnimationWrapper('MyAccountWindow__container_animated', this.renderMainScreen());

    return (
      <div className="MyAccountWindow" ref={this.containerRef}>
        <TransitionGroup>
          {currentScreen === Screen.MAIN && mainScreen}
          {currentScreen === Screen.LOCALE && localeScreen}
          {currentScreen === Screen.FONTS && fontsScreen}
        </TransitionGroup>
      </div>
    );
  }
}

class MyAccountWindowWrapperComponent extends Component<MyAccountWindowProps> {

  public handleClickOutside = (e: SyntheticEvent) => this.props.closeMyAccountWindow(e);

  public render() {
    return <MyAccountWindow {...this.props}/>;
  }
}

export const MyAccountWindowWrapper = onClickOutside(MyAccountWindowWrapperComponent);
