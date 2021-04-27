import React, { Component, MouseEvent } from 'react';
import intl from 'react-intl-universal';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { CSSTransition } from 'react-transition-group';

import { LoginStore } from 'user/view/LoginStore';
import { UserType } from 'user/User';
import { MyAccountWindowWrapper } from './MyAccountWindow/MyAccountWindow';
import { UIStore } from 'locales/UIStore';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import logoImage from 'assets/images/logo.svg';
import burger from 'assets/images/burger-icon.svg';
import verticalDots from 'assets/images/vertical-dots.svg';
import userPlaceholder from 'assets/images/user-placeholder.png';
import question from 'assets/images/questions.svg';

import './AppHeader.scss';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';

interface HeaderNavigationLink {
  name: string;
  url: string;
  dropdown?: boolean;
  submenuItems?: Array<HeaderNavigationLink>;
}

const ANIMATION_TIMEOUT = 200;

const headerLinks: Array<HeaderNavigationLink> = [
  {
    name: 'School',
    url: `${process.env.REACT_APP_WP_URL}/undervisning/`
  },
  {
    name: 'Library',
    url: '#',
    dropdown: true,
    submenuItems: [
      {
        name: 'Articles',
        url: `${process.env.REACT_APP_WP_URL}/artikler/`
      },
      {
        name: 'Publications',
        url: `${process.env.REACT_APP_WP_URL}/temaboker/`
      },
      {
        name: 'Sound articles',
        url: `${process.env.REACT_APP_WP_URL}/lydartikler/`
      }
    ]
  },
  {
    name: 'About skolerom',
    url: `${process.env.REACT_APP_WP_URL}/om-skolerom/`
  }
];
const tabletHeaderLinks: Array<HeaderNavigationLink> = [
  {
    name: 'School',
    url: `${process.env.REACT_APP_WP_URL}/undervisning/`
  },
  {
    name: 'Articles',
    url: `${process.env.REACT_APP_WP_URL}/artikler/`
  },
  {
    name: 'Publications',
    url: `${process.env.REACT_APP_WP_URL}/temaboker/`
  },
  {
    name: 'Sound articles',
    url: `${process.env.REACT_APP_WP_URL}/lydartikler/`
  },
  {
    name: 'About skolerom',
    url: `${process.env.REACT_APP_WP_URL}/om-skolerom/`
  }
];
const nynorskHeaderLinks: Array<HeaderNavigationLink> = [
  {
    name: 'School',
    url: `${process.env.REACT_APP_WP_URL}/nn/undervisning/`
  }
];

