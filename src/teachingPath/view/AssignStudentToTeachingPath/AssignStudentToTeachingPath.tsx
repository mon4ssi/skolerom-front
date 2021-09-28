import React, { Component } from 'react';
import { Redirect, RouteChildrenProps } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { EditTeachingPathStore } from '../EditTeachingPath/EditTeachingPathStore';

import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

interface MatchParams {
  id: string;
}

interface Props extends RouteChildrenProps<MatchParams> {
  editTeachingPathStore?: EditTeachingPathStore;
}

interface State {
  path: string;
}

@inject('editTeachingPathStore')
@observer
export class AssignStudentToTeachingPath extends Component<Props, State> {

  public state = {
    path: '',
  };

  public componentDidMount = async () => {
    const { editTeachingPathStore, location, match } = this.props;
    const currentUser = editTeachingPathStore!.getCurrentUser();

    const teachingPathId = match!.params.id || editTeachingPathStore!.getTeachingPathIdFromLocalStorage();
    const referralToken = location.search.split('=')[1] || editTeachingPathStore!.getReferralToken();

    if (currentUser && currentUser.type === 'STUDENT') {
      const response = await editTeachingPathStore!.assignStudentToTeachingPath(teachingPathId, referralToken);
      Notification.create({
        type: response ? NotificationTypes.ERROR : NotificationTypes.SUCCESS,
        title: response || intl.get('distribution_page.teaching_path_is_assigned_to_user')
      });
      this.setState({ path: `/teaching-path/${teachingPathId}` });
    } else if (currentUser && currentUser.type === 'TEACHER') {
      this.setState({ path: '/teaching-paths/all' });

    } else {
      editTeachingPathStore!.setAssignmentIdToLocalStorage(teachingPathId);
      editTeachingPathStore!.setReferralToken(referralToken);

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
