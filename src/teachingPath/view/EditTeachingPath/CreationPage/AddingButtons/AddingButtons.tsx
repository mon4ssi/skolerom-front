import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { validDomain } from 'utils/validDomain';
import { lettersNoEn } from 'utils/lettersNoEn';
import intl from 'react-intl-universal';

import { ItemContentTypeContext } from '../../ItemContentTypeContext';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { EditTeachingPathStore } from '../../EditTeachingPathStore';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import addArticleImg from 'assets/images/add-article.svg';
import addAssignemntImg from 'assets/images/add-assignment.svg';
import createAssignmentImg from 'assets/images/create-assignment.svg';
import addDomainImg from 'assets/images/app-window-link.svg';
import linkImg from 'assets/images/link.svg';

import './AddingButtons.scss';

interface Props extends RouteComponentProps {
  node?: EditableTeachingPathNode;
  editTeachingPathStore?: EditTeachingPathStore;
  newAssignmentStore?: NewAssignmentStore;
  nester: number;
}

@inject('editTeachingPathStore', 'newAssignmentStore')
@observer
class AddingButtonsContainer extends Component<Props> {

  public static contextType = ItemContentTypeContext;
  public state = {
    modalDomain : false,
    disabledbutton : true,
    loading : true,
    valueInputDomain: '',
    itemsForNewChildren: []
  };

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

  private openDomainModal = () => {
    this.setState({
      modalDomain: true
    });
  }

  private closeDomainModal = () => {
    if (this.state.loading) {
      this.setState({
        modalDomain: false
      });
    }
  }

  private validUrlPath = (value: string) => {
    if (value.split('//').length > 1) {
      return value;
    }
    return `https://${value}`;
  }

  private handleChangeNewQuestion = (e:  React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ valueInputDomain: e.target.value });
    if (validDomain(e.target.value)) {
      this.setState({ disabledbutton: false });
      document.addEventListener('keyup', this.handleKeyboardControl);
    } else {
      this.setState({ disabledbutton: true });
      document.removeEventListener('keyup', this.handleKeyboardControl);
    }
  }

  private handleKeyboardControl = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      this.sendDomain();
    }
  }

  private sendDomain = async () => {
    const { disabledbutton } = this.state;
    const { editTeachingPathStore, node } = this.props;
    if (!disabledbutton) {
      const response = await editTeachingPathStore!.sendDataDomain(this.validUrlPath(this.state.valueInputDomain));
      editTeachingPathStore!.setCurrentNode(node!);
      this.setState({ itemsForNewChildren: [...this.state.itemsForNewChildren, response] });
      const newChildren = this.state.itemsForNewChildren.map(
        item => editTeachingPathStore!.createNewNode(
          item,
          TeachingPathNodeType.Domain
        )
      );
      newChildren.forEach(child => editTeachingPathStore!.addChildToCurrentNode(child));
      editTeachingPathStore!.currentEntity!.save();

      this.context.changeContentType(null);
      editTeachingPathStore!.setCurrentNode(null);
    } else {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: intl.get('teaching path passing.external_error')
      });
    }
  }

  private renderModalDomain = () => {
    const { disabledbutton } = this.state;
    return (
      <div className="modalDomain">
        <div className="modalDomain__background" onClick={this.closeDomainModal} />
        <div className="modalDomain__content">
          <div className="modalDomain__context">
            <div className="modalDomain__form">
              <div className="modalDomain__input">
                <img src={linkImg} alt="add-domain" />
                <input
                  className="newTextQuestionInput"
                  placeholder={intl.get('new assignment.type_or_paste')}
                  value={this.state.valueInputDomain}
                  onChange={this.handleChangeNewQuestion}
                  aria-required="true"
                  aria-invalid="false"
                  autoFocus={true}
                />
              </div>
              <div className="modalDomain__button">
                <button
                  className="btn"
                  onClick={this.sendDomain}
                  title={intl.get('new assignment.add_link')}
                >
                  {intl.get('new assignment.add_link')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderButtonDomain = () => {
    const { disabledbutton } = this.state;
    return (
    <div className="addingButton" onClick={this.openDomainModal}>
      <button title={intl.get('edit_teaching_path.modals.add_domain')}>
        <img src={addDomainImg} alt="add-article" />
        {intl.get('edit_teaching_path.modals.add_domain')}
      </button>
    </div>
    );
  }

  public render() {
    return (
      <div className="AddingButtons flexBox dirColumn">
        <div
          className="addingButton"
          onClick={this.openArticlesList}
        >
          <button title={intl.get('edit_teaching_path.modals.add_articles')}>
            <img src={addArticleImg} alt="add-article" />
            {intl.get('edit_teaching_path.modals.add_articles')}
          </button>
        </div>
        {this.renderButtonDomain()}
        {this.state.modalDomain && this.renderModalDomain()}
        <div
          className="addingButton"
          onClick={this.openAssignmentsList}
        >
          <button title={intl.get('edit_teaching_path.modals.add_assignments')}>
          <img src={addAssignemntImg} alt="add-assignment" />
          {intl.get('edit_teaching_path.modals.add_assignments')}
          </button>
        </div>
        <div
          className="addingButton"
          onClick={this.openCreatingAssignment}
        >
          <button title={intl.get('edit_teaching_path.modals.create_assignment')}>
            <img src={createAssignmentImg} alt="create-assignment" />
            {intl.get('edit_teaching_path.modals.create_assignment')}
          </button>
        </div>
      </div>
    );
  }
}

export const AddingButtons = withRouter(AddingButtonsContainer);