const renderHeaderLink = (link: HeaderNavigationLink) => {
  if (link.dropdown) {
    const renderSubmenu = (item: HeaderNavigationLink) => (
      <li key={item.name} className={'AppHeader__dropdownItem'}>
        <a href={item.url}>{intl.get(`header.${item.name}`)}</a>
      </li>
    );

    return (
      <li key={link.name} className="AppHeader__navigationItem tc1 fs17 fw500">
        <div className="AppHeader__navigationItemText">
          <a href={link.url} className="AppHeader__dropdown">{intl.get(`header.${link.name}`)}</a>
          <div className={'AppHeader__submenuWrapper'}>
            <ul className={'AppHeader__submenu'}>
              {link.submenuItems!.map(renderSubmenu)}
            </ul>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li key={link.name} className="AppHeader__navigationItem tc1 fs17 fw500">
      <div className="AppHeader__navigationItemText">
        <a href={link.url}>{intl.get(`header.${link.name}`)}</a>
      </div>
    </li>
  );
};

interface HeaderProps extends RouteComponentProps {
  entityStore?: AssignmentListStore | TeachingPathsListStore;
  loginStore?: LoginStore;
  fromAssignmentPassing?: boolean;
  fromTeachingPathPassing?: boolean;
  uiStore?: UIStore;
  width?:number;
  onLogoClick?: (e: MouseEvent) => void;
  currentEntityId?: number;
}

enum Modals {
  NONE,
  USER,
}

interface HeaderState {
  modalVisible: Modals;
  isModalKeyboard: boolean;
}

@inject('loginStore', 'uiStore')
@observer
class AppHeader extends Component<HeaderProps, HeaderState> {

  public readonly state: HeaderState = {
    modalVisible: Modals.NONE,
    isModalKeyboard: false
  };

  private renderUserModalIfNeeded() {
    return (
      <CSSTransition
        unmountOnExit
        in={this.state.modalVisible === Modals.USER}
        classNames="AppHeader__modal_animated"
        timeout={ANIMATION_TIMEOUT}
      >
        <MyAccountWindowWrapper
          navigation={tabletHeaderLinks}
          closeMyAccountWindow={this.closeModals}
          onLogIn={this.getFeideUrl}
        />
      </CSSTransition>
    );
  }

  private handleLogoClick = async (event: MouseEvent) => {
    const { uiStore, fromAssignmentPassing, fromTeachingPathPassing, onLogoClick } = this.props;
    if (fromAssignmentPassing || fromTeachingPathPassing) {
      event.preventDefault();

      onLogoClick!(event);
    }

    uiStore!.setCurrentActiveTab('activity');
  }

  private getFeideUrl = async () => {
    const { history } = this.props;

    history.push('dataporten/auth');
  }

  private renderAccountTab = () => {
    const { loginStore } = this.props;

    return loginStore!.currentUser ? (
      <li className="AppHeader__navigationItem" onClick={this.showUserModal}>
        <a href="javascript:void(0)" className="AppHeader__navigationItemText">
          {intl.get('header.My account')}
        </a>
        <img
          className="AppHeader__userLogo"
          src={loginStore!.currentUser.photo ? loginStore!.currentUser.photo : userPlaceholder}
          alt={loginStore!.currentUser.name}
          aria-label="User Logo Description"
        />
      </li>
    ) : (
      <li className="AppHeader__navigationItem">
        <a href={`${process.env.REACT_APP_BASE_URL}/api/dataporten/auth`}>
          {intl.get('header.Log in')}
        </a>
      </li>
    );
  }

  private renderRole = () => {
    const currentUser = this.props.loginStore!.currentUser;

    if (currentUser && currentUser.type === UserType.Teacher) {
      return intl.get('header.teacher');
    }
    if (currentUser && currentUser.type === UserType.Student) {
      return intl.get('header.student');
    }
    if (currentUser && currentUser.type === UserType.ContentManager) {
      return intl.get('header.content_manager');
    }
  }

  private showUserModal = () => {
    const { sidebarShown } = this.props.uiStore!;
    const { modalVisible } = this.state;

    if (sidebarShown) {
      this.props.uiStore!.hideSidebar();
    }
    if (modalVisible === Modals.NONE) {
      return this.setState({ modalVisible: Modals.USER });
    }
    if (modalVisible === Modals.USER) {
      return this.setState({ modalVisible: Modals.NONE });
    }
  }

  private closeModals = () => {
    this.setState({
      modalVisible: Modals.NONE,
    });
  }

  private toggleSidebar = () => {
    this.props.uiStore!.toggleSidebar();
    this.setState({ modalVisible: Modals.NONE });
  }

  private openKeyboardModal = () => {
    const { isModalKeyboard } = this.state;
    return this.setState({ isModalKeyboard: true });
  }

  private closeModalKeyboard = () => {
    const { isModalKeyboard } = this.state;
    return this.setState({ isModalKeyboard: false });
  }

  private renderContentKeyboardStudent = () => (
    <div className="modalKeyboard__list">
      <h2>{intl.get('generals.accesibility_text.title_quick')}</h2>
      <ul>
        <li>
          <strong>Shift + T</strong>
          <p>{intl.get('generals.accesibility_text.shift_t')}</p>
        </li>
        <li>
          <strong>Shift + N</strong>
          <p>{intl.get('generals.accesibility_text.shift_n')}</p>
        </li>
        <li>
          <strong>Shift + R</strong>
          <p>{intl.get('generals.accesibility_text.shift_r')}</p>
        </li>
        <li>
          <strong>Shift + U</strong>
          <p>{intl.get('generals.accesibility_text.shift_u')}</p>
        </li>
        <li>
          <strong>Shift + O</strong>
          <p>{intl.get('generals.accesibility_text.shift_o')}</p>
        </li>
      </ul>
    </div>
  )

  private renderContentKeyboardTeacher = () => (
    <div className="modalKeyboard__list">
      <h2>{intl.get('generals.accesibility_text.title_when_editing')}</h2>
      <ul>
        <li>
          <strong>Shift + A</strong>
          <p>{intl.get('generals.accesibility_text.shift_a')}</p>
        </li>
        <li>
          <strong>Shift + S</strong>
          <p>{intl.get('generals.accesibility_text.shift_s')}</p>
        </li>
        <li>
          <strong>Shift + P</strong>
          <p>{intl.get('generals.accesibility_text.shift_p')}</p>
        </li>
        <li>
          <strong>Shift + D</strong>
          <p>{intl.get('generals.accesibility_text.shift_d')}</p>
        </li>
        <li>
          <strong>Shift + C</strong>
          <p>{intl.get('generals.accesibility_text.shift_c')}</p>
        </li>
        <li>
          <strong>Shift + G</strong>
          <p>{intl.get('generals.accesibility_text.shift_g')}</p>
        </li>
      </ul>
    </div>
  )

  private renderKeyboardModal = () => {
    const currentUser = this.props.loginStore!.currentUser;
    if (currentUser && currentUser.type === UserType.Student) {
      return (
        <div className="modalKeyboard">
          <div className="modalKeyboard__background" onClick={this.closeModalKeyboard} />
          <div className="modalKeyboard__content">
            <div className="modalKeyboard__close" onClick={this.closeModalKeyboard} />
            <div className="modalKeyboard__inside">
              {this.renderContentKeyboardStudent()}
            </div>
          </div>
        </div>
      );
    }
    if (currentUser && currentUser.type === UserType.Teacher) {
      return (
        <div className="modalKeyboard">
          <div className="modalKeyboard__background" onClick={this.closeModalKeyboard} />
          <div className="modalKeyboard__content">
            <div className="modalKeyboard__close" onClick={this.closeModalKeyboard} />
            <div className="modalKeyboard__inside">
              {this.renderContentKeyboardStudent()}
              {this.renderContentKeyboardTeacher()}
            </div>
          </div>
        </div>
      );
    }
    if (currentUser && currentUser.type === UserType.ContentManager) {
      return (
        <div className="modalKeyboard">
          <div className="modalKeyboard__background" onClick={this.closeModalKeyboard} />
          <div className="modalKeyboard__content">
            <div className="modalKeyboard__close" onClick={this.closeModalKeyboard} />
            <div className="modalKeyboard__inside">
              {this.renderContentKeyboardStudent()}
              {this.renderContentKeyboardTeacher()}
            </div>
          </div>
        </div>
      );
    }
  }

  private renderQuestionTab = () => (
    <li className="AppHeader__navigationItem helpNavigation">
      <div className="AppHeader__navigationItemText">
        <a href="javascript:void(0)" className="AppHeader__dropdown">
          <img src={question} alt="question" className="AppHeader__navigationItemImage"/>
        </a>
        <div className="AppHeader__submenuWrapper">
          <ul className="AppHeader__submenu">
            <li className="AppHeader__dropdownItem">
              <a href="https://skolerom.no/support" target="_blank">{intl.get('generals.support')}</a>
            </li>
            <li className="AppHeader__dropdownItem">
              <a href="javascript:void(0)" onClick={this.openKeyboardModal}>{intl.get('generals.keyboard')}</a>
            </li>
          </ul>
        </div>
      </div>
    </li>
  )

  public handleKeyboardControl = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.setState({
        modalVisible: Modals.NONE,
      });
      this.setState({ isModalKeyboard: false });
    }
    if (event.shiftKey && event.key === 'R' || event.shiftKey && event.key === 'r') {
      window.open(`${process.env.REACT_APP_WP_URL}/artikler/`, '_blank');
    }
    if (event.shiftKey && event.key === 'U' || event.shiftKey && event.key === 'u') {
      window.open(`${process.env.REACT_APP_WP_URL}/temaboker/`, '_blank');
    }
    if (event.shiftKey && event.key === 'O' || event.shiftKey && event.key === 'o') {
      window.open(`${process.env.REACT_APP_WP_URL}/lydartikler/`, '_blank');
    }
  }

  public async componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboardControl);
  }
  public componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public renderNavigation = () => {
    const { uiStore } = this.props;
    const linksList = uiStore!.currentLocale === 'nn' ? nynorskHeaderLinks : headerLinks;
    const tabletLinksList = uiStore!.currentLocale === 'nn' ? nynorskHeaderLinks : headerLinks;

    return (
      <>
        <ul className="AppHeader__navigation">
          {linksList.map(renderHeaderLink)}
          {this.renderAccountTab()}
          {this.renderQuestionTab()}
        </ul>
        <ul className="AppHeader__navigation AppHeader__navigation_tablet">
          {tabletLinksList.map(renderHeaderLink)}
          {this.renderAccountTab()}
          {this.renderQuestionTab()}
        </ul>
      </>
    );
  }

  public handleCopy = async () => {
    const { entityStore, currentEntityId, history } = this.props;

    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.copy')
    });

    if (isCopyApproved) {
      const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths';
      const copyId = await entityStore!.copyEntity(currentEntityId!);
      history.push(`/${currentEntityRoute}/edit/${copyId}`);
    }
  }

  public renderCopyButton = (intlKey: string) => (
    <div className="doneBox flexBox alignCenter">
      <CreateButton
        onClick={this.handleCopy}
      >
        {intl.get(intlKey)}
      </CreateButton>
    </div>
  )

  public renderBurgerButton = () => {
    const { loginStore } = this.props;

    if (loginStore!.currentUser) {
      return (
        <button
          className="AppHeader__block AppHeader__button AppHeader__block_mobile"
          onClick={this.toggleSidebar}
        >
          <img src={burger} alt="burger button"/>
        </button>
      );
    }
  }

  public render() {
    const { loginStore, fromAssignmentPassing, fromTeachingPathPassing } = this.props;
    const currentUser = loginStore!.currentUser;
    const isStudent = loginStore!.currentUser ? loginStore!.currentUser.type === UserType.Student : false;
    const redirectLink = currentUser
        ? '/activity'
      : '#';

    return (
      <header className="AppHeader">
        {this.renderUserModalIfNeeded()}
        {this.state.modalVisible !== Modals.NONE && <div className="AppHeader__headerOverlay" onClick={this.closeModals} />}
        {!fromAssignmentPassing && !fromTeachingPathPassing && <p id="LogoDescription" className="hidden">Logo Skolerom</p>}
        {fromAssignmentPassing && fromTeachingPathPassing && <p id="LogoDescriptionStudent" className="hidden">Logo Skolerom</p>}
        <div className="AppHeader__block" aria-labelledby="LogoDescription">
          <NavLink to={redirectLink} onClick={this.handleLogoClick}>
            <div className="AppHeader__block">
              <img src={logoImage} alt="Skolerom Dashboard" className="AppHeader__logo" title="Skolerom Skolerom"/>
              <span className="AppHeader__role">{this.renderRole()}</span>
            </div>
          </NavLink>
        </div>

        {!fromAssignmentPassing && !fromTeachingPathPassing && this.renderNavigation()}
        {!isStudent && fromAssignmentPassing && this.renderCopyButton('assignment list.Copy assignment')}
        {!isStudent && fromTeachingPathPassing && this.renderCopyButton('teaching_paths_list.copy')}

        {this.renderBurgerButton()}
        <div className="AppHeader__block AppHeader__block_mobile">
          <NavLink to={redirectLink} onClick={this.handleLogoClick}>
            <img src={logoImage} alt="logo mobile"/>
          </NavLink>
        </div>
        <div className={'AppHeader__block_mobile AppHeader__block'}>
          {this.renderQuestionTab()}
          <button
            className="AppHeader__block AppHeader__button AppHeader__block_mobile AppHeader__userMenuButton"
            onClick={this.showUserModal}
          >
            <img src={verticalDots} alt="user menu"/>
          </button>
        </div>
        {this.state.isModalKeyboard && this.renderKeyboardModal()}
      </header>
    );
  }
}

const resizeComponent = withRouter(AppHeader);
export { resizeComponent as AppHeader };
