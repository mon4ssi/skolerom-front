import React, { Component } from 'react';
import intl from 'react-intl-universal';
import onClickOutside from 'react-onclickoutside';

import moreOptionsCustomImageIcon from 'assets/images/more-with-bg.svg';
import moreOptionsCustomImageIconLight from 'assets/images/more-options-question-light.svg';
import moreOptionsCustomImageIconPink from 'assets/images/more-options-question-pink.svg';
import editIcon from 'assets/images/edit-image.svg';
import deleteIcon from 'assets/images/trash-image.svg';

import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import './MoreOptionsCustomImage.scss';
import { Attachment } from 'assignment/Assignment';

interface MoreOptionsCustomImageWrapperProps {
  question?: EditableQuestion;
  attachment?: Attachment;
  attachmentId: number;
  onClick?: (id?: number) => Promise<void>;
  onResetId?: (id?: number) => Promise<void>;
  onEdit: (id?: number, attachment?: Attachment) => Promise<void>;
  onRemove: (id?: number) => Promise<void>;
}

class MoreOptionsCustomImageWrapper extends Component<MoreOptionsCustomImageWrapperProps> {
  public state = {
    isMoreOptionsCustomImageTooltipVisible: false
  };

  public handleClickOutside = () => {
    this.setState({ isMoreOptionsCustomImageTooltipVisible: false });
    this.props.onResetId!(this.state.isMoreOptionsCustomImageTooltipVisible! && this.props.attachmentId !== 0 ? this.props.attachmentId! : 0);
  }

  public handleClickIcon = () => {
    this.setState({
      isMoreOptionsCustomImageTooltipVisible: !this.state.isMoreOptionsCustomImageTooltipVisible
    });
    this.props.onClick!(this.props.attachmentId!);
  }
  public edit = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    this.props.onEdit(this.props.attachmentId, this.props.attachment);
  }

  public remove = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    this.props.onRemove(this.props.attachmentId!);
  }

  public renderMoreOptionsCustomImage = () => (
    <div className="tooltip" >
      <div className="bottom">
        <ul className="flexBox dirColumn">
          <li>
            <a href="javascript:void(0)" onClick={this.edit} className="flexBox" >
              <span>{intl.get('new assignment.images_options.edit')}</span>
              <img src={editIcon} alt="Duplicate qustion" />
            </a>
          </li>
          <li>
            <a href="javascript:void(0)" onClick={this.remove} className="flexBox">
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
    const image = moreOptionsCustomImageIcon;
    /* console.log(this.props.attachmentId); */

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
