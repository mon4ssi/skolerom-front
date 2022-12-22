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
import closeicon from 'assets/images/close-rounded-black.svg';
import question from 'assets/images/questions.svg';

import './AppHeader.scss';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import loginBtnIcon from 'assets/images/login-btn-icon.svg';
import { DetailsModal } from 'components/common/DetailsModal/DetailsModal';
import { divide } from 'lodash';

interface HeaderNavigationLink {
  name: string;
  url: string;
  dropdown?: boolean;
  submenuItems?: Array<HeaderNavigationLink>;
}

const LEFTCODE = 8592;
const RIGHTCODE = 8594;
const ANIMATION_TIMEOUT = 200;

const headerLinks: Array<HeaderNavigationLink> = [
  {
    name: 'Library',
    url: '#',
    dropdown: true,
    submenuItems: [
      {
        name: 'School Articles',
        url: `${process.env.REACT_APP_WP_URL}/undervisning/`,
      },
      {
        name: 'Publications',
        url: `${process.env.REACT_APP_WP_URL}/temaboker/`
      },
      {
        name: 'Articles',
        url: `${process.env.REACT_APP_WP_URL}/artikler/`
      },
      {
        name: 'Sound articles',
        url: `${process.env.REACT_APP_WP_URL}/lydartikler/`
      }
    ]
  },
  {
    name: 'School',
    url: '#',
    dropdown: true,
    submenuItems: [
      {
        name: 'For foresatte',
        url: `${process.env.REACT_APP_WP_URL}/for-foresatte/`
      },
      {
        name: 'For Larere',
        url: '#',
        dropdown: true,
        submenuItems: [
          {
            name: 'Lesereisen',
            url: `${process.env.REACT_APP_WP_URL}/lesereisen-2022/`
          },
          {
            name: 'Arshjul',
            url: `${process.env.REACT_APP_WP_URL}/arshjul/`
          }
        ]
      }
    ]
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
    url: `${process.env.REACT_APP_WP_URL}/hva-er-skolerom/`
  },
  {
    name: 'contact',
    url: `${process.env.REACT_APP_WP_URL}/kontakt-oss/`
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
    const renderSubMenuSubMenu = (item: HeaderNavigationLink) => (
      <li key={item.name} className={'AppHeader__dropdownItem__subItem'}>
        <a href={item.url} title={item.name}>{item.name}</a>
      </li>
    );
    const renderSubmenu = (item: HeaderNavigationLink) => {
      if (item.dropdown) {
        return (
          <li key={item.name} className={'AppHeader__dropdownItem'}>
            <a href={item.url} title={item.name}>{item.name}</a>
            <ul className="AppHeader__dropdownItem__subMenu">
              {item.submenuItems!.map(renderSubMenuSubMenu)}
            </ul>
          </li>
        );
      }
      return (
        <li key={item.name} className={'AppHeader__dropdownItem'}>
          <a href={item.url} title={item.name}>{item.name}</a>
        </li>
      );
    };

    return (
      <li key={link.name} className="AppHeader__navigationItem tc1 fs17 fw500">
        <div className="AppHeader__navigationItemText">
          <a href={link.url} className="AppHeader__dropdown" title={link.name}>{link.name}</a>
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
        <a href={link.url} title={link.name}>{link.name}</a>
      </div>
    </li>
  );
};

interface HeaderProps extends RouteComponentProps {
  entityStore?: AssignmentListStore | TeachingPathsListStore;
  loginStore?: LoginStore;
  fromAssignmentPassing?: boolean;
  fromTeachingPathPassing?: boolean;
  studentFormTeachinPath?: boolean;
  studentFormAssignment?: boolean;
  isPreview?: boolean;
  uiStore?: UIStore;
  width?: number;
  onLogoClick?: (e: MouseEvent) => void;
  currentEntityId?: number;
  currentEntityIsPrivate?: boolean;
}

enum Modals {
  NONE,
  USER,
}

interface HeaderState {
  modalVisible: Modals;
  isModalKeyboard: boolean;
  isMobileModalOpen: boolean;
  linksMenu: Array<HeaderNavigationLink>;
}

@inject('loginStore', 'uiStore')
@observer
class AppHeader extends Component<HeaderProps, HeaderState> {
  public readonly state: HeaderState = {
    modalVisible: Modals.NONE,
    isModalKeyboard: false,
    isMobileModalOpen: false,
    linksMenu: []
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

  private closeWindow = () => {
    const textClose = (this.props.studentFormAssignment) ? intl.get('teaching path passing.exit') : intl.get('current_assignment_page.Exit assignment');
    return (
      <div className="closeHeaderTp" onClick={this.handleLogoClick}>
        <p>{textClose}</p>
        <img src={closeicon} />
      </div>
    );
  }

  private getFeideUrl = async () => {
    const { history } = this.props;

    history.push('dataporten/auth');
  }

  private renderAccountTab = () => {
    const { loginStore } = this.props;

    return loginStore!.currentUser ? (
      <li className="AppHeader__navigationItem" onClick={this.showUserModal}>
        <a href="javascript:void(0)" className="AppHeader__navigationItemText" title={intl.get('header.title.My account')}>
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
        <a href={`${process.env.REACT_APP_BASE_URL}/api/dataporten/auth`} title={intl.get('header.Log in')}>
          {intl.get('header.Log in')}
        </a>
      </li>
    );
  }

  private renderRole = () => {
    const { studentFormTeachinPath } = this.props;
    const currentUser = this.props.loginStore!.currentUser;

    /*if (currentUser && currentUser.type === UserType.Teacher) {
      return intl.get('header.teacher');
    }
    if (currentUser && currentUser.type === UserType.Student) {
      return intl.get('header.student');
    }*/
    if (currentUser && currentUser.type === UserType.Student && studentFormTeachinPath) {
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

  private openKeyboardModal = () => (this.setState({ isModalKeyboard: true }));

  private closeModalKeyboard = () => (this.setState({ isModalKeyboard: false }));

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
        <li>
          <strong>Shift + F</strong>
          <p>{intl.get('assignment preview.Finish reading article')}</p>
        </li>
        <li>
          <strong>Shift + {String.fromCharCode(LEFTCODE)}</strong>
          <p>{intl.get('pagination.Previous page')}</p>
        </li>
        <li>
          <strong>Shift + {String.fromCharCode(RIGHTCODE)}</strong>
          <p>{intl.get('pagination.Next page')}</p>
        </li>
      </ul>
    </div>
  )

  private renderContentKeyboardStudentTeacher = () => (
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
        <li>
          <strong>Shift + F</strong>
          <p>{intl.get('assignment preview.Finish reading article')}</p>
        </li>
      </ul>
    </div>
  )

  private renderContentKeyboardTeacher = () => (
    <div className="modalKeyboard__list">
      <h2>{intl.get('generals.accesibility_text.title_when_editing')}</h2>
      <ul>
        <li>
          <strong>Shift + C</strong>
          <p>{intl.get('generals.accesibility_text.shift_c')}</p>
        </li>
        <li>
          <strong>Shift + G</strong>
          <p>{intl.get('generals.accesibility_text.shift_g')}</p>
        </li>
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
              {this.renderContentKeyboardStudentTeacher()}
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
              {this.renderContentKeyboardStudentTeacher()}
              {this.renderContentKeyboardTeacher()}
            </div>
          </div>
        </div>
      );
    }
  }

  private dropDownKeyboard = () => (
    <li className="AppHeader__dropdownItem">
      <a href="javascript:void(0)" onClick={this.openKeyboardModal} title={intl.get('header.title.keyboard')}>{intl.get('generals.keyboard')}</a>
    </li>
  )

  private renderQuestionTab = () => (
    <li className="AppHeader__navigationItem tc1 fs17 fw500">
      <div className="AppHeader__navigationItemText">
        <a href="javascript:void(0)" className="AppHeader__dropdown" title={intl.get('header.About')}>
          {intl.get('header.About')}
        </a>
        <div className="AppHeader__submenuWrapper">
          <ul className="AppHeader__submenu">
            <li className="AppHeader__dropdownItem">
              <a href={`${process.env.REACT_APP_WP_URL}/hva-er-skolerom`} title={intl.get('header.About skolerom')} target="_blank">{intl.get('header.About skolerom')}</a>
            </li>
            <li className="AppHeader__dropdownItem">
              <a href={`${process.env.REACT_APP_WP_URL}/kontakt-oss`} title={intl.get('header.contact')} target="_blank">{intl.get('header.contact')}</a>
            </li>
            <li className="AppHeader__dropdownItem">
              <a href={`${process.env.REACT_APP_WP_URL}/support-skolerom`} title={intl.get('generals.support')} target="_blank">{intl.get('generals.support')}</a>
            </li>
            {this.props.loginStore!.currentUser && this.dropDownKeyboard()}
          </ul>
        </div>
      </div>
    </li>
  )

  private renderSimpleQuestionTab = () => (
    <li className="AppHeader__navigationItem helpNavigation">
      <div className="AppHeader__navigationItemText">
        <a href="javascript:void(0)" className="AppHeader__dropdown" title={intl.get('header.title.Help')}>
          {intl.get('header.title.Help')}
        </a>
        <div className="AppHeader__submenuWrapper">
          <ul className="AppHeader__submenu">
            <li className="AppHeader__dropdownItem">
              <a href="https://skolerom.no/support-skolerom" title={intl.get('header.title.Help')} target="_blank">{intl.get('generals.support')}</a>
            </li>
            {this.props.loginStore!.currentUser && this.dropDownKeyboard()}
          </ul>
        </div>
      </div>
    </li>
  )

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const classDivPath = (event.composedPath()[0] as Element).className;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    const qlEditorText = 'ql-editor';
    if (event.key === 'Escape') {
      this.setState({
        modalVisible: Modals.NONE,
      });
      this.setState({ isModalKeyboard: false });
    }
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText && classDivPath !== qlEditorText) {
      if ((event.shiftKey && event.key === 'R') || (event.shiftKey && event.key === 'r')) {
        window.open(`${process.env.REACT_APP_WP_URL}/artikler/`, '_blank');
      }
      if ((event.shiftKey && event.key === 'U') || (event.shiftKey && event.key === 'u')) {
        window.open(`${process.env.REACT_APP_WP_URL}/temaboker/`, '_blank');
      }
      if ((event.shiftKey && event.key === 'O') || (event.shiftKey && event.key === 'o')) {
        window.open(`${process.env.REACT_APP_WP_URL}/lydartikler/`, '_blank');
      }
    }
  }

  public sendTitleActivity = () => {
    const currentUser = this.props.loginStore!.currentUser;
    if (currentUser && currentUser.type === UserType.Student) {
      return (
        <li className="AppHeader__navigationItem tc1 fs17 fw500 ">
          <div className="AppHeader__navigationItemText">
            <a href="/activity" className="permanActive" title={intl.get('header.student_room')}>{intl.get('header.student_room')}</a>
          </div>
        </li>
      );
    }
    if (currentUser && currentUser.type === UserType.Teacher) {
      return (
        <li className="AppHeader__navigationItem tc1 fs17 fw500 ">
          <div className="AppHeader__navigationItemText">
            <a href="/activity" className="permanActive" title={intl.get('header.teacher_room')}>{intl.get('header.teacher_room')}</a>
          </div>
        </li>
      );
    }
    if (currentUser && currentUser.type === UserType.ContentManager) {
      return (
        <li className="AppHeader__navigationItem tc1 fs17 fw500 ">
          <div className="AppHeader__navigationItemText">
            <a href="/activity" className="permanActive" title={intl.get('header.teacher_room')}>{intl.get('header.teacher_room')}</a>
          </div>
        </li>
      );
    }
  }

  public async componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboardControl);
    this.getdataMenu();
  }
  public componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public getdataMenu = async () => {
    const { uiStore } = this.props;
    const linksLis2t = await this.props.loginStore!.getMenuData(uiStore!.currentLocale);
    this.setState({
      linksMenu: linksLis2t
    });
  }

  public renderNavigation = () => {
    const { uiStore } = this.props;
    // const linksList = uiStore!.currentLocale === 'nn' ? nynorskHeaderLinks : headerLinks;
    const tabletLinksList = uiStore!.currentLocale === 'nn' ? nynorskHeaderLinks : headerLinks;
    const linksList = this.state.linksMenu;

    return (
      <>
        <ul className="AppHeader__navigation">
          {this.sendTitleActivity()}
          {linksList.map(renderHeaderLink)}
          {this.renderQuestionTab()}
          {this.renderAccountTab()}
        </ul>
        <ul className="AppHeader__navigation AppHeader__navigation_tablet">
          {linksList.map(renderHeaderLink)}
          {this.renderQuestionTab()}
          {this.renderAccountTab()}
        </ul>
      </>
    );
  }

  public renderNavigationNotLogin = () => {
    const { uiStore } = this.props;
    const linksList = uiStore!.currentLocale === 'nn' ? nynorskHeaderLinks : headerLinks;
    const tabletLinksList = uiStore!.currentLocale === 'nn' ? nynorskHeaderLinks : headerLinks;

    return (
      <>
        <ul className="AppHeader__navigation">
          {linksList.map(renderHeaderLink)}
          {this.renderQuestionTab()}
          {this.renderItemsNotLogin()}
        </ul>
        <ul className="AppHeader__navigation AppHeader__navigation_tablet">
          {tabletLinksList.map(renderHeaderLink)}
          {this.renderQuestionTab()}
          {this.renderItemsNotLogin()}
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
    <div className="doneBox flexBox alignCenter copyButton">
      <CreateButton
        onClick={this.handleCopy}
        title={intl.get(intlKey)}
      >
        {intl.get(intlKey)}
      </CreateButton>
    </div>
  )

  public openModalTGAssig = (nroLevel: string) => {
    const modalTG = Array.from(document.getElementsByClassName('modalContentTGAssig') as HTMLCollectionOf<HTMLElement>);
    const modalTGBack = Array.from(document.getElementsByClassName('modalContentTGAssigBackground') as HTMLCollectionOf<HTMLElement>);
    modalTG[0].classList.add('open');
    modalTGBack[0].classList.remove('hide');
  }

  public renderGuidanceAndCopyButton = () => {
    const { currentEntityId } = this.props;
    const { currentEntity } = this.props.entityStore!;
    const isPrivateAssignment = false;
    return (
      <div className="doneBox flexBox alignCenter copyButton">
        <CreateButton
          className="jr-btnHeaderTeacherGuidance AppHeader__btnHeaderGuidance"
          onClick={this.openModalTGAssig.bind(this, '0')}
          title={intl.get('teacherGuidance.name')}
        >
          {intl.get('teacherGuidance.name')}
        </CreateButton>
        {!isPrivateAssignment! && (<div className="grepButton"><DetailsModal isAssignment={true} id={currentEntityId} /></div>)}
        <CreateButton
          onClick={this.handleCopy}
          title={intl.get('assignment list.Copy assignment')}
        >
          {intl.get('assignment list.Copy assignment')}
        </CreateButton>
      </div>
    );
  }

  public renderBurgerButton = () => {
    const { loginStore } = this.props;

    if (loginStore!.currentUser) {
      return (
        <button
          className="AppHeader__block AppHeader__button AppHeader__block_mobile"
          onClick={this.toggleSidebar}
          title="menu button"
        >
          <img src={burger} alt="burger button" title="menu button" />
        </button>
      );
    }
  }

  public showMobileModal = () => {
    if (!this.state.isMobileModalOpen) {
      this.setState({ isMobileModalOpen: true });
    } else {
      this.setState({ isMobileModalOpen: false });
    }
  }

  public renderMobileButton = () => {
    if (this.props.loginStore!.currentUser) {
      return (
        <button
          className="AppHeader__block AppHeader__button AppHeader__block_mobile AppHeader__userMenuButton"
          onClick={this.showUserModal}
          title="user menu"
        >
          <img src={verticalDots} alt="user menu" />
        </button>
      );
    }
    return (
      <button
        className="AppHeader__block AppHeader__button AppHeader__block_mobile AppHeader__userMenuButton"
        onClick={this.showMobileModal}
        title="user menu"
      >
        <img src={verticalDots} alt="user menu" />
      </button>
    );
  }

  public renderItemsNotLogin = () => {
    const classTemplar = (this.props.loginStore!.isCurrentUserFetching) ? 'BtnFinal btnDisabled' : 'BtnFinal';
    return (
      <li className="singleListElementsSimple">
        <a href={`${process.env.REACT_APP_BASE_URL}/api/dataporten/auth`} className={classTemplar}>
          <img src={loginBtnIcon} />
          <p>{intl.get('header.logg_in')}</p>
        </a>
      </li>
    );
  }

  public renderLineMobileButton = () => (
    <div className="singleFlexElements AppHeader__block">
      {this.renderItemsNotLogin()}
    </div>
  )

  public renderModalMobileButton = () => (
    <div className="singleElements">
      {this.renderItemsNotLogin()}
    </div>
  )

  public render() {
    const { loginStore, fromAssignmentPassing, fromTeachingPathPassing } = this.props;
    const currentUser = loginStore!.currentUser;
    const isStudent = loginStore!.currentUser ? loginStore!.currentUser.type === UserType.Student : false;
    const redirectLink = currentUser
      ? '/activity'
      : '#';

    let ifLogin = true;
    if (this.props.loginStore!.currentUser) {
      ifLogin = false;
    }

    const classCreation = (fromTeachingPathPassing) ? 'AppHeader creationHeader' : 'AppHeader';

    return (
      <header className={classCreation}>
        {this.renderUserModalIfNeeded()}
        {this.state.modalVisible !== Modals.NONE && <div className="AppHeader__headerOverlay" onClick={this.closeModals} />}
        {!fromAssignmentPassing && !fromTeachingPathPassing && <p id="LogoDescription" className="hidden">Logo Skolerom</p>}
        {fromAssignmentPassing && fromTeachingPathPassing && <p id="LogoDescriptionStudent" className="hidden">Logo Skolerom</p>}
        <div className="AppHeader__block" aria-labelledby="LogoDescription">
          <NavLink to={redirectLink} onClick={this.handleLogoClick}>
            <div className="AppHeader__block">
              <img src={logoImage} alt="Skolerom Logo" className="AppHeader__logo" title="Skolerom" />
              <span className="AppHeader__role">{this.renderRole()}</span>
            </div>
          </NavLink>
        </div>
        {this.props.loginStore!.currentUser && !fromAssignmentPassing && !fromTeachingPathPassing && this.renderNavigation()}
        {!this.props.isPreview && this.props.loginStore!.currentUser && !isStudent && fromAssignmentPassing && this.renderGuidanceAndCopyButton()}
        {!this.props.isPreview && this.props.loginStore!.currentUser && !isStudent && fromTeachingPathPassing && this.renderCopyButton('teaching_paths_list.copy')}
        {ifLogin && this.renderNavigationNotLogin()}

        {this.props.loginStore!.currentUser && this.renderBurgerButton()}
        {false && this.props.studentFormTeachinPath && this.closeWindow()}
        <div className="AppHeader__block AppHeader__block_mobile">
          <NavLink to={redirectLink} onClick={this.handleLogoClick}>
            <img src={logoImage} alt="logo mobile" />
          </NavLink>
        </div>
        <div className={'AppHeader__block_mobile AppHeader__block'}>
          {this.renderQuestionTab()}
          {this.renderMobileButton()}
          {this.state.isMobileModalOpen && this.renderModalMobileButton()}
        </div>
        {this.props.loginStore!.currentUser && this.state.isModalKeyboard && this.renderKeyboardModal()}
      </header>
    );
  }
}

const resizeComponent = withRouter(AppHeader);
export { resizeComponent as AppHeader };
