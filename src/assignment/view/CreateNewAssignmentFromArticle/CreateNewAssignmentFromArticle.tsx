import React, { Component } from 'react';
import { Redirect, RouteChildrenProps } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';

interface Props extends RouteChildrenProps {
  newAssignmentStore?: NewAssignmentStore;
}

interface State {
  isFinish: boolean;
  isCreated: boolean;
  path: string;
}

@inject('newAssignmentStore')
@observer
export class CreateNewAssignmentFromArticle extends Component<Props, State> {
  public state = {
    isFinish: false,
    isCreated: false,
    path: '',
  };

  public componentDidMount = async () => {
    const { newAssignmentStore, location } = this.props;
    const currentUser = newAssignmentStore!.getCurrentUser();
    const postID = Number(location.search.split('=')[1]) || newAssignmentStore!.getPostID();

    if (currentUser && currentUser.type === 'TEACHER') {
      const result = await newAssignmentStore!.createAssignmentWithArticle(
        postID
      );

      this.setState({ isFinish: result.isFinish, isCreated: result.isCreated });
    } else if (currentUser && currentUser.type === 'STUDENT') {
      this.setState({ isFinish: true, path: '/students' });
    } else {
      newAssignmentStore!.setPostID(postID);

      this.setState({ isFinish: true, path: '/login' });
    }
  }

  public render() {
    const { isFinish, isCreated } = this.state;

    if (!isFinish) {
      return <div>Please wait...</div>;
    }

    const path = isCreated
      ? `/assignments/edit/${this.props.newAssignmentStore!.currentEntity!.id}`
      : this.state.path;

    return (
      <Redirect
        to={path}
      />
    );
  }
}
