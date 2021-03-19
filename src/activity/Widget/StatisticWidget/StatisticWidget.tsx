import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { WidgetHeader } from '../Core/WidgetHeader';
import { StatisticBlock } from './StatisticBlock';
import { ContentWrapper } from '../Core/ContentWrapper';
import { StatisticWidgetDomain } from '../../Activity';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';

import { StoreState, QueryStringKeys } from 'utils/enums';

import activeAssignments from 'assets/images/active-assignments.svg';
import activeTeachingPaths from 'assets/images/active-teaching-paths.svg';
import answersEvaluated from 'assets/images/answers-evaluated.svg';

import './StatisticWidget.scss';

interface IStatisticWidgetProps extends RouteComponentProps {
  state: StoreState;
  widget?: StatisticWidgetDomain;
  newAssignmentStore?: NewAssignmentStore;
  editTeachingPathStore?: EditTeachingPathStore;
  assignmentListStore?: AssignmentListStore;
}

interface State {
  isVisibleContent: boolean;
}

@inject('newAssignmentStore', 'editTeachingPathStore', 'assignmentListStore')
@observer
export class StatisticWidgetContainer extends Component<IStatisticWidgetProps, State> {

  public state = {
    isVisibleContent: true
  };

  private async createAndGoToAssignment() {
    const { newAssignmentStore, history } = this.props;

    const id = await newAssignmentStore!
      .createAssigment()
      .then(response => response.id);
    history.push(`/assignments/edit/${id}`);
  }

  private goToAssignmentsPage() {
    const { history } = this.props;

    history.push({
      pathname: '/evaluation/assignments',
      search: `?${QueryStringKeys.ACTIVITY}=1`
    });
  }

  private async createAndGoToTeachingPath() {
    const { editTeachingPathStore, history } = this.props;

    const id = await editTeachingPathStore!
      .createTeachingPath()
      .then(response => response.id);
    history.push(`/teaching-paths/edit/${id}`);
  }

  private goToTeachingPathsPage() { // TODO here should be different path
    const { history } = this.props;

    history.push('/teaching-paths/all');
  }

  private openAssignments = () => {
    const { widget } = this.props;

    if (widget && widget.activeAssignments === 0) {
      this.createAndGoToAssignment();
    }

    if (widget && widget.activeAssignments > 0) {
      this.goToAssignmentsPage();
    }
  }

  private openTeachingPaths = () => {
    const { widget } = this.props;

    if (widget && widget.activeTeachingPaths === 0) {
      this.createAndGoToTeachingPath();
    }

    if (widget && widget.activeTeachingPaths > 0) {
      // this.goToTeachingPathsPage();
    }
  }

  private openAnswers = () => {
    const { history } = this.props;

    history.push('/evaluation/assignments');
  }

  private renderContent() {
    const { widget } = this.props;
    const { isVisibleContent } = this.state;

    if (widget) {
      const hasButtonAnswers = widget!.unevaluatedAnswers > 0;
      const hasButtonTeachingPath = widget!.activeTeachingPaths === 0;

      const assignmentButtonLabel = widget!.activeAssignments > 0
        ? intl.get('activity_page.View assignments')
        : intl.get('activity_page.Create assignment');
      const teachingPathButtonLabel = widget!.activeTeachingPaths > 0
        ? intl.get('activity_page.View teaching paths')
        : intl.get('activity_page.Create teaching path');

      return (
        <div className="StatisticWidget__content">
          <div className={'StatisticWidget__item'}>
            <StatisticBlock
              small={!isVisibleContent}
              value={widget!.activeAssignments}
              title={intl.get('activity_page.active assignments')}
              buttonLabel={assignmentButtonLabel}
              imageSrc={activeAssignments}
              onClick={this.openAssignments}
            />
          </div>
          <div className={'StatisticWidget__item'}>
            <StatisticBlock
              small={!isVisibleContent}
              value={widget!.activeTeachingPaths}
              title={intl.get('activity_page.active teaching paths')}
              buttonLabel={teachingPathButtonLabel}
              imageSrc={activeTeachingPaths}
              onClick={this.openTeachingPaths}
              hasButton={hasButtonTeachingPath}
            />
          </div>
          <div className={'StatisticWidget__item'}>
            <StatisticBlock
              small={!isVisibleContent}
              value={widget!.unevaluatedAnswers}
              title={intl.get('activity_page.answers unevaluated')}
              buttonLabel={intl.get('activity_page.View answers')}
              imageSrc={answersEvaluated}
              onClick={this.openAnswers}
              hasButton={hasButtonAnswers}
            />
          </div>
        </div>
      );
    }
  }

  private onCollapseWidget = () => {
    this.setState({ isVisibleContent: !this.state.isVisibleContent });
  }

  public render() {
    return (
      <div className="StatisticWidget">
        <div className="StatisticWidget__titleWrapper">
          <WidgetHeader title="" onCollapseWidget={this.onCollapseWidget} isVisibleContent={this.state.isVisibleContent}/>
        </div>
        <ContentWrapper state={this.props.state} className="StatisticWidget__loader">
          {this.renderContent()}
        </ContentWrapper>
      </div>
    );
  }
}

export const StatisticWidget = withRouter(StatisticWidgetContainer);
