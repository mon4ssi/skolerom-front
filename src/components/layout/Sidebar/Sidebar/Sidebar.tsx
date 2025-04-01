import React, { Component, MouseEvent } from 'react';
import intl from 'react-intl-universal';
import classNames from 'classnames';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import { LoginStore } from 'user/view/LoginStore';
import { UserType } from 'user/User';
import { UIStore } from 'locales/UIStore';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';

import activityIcon from 'assets/images/activity.svg';
import assignmentsImg from 'assets/images/assignment.svg';
import teachingPathImg from 'assets/images/teaching-path.svg';
import toggleSidebarIcon from 'assets/images/icon-sidebar.svg';
import studentsImg from 'assets/images/students-circle.svg';
import evaluationIcon from 'assets/images/evaluation-menu-icon.svg';
import favoritesIcon from 'assets/images/favorites.svg';
import forumIcon from 'assets/images/forum.svg';
import searchIcon from 'assets/images/search_circle_icon.svg';

import './Sidebar.scss';

interface SideBarLink {
  url: string;
  path: string;
  icon: string;
  name: string;
}

const UI_URL = process.env.REACT_APP_UI_URL as string;

const sidebarLink = {
  activity: {
    url: '/activity',
    path: '/activity',
    icon: activityIcon,
    name: 'Activity'
  },
  search: {
    url: '/search',
    path: '/search',
    icon: searchIcon,
    name: 'Search'
  },
  teachingPaths: {
    url: '/teaching-paths',
    path: '/teaching-paths',
    icon: teachingPathImg,
    name: 'Teaching Paths'
  },
  assignments: {
    url: '/assignments',
    path: '/assignments',
    icon: assignmentsImg,
    name: 'Assignments'
  },
  evaluation: {
    url: '/evaluation',
    path: '/evaluation',
    icon: evaluationIcon,
    name: 'Evaluation'
  },
  students: {
    url: '/students',
    path: '/students',
    icon: studentsImg,
    name: 'Students'
  },
  sharingArticles: {
    url: `${UI_URL}/login`,
    path: '/sharing/articles',
    icon: evaluationIcon,
    name: 'Articles'
  },
  favorites: {
    url: '/favorites',
    path: '/favorites',
    icon: favoritesIcon,
    name: 'Favorites',
  },
  forum: {
    url: '/forum',
    path: '/forum',
    icon: forumIcon,
    name: 'Forum',
  },
};

const teacherSidebarLinks: Array<SideBarLink> = [
  sidebarLink.activity,
  sidebarLink.search,
  sidebarLink.teachingPaths,
  sidebarLink.assignments,
  sidebarLink.evaluation,
  sidebarLink.students,
  // sidebarLink.sharingArticles, TODO: Enable when sharing articles is ready
  // sidebarLink.favorites,
  // sidebarLink.forum,
];

const teacherTrialSidebarLinks: Array<SideBarLink> = [
  sidebarLink.activity,
  sidebarLink.search,
  sidebarLink.teachingPaths,
  sidebarLink.assignments,
  // sidebarLink.evaluation,
  // sidebarLink.students,
  // sidebarLink.sharingArticles, TODO: Enable when sharing articles is ready
];

const studentSidebarLinks: Array<SideBarLink> = [
  sidebarLink.activity,
  sidebarLink.search,
  sidebarLink.teachingPaths,
  sidebarLink.assignments,
  // sidebarLink.sharingArticles, TODO: Enable when sharing articles is ready
];

const contentManagerSidebar: Array<SideBarLink> = [
  sidebarLink.activity,
  sidebarLink.search,
  sidebarLink.teachingPaths,
  sidebarLink.assignments,
  // sidebarLink.sharingArticles, TODO: Enable when sharing articles is ready
];
const PATHLENGTH = 4;

interface Props extends RouteComponentProps {
  loginStore?: LoginStore;
  uiStore?: UIStore;
  newAssignmentStore?: NewAssignmentStore;
  editTeachingPathStore?: EditTeachingPathStore;
}

@inject('loginStore', 'uiStore')
@inject('assignmentListStore', 'newAssignmentStore')
@inject('teachingPathsListStore', 'editTeachingPathStore')
@observer
class Sidebar extends Component<Props> {

  private handleClickLink = (link: SideBarLink) => (event: MouseEvent) => {
    const { loginStore, uiStore } = this.props;

    const reload = (path: string) => {
      window.location.href = `${window.location.origin}${path}`;
    };

    const redirect = (url: string) => {
      window.location.href = url;
    };

    if (link.path.includes(uiStore!.currentActiveTab)) {
      event.preventDefault();
      reload(link.path);
      return;
    }

    if (link.url.includes('http')) {
      event.preventDefault();
      const user = loginStore!.currentUser;
      const params = new URLSearchParams({ redirect: link.path, userId: user!.signature || '' });
      const target = `${link.url}?${params.toString()}`;
      redirect(target);
      return;
    }

    uiStore!.setCurrentActiveTab(link.path.split('/')[1]);

    this.props.uiStore!.hideSidebar();
  }

