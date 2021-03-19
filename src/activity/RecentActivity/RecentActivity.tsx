import React, { Component, MouseEvent, SyntheticEvent } from 'react';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import moment from 'moment';
import intl from 'react-intl-universal';

import { ActivityStore } from 'activity/ActivityStore';
import { RecentActivity, RecentActivityAction } from 'activity/Activity';
import { StoreState } from 'utils/enums';
import { Loader } from 'components/common/Loader/Loader';
import { WidgetTooltip } from '../Widget/WidgetTooltip';

import optionsImg from 'assets/images/hovered-more.svg';
import assignmentImg from 'assets/images/assignment-grey.svg';
import teachingPathImg from 'assets/images/teaching-path-grey.svg';

import './RecentActivity.scss';

interface Props extends RouteComponentProps {
  activityStore?: ActivityStore;
}

interface State {
  isVisibleTooltip: boolean;
  isVisibleContent: boolean;
}

@inject('activityStore')
@observer
export class RecentActivitiesListComponent extends Component<Props, State> {

  public state = {
    isVisibleTooltip: false,
    isVisibleContent: true
  };

  public getItemTitle = (item: RecentActivity) => {
    const { userName, taskType, action, taskId, taskName } = item;

    const onClick = (e: MouseEvent<HTMLSpanElement>) => {
      e.preventDefault();
      this.props.history.push({
        pathname: `/${taskType}s/answers/${taskId}`,
        state: {
          title: taskName
        }
      });
    };

    const taskNameSpan = <span className="RecentActivity__link" onClick={onClick}>«{item.taskName}»</span>;

    switch (action) {
      case RecentActivityAction.GIVE_ANSWER:
        const giveAnswerText = intl.get(
          'activity_page.recent_activity.give_answer',
          { userName, taskType: intl.get(taskType) }
        );

        return (
          <>
            {giveAnswerText}{' '}
            {taskNameSpan}
          </>
        );

      case RecentActivityAction.UPDATE_ANSWER:
        const updateAnswerText = intl.get(
          'activity_page.recent_activity.update_answer',
          { userName, taskType: intl.get(taskType) }
        );

        return (
          <>
            {updateAnswerText}{' '}
            {taskNameSpan}
          </>
        );

      case RecentActivityAction.PAST_DEADLINE:
        const pastDeadlinePart1Text = intl.get(
          'activity_page.recent_activity.past_deadline_part1',
          { userName, taskType: intl.get(taskType) }
        );

        return (
          <>
            {pastDeadlinePart1Text}{' '}
            {taskNameSpan}{' '}
            {intl.get('activity_page.recent_activity.past_deadline_part2')}
          </>
        );

      default:
        return '';
    }
  }

  public renderRecentActivityItem = (item: RecentActivity) => {
    const itemImage = item.taskType === 'assignment' ?
      assignmentImg :
      teachingPathImg;

    return (
      <div className="RecentActivity__item" key={item.taskId}>
        <div className="RecentActivity__block">
          <img className="RecentActivity__image" src={itemImage} alt="activity-icon" />
          <div className="RecentActivity__text">{this.getItemTitle(item)}</div>
        </div>
        <div className="RecentActivity__date">
          {moment(item.createdAt).format('DD/MM YYYY')}
        </div>
      </div>
    );
  }

  public renderList = () => {
    const { recentActivityList, recentActivityState } = this.props.activityStore!;
    if (recentActivityState !== StoreState.PENDING) {
      return <Loader />;
    }

    if (!recentActivityList.length) {
      return (
        <div className={'RecentActivity__collapseWrapper'}>
          <span>{intl.get('activity_page.No available content')}</span>
          <span className={'RecentActivity__collapse'} onClick={this.handleClickCollapse}>{intl.get('activity_page.collapse')}</span>
        </div>
      );
    }

    return recentActivityList.map(this.renderRecentActivityItem);
  }

  public handleClickTooltip = (e: SyntheticEvent) => {
    const { isVisibleTooltip } = this.state;
    e.stopPropagation();
    this.setState({ isVisibleTooltip: !isVisibleTooltip });
  }

  public handleClickCollapse = () => {
    this.setState({ isVisibleTooltip: false, isVisibleContent: !this.state.isVisibleContent });
  }

  public closeTooltip = () => {
    this.setState({ isVisibleTooltip: false });
  }

  public renderContent = () => {
    const { isVisibleContent } = this.state;

    if (isVisibleContent) {
      return (
        <div className="RecentActivity__list">
          {this.renderList()}
        </div>
      );
    }
  }

  public renderTooltip = () => {
    const { isVisibleTooltip, isVisibleContent } = this.state;

    if (isVisibleTooltip) {
      return (
        <WidgetTooltip
          isVisibleContent={isVisibleContent}
          handleClickCollapse={this.handleClickCollapse}
          closeTooltip={this.closeTooltip}
        />
      );
    }
  }

  public render() {
    return (
      <div className="RecentActivity__container">
        <div className="RecentActivity__header" onClick={this.handleClickCollapse}>
          <p>{intl.get('activity_page.recent_activity.header')}</p>
          <img src={optionsImg} alt="recent-activity" onClick={this.handleClickTooltip}/>
          {this.renderTooltip()}
        </div>
        {this.renderContent()}
      </div>
    );
  }
}

export const RecentActivitiesList = withRouter(RecentActivitiesListComponent);
