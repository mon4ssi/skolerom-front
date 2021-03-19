import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { FilterableAttachment } from '../AttachmentsList';
import { NewAssignmentStore } from '../../NewAssignmentStore';
import { EditableVideosContentBlock } from 'assignment/assignmentDraft/EditableContentBlock';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
  filterAttachments(attachment: FilterableAttachment): boolean;
  sortAttachments(attachmentA: FilterableAttachment, attachmentB: FilterableAttachment): number;
  renderAttachment(item: FilterableAttachment): void;
}

@inject('newAssignmentStore')
@observer
export class VideosAttachments extends Component<Props> {

  public render() {
    const { newAssignmentStore } = this.props;
    const attachments: Array<FilterableAttachment> = [];

    const currentBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableVideosContentBlock;
    if (currentBlock && currentBlock.videos && currentBlock.videos.length > 0) {
      currentBlock.videos.forEach((video) => {
        const existingVideo = newAssignmentStore!.questionAttachments!.find(attachment => attachment.id === video.id);

        if (!existingVideo) {
          attachments.push(video);
        }
      });
    }

    const renderedAttachments = attachments
      .concat(newAssignmentStore!.questionAttachments)
      .filter(this.props.filterAttachments)
      .sort(this.props.sortAttachments)
      .map(this.props.renderAttachment);

    if (renderedAttachments.length <= 0) {
      return (
        <div className="message">
          {intl.get('new assignment.no_videos_found')}
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
