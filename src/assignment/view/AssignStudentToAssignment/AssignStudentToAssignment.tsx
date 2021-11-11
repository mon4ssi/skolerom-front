import React, { Component } from 'react';
import { Redirect, RouteChildrenProps } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { UserType } from 'user/User';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

interface MatchParams {
  id: string;
}

interface Props extends RouteChildrenProps<MatchParams> {
  newAssignmentStore?: NewAssignmentStore;
}

interface State {
  path: string;
}

@inject('newAssignmentStore')
@observer
export class AssignStudentToAssignment extends Component<Props, State> {

  public state = {
    path: '',
  };

  public componentDidMount = async () => {
    const { newAssignmentStore, location, match } = this.props;
    const currentUser = newAssignmentStore!.getCurrentUser();

    const assignmentId = match!.params.id || newAssignmentStore!.getAssignmentIdFromLocalStorage();
    const referralToken = location.search.split('=')[1] || newAssignmentStore!.getReferralToken();

    if (currentUser && currentUser.type === UserType.Student) {
      const response = await newAssignmentStore!.assignStudentToAssignment(assignmentId, referralToken);

      Notification.create({
        type: response ? NotificationTypes.ERROR : NotificationTypes.SUCCESS,
        title: response || intl.get('distribution_page.assignment_is_assigned_to_user')
      });
      this.setState({ path: `/assignment/${assignmentId}` });
    } else if (currentUser && currentUser.type === UserType.Teacher) {
      this.setState({ path: '/assignments/all' });

    } else {
      newAssignmentStore!.setAssignmentIdToLocalStorage(assignmentId);
      newAssignmentStore!.setReferralToken(referralToken);

      this.setState({ path: '/login' });
    }
  }

  public render() {
    const { path } = this.state;

    if (!path) {
      return <div>Please wait...</div>;
    }

    return (
      <Redirect
        to={path}
      />
    );
  }

}
