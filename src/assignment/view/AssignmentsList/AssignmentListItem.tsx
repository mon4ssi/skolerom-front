import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import { Link } from 'react-router-dom';
import { toJS } from 'mobx';
import classNames from 'classnames';

import { Assignment, Subject } from 'assignment/Assignment';
import {
  ActionMenu,
  ActionMenuItemButton,
  ActionMenuItemLink,
  ActionMenuItemType, CaretHorizontalPosition,
  CaretVerticalPosition,
} from 'components/common/ActionMenu/ActionMenu';
import { getStudentLevelsRange } from 'utils/studentLevelsRange';
import { secondLevel, thirdLevel } from 'utils/constants';
import { UserType } from 'user/User';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import notLikedIcon from 'assets/images/not-liked.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';
import firstLevelImg from 'assets/images/level-1-blue.svg';
import secondLevelImg from 'assets/images/level-2-blue.svg';
import thirdLevelImg from 'assets/images/level-3-blue.svg';
import contentCreatorImg from 'assets/images/content-creator-icon.svg';

import './AssignmentListItem.scss';

const maxNumberOfSubjects = 2;

interface AssignmentListItemProps {
  assignment: Assignment;
  currentUserRole: UserType;
  removeAssignment: (assignmentId: number) => void;
  copyAssignment: (id: number) => void;
  itemsToLastAssignment: number;
  isContentManager: boolean;
}

interface AssignmentListItemState {
  isActionMenuVisible: boolean;
}

export class AssignmentListItem extends Component<AssignmentListItemProps, AssignmentListItemState> {

  public state = {
    isActionMenuVisible: false,
  };

  private checkAssignmentStatus = () => {
    const { assignment } = this.props;

    if (!assignment.view && !assignment.publishedAt) {
      return ` - ${intl.get('assignment list.Draft')}`;
    }

    if (!assignment.view && assignment.publishedAt && assignment.isChanged) {
      return ` - ${intl.get('assignment list.Unpublished changes')}`;
    }

    return null;
  }

  private toggleActionMenu = (e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();

    this.setState(prevState => ({
      isActionMenuVisible: !prevState.isActionMenuVisible,
    }));
  }

  private closeActionMenu = () => {
    this.setState({
      isActionMenuVisible: false,
    });
  }

