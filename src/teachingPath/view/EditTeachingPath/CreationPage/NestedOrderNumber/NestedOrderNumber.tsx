import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import classnames from 'classnames';

import { EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { EditTeachingPathStore } from '../../EditTeachingPathStore';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { ItemContentTypeContext } from '../../ItemContentTypeContext';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import editImg from 'assets/images/edit-tp.svg';
import deleteImg from 'assets/images/trash-tp.svg';

import './NestedOrderNumber.scss';

interface Props {
  editTeachingPathStore?: EditTeachingPathStore;
  node: EditableTeachingPathNode;
  nestedOrderNumber: number;
  readOnly?: boolean;
}

@inject('editTeachingPathStore')
@observer
export class NestedOrderNumber extends Component<Props> {

  public static contextType = ItemContentTypeContext;

  public handleEditClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const { editTeachingPathStore, node } = this.props;

    event.preventDefault();
    editTeachingPathStore!.setCurrentNode(node!);
    this.context.changeContentType(node.children[0].type === TeachingPathNodeType.Article ? 0 : 1);
  }

  public handleDeleteClick = async (event: React.MouseEvent<HTMLImageElement>) => {
    event.preventDefault();

    const deleteConfirm = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('edit_teaching_path.notifications.delete_path')
    });

    if (deleteConfirm) {
      this.props.node.setChildren([]);
    } else {
      event.stopPropagation();
    }
  }

  public renderEditIcon = () => (
    <img
      src={editImg}
      alt="edit"
      onClick={this.handleEditClick}
    />
  )

  public renderDeleteIcon = () => (
    <img
      src={deleteImg}
      alt="delete"
      onClick={this.handleDeleteClick}
    />
  )

  public render() {
    const { nestedOrderNumber, readOnly } = this.props;

    const numberAndActionsClassnames = classnames(
      'numberAndActions flexBox alignCenter justifyCenter',
      nestedOrderNumber === 1 && 'firstNumber'
    );

    return (
      <div className={numberAndActionsClassnames}>
        {!readOnly && this.renderEditIcon()}
        <div className="nestedOrderNumber">
          {nestedOrderNumber}
        </div>
        {!readOnly && this.renderDeleteIcon()}
      </div>
    );
  }
}
