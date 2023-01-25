import React, { Component } from 'react';
import intl from 'react-intl-universal';
import onClickOutside from 'react-onclickoutside';

import moreOptionsCustomImageIcon from 'assets/images/more-with-bg.svg';
import moreOptionsCustomImageIconLight from 'assets/images/more-options-question-light.svg';
import moreOptionsCustomImageIconPink from 'assets/images/more-options-question-pink.svg';
import editIcon from 'assets/images/edit-image.svg';
import deleteIcon from 'assets/images/trash-image.svg';

import { CreationElements, NewAssignmentStore } from '../../../NewAssignmentStore';
import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { AttachmentContentType, AttachmentContentTypeContext } from '../../../AttachmentContentTypeContext';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import './MoreOptionsCustomImage.scss';

interface MoreOptionsCustomImageWrapperProps {
  question?: EditableQuestion;
  newAssignmentStore?: NewAssignmentStore;
  attachmentId: number;
  onEdit: () => Promise<void>;
  onRemove: () => Promise<void>;
}

class MoreOptionsCustomImageWrapper extends Component<MoreOptionsCustomImageWrapperProps> {
  public static contextType = AttachmentContentTypeContext;
  public state = {
    isMoreOptionsCustomImageTooltipVisible: false
  };

  public handleClickOutside = () =>
    this.setState({ isMoreOptionsCustomImageTooltipVisible: false })

  public handleClickIcon = () =>
    this.setState({
      isMoreOptionsCustomImageTooltipVisible: !this.state.isMoreOptionsCustomImageTooltipVisible
    })

  public edit = async (event: React.MouseEvent<HTMLAnchorElement>) => this.props.onEdit();

  public remove = async (event: React.MouseEvent<HTMLAnchorElement>) => this.props.onRemove();

  public renderMoreOptionsCustomImage = () => (
    <div className="tooltip" >
      <div className="bottom">
        <ul className="flexBox dirColumn">
          <li>
            <a href="javascript:void(0)" onClick={this.edit} className="flexBox" role="button">
              <span>{intl.get('new assignment.images_options.edit')}</span>
              <img src={editIcon} alt="Duplicate qustion" />
            </a>
          </li>
          <li>
            <a href="javascript:void(0)" onClick={this.remove} className="flexBox" role="button">
              <span style={{ color: '#E2017B' }}>{intl.get('new assignment.images_options.delete')}</span>
              <img src={deleteIcon} alt="Delete qustion" />
            </a>
          </li>
        </ul>

        <i />
      </div>
    </div>
  )

  public render() {
    const { isMoreOptionsCustomImageTooltipVisible } = this.state;
    const { newAssignmentStore, question } = this.props;
    const image = moreOptionsCustomImageIcon;

    return (
      <div className="MoreOptionsCustomImage">
        <button onClick={this.handleClickIcon}>
          <img
            src={image}
            alt="More"
            className="moreIcon"
          />
        </button>

        {isMoreOptionsCustomImageTooltipVisible && this.renderMoreOptionsCustomImage()}
      </div>
    );
  }
}

export const MoreOptionsCustomImage = onClickOutside(MoreOptionsCustomImageWrapper);