  private renderSidebarLink = (link: SideBarLink) => (
    <NavLink
      key={link.name}
      className="Sidebar__listItem"
      to={link.path}
      activeClassName="Sidebar__listItem_active"
      onClick={this.handleClickLink(link)}
      aria-label={intl.get(`sidebar.${link.name}`)}
      role="button"
      title={intl.get(`sidebar.title.${link.name}`)}
      tabIndex={0}
    >
      <img className="Sidebar__icon" src={link.icon} alt={intl.get(`sidebar.alt.${link.name}`)} title={intl.get(`sidebar.title.${link.name}`)} />
      <span className="Sidebar__text">
        {intl.get(`sidebar.${link.name}`)}
      </span>
    </NavLink>
  )

  private renderSidebarLinks = () => {
    const { currentUser } = this.props.loginStore!;
    if (currentUser) {
      switch (currentUser!.type) {
        case (UserType.Teacher):
          if (!currentUser!.teacherTrial) {
            return teacherSidebarLinks.map(this.renderSidebarLink);
          }
          return teacherTrialSidebarLinks.map(this.renderSidebarLink);
        case (UserType.Student):
          return studentSidebarLinks.map(this.renderSidebarLink);
        case (UserType.ContentManager):
          return contentManagerSidebar.map(this.renderSidebarLink);
        default:
          return;
      }
    }
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const classDivPath = (event.composedPath()[0] as Element).className;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    const qlEditorText = 'ql-editor';
    const sidebarItem = Array.from(document.getElementsByClassName('Sidebar__listItem') as HTMLCollectionOf<HTMLElement>);
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText && classDivPath !== qlEditorText) {
      if ((event.shiftKey && event.key === 'S') || (event.shiftKey && event.key === 's')) {
        sidebarItem[0]!.focus();
      }
      if ((event.shiftKey && event.key === 'T') || (event.shiftKey && event.key === 't')) {
        window.location.href = '/teaching-paths/';
      }
      if ((event.shiftKey && event.key === 'N') || (event.shiftKey && event.key === 'n')) {
        window.location.href = '/assignments/';
      }
      if ((event.shiftKey && event.key === 'G') || (event.shiftKey && event.key === 'g')) {
        if (UserType.Teacher || UserType.ContentManager) {
          this.createAssignment();
        }
      }
      if ((event.shiftKey && event.key === 'C' || event.shiftKey && event.key === 'c')) {
        if (UserType.Teacher || UserType.ContentManager) {
          this.createTeachingPath();
        }
      }
    }
  }

  public createAssignment = async () => {
    const { newAssignmentStore, history } = this.props;

    const id = await newAssignmentStore!
      .createAssigment()
      .then(response => response.id);
    history.push(`/assignments/edit/${id}`);
  }

  public createTeachingPath = async () => {
    const { editTeachingPathStore, history } = this.props;
    const id = await editTeachingPathStore!
      .createTeachingPath()
      .then(response => response.id);
    history.push(`/teaching-paths/edit/${id}`);
  }

  public componentDidMount() {
    const { uiStore, history } = this.props;
    const currentActiveTab = history.location.pathname.split('/')[1];
    uiStore!.setCurrentActiveTab(currentActiveTab);
    document.addEventListener('keyup', this.handleKeyboardControl);
  }

  public componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public render() {
    const { sidebarShown, hideSidebar, toggleSidebar } = this.props.uiStore!;
    const sidebarClasses = classNames('Sidebar', {
      Sidebar_visible: sidebarShown,
      Sidebar_expanded: sidebarShown,
    });
    const overlayClasses = classNames({
      Sidebar__overlay: sidebarShown
    });

    return (
      <>
        <div className={overlayClasses} onClick={hideSidebar} />
        <div className={sidebarClasses}>
          <nav className="Sidebar__list">
            {this.renderSidebarLinks()}
          </nav>
          <button className="Sidebar__toggleButton" onClick={toggleSidebar} title="Toggle Sidebar">
            <img
              src={toggleSidebarIcon}
              alt="toggleSidebar"
              title="Toggle Sidebar"
            />
          </button>
        </div>
      </>
    );
  }
}

const SidebarWithRouter = withRouter(Sidebar);
export { SidebarWithRouter as Sidebar };
