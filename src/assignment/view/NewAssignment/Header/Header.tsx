import React, { Component } from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import { NavLink, withRouter, RouteComponentProps } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Location } from 'history';

import backIcon from 'assets/images/back-arrow.svg';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { NewAssignmentStore } from '../NewAssignmentStore';
import { AssignmentValidationError } from 'assignment/assignmentDraft/AssignmentDraft';
import { DistributionValidationError } from 'distribution/Distribution';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { UserType } from 'user/User';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';

import './Header.scss';

type LocationProps = Location<{ fromTeachingPath: boolean, teachingPathId: number }>;
const PATHLENGTH = 4;
interface MatchProps {
  id: string;
}

interface Props extends RouteComponentProps<MatchProps> {
  newAssignmentStore?: NewAssignmentStore;
  assignmentListStore?: AssignmentListStore;
  isCreation?: boolean;
  isPublishing?: boolean;
  isDistribution?: boolean;
  location: LocationProps;
}

@inject('newAssignmentStore', 'assignmentListStore')
@observer
class HeaderWrapper extends Component<Props> {
  private ref = React.createRef<HTMLButtonElement>();
  private refGoDistribution = React.createRef<HTMLButtonElement>();
  private refFinalDistribution = React.createRef<HTMLButtonElement>();
  private isDisabledPublishButton = (): boolean => {
    const { isDisabledButtons } = this.props.newAssignmentStore!;
    return !isDisabledButtons;
  }

  private isDisabledSaveButton = () => false;
  private isDisabledDistributeButton = (): boolean => {
    const { isDisabledButtons } = this.props.newAssignmentStore!;
    return !isDisabledButtons;
  }

