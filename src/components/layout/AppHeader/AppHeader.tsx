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
    url: 'https://skolerom.no/undervisning/'
  },
  {
    name: 'Library',
    url: '#',
    dropdown: true,
    submenuItems: [
      {
        name: 'Articles',
        url: 'https://skolerom.no/artikler/'
      },
      {
        name: 'Publications',
        url: 'https://skolerom.no/temaboker/'
      },
      {
        name: 'Sound articles',
        url: 'https://skolerom.no/lydartikler/'
      }
    ]
  },
  {
    name: 'About skolerom',
    url: 'https://skolerom.no/om-skolerom/'
  }
];
const tabletHeaderLinks: Array<HeaderNavigationLink> = [
  {
    name: 'School',
    url: 'https://skolerom.no/undervisning/'
  },
  {
    name: 'Articles',
    url: 'https://skolerom.no/artikler/'
  },
  {
    name: 'Publications',
    url: 'https://skolerom.no/temaboker/'
  },
  {
    name: 'Sound articles',
    url: 'https://skolerom.no/lydartikler/'
  },
  {
    name: 'About skolerom',
    url: 'https://skolerom.no/om-skolerom/'
  }
];
const nynorskHeaderLinks: Array<HeaderNavigationLink> = [
  {
    name: 'School',
    url: 'https://skolerom.no/nn/undervisning/'
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
}

@inject('loginStore', 'uiStore')
@observer
class AppHeader extends Component<HeaderProps, HeaderState> {

  public readonly state: HeaderState = {
    modalVisible: Modals.NONE,
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
        <div className="AppHeader__navigationItemText">
          {intl.get('header.My account')}
        </div>
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

  private renderQuestionTab = () => (
    <li className="AppHeader__navigationItem">
      <a href="https://skolerom.no/support">
        <img src={question} alt="question" className="AppHeader__navigationItemImage"/>
      </a>
    </li>
  )

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
              <img src={logoImage} alt="Temabok Dashboard" className="AppHeader__logo" title="Logo Skolerom"/>
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
      </header>
    );
  }
}

const resizeComponent = withRouter(AppHeader);
export { resizeComponent as AppHeader };
