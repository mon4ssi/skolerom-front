import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { IListWidgetItem, ListWidget } from './Widget/ListWidget';
import { SliderWidget } from './Widget/SliderWidget';
import { StatisticWidget } from './Widget/StatisticWidget/StatisticWidget';
import { LoginStore } from 'user/view/LoginStore';
import { ActivityStore } from './ActivityStore';
import { RecentActivitiesList } from './RecentActivity/RecentActivity';
import { Assignment } from '../assignment/Assignment';
import { TeachingPath } from '../teachingPath/TeachingPath';
import { UserType } from '../user/User';
import { Popup } from 'components/common/Popup/Popup';

import placeholder from 'assets/images/list-placeholder.svg';

import './ActivityPage.scss';

const loadRecentActivityInterval = 30000;

const studentAmountArticles = 7;
const teacherAmountArticles = 4;

interface ActivityPageProps {
  activityStore?: ActivityStore;
  loginStore?: LoginStore;
  role: UserType;
}

interface ActivityPageState {
  iframeURL: string;
  popupShown: boolean;
  isPause: boolean;
}

@inject('activityStore', 'loginStore')
@observer
class Activity extends Component<ActivityPageProps & RouteComponentProps, ActivityPageState> {
  private getRecentActivityWithInterval: number = 0;

  public state = {
    iframeURL: '',
    popupShown: false,
    isPause: false
  };

  private loadWidgetData() {
    const { role, activityStore } = this.props;
    switch (role) {
      case UserType.Teacher:
        activityStore!.loadSliderWidget(UserType.Teacher);
        break;
      case UserType.Student:
        activityStore!.loadSliderWidget(UserType.Student);
        break;
      case UserType.ContentManager:
        activityStore!.loadSliderWidget(UserType.Teacher);
        activityStore!.loadSliderWidget(UserType.Student);
        break;
      default:
        throw new Error(`Undefined user role: ${role}`);
    }
  }

  private onClickArticle = (url: string) => () => {
    window.open(url, '_blank');
  }

  private onClickTeachingPath = (teachingPath: TeachingPath) => () => {
    if (teachingPath.view === 'edit') {
      return this.props.history.push(`/teaching-paths/edit/${teachingPath.id}`);
    }
    return this.props.history.push(`/teaching-paths/view/${teachingPath.id}`, {
      readOnly: true
    });
  }

  private onClickAssignment = (assignment: Assignment) => () => {
    if (assignment.view === 'edit') {
      return this.props.history.push(`/assignments/edit/${assignment.id}`);
    }
    return this.props.history.push(`/assignments/view/${assignment.id}`, {
      readOnly: true
    });
  }

  private closePopup = () => {
    this.setState({
      popupShown: false,
      iframeURL: '',
    });
  }

  private openPopup = (url: string) => {
    this.setState({
      popupShown: true,
      iframeURL: url,
    });
  }

  private getNewestArticles = (): Array<IListWidgetItem> => {
    const { activityStore } = this.props;

    return activityStore!.newestArticles.map((article) => {
      const widgetItem = {
        id: article.id,
        text: article.title,
        imageSrc: (article.images && article.images.url) ? article.images.url : placeholder,
        onClick: this.onClickArticle(article.url!)
      } as IListWidgetItem;
      return widgetItem;
    }
    );
  }

  private getNewestAssignments = (): Array<IListWidgetItem> => {
    const { activityStore } = this.props;

    return activityStore!.newestAssignments.map((assignment) => {
      const widgetItem = {
        id: assignment.id,
        text: assignment.title,
        imageSrc: assignment.featuredImage ? assignment.featuredImage : placeholder,
        onClick: this.onClickAssignment(assignment)
      } as IListWidgetItem;
      return widgetItem;
    }
    );
  }

  private getNewestTeachingPaths = (): Array<IListWidgetItem> => {
    const { activityStore } = this.props;

    return activityStore!.newestTeachingPaths.map((teachingPath) => {
      const widgetItem = {
        id: teachingPath.id,
        text: teachingPath.title,
        imageSrc: teachingPath.featuredImage || placeholder,
        onClick: this.onClickTeachingPath(teachingPath)
      } as IListWidgetItem;
      return widgetItem;
    }
    );
  }

  private renderRecentActivitiesList = () =>
    this.props.role !== UserType.Student && (
        <div className="ActivityPage__widget" aria-live="polite">
          <RecentActivitiesList/>
        </div>
      )

  private renderTeachingPathList = () => {
    const { activityStore, role } = this.props;

    return (role === UserType.Teacher || role === UserType.ContentManager) && (
        <div className="ActivityPage__widget">
          <ListWidget
            state={activityStore!.newestTeachingPathState}
            title={intl.get('activity_page.new_teaching_path')}
            items={this.getNewestTeachingPaths()}
          />
        </div>
      );
  }