  private onSave = async (): Promise<void> => {
    const { newAssignmentStore, history, location } = this.props;
    const { id } = newAssignmentStore!.currentEntity!;

    try {
      await newAssignmentStore!.save();
      Notification.create({
        type: NotificationTypes.SUCCESS,
        title: intl.get('new assignment.after_saving')
      });

      history.push({
        pathname: `/assignments/edit/${id}/publish`,
        state: location.state
      });
    } catch (e) {
      if (e instanceof AssignmentValidationError) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get(e.localizationKey)
        });
      }
    }

  }

  private onPublish = (onlyPublish: boolean) => async () => {
    const { newAssignmentStore, history, location } = this.props;
    const { id } = newAssignmentStore!.currentEntity!;
    const userType = newAssignmentStore!.getCurrentUser()!.type;
    const assignmentTitle = newAssignmentStore!.assignmentContainer!.assignment!.title;
    const isPrivate = newAssignmentStore!.assignmentContainer!.assignment!.isPrivate;
    const isCopy = newAssignmentStore!.assignmentContainer!.assignment!.isCopy;
    const sources = newAssignmentStore!.assignmentContainer!.assignment!.sources;

    if (!newAssignmentStore!.isActiveButtons) {
      const grepGoals = newAssignmentStore!.assignmentContainer!.assignment.grepGoalsIds;
      const msj = (typeof (grepGoals) === 'undefined') ? intl.get('edit_teaching_path.header.cant_publish_goals') : (grepGoals!.length === 0) ? intl.get('edit_teaching_path.header.cant_publish_goals') : intl.get('edit_teaching_path.header.cant_publish');
      Notification.create({
        type: NotificationTypes.ERROR,
        title: msj
      });
      return;
    }

    if (userType === UserType.ContentManager && !isPrivate && sources.length === 0) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: intl.get('edit_teaching_path.header.source_required')
      });
      return;
    }

    if (
      !isPrivate &&
      isCopy &&
      (
        /Copy$/.test(assignmentTitle) ||
        /Kopi$/.test(assignmentTitle) ||
        /copy$/.test(assignmentTitle) ||
        /kopi$/.test(assignmentTitle)
      )
    ) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: intl.get('new assignment.copy_title_not_allow')
      });

      return;
    }

    try {
      await newAssignmentStore!.publish();

      if (location.state && location.state.fromTeachingPath) {
        Notification.create({
          type: NotificationTypes.SUCCESS,
          title: intl.get('publishing_page.after_publishing_from_teaching_path')
        });

        newAssignmentStore!.storeAssignment();
        history.push({
          pathname: `/teaching-paths/edit/${location.state.teachingPathId}`,
          state: {
            fromAssignmentCreating: true
          }
        });
        return;
      }

      Notification.create({
        type: NotificationTypes.SUCCESS,
        title: intl.get('publishing_page.after_publishing')
      });

      if (userType === UserType.Teacher) {
        onlyPublish ? history.push('/assignments/all') : history.push(`/assignments/edit/${id}/distribute`);
      }

      if (userType === UserType.ContentManager) {
        history.push('/assignments/all');
      }
    } catch (e) {
      if (e instanceof AssignmentValidationError) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get(e.localizationKey)
        });
      }
    }
  }

  private onDistribute = async () => {
    const { newAssignmentStore, history } = this.props;

    newAssignmentStore!.distribute()
      .then(() => history.push({
        pathname: '/distributed',
        state: {
          entityType: 'assignment',
          editPath: `/assignments/edit/${newAssignmentStore!.currentEntity!.id}`,
          exitPath: '/assignments/all'
        }
      }))
      .catch((error) => {
        if (error instanceof DistributionValidationError) {
          Notification.create({
            type: NotificationTypes.ERROR,
            title: intl.get(error.localizationKey)
          });
        }
      });
  }

  private checkUpdatedAt = () => {
    const { newAssignmentStore } = this.props;
    const currentLocale = newAssignmentStore!.getCurrentLocale();

    return newAssignmentStore!.getIsDraftSaving()
      ? intl.get('new assignment.Changes made')
      : `
        ${intl.get('new assignment.Last edit was made')}
        ${moment(newAssignmentStore!.getUpdatedAt() || new Date())
        .locale(currentLocale)
        .fromNow()}
        `;
  }

  private onGoBack = async () => {
    const { isCreation, isPublishing, isDistribution, location, assignmentListStore } = this.props;
    if (isCreation) {
      if (location.state && location.state.fromTeachingPath) {
        const goBackConfirm = await Notification.create({
          type: NotificationTypes.CONFIRM,
          title: intl.get('new assignment.go_back_to_teaching_path')
        });
        if (goBackConfirm) {
          this.props.history.push(`/teaching-paths/edit/${location.state.teachingPathId}`);
        }
      } else {
        this.props.history.push(`/assignments/${assignmentListStore!.typeOfAssignmentsList}`);
        /* const url: string = localStorage!.getItem('url') !== null ? localStorage!.getItem('url')!.toString().split('?')[1] : '';
        this.props.history.push(`/assignments/all?${url}`);
        localStorage.removeItem('url'); */
        /* localStorage.clear(); */
      }
    }

    if (isPublishing) {
      this.props.history.push({
        pathname: `/assignments/edit/${this.props.match.params.id}/`,
        state: location.state
      });
    }

    if (isDistribution) {
      this.props.history.push(`/assignments/edit/${this.props.match.params.id}/publish`);
    }
  }

  private renderDistributeButton = () => {
    const { newAssignmentStore, location } = this.props;
    const userType = newAssignmentStore!.getCurrentUser()!.type;
    if (userType !== UserType.ContentManager && !(location.state && location.state.fromTeachingPath)) {
      return (
        <button
          onClick={this.onPublish(false)}
          disabled={this.isDisabledPublishButton()}
          className="CreateButton"
          ref={this.refGoDistribution}
          title={intl.get('new assignment.publish_and_distribute_assignment')}
        >
          {intl.get('new assignment.publish_and_distribute_assignment')}
        </button>
      );
    }
  }

  public renderFunctionalSide = () => {
    const { isCreation, isDistribution, isPublishing, newAssignmentStore } = this.props;
    const userType = newAssignmentStore!.getCurrentUser()!.type;

    if (isCreation) {
      return (
        <>
          <span>{this.checkUpdatedAt()}</span>
          <CreateButton
            onClick={this.onSave}
            disabled={this.isDisabledSaveButton()}
            title={intl.get('new assignment.save_assignment')}
          >
            {intl.get('new assignment.save_assignment')}
          </CreateButton>
        </>
      );
    }

    if (isPublishing) {
      return (
        <>
          <span>{this.checkUpdatedAt()}</span>
          <button
            onClick={this.onPublish(true)}
            disabled={this.isDisabledDistributeButton()}
            className="CreateButton"
            ref={this.ref}
            title={intl.get('new assignment.publish_assignment')}
          >
            {intl.get('new assignment.publish_assignment')}
          </button>
          {this.renderDistributeButton()}
        </>
      );
    }

    if (isDistribution) {
      return (
        <button
          onClick={this.onDistribute}
          disabled={this.isDisabledPublishButton()}
          className="CreateButton"
          ref={this.refFinalDistribution}
          title={intl.get('distribution_page.distribute_assignment')}
        >
          {intl.get('distribution_page.distribute_assignment')}
        </button>
      );
    }
  }

  public renderCreationItem = () => (
    <NavLink
      exact
      className="link flexBox alignCenter disabled-link"
      to={`/assignments/edit/${this.props.match.params.id}/`}
      activeClassName="activeRoute"
    >
      {intl.get('new assignment.Create assignment')}
    </NavLink>
  )

  public renderPublishingItem = () => (
    <NavLink
      className="link flexBox alignCenter disabled-link"
      to={`/assignments/edit/${this.props.match.params.id}/publish`}
      activeClassName="activeRoute"
    >
      {intl.get('new assignment.publish')}
    </NavLink>
  )

  public renderDistributionItem = () => {
    const { newAssignmentStore, match, location } = this.props;

    const userType = newAssignmentStore!.getCurrentUser()!.type;

    return !location.state && userType === UserType.Teacher ? (
      <NavLink
        className="link flexBox alignCenter disabled-link"
        to={`/assignments/edit/${match.params.id}/distribute`}
        activeClassName="activeRoute"
      >
        {intl.get('new assignment.Distribute')}
      </NavLink>
    ) : null;
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const { isCreation, isDistribution, isPublishing, newAssignmentStore } = this.props;
    const classDivPath = (event.composedPath()[0] as Element).className;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    const qlEditorText = 'ql-editor';
    if (event.key === 'Escape') {
      if (!newAssignmentStore!.visibilityArticles) {
        if (!newAssignmentStore!.visibilityAttachments) {
          this.onGoBack();
        }
      }
    }
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText && classDivPath !== qlEditorText) {
      if ((event.shiftKey && event.key === 'S') || (event.shiftKey && event.key === 's')) {
        if (!newAssignmentStore!.visibilityArticles) {
          if (!newAssignmentStore!.visibilityAttachments) {
            if (isCreation) {
              if (!this.isDisabledSaveButton()) {
                this.onSave();
              }
            }
          }
        }
      }
      if ((event.shiftKey && event.key === 'P') || (event.shiftKey && event.key === 'p')) {
        if (!newAssignmentStore!.visibilityArticles) {
          if (!newAssignmentStore!.visibilityAttachments) {
            if (isPublishing) {
              if (!this.isDisabledPublishButton()) {
                this.ref.current!.click();
              }
            }
          }
        }
      }
      if ((event.shiftKey && event.key === 'D') || (event.shiftKey && event.key === 'd')) {
        if (!newAssignmentStore!.visibilityArticles) {
          if (!newAssignmentStore!.visibilityAttachments) {
            if (isPublishing) {
              if (!this.isDisabledPublishButton()) {
                this.refGoDistribution.current!.click();
              }
            }
            if (isDistribution) {
              if (!this.isDisabledPublishButton()) {
                this.refFinalDistribution.current!.click();
              }
            }
          }
        }
      }
    }
  }

  public async componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboardControl);
  }
  public componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public render() {
    return (
      <div className="header flexBox spaceBetween alignCenter">
        <div className="flexBox alignCenter back-button fs15" onClick={this.onGoBack}>
          <img src={backIcon} alt="Back" />
          {intl.get('new assignment.go_back')}
        </div>

        <div className="flexBox assignmentTabs">

          {this.renderCreationItem()}

          {this.renderPublishingItem()}

          {this.renderDistributionItem()}
        </div>

        <div className="doneBox flexBox alignCenter">
          {this.renderFunctionalSide()}
        </div>
      </div>
    );
  }
}

export const Header = withRouter(HeaderWrapper);