  private confirmDeleteListItem = async () => {
    const { removeAssignment, assignment } = this.props;

    this.closeActionMenu();

    const isDeletionApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.delete')
    });

    if (isDeletionApproved) {
      removeAssignment(assignment!.id);
    }
  }

  private handleCopyAssignment = async () => {
    const { assignment, copyAssignment } = this.props;
    this.closeActionMenu();

    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.copy')
    });

    if (isCopyApproved) {
      copyAssignment(assignment.id);
    }
  }

  private getActionList = () => {
    const { assignment, isContentManager } = this.props;

    const myAssignmentsActions: Array<ActionMenuItemLink | ActionMenuItemButton> = [
      {
        type: ActionMenuItemType.LINK,
        text: intl.get('assignment list.Edit assignment'),
        link: `/assignments/edit/${assignment.id}`
      },
      {
        type: ActionMenuItemType.LINK,
        text: intl.get('assignment list.View answers'),
        link: `/assignments/answers/${assignment!.id}`,
        disabled: !(assignment.isPublished && assignment.isDistributed)
      },
      {
        type: ActionMenuItemType.BUTTON,
        text: intl.get('assignment list.Copy assignment'),
        // tslint:disable-next-line:no-empty
        onClick: assignment.isPublished ? this.handleCopyAssignment : () => {},
        disabled: !assignment.isPublished
      },
      {
        type: ActionMenuItemType.BUTTON,
        text: intl.get('assignment list.Delete assignment'),
        onClick: this.confirmDeleteListItem,
      }
    ];

    const foreignAllAssignmentsActions: Array<ActionMenuItemLink | ActionMenuItemButton> = [
      {
        type: ActionMenuItemType.LINK,
        text: intl.get('assignment list.View assignment'),
        link: {
          pathname: `/assignments/view/${assignment!.id}`,
          state: {
            readOnly: true
          }
        }
      },
      {
        type: ActionMenuItemType.BUTTON,
        text: intl.get('assignment list.Copy assignment'),
        // tslint:disable-next-line:no-empty
        onClick: assignment.isPublished ? this.handleCopyAssignment : () => {},
        disabled: !assignment.isPublished
      },
    ];

    const allAssignmentsActionsContentManager: Array<ActionMenuItemLink | ActionMenuItemButton> = [
      {
        type: ActionMenuItemType.LINK,
        text: assignment.view === 'edit' ? intl.get('assignment list.Edit assignment') : intl.get('assignment list.View assignment'),
        link: assignment.view === 'edit' ? `/assignments/edit/${assignment.id}` : {
          pathname: `/assignments/view/${assignment!.id}`,
          state: {
            readOnly: true
          }
        }
      },
      {
        type: ActionMenuItemType.BUTTON,
        text: intl.get('assignment list.Copy assignment'),
        // tslint:disable-next-line:no-empty
        onClick: assignment.isPublished ? this.handleCopyAssignment : () => {},
        disabled: !assignment.isPublished
      },
      {
        type: ActionMenuItemType.BUTTON,
        text: intl.get('assignment list.Delete assignment'),
        onClick: this.confirmDeleteListItem,
      }
    ];

    const myAssignmentsActionsContentManager: Array<ActionMenuItemLink | ActionMenuItemButton> = [
      {
        type: ActionMenuItemType.LINK,
        text: intl.get('assignment list.Edit assignment'),
        link: `/assignments/edit/${assignment.id}`
      },
      {
        type: ActionMenuItemType.BUTTON,
        text: intl.get('assignment list.Copy assignment'),
        // tslint:disable-next-line:no-empty
        onClick: assignment.isPublished ? this.handleCopyAssignment : () => {},
        disabled: !assignment.isPublished
      },
      {
        type: ActionMenuItemType.BUTTON,
        text: intl.get('assignment list.Delete assignment'),
        onClick: this.confirmDeleteListItem,
      }
    ];

    switch (window.location.pathname) {
      case '/assignments/all':
        const originList = assignment!.view === 'edit' ? myAssignmentsActions : foreignAllAssignmentsActions;
        return isContentManager ? allAssignmentsActionsContentManager : originList;

      case '/assignments/my':
        return isContentManager ? myAssignmentsActionsContentManager : myAssignmentsActions;

      default:
        return [];
    }
  }

  private shouldRenderActionMenuToTop = () => {
    const { itemsToLastAssignment } = this.props;
    switch (window.location.pathname) {
      case '/assignments/all':
        return itemsToLastAssignment <= 0;

      case '/assignments/my':
        // tslint:disable-next-line:no-magic-numbers
        return itemsToLastAssignment <= 2;

      default:
        return false;
    }
  }

  private renderContentCreatorIcon = () => {
    const { assignment } = this.props;

    return assignment.isCreatedByContentManager && (
      <img
        src={contentCreatorImg}
        alt="content-creator"
        className="AssignmentListItem__contentCreatorImage"
      />
    );
  }

  private renderSubjects = (isMobile: boolean = false) => {
    const { assignment } = this.props;
    const subjects = assignment.subjects.length <= maxNumberOfSubjects ?
      toJS(assignment.subjects) :
      [...toJS(assignment.subjects).splice(0, maxNumberOfSubjects), { id: 0, title: intl.get('assignment list.Others') }];
    const classes = classNames('AssignmentListItem__subjects', {
      AssignmentListItem__subjects_mobile: isMobile
    });

    if (subjects.length !== 0) {
      return (
        <div className={classes}>
          <div className="AssignmentListItem__subject">{subjects[0].title}</div>
          {this.renderSecondSubjectIfPossible(subjects[1])}
          {this.renderOthersBadgeIfPossible(subjects[1])}
          {/* tslint:disable-next-line:no-magic-numbers */}
          {this.renderMobileOthersBadgeIfPossible(subjects[2])}
        </div>
      );
    }

    return null;
  }

  private renderSecondSubjectIfPossible(subject: Subject | undefined) {
    if (subject) {
      return (
        <div className="AssignmentListItem__subject AssignmentListItem__subject_desktop">
          {subject.title}
        </div>
      );
    }
  }

  private renderMobileOthersBadgeIfPossible(subject: Subject | undefined) {
    if (subject) {
      return (
        <div className="AssignmentListItem__subject AssignmentListItem__subject_mobile">
          {intl.get('evaluation_page.Others')}
        </div>
      );
    }
  }

  private renderOthersBadgeIfPossible(subject: Subject | undefined) {
    if (subject) {
      return (
        <div className="AssignmentListItem__subject AssignmentListItem__subject_desktop">
          {intl.get('evaluation_page.Others')}
        </div>
      );
    }
  }

  private renderQuestions = (isMobile: boolean = false) => {
    const { assignment } = this.props;
    const classes = classNames('AssignmentListItem__questions', {
      AssignmentListItem__questions_mobile: isMobile
    });

    return (
      <div className={classes}>
        {assignment.numberOfQuestions} {assignment.numberOfQuestions === 1 ? intl.get('assignment list.question') : intl.get('assignment list.questions')}
      </div>
    );
  }

  private renderLevels = () => {
    const { assignment } = this.props;

    const levelImage = assignment!.levels.includes(thirdLevel) ? thirdLevelImg :
      assignment!.levels.includes(secondLevel) ? secondLevelImg :
        firstLevelImg;

    return assignment.levels.length ? (
      <div className="AssignmentListItem__level">
        <img className="AssignmentListItem__levelImage" src={levelImage} alt="levels" />
        {getStudentLevelsRange(assignment.levels)}
      </div>
    ) : null;
  }

  private renderLikes = (isMobile: boolean = false) => {
    const classes = classNames('AssignmentListItem__likes', {
      AssignmentListItem__likes_mobile: isMobile,
    });

    return (
      <div className={classes}>
        <img className="AssignmentListItem__likesImage" src={notLikedIcon} alt="Not liked" />0
      </div>
    );
  }

  private renderActionMenu = () => {
    // don't be scared of it. it just batch of CSS media rules presented in js
    const caretHorizontalRules = [
      {
        side: CaretHorizontalPosition.RIGHT,
        indent: 29
      },
      {
        side: CaretHorizontalPosition.LEFT,
        maxWidth: 768,
        indent: 22
      }
    ];

    return (
      <ActionMenu
        list={this.getActionList()}
        onClose={this.closeActionMenu}
        caretVerticalPosition={this.shouldRenderActionMenuToTop() ? CaretVerticalPosition.BOTTOM : CaretVerticalPosition.TOP}
        caretHorizontalPositionRules={caretHorizontalRules}
      />
    );
  }

  public render() {
    const { assignment } = this.props;
    const { isActionMenuVisible } = this.state;
    const linkOptions = !assignment.view || assignment.view === 'edit' ? {
      pathname: `edit/${assignment.id}`,
    } : {
      pathname: `view/${assignment.id}`,
      state: {
        readOnly: true
      }
    };
    // const hasLikes = !((!assignment.view && !assignment.publishedAt) || (!assignment.view && assignment.publishedAt && assignment.isChanged));

    const moreButtonClasses = classNames('AssignmentListItem__more', {
      AssignmentListItem__more_clicked: isActionMenuVisible,
    });
    const actionMenuWrapperClasses = classNames('AssignmentListItem__actionMenu', {
      AssignmentListItem__actionMenu_top: this.shouldRenderActionMenuToTop(),
    });

    return (
      <div className="AssignmentListItem__super">
        <Link to={linkOptions}>
          <li className="AssignmentListItem">
            <div className="AssignmentListItem__block AssignmentListItem__blockMain">
              <img
                className="AssignmentListItem__image"
                src={assignment.featuredImage ? assignment.featuredImage : listPlaceholderImg}
                alt={assignment.title}
              />
              {/*{hasLikes && this.renderLikes()}*/}
              <div className="AssignmentListItem__title">
                {assignment.title ? assignment.title : <span className={'AssignmentListItem__noTitle'}>{intl.get('new assignment.no_title')}</span>}
                <span className="AssignmentListItem__status">
                  {this.checkAssignmentStatus()}
                </span>
              </div>
              {this.renderQuestions(true)}
              {this.renderSubjects(true)}
            </div>
            <div className="AssignmentListItem__block AssignmentListItem__blockSecondary">
              {this.renderContentCreatorIcon()}
              {this.renderSubjects()}
              {this.renderQuestions()}
              {/*{hasLikes && this.renderLikes(true)}*/}
            </div>
          </li>
        </Link>
        <div className="AssignmentListItem__moreWrapper">
          <button className={moreButtonClasses} onClick={this.toggleActionMenu} data-msj={intl.get('activity_page.options')} />
          <div className={actionMenuWrapperClasses}>
            {isActionMenuVisible && this.renderActionMenu()}
          </div>
        </div>
      </div>
    );
  }
}
