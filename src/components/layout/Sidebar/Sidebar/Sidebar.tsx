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

import './Sidebar.scss';

interface SideBarLink {
  icon: string;
  name: string;
  url: string;
}

const teacherSidebarLinks = [
  {
    icon: activityIcon,
    name: 'Activity',
    url: '/activity'
  },
  {
    icon: teachingPathImg,
    name: 'Teaching Paths',
    url: '/teaching-paths'
  },
  {
    icon: assignmentsImg,
    name: 'Assignments',
    url: '/assignments'
  },
  {
    icon: evaluationIcon,
    name: 'Evaluation',
    url: '/evaluation'
  },
  {
    icon: studentsImg,
    name: 'Students',
    url: '/students'
  },
  /*  {
      icon: favoritesIcon,
      name: 'Favorites',
      url: '/favorites'
    },*/
  /*  {
      icon: forumIcon,
      name: 'Forum',
      url: '/forum'
    }*/
];

const studentSidebarLinks = [
  {
    icon: activityIcon,
    name: 'Activity',
    url: '/activity'
  },
  {
    icon: teachingPathImg,
    name: 'Teaching Paths',
    url: '/teaching-paths'
  },
  {
    icon: assignmentsImg,
    name: 'Assignments',
    url: '/assignments'
  },
];

const contentManagerSidebar = [
  {
    icon: activityIcon,
    name: 'Activity',
    url: '/activity'
  },
  {
    icon: teachingPathImg,
    name: 'Teaching Paths',
    url: '/teaching-paths'
  },
  {
    icon: assignmentsImg,
    name: 'Assignments',
    url: '/assignments'
  }
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
    const { uiStore } = this.props;
    if (link.url.includes(uiStore!.currentActiveTab)) {
      event.preventDefault();
    } else {
      uiStore!.setCurrentActiveTab(link.url.split('/')[1]);
    }

    this.props.uiStore!.hideSidebar();
  }

  private renderSidebarLink = (link: SideBarLink) => (
    <NavLink
      key={link.name}
      className="Sidebar__listItem"
      to={link.url}
      activeClassName="Sidebar__listItem_active"
      onClick={this.handleClickLink(link)}
      aria-label={intl.get(`sidebar.${link.name}`)}
      title={intl.get(`sidebar.title.${link.name}`)}
    >
      <img className="Sidebar__icon" src={link.icon} alt={intl.get(`sidebar.alt.${link.name}`)} title={intl.get(`sidebar.title.${link.name}`)} />
      <span className="Sidebar__text">
        {intl.get(`sidebar.${link.name}`)}
      </span>
    </NavLink>
  )

  private renderSidebarLinks = () => {
    const { currentUser } = this.props.loginStore!;

    switch (currentUser!.type) {
      case (UserType.Teacher):
        return teacherSidebarLinks.map(this.renderSidebarLink);
      case (UserType.Student):
        return studentSidebarLinks.map(this.renderSidebarLink);
      case (UserType.ContentManager):
        return contentManagerSidebar.map(this.renderSidebarLink);
      default:
        return;
    }
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText) {
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
