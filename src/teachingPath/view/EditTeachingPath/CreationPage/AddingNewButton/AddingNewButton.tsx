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

import './AddingNewButton.scss';
import { AddingButtons } from '../AddingButtons/AddingButtons';

interface Props extends RouteComponentProps {
  node?: EditableTeachingPathNode;
  editTeachingPathStore?: EditTeachingPathStore;
  newAssignmentStore?: NewAssignmentStore;
  parent?: EditableTeachingPathNode;
  nester: number;
  side: string;
  onCancelDrag?(): void;

}

@inject('editTeachingPathStore', 'newAssignmentStore')
@observer
class AddingNewButton extends Component<Props> {

  public static contextType = ItemContentTypeContext;
  public state = {
    modalDomain: false,
    disabledbutton: true,
    loading: true,
    valueInputDomain: '',
    itemsForNewChildren: [],
    isOpenedModal: (this.props.node!.type === TeachingPathNodeType.Root && this.props.parent === undefined) ? true : false,
  };

  private openArticlesList = (event: React.MouseEvent<HTMLDivElement>) => {
    const { editTeachingPathStore, node } = this.props;
    event.preventDefault();
    editTeachingPathStore!.setCurrentNode(node!);
    this.props.onCancelDrag!();
    this.context.changeContentType(0);
  }

  private openMyArticlesListButton = (event: React.MouseEvent<HTMLDivElement>) => {
    const { editTeachingPathStore, node, parent, side } = this.props;
    event.preventDefault();
    editTeachingPathStore!.setEditNodeArticlesItem(true);
    editTeachingPathStore!.setNodeUse(node!);
    editTeachingPathStore!.setParentNodeUse(parent!);
    editTeachingPathStore!.setOrientationNodeArticlesItem(side);
    this.setState({ isOpenedModal: false });
    this.props.onCancelDrag!();
    this.context.changeContentType(0);
  }

  private openMyArticlesList = () => {
    const { editTeachingPathStore, node, parent, side } = this.props;
    editTeachingPathStore!.setEditNodeArticlesItem(true);
    editTeachingPathStore!.setNodeUse(node!);
    editTeachingPathStore!.setParentNodeUse(parent!);
    editTeachingPathStore!.setOrientationNodeArticlesItem(side);
    this.props.onCancelDrag!();
    this.context.changeContentType(0);
  }

  private openAssignmentsList = (event: React.MouseEvent<HTMLDivElement>) => {
    const { editTeachingPathStore, node, parent, side } = this.props;
    event.preventDefault();
    editTeachingPathStore!.setEditNodeAssigmentItem(true);
    editTeachingPathStore!.setNodeUse(node!);
    editTeachingPathStore!.setParentNodeUse(parent!);
    editTeachingPathStore!.setOrientationNodeArticlesItem(side);
    this.props.onCancelDrag!();
    this.context.changeContentType(1);
    this.setState({ isOpenedModal: false });
  }

  private openCreatingAssignment = async (event: React.MouseEvent<HTMLDivElement>) => {
    const { newAssignmentStore, editTeachingPathStore, history, node, parent, side } = this.props;

    event.preventDefault();
    this.props.onCancelDrag!();
    editTeachingPathStore!.setEditNodeAssigmentItem(true);
    editTeachingPathStore!.setNodeUse(node!);
    editTeachingPathStore!.setParentNodeUse(parent!);
    editTeachingPathStore!.setOrientationNodeArticlesItem(side);
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
    this.props.onCancelDrag!();
    document.addEventListener('keyup', this.handleKeyboardControl);
  }

  private closeDomainModal = () => {
    if (this.state.loading) {
      this.setState({
        modalDomain: false
      });
      document.removeEventListener('keyup', this.handleKeyboardControl);
    }
  }

  private validUrlPath = (value: string) => {
    if (value.split('//').length > 1) {
      return value;
    }
    return `https://${value}`;
  }

