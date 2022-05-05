import React, { Component } from 'react';
import { EditableImageChoiceQuestion } from '../../../../assignmentDraft/AssignmentDraft';
import { EditableImagesContentBlock } from '../../../../assignmentDraft/EditableContentBlock';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { FilterableAttachment } from '../AttachmentsList';
import { NewAssignmentStore } from '../../NewAssignmentStore';
import { divide } from 'lodash';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
  filterAttachments(attachment: FilterableAttachment): boolean;
  sortAttachments(attachmentA: FilterableAttachment, attachmentB: FilterableAttachment): number;
  renderAttachment(item: FilterableAttachment): void;
}

@inject('newAssignmentStore')
@observer
export class CustomImageAttachments extends Component<Props> {

  public renderCustomImagesAttachments = (elements: Array<any>) => {
    if (!!elements) {
      return (
        elements.map(item =>
        (
          <div key={item.id} className="attachments-list__img-wrap">
            <button>
              <img src={item.path} alt={item.title} />
            </button>
          </div>
        ))
      );
    }
  }

  public render() {
    const { newAssignmentStore } = this.props;
    const attachments: Array<FilterableAttachment> = [];
    /* console.log(newAssignmentStore!.questionCustomAttachments);
    console.log(newAssignmentStore!.currentOrderOption); */
    if (newAssignmentStore!.currentOrderOption >= 0) {
      /* console.log('executing A') */
      const currentQuestion = newAssignmentStore!.currentQuestion as EditableImageChoiceQuestion;
      if (currentQuestion && currentQuestion.options && currentQuestion.options.length > 0) {
        /* console.log('executing A.1');
        console.log(currentQuestion); */
        currentQuestion.options.forEach((item) => {
          if (item.image) {
            const existingImage = newAssignmentStore!.questionCustomAttachments!
              .find(attachment => attachment.id === item.image.id);
            if (!existingImage) {
              attachments.push(item.image);
            }
          }
        }
        );
        /* console.log(attachments); */
      }
    } else {
      /* console.log('executing b'); */
      const currentBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableImagesContentBlock;
      if (currentBlock && currentBlock.images && currentBlock.images.length > 0) {
        currentBlock.images.forEach((image) => {
          const existingImage = newAssignmentStore!.questionCustomAttachments!.find(attachment => attachment.id === image.id);

          if (!existingImage) {
            attachments.push(image);
          }
        });
      }
    }

    const renderedAttachments = newAssignmentStore!.questionCustomAttachments;
    const element = renderedAttachments.length > 0 ? renderedAttachments[0].title : 'No elements.';
    const elements: Array<any> = renderedAttachments.map(item => item);

    if (renderedAttachments.length === 0) {
      return (
        <div className="message">
          {intl.get('new assignment.no_custom_images_found')}
        </div>
      );
    }
    return (
      <div className="attachments-list">
        {this.renderCustomImagesAttachments(elements)}
      </div>
    );
  }
}
