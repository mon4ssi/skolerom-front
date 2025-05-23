import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { validDomain } from 'utils/validDomain';
import classnames from 'classnames';

import { EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { EditTeachingPathStore } from '../../EditTeachingPathStore';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { ItemContentTypeContext } from '../../ItemContentTypeContext';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import editImg from 'assets/images/edit-tp.svg';
import deleteImg from 'assets/images/trash-tp.svg';
import addArticleImg from 'assets/images/add-article.svg';
import guidanceEditImg from 'assets/images/guidance-edit.svg';

import './NestedOrderNumber.scss';
const TIMEOUT = 800;

interface Props {
  editTeachingPathStore?: EditTeachingPathStore;
  node: EditableTeachingPathNode;
  nestedOrderNumber: number;
  readOnly?: boolean;
  nroLetter?: number;
  onCancelDrag?(): void;
}

@inject('editTeachingPathStore')
@observer
export class NestedOrderNumber extends Component<Props> {

  public static contextType = ItemContentTypeContext;
  public state = {
    modalDomain : false,
    disabledbutton : true,
    loading : true,
    valueInputDomain: '',
    itemsForNewChildren: [],
  };

  public buttonref = React.createRef<HTMLButtonElement>();
  public componentDidMount() {
    if (this.buttonref.current) {
      this.buttonref.current.focus();
    }
  }

  public openDomainModal = () => {
    this.setState({
      modalDomain: true
    });
    document.addEventListener('keyup', this.handleKeyboardControl);
  }

  public closeDomainModal = () => {
    if (this.state.loading) {
      this.setState({
        modalDomain: false
      });
      document.removeEventListener('keyup', this.handleKeyboardControl);
    }
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (!this.state.disabledbutton) {
        this.sendDomain();
      }
    }
    if (event.key === 'Escape') {
      this.closeDomainModal();
    }
  }

  public validUrlPath = (value: string) => {
    if (value.split('//').length > 1) {
      return value;
    }
    return `https://${value}`;
  }

  public handleChangeNewQuestion = (e:  React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ valueInputDomain: e.target.value });
    if (validDomain(e.target.value)) {
      this.setState({ disabledbutton: false });
    } else {
      this.setState({ disabledbutton: true });
    }
  }

  public sendDomain = async () => {
    const { editTeachingPathStore, node } = this.props;
    this.setState({ disabledbutton: true });
    const response = await editTeachingPathStore!.sendDataDomain(this.validUrlPath(this.state.valueInputDomain));
    if (node !== null) {
      editTeachingPathStore!.setCurrentNode(node!);
      editTeachingPathStore!.currentNode!.children[0].editItemDomain(response);
      editTeachingPathStore!.currentEntity!.save();
      editTeachingPathStore!.setCurrentNode(null);
      this.setState({
        modalDomain: false
      });
      document.removeEventListener('keyup', this.handleKeyboardControl);
      /*this.setState({ itemsForNewChildren: [...this.state.itemsForNewChildren, response] });
      const newChildren = this.state.itemsForNewChildren.map(
        item => editTeachingPathStore!.createNewNode(
          item,
          TeachingPathNodeType.Domain
        )
      );
      let idNode = 0;
      editTeachingPathStore!.currentNode!.children.forEach(
        (child) => {
          idNode = child.items![0].value.id;
          node.removeChild(child);
        }
      );*/
      setTimeout(
        () => {
          /*node.addChild(newChildren[0], idNode);
          editTeachingPathStore!.setCurrentNode(null);
          document.removeEventListener('keyup', this.handleKeyboardControl);*/
        },
        TIMEOUT
      );
    }
  }

  public renderModalDomain = () => {
    const { disabledbutton } = this.state;
    return (
      <div className="modalDomain">
        <div className="modalDomain__background" onClick={this.closeDomainModal} />
        <div className="modalDomain__content">
          <div className="modalDomain__context">
            <div className="modalDomain__form">
              <div className="modalDomain__input">
                <img src={addArticleImg} alt="add-article" />
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
                  disabled={disabledbutton}
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

  public handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { editTeachingPathStore, node } = this.props;
    this.props.onCancelDrag!();
    event.preventDefault();
    editTeachingPathStore!.setCurrentNode(node!);
    if (node.children[0].type === TeachingPathNodeType.Domain) {
      this.setState(
        {
          modalDomain: true
        },
        () => {
          document.addEventListener('keyup', this.handleKeyboardControl);
        }
      );
    } else {
      this.context.changeContentType(node.children[0].type === TeachingPathNodeType.Article ? 0 : 1);
    }
  }

  public handleDeleteClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onCancelDrag!();
    const deleteConfirm = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('edit_teaching_path.notifications.delete_sub_group')
    });

    if (deleteConfirm) {
      this.props.node.setChildren([]);
    } else {
      event.stopPropagation();
    }
  }

  public handleOpenModalTG = (nroLevel: string) => {
    const { editTeachingPathStore } = this.props;
    editTeachingPathStore!.currentEntity!.handleOpenTeacherGuidance(nroLevel);
  }

  public renderEditIcon = () => (
    <button onClick={this.handleEditClick} title={intl.get('edit_teaching_path.nodes.change_content_sub_group')}>
      <img
        src={editImg}
        alt={intl.get('edit_teaching_path.nodes.change_content_sub_group')}
        title={intl.get('edit_teaching_path.nodes.change_content_sub_group')}
      />
    </button>
  )

  public renderDeleteIcon = () => (
    <button onClick={this.handleDeleteClick} title={intl.get('edit_teaching_path.nodes.delete_sub_group')}>
      <img
        src={deleteImg}
        alt={intl.get('edit_teaching_path.nodes.delete_sub_group')}
        title={intl.get('edit_teaching_path.nodes.delete_sub_group')}
      />
    </button>
  )

  public renderEditTGIcon = () => {
    const { nestedOrderNumber, nroLetter } = this.props;

    return (
      <button onClick={this.handleOpenModalTG.bind(this, `${String(nestedOrderNumber)}${String.fromCharCode(nroLetter!)}`)} title={intl.get('teacherGuidance.buttons.edit')}>
        <img
          src={guidanceEditImg}
          alt={intl.get('teacherGuidance.buttons.edit')}
          title={intl.get('teacherGuidance.buttons.edit')}
        />
      </button>
    );
  }

  public render() {
    const { nestedOrderNumber, readOnly } = this.props;

    const numberAndActionsClassnames = classnames(
      'numberAndActions flexBox alignCenter justifyCenter',
      nestedOrderNumber === 1 && 'firstNumber'
    );

    return (
      <div>
        <div className={numberAndActionsClassnames}>
          {!readOnly && this.renderEditIcon()}
          {!readOnly && this.renderEditTGIcon()}
          <div className="nestedOrderNumber">
            {nestedOrderNumber}
          </div>
          {!readOnly && this.renderDeleteIcon()}
        </div>
        {this.state.modalDomain && this.renderModalDomain()}
      </div>
    );
  }
}
