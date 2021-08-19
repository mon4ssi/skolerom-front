import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import intl from 'react-intl-universal';

import { Assignment } from 'assignment/Assignment';
import { AssignmentListStore } from './AssignmentListStore';
import { AssignmentListItem } from './AssignmentListItem';
import { UserType } from 'user/User';
import { LoginStore } from 'user/view/LoginStore';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';

import './AssignmentsList.scss';
import { StoreState } from 'utils/enums';

interface Props extends RouteComponentProps {
  assignments: Array<Assignment>;
  assignmentListStore?: AssignmentListStore;
  loginStore?: LoginStore;
}

@inject('assignmentListStore', 'loginStore')
@observer
class AssignmentsList extends Component<Props> {
  private isContentManager = !!this.props.loginStore!.currentUser && this.props.loginStore!.currentUser.type === UserType.ContentManager;

  private copyAssignment = async (id: number) => {
    const { assignmentListStore, history } = this.props;

    const copyId = await assignmentListStore!.copyEntity(id);
    history.push(`/assignments/edit/${copyId}`);
  }

  public renderListItem = (assignment: Assignment, idx: number, list: Array<Assignment>) => {
    const { assignmentListStore } = this.props;

    return assignmentListStore!.assignmentsState === StoreState.LOADING ? (
      <SkeletonLoader key={idx} className="AssignmentListItem" />
    ) : (
      <AssignmentListItem
        assignment={assignment}
        key={assignment.id}
        currentUserRole={assignmentListStore!.getCurrentUser()!.type}
        /* tslint:disable-next-line:no-magic-numbers */
        itemsToLastAssignment={list.length > 4 ? list.length - (idx + 1) : 4}
        isContentManager={this.isContentManager}
        removeAssignment={assignmentListStore!.removeAssignment}
        copyAssignment={this.copyAssignment}
      />
    );
  }

  public render() {
    const { assignments } = this.props;
    if (assignments.length === 0) {
      return (
        <div className="noResults emptyTeachingPaths">
          {intl.get('edit_teaching_path.No results found')}
        </div>
      );
    }
    return <ul className="MyList" id="List" aria-live="polite">{assignments.map(this.renderListItem)}</ul>;
  }
}

const AssignmentsListWithRouter = withRouter(AssignmentsList);
export { AssignmentsListWithRouter as AssignmentsList };
