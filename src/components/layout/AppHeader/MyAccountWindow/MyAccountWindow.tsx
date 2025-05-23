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
import { LANGUAGES } from 'utils/constants';

const ANIMATION_TIMEOUT = 200;

interface INavigationItem {
  name: string;
  url: string;
}
interface HeaderNavigationLink {
  name: string;
  url: string;
  dropdown?: boolean;
  submenuItems?: Array<HeaderNavigationLink>;
}
enum Screen {
  MAIN,
  LOCALE,
  FONTS
}

interface MyAccountWindowProps {
  uiStore?: UIStore;
  loginStore?: LoginStore;
  navigation: Array<HeaderNavigationLink>;
  onLogIn: () => void;
  openKeyboardModal: () => void;
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
          <a href="#" className="MyAccountWindow__itemText">
            {intl.get('header.Change Language')} (<span style={{ textTransform: 'uppercase' }}>{uiStore!.currentLocale})</span>
          </a>
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

  private renderNavigation = (link: HeaderNavigationLink) => {
    if (link.dropdown) {
      const renderSubMenuSubMenu = (item: HeaderNavigationLink) => (
        <li key={item.name} className={'AppHeader__dropdownItem__subItem'}>
          <a href={item.url} title={item.name} role="button">{item.name}</a>
        </li>
      );
      const renderSubmenu = (item: HeaderNavigationLink) => {
        if (item.dropdown) {
          let maxLength = 0;
          if (item.submenuItems) {
            item.submenuItems.forEach((element) => {
              if (element.name.length > maxLength) {
                maxLength = element.name.length;
              }
            });
          }
          const classInside = 'AppHeader__dropdownItem__subMenuMobile';
          return (
            <li key={item.name} className={'MyAccountWindow__itemText activeMobileSubMenu'}>
              <a href={item.url} title={item.name} role="button" className="identSubMenu">{item.name}</a>
              <ul className={classInside}>
                {item.submenuItems!.map(renderSubMenuSubMenu)}
              </ul>
            </li>
          );
        }
        return (
          <li key={item.name} className={'MyAccountWindow__link'}>
            <a href={item.url} title={item.name} role="button">{item.name}</a>
          </li>
        );
      };
      return (
        <li key={link.url} className="MyAccountWindow__item">
          <div className="MyAccountWindow__itemText">
            <a href={link.url} className="MyAccountWindow__link drowDown">{link.name}</a>
          </div>
          <div className="MyAccountWindow__submenu">
            <ul>
              {link.submenuItems!.map(renderSubmenu)}
            </ul>
          </div>
        </li>
      );
    }
    return (
      <li key={link.url} className="MyAccountWindow__item">
        <div className="MyAccountWindow__itemText">
          <a href={link.url} className="MyAccountWindow__link drowDown">{link.name}</a>
        </div>
      </li>
    );
  }

  private renderLogOutButtonIfNeeded() {
    return this.props.loginStore!.currentUser
    && (
      <ul className="MyAccountWindow__list">
        <li className="MyAccountWindow__item" onClick={this.logOut}>
          <img className="MyAccountWindow__itemImage" src={logOutIcon} alt={intl.get('header.Log out')} />
          <a href="#" className="MyAccountWindow__itemText">
            {intl.get('header.Log out')}
          </a>
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
            <a href="#" className="MyAccountWindow__itemText">
              {intl.get('header.Log in')}
            </a>
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

        <a href="#" className="MyAccountWindow__closeButton" onClick={closeMyAccountWindow}><img src={closeIcon} alt="Close"  /></a>
      </ul>
    );
  }