  private handleChangeNewQuestion = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ valueInputDomain: e.target.value });
    if (validDomain(e.target.value)) {
      this.setState({ disabledbutton: false });
    } else {
      this.setState({ disabledbutton: true });
    }
  }

  private handleKeyboardControl = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (!this.state.disabledbutton) {
        this.sendDomain();
      }
    }
    if (event.key === 'Escape') {
      this.closeDomainModal();
    }
  }

  private sendDomain = async () => {
    const { disabledbutton } = this.state;
    const { editTeachingPathStore, node, parent } = this.props;
    if (!disabledbutton) {
      const response = await editTeachingPathStore!.sendDataDomain(this.validUrlPath(this.state.valueInputDomain));
      if (node !== null) {
        editTeachingPathStore!.setCurrentNode(parent!);
        this.setState({ itemsForNewChildren: [...this.state.itemsForNewChildren, response] });
        const newChildren = this.state.itemsForNewChildren.map(
          item => editTeachingPathStore!.createNewNode(
            item,
            TeachingPathNodeType.Domain
          )
        );
        editTeachingPathStore!.addChildrenByOrder(newChildren[0], node!, this.props.side);
        this.setState({ modalDomain: false, valueInputDomain: '', itemsForNewChildren: [] });
        editTeachingPathStore!.currentEntity!.save();
        document.removeEventListener('keyup', this.handleKeyboardControl);
        this.context.changeContentType(null);
        editTeachingPathStore!.setCurrentNode(null);
        this.setState({ isOpenedModal: false });
      }
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
      <div className="addingButton addExternalArtikle" onClick={this.openDomainModal}>
        <button title={intl.get('edit_teaching_path.modals.add_domain')}>
          <img src={addDomainImg} alt="add-article" />
          {intl.get('edit_teaching_path.modals.add_domain')}
        </button>
      </div>
    );
  }

  private renderAddingButtons = () =>
  (
    <div>
      <AddingButtons node={this.props.node} nester={this.props.nester!} onCancelDrag={this.props.onCancelDrag} />
    </div>
  )

  private switchModal = () => {
    const { isOpenedModal } = this.state;
    if (isOpenedModal) {
      this.setState({ isOpenedModal: false });
    } else {
      this.setState({ isOpenedModal: true });
    }
  }

  private myswitchModal = () => {
    const { node } = this.props;
    if (node) {
      switch (node.type) {
        case TeachingPathNodeType.Article:
          this.openMyArticlesList();
          break;
        case TeachingPathNodeType.Assignment:
          this.switchModal();
          break;
        case TeachingPathNodeType.Domain:
          this.openDomainModal();
          break;
        default:
          break;
      }
    }
  }

  private renderMyAddingButtons = () => {
    const { node } = this.props;
    return (
      <div>
        <div className="AddingButtons flexBox dirColumn">
          <div
            className="addingButton"
            onClick={this.openMyArticlesListButton}
          >
            <button title={intl.get('edit_teaching_path.modals.add_articles')}>
              <img src={addArticleImg} alt="add-article" />
              {intl.get('edit_teaching_path.modals.add_articles')}
            </button>
          </div>
          <div className="addingButton addExternalArtikle" onClick={this.openDomainModal}>
            <button title={intl.get('edit_teaching_path.modals.add_domain')}>
              <img src={addDomainImg} alt="add-article" />
              {intl.get('edit_teaching_path.modals.add_domain')}
            </button>
          </div>
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
        {this.state.modalDomain && this.renderModalDomain()}
      </div>
    );
  }

  public render() {
    const { isOpenedModal } = this.state;
    const isFirstCircle = this.props.node!.type === TeachingPathNodeType.Root && this.props.parent === undefined;
    const classInside = isOpenedModal ? 'circleOption active' : 'circleOption';
    const firstCircle = isFirstCircle ? 'hiddenRootCircle' : 'circle circleBottom';

    const isOpenTabRoot = (this.props.node!.type === TeachingPathNodeType.Root && this.props.parent === undefined) ? true : isOpenedModal;
    if (this.props.side!) {
      switch (this.props.side!) {
        case 'left':
          return (
            <div className={classInside}>
              <button className="circle" onClick={this.switchModal}>
                <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill-rule="evenodd"><path fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z" /></svg>
              </button>
              {isOpenedModal && this.renderMyAddingButtons()}
            </div>
          );
          break;
        case 'bottom':
          return (
            <div className={classInside}>
              <button className={firstCircle} onClick={this.switchModal}>
                <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill-rule="evenodd"><path fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z" /></svg>
              </button>
              {isOpenedModal && this.renderAddingButtons()}
            </div>
          );
          break;
        case 'right':
          return (
            <div className={classInside}>
              <button className="circle" onClick={this.switchModal}>
                <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill-rule="evenodd"><path fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z" /></svg>
              </button>
              {isOpenedModal && this.renderMyAddingButtons()}
            </div>
          );
          break;
        default:
          break;
      }
    }

  }
}

export const AddingNewButtonElement = withRouter(AddingNewButton);
