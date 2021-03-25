import React, { Component, SyntheticEvent } from 'react';

import { Assignment } from 'assignment/Assignment';
import { StudentAssignmentsListItem } from './StudentAssignmentsListItem';
import { SideOutPanel } from 'components/common/SideOutPanel/SideOutPanel';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { StoreState } from 'utils/enums';

import './StudentAssignmentsList.scss';
import { inject, observer } from 'mobx-react';
import { AssignmentListStore } from '../AssignmentsList/AssignmentListStore';

interface Props {
  assignmentListStore?: AssignmentListStore;
  isAssignmentPreviewVisible: boolean;
  assignments: Array<Assignment>;
  onAssignment(id: number): void;
  onClose(): void;
}

@inject('assignmentListStore')
@observer
export class StudentAssignmentsList extends Component<Props> {

  public handleAssignmentPreviewVisible = (id: number) => (e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    this.props.onAssignment(id);
  }

  public closeSlideOutPanel = (e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    this.props.onClose();
  }

  public renderListItem = (assignment: Assignment, index: number) => {
    const { assignmentListStore } = this.props;

    return assignmentListStore!.assignmentsState === StoreState.LOADING ? (
      <SkeletonLoader key={index} className="StudentAssignmentsListItem" />
    ) : (
      <StudentAssignmentsListItem assignment={assignment} key={assignment.id} onClickItem={this.handleAssignmentPreviewVisible(assignment.id)}/>
    );
  }

  public renderSlideOutPanel = () => {
    const { assignmentListStore } = this.props;

    return (
      <div className="darkStudentList" onClick={this.closeSlideOutPanel}>
        <SideOutPanel
          store={assignmentListStore}
          onClose={this.closeSlideOutPanel}
        />
      </div>
    );
  }

  public render() {
    const { assignments } = this.props;
    const { isAssignmentPreviewVisible } = this.props;

    return (
      <>
        <ul className="MyList" id="List" aria-live="polite">{assignments.map(this.renderListItem)}</ul>
        {isAssignmentPreviewVisible && this.renderSlideOutPanel()}
      </>
    );
  }
}