  private renderChangeFontSize() {
    const { loginStore, uiStore } = this.props;
    return loginStore!.currentUser
    && (
      <ul className="MyAccountWindow__list MyAccountWindow__list_separated">
        <li className="MyAccountWindow__item"  onClick={this.goToFontsScreen}>
          <a href="#" className="MyAccountWindow__itemText">
            {intl.get('header.change_font_size')}
          </a>
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
          <li className="MyAccountWindow__item">
            <div className="MyAccountWindow__itemText">
              <a href="#" className="MyAccountWindow__link drowDown">{intl.get('header.About')}</a>
            </div>
            <div className="MyAccountWindow__submenu">
              <ul>
                <li className={'MyAccountWindow__link'}>
                  <a href={`${process.env.REACT_APP_WP_URL}/hva-er-skolerom`} title={intl.get('header.About skolerom')} target="_blank" role="button">{intl.get('header.About skolerom')}</a>
                </li>
                <li className={'MyAccountWindow__link'}>
                  <a href={`${process.env.REACT_APP_WP_URL}/kontakt-oss`} title={intl.get('header.contact')} target="_blank" role="button">{intl.get('header.contact')}</a>
                </li>
                <li className={'MyAccountWindow__link'}>
                  <a href={`${process.env.REACT_APP_WP_URL}/support-skolerom`} title={intl.get('generals.support')} target="_blank" role="button">{intl.get('generals.support')}</a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
        {this.renderLocaleChooserIfNeeded()}
        {this.renderChangeFontSize()}
        <ul className="MyAccountWindow__list MyAccountWindow__list_separated">
          <li className="MyAccountWindow__item">
            <a href="#" className="MyAccountWindow__itemText" onClick={this.props.openKeyboardModal} title={intl.get('header.title.keyboard')}>{intl.get('generals.keyboard')}</a>
          </li>
        </ul>
        {this.renderLogOutButtonIfNeeded()}
        {this.renderLogInButtonIfNeeded()}
      </>
    );
  }

  private renderLanguageChangeScreen = () => {
    const { uiStore, closeMyAccountWindow, loginStore } = this.props;
    const setCurrentLocale = async (language: string) => {
      if (uiStore!.currentLocale === language) {
        return null;
      }
      uiStore!.setCurrentLocale(language);
      await loginStore!.getLocaleData(language as Locales);
      window.location.reload();
    };

    const renderLanguage = (language: { description: string, shortName: string }) => (
      <li
        className="MyAccountWindow__item"
        // tslint:disable-next-line: jsx-no-lambda
        onClick={() => setCurrentLocale(language.shortName)}
        key={language.description}
      >
        <a
          href="#"
          className={classnames('MyAccountWindow__itemText', { MyAccountWindow__itemText_selected: uiStore!.currentLocale === language.shortName })}
        >
          {language.description} {uiStore!.currentLocale === language.shortName && `(${intl.get('header.selected')})`}
        </a>
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

            <a href="#" onClick={closeMyAccountWindow} className="MyAccountWindow__closeButton"><img src={closeIcon} alt="Close" /></a>
          </li>
        </ul>
        <div id="aux4" className="hidden">Not name</div>
        <input type="text" aria-labelledby="aux4" autoFocus className="hidden"/>
        <ul className="MyAccountWindow__list">
          {LANGUAGES.map(renderLanguage)}
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
        <a
          href="#"
          className={classnames('MyAccountWindow__itemText', { MyAccountWindow__itemText_selected: uiStore!.currentFont === fontstore.classname })}
        >
          {fontstore.name}
        </a>
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

            <a href="#" className="MyAccountWindow__closeButton" onClick={closeMyAccountWindow}><img src={closeIcon} alt="Close" /></a>
          </li>
        </ul>
        <div id="aux3" className="hidden">Not name</div>
        <input type="text" aria-labelledby="aux3" autoFocus className="hidden"/>
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

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const { closeMyAccountWindow } = this.props;
    if (event.key === 'ArrowLeft') {
      this.goToMainScreen();
    }
  }

  public async componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboardControl);
  }

  public render() {
    const { currentScreen } = this.state;
    const localeScreen = this.renderAnimationWrapper('MyAccountWindow__secondaryContainer_animated', this.renderLanguageChangeScreen());
    const fontsScreen = this.renderAnimationWrapper('MyAccountWindow__secondaryContainer_animated', this.renderFontsChangeScreen());
    const mainScreen = this.renderAnimationWrapper('MyAccountWindow__container_animated', this.renderMainScreen());

    return (
      <div className="MyAccountWindow" ref={this.containerRef}>
        <div id="aux2" className="hidden">Not name</div>
        <input type="text" aria-labelledby="aux2" autoFocus className="hidden"/>
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
