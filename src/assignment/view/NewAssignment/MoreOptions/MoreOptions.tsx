import React, { Component } from 'react';
import intl from 'react-intl-universal';
import onClickOutside from 'react-onclickoutside';

import moreOptionsIcon from 'assets/images/more-options-question.svg';
import moreOptionsIconLight from 'assets/images/more-options-question-light.svg';
import moreOptionsIconPink from 'assets/images/more-options-question-pink.svg';
import duplicateIcon from 'assets/images/duplicate-question.svg';
import deleteIcon from 'assets/images/delete-question.svg';

import { CreationElements, NewAssignmentStore } from '../NewAssignmentStore';
import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import './MoreOptions.scss';

interface MoreOptionsWrapperProps {
  question: EditableQuestion;
  newAssignmentStore?: NewAssignmentStore;
}

class MoreOptionsWrapper extends Component<MoreOptionsWrapperProps> {
  public static contextType = AttachmentContentTypeContext;
  public state = {
    isMoreOptionsTooltipVisible: false
  };

  public handleClickOutside = () =>
    this.setState({ isMoreOptionsTooltipVisible: false })

  public handleClickIcon = () =>
    this.setState({
      isMoreOptionsTooltipVisible: !this.state.isMoreOptionsTooltipVisible
    })

  public duplicate = (event: React.MouseEvent<HTMLLIElement>) => {
    const { newAssignmentStore } = this.props;
    newAssignmentStore!.duplicateQuestion(this.props.question);

    if (newAssignmentStore!.currentEntity!.questions.length !== newAssignmentStore!.currentPreviewQuestion) {
      newAssignmentStore!.setPreviewQuestionByIndex(newAssignmentStore!.currentEntity!.questions.length - 1);
      newAssignmentStore!.setHighlightingItem(
        CreationElements.Questions,
        newAssignmentStore!.currentEntity!.questions.length - 1
      );
    }

    this.setState({ isMoreOptionsTooltipVisible: false });
    event.stopPropagation();
  }

  public delete = async (event: React.MouseEvent<HTMLLIElement>) => {
    const { newAssignmentStore, question } = this.props;

    if (await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('notifications.delete_question')
    })) {
      this.context.changeContentType(AttachmentContentType.text);
      newAssignmentStore!.currentEntity!.deleteQuestion(question.orderPosition);

      if (newAssignmentStore!.currentEntity!.questions.length === newAssignmentStore!.currentPreviewQuestion) {
        newAssignmentStore!.setPreviewQuestionByIndex(newAssignmentStore!.currentEntity!.questions.length - 1);
        newAssignmentStore!.setHighlightingItem(CreationElements.Questions, newAssignmentStore!.currentEntity!.questions.length - 1);
      }

      if (newAssignmentStore!.currentEntity!.questionsWithErrors === question.orderPosition) {
        newAssignmentStore!.currentEntity!.setQuestionsWithError(null);
      }

      this.setState({ isMoreOptionsTooltipVisible: false });
      event.stopPropagation();
    }
  }

  public renderMoreOptions = () => (
    <div className="tooltip">
      <div className="left">
        <ul className="flexBox dirColumn">
          <li className="flexBox" onClick={this.duplicate}>
            <span>{intl.get('new assignment.Duplicate question')}</span>
            <img src={duplicateIcon} alt="Duplicate qustion"/>
          </li>

          <li className="flexBox" onClick={this.delete}>
            <span style={{ color: '#E2017B' }}>{intl.get('new assignment.Remove question')}</span>
            <img src={deleteIcon} alt="Delete qustion"/>
          </li>
        </ul>

        <i/>
      </div>
    </div>
  )

  public render() {
    const { isMoreOptionsTooltipVisible } = this.state;
    const { newAssignmentStore, question } = this.props;
    const hasError = newAssignmentStore!.currentEntity!.questionsWithErrors === question.orderPosition;
    const image = hasError ? moreOptionsIconPink : isMoreOptionsTooltipVisible ? moreOptionsIconLight : moreOptionsIcon;

    return (
      <div className="MoreOptions">
        <img
          src={image}
          alt="More"
          onClick={this.handleClickIcon}
          className={'moreIcon'}
        />

        {isMoreOptionsTooltipVisible && this.renderMoreOptions()}
      </div>
    );
  }
}

export const MoreOptions = onClickOutside(MoreOptionsWrapper);