  private renderStatisticWidget = () => {
    const { activityStore, role } = this.props;

    return role !== UserType.Student && (
      <div className="ActivityPage__widget">
        <StatisticWidget
          state={activityStore!.statisticWidgetState}
          widget={activityStore!.statisticWidget}
        />
      </div>
    );
  }

  private renderSliderWidget = (role: UserType.Student | UserType.Teacher) => {
    const { activityStore } = this.props;
    return (
      <div className="ActivityPage__widgetSlider ActivityPage__widget">
        <SliderWidget
          onPopup={this.openPopup}
          state={activityStore!.getSliderWidgetState(role)}
          widget={activityStore!.getSliderWidget(role)}
        />
      </div>
    );
  }

  private renderSliderWidgetBlock = () => {
    const { role } = this.props;
    return (
      <>
        {role === UserType.ContentManager && <span className={'ActivityPage__targetRoleTitle'}>{intl.get('activity_page.teacher’s_view')}</span>}
        {this.renderSliderWidget(role === UserType.Student ? UserType.Student : UserType.Teacher)}
        {role === UserType.ContentManager && <span className={'ActivityPage__targetRoleTitle'}>{intl.get('activity_page.student’s_view')}</span>}
        {role === UserType.ContentManager && this.renderSliderWidget(UserType.Student)}
        {this.renderPopup()}
      </>
    );
  }

  private renderAssignmentWidget = () => {
    const { activityStore, role } = this.props;

    return (role === UserType.Teacher || role === UserType.ContentManager) && (
      <div className="ActivityPage__widget">
        <ListWidget
          state={activityStore!.newestAssignmentsState}
          title={intl.get('activity_page.new_assignments')}
          items={this.getNewestAssignments()}
        />
      </div>
    );
  }

  // don't move to SliderWidget component because of issues with z-index on Content Manager side:
  // the second slider overlay popup related to first slider
  private renderPopup() {
    return (
      <Popup
        visible={this.state.popupShown}
        onClose={this.closePopup}
      >
        <iframe
          title="SliderWidget"
          src={this.state.iframeURL}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Popup>
    );
  }

  public componentDidMount() {
    const { activityStore, role } = this.props;
    activityStore!.loadNewestArticles(role === UserType.Student ? studentAmountArticles : teacherAmountArticles);
    if (role === UserType.Teacher || role === UserType.ContentManager) {
      activityStore!.loadNewestTeachingPaths();
      activityStore!.loadNewestAssignments();
    }
    if (role === UserType.Teacher) {
      activityStore!.loadRecentActivity();
      activityStore!.loadStatisticWidget();
      if (!this.state.isPause) {
        this.getRecentActivityWithInterval = window.setInterval(
          () => {
            this.props.activityStore!.loadRecentActivity();
          },
          loadRecentActivityInterval,
        );
      }
    }
    this.loadWidgetData();
  }

  public stopComponent() {
    if (this.props.activityStore) {
      if (!this.state.isPause) {
        this.setState({
          isPause: true
        });
        window.clearInterval(this.getRecentActivityWithInterval);
      } else {
        this.setState({
          isPause: false
        });
        this.getRecentActivityWithInterval = window.setInterval(
          () => {
            this.props.activityStore!.loadRecentActivity();
          },
          loadRecentActivityInterval,
        );
      }
    }
  }

  public componentWillUnmount() {
    const { activityStore, role } = this.props;
    activityStore!.resetNewestArticles();
    if (role === UserType.Teacher) {
      window.clearInterval(this.getRecentActivityWithInterval);
      activityStore!.resetNewestTeachingPaths();
    }
  }

  public render() {
    const { activityStore, loginStore } = this.props;
    const username = loginStore!.currentUser ? loginStore!.currentUser.name : 'username';
    const isContentManager = loginStore!.currentUser!.type === UserType.ContentManager;

    return (
      <div className="ActivityPage">
        <div className="ActivityPage__greeting">
          <h1>{intl.get('activity_page.Hello')} {username}</h1>
        </div>
        <div className="ActivityPage__content">
          <div className="ActivityPage__main">
            {this.renderSliderWidgetBlock()}
            {/* {/* {role === UserType.Teacher && this.renderStatisticWidget()} */}
            <div className="recentActivityNewContent">
            {/* {role === UserType.Teacher && this.renderRecentActivitiesList()} */}
            </div>
          </div>

          <div className={`ActivityPage__aside ${isContentManager && 'marginTop'}`}>
            <div className="ActivityPage__widget">
              <ListWidget
                state={activityStore!.newestArticlesState}
                title={intl.get('activity_page.new_articles')}
                items={this.getNewestArticles()}
              />
            </div>
            {this.renderAssignmentWidget()}
            {this.renderTeachingPathList()}
          </div>
        </div>
      </div>
    );
  }
}

export const ActivityPage = withRouter(Activity);
