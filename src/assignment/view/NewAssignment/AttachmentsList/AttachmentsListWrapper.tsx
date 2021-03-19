import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';

import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';

import { AttachmentsList, AttachmentsListProps } from './AttachmentsList';

class AttachmentsListComponent extends Component<AttachmentsListProps> {
  public static contextType = AttachmentContentTypeContext;

  public handleClickOutside = () => {
    this.context.changeContentType(AttachmentContentType.text);
  }

  public render() {
    const { contentType } = this.context;
    return (contentType === AttachmentContentType.image || contentType === AttachmentContentType.video) && <AttachmentsList {...this.props} />;
  }
}

export const AttachmentsListWrapper = onClickOutside(AttachmentsListComponent);
