import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import { ItemContentTypeContext } from '../../ItemContentTypeContext';
import { EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { EditTeachingPathStore } from '../../EditTeachingPathStore';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';

import addArticleImg from 'assets/images/add-article.svg';
import addAssignemntImg from 'assets/images/add-assignment.svg';
import createAssignmentImg from 'assets/images/create-assignment.svg';

import './AddingButtons.scss';

interface Props extends RouteComponentProps {
  node?: EditableTeachingPathNode;
  editTeachingPathStore?: EditTeachingPathStore;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('editTeachingPathStore', 'newAssignmentStore')
@observer
class AddingButtonsContainer extends Component<Props> {

  public static contextType = ItemContentTypeContext;

  private openArticlesList = (event: React.MouseEvent<HTMLDivElement>) => {
    const { editTeachingPathStore, node } = this.props;
    event.preventDefault();
    editTeachingPathStore!.setCurrentNode(node!);
    this.context.changeContentType(0);
  }

  private openAssignmentsList = (event: React.MouseEvent<HTMLDivElement>) => {
    const { editTeachingPathStore, node } = this.props;
    event.preventDefault();
    editTeachingPathStore!.setCurrentNode(node!);
    this.context.changeContentType(1);
  }

  private openCreatingAssignment = async (event: React.MouseEvent<HTMLDivElement>) => {
    const { newAssignmentStore, editTeachingPathStore, history, node } = this.props;

    event.preventDefault();
    editTeachingPathStore!.setCurrentNode(node!);
    editTeachingPathStore!.setIsAssignmentCreating(true);

    const id = await newAssignmentStore!
      .createAssigment()
      .then(response => response.id);
    history.push({
      pathname: `/assignments/edit/${id}`,
      state: { fromTeachingPath: true, teachingPathId: editTeachingPathStore!.currentEntity!.id }
    });
  }

  public render() {
    return (
      <div className="AddingButtons flexBox dirColumn">
        <div
          className="addingButton"
          onClick={this.openArticlesList}
        >
          <img src={addArticleImg} alt="add-article" />
          {intl.get('edit_teaching_path.modals.add_articles')}
        </div>
        <div
          className="addingButton"
          onClick={this.openAssignmentsList}
        >
          <img src={addAssignemntImg} alt="add-assignment" />
          {intl.get('edit_teaching_path.modals.add_assignments')}
        </div>
        <div
          className="addingButton"
          onClick={this.openCreatingAssignment}
        >
          <img src={createAssignmentImg} alt="create-assignment" />
          {intl.get('edit_teaching_path.modals.create_assignment')}
        </div>
      </div>
    );
  }
}

export const AddingButtons = withRouter(AddingButtonsContainer);
