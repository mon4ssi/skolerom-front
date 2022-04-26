import React, { Component } from 'react';
import { EditableImageChoiceQuestion } from '../../../../assignmentDraft/AssignmentDraft';
import { EditableImagesContentBlock } from '../../../../assignmentDraft/EditableContentBlock';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { FilterableAttachment } from '../AttachmentsList';
import { NewAssignmentStore } from '../../NewAssignmentStore';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
  filterAttachments(attachment: FilterableAttachment): boolean;
  sortAttachments(attachmentA: FilterableAttachment, attachmentB: FilterableAttachment): number;
  renderAttachment(item: FilterableAttachment): void;
}

@inject('newAssignmentStore')
@observer
export class CustomImageAttachments extends Component<Props> {
  public render() {
    const { newAssignmentStore } = this.props;
    const attachments: Array<FilterableAttachment> = [];

    if (newAssignmentStore!.currentOrderOption >= 0) {
      const currentQuestion = newAssignmentStore!.currentQuestion as EditableImageChoiceQuestion;
      if (currentQuestion && currentQuestion.options && currentQuestion.options.length > 0) {
        currentQuestion.options.forEach((item) => {
          if (item.image) {
            const existingImage = newAssignmentStore!.questionAttachments!
                                          .find(attachment => attachment.id === item.image.id);
            if (!existingImage) {
              attachments.push(item.image);
            }
          }
        }
    );
      }
    } else {
      const currentBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableImagesContentBlock;
      if (currentBlock && currentBlock.images && currentBlock.images.length > 0) {
        currentBlock.images.forEach((image) => {
          const existingImage = newAssignmentStore!.questionAttachments!.find(attachment => attachment.id === image.id);

          if (!existingImage) {
            attachments.push(image);
          }
        });
      }
    }

    const renderedAttachments = attachments
      .concat(newAssignmentStore!.questionAttachments)
      .filter(this.props.filterAttachments)
      .sort(this.props.sortAttachments)
      .map(this.props.renderAttachment);

    if (renderedAttachments.length <= 0) {
      return (
        <div className="message">
          {intl.get('new assignment.no_custom_images_found')}
        </div>
      );
    }

    return (
    <div className="attachments-list">
      {renderedAttachments}
    </div>
    );
  }
}
