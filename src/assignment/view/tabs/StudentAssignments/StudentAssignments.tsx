import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import debounce from 'lodash/debounce';

import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { StudentAssignmentsList } from '../../StudentAssignmentsList/StudentAssignmentsList';
import { QueryStringKeys, SortingFilter, StoreState } from 'utils/enums';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { DEBOUNCE_TIME } from 'utils/constants';

interface Props {
  assignmentListStore?: AssignmentListStore;
}

interface State {
  isAssignmentPreviewVisible: boolean;
}

@inject('assignmentListStore')
@observer
class StudentAssignments extends Component<Props & RouteComponentProps, State> {

  private locationUpdateListener: () => void = debounce(
    () => {
      const { history } = this.props;

      if (history.location.pathname.includes('/assignments')) {
        this.fetchAssignments();
      }
    },
    DEBOUNCE_TIME,
  );

  public state = {
    isAssignmentPreviewVisible: false,
  };

  private unregisterListener: () => void = () => undefined;

  private fetchAssignments() {
    const { assignmentListStore, history } = this.props;
    const { filter } = assignmentListStore!;

    filter.page = QueryStringHelper.getNumber(history, QueryStringKeys.PAGE);
    filter.subject = QueryStringHelper.getNumber(history, QueryStringKeys.SUBJECT);
    filter.searchQuery = QueryStringHelper.getString(history, QueryStringKeys.SEARCH);
    filter.isEvaluated = QueryStringHelper.getString(history, QueryStringKeys.IS_EVALUATED);
    filter.isAnswered = QueryStringHelper.getString(history, QueryStringKeys.IS_ANSWERED);
    filter.order = QueryStringHelper.getString(history, QueryStringKeys.ORDER, SortingFilter.DESC);
    filter.orderField = SortingFilter.DEADLINE;

    assignmentListStore!.getStudentAssignmentList();
  }

  public componentDidMount = async () => {
    this.fetchAssignments();
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
  }

  public openAssignmentPreview = (id: number) => {
    this.unregisterListener();
    this.props.assignmentListStore!.setCurrentAssignment(id);
    this.setState({ isAssignmentPreviewVisible: true });
  }

  public closeAssignmentPreview = () => {
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
    this.setState({ isAssignmentPreviewVisible: false });
  }

  public componentWillUnmount() {
    this.unregisterListener();
    this.props.assignmentListStore!.resetCurrentPage();
  }

  public render() {
    const { assignmentListStore } = this.props;

    const assignments = assignmentListStore!.assignmentsState === StoreState.LOADING ?
      assignmentListStore!.assignmentsForSkeleton :
      assignmentListStore!.getAllMyAssignments();

    return (
      <div className={'assignmentList flexBox dirColumn spaceBetween'}>
        <StudentAssignmentsList
          assignments={assignments}
          onAssignment={this.openAssignmentPreview}
          onClose={this.closeAssignmentPreview}
          isAssignmentPreviewVisible={this.state.isAssignmentPreviewVisible}
        />
      </div>
    );
  }
}

const StudentAssignmentsComponent = withRouter(StudentAssignments);
export { StudentAssignmentsComponent as StudentAssignments };
