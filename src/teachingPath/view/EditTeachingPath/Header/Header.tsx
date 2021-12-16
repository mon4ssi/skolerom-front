import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { NavLink, withRouter, RouteComponentProps } from 'react-router-dom';
import intl from 'react-intl-universal';
import moment from 'moment';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { EditTeachingPathStore } from '../EditTeachingPathStore';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { TeachingPathValidationError } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { DistributionValidationError } from 'distribution/Distribution';
import { UserType } from 'user/User';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import backImg from 'assets/images/back-arrow.svg';

import './Header.scss';
const PATHLENGTH1 = 11;
const PATHLENGTH2 = 12;
interface MatchProps {
  id: string;
}

interface Props extends RouteComponentProps<MatchProps> {
  editTeachingPathStore?: EditTeachingPathStore;
  teachingPathsListStore?: TeachingPathsListStore;
  isCreation?: boolean;
  isPublishing?: boolean;
  isDistribution?: boolean;
  readOnly?: boolean;
}

@inject('editTeachingPathStore', 'teachingPathsListStore')
@observer
export class HeaderComponent extends Component<Props> {

  private ref = React.createRef<HTMLButtonElement>();
  private refGoDistribution = React.createRef<HTMLButtonElement>();
  private refFinalDistribution = React.createRef<HTMLButtonElement>();
  private isDisabledSaveButton = () => false;
  private isDisabledPublishButton = (): boolean => {
    const { isActiveButtons } = this.props.editTeachingPathStore!;
    return !isActiveButtons;
  }

  private onSave = async (): Promise<void> => {
    const { editTeachingPathStore, history } = this.props;
    const { id } = editTeachingPathStore!.currentEntity!;

    try {
      await editTeachingPathStore!.save();
      Notification.create({
        type: NotificationTypes.SUCCESS,
        title: intl.get('edit_teaching_path.header.after_saving')
      });

      history.push({
        pathname: `/teaching-paths/edit/${id}/publish`,
      });
    } catch (e) {
      if (e instanceof TeachingPathValidationError) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get(e.localizationKey)
        });
      }
    }
  }

  private onPublish = (onlyPublish: boolean) => async () => {
    const { editTeachingPathStore, history } = this.props;
    const { id } = editTeachingPathStore!.currentEntity!;
    const userType = editTeachingPathStore!.getCurrentUser()!.type;
    const tpTitle = editTeachingPathStore!.teachingPathContainer!.teachingPath!.title;
    const isPrivate = editTeachingPathStore!.teachingPathContainer!.teachingPath!.isPrivate;
    const isCopy = editTeachingPathStore!.teachingPathContainer!.teachingPath!.isCopy;
    const sources = editTeachingPathStore!.teachingPathContainer!.teachingPath!.sources;

    if (!editTeachingPathStore!.isActiveButtons) {
      const grepGoals = editTeachingPathStore!.teachingPathContainer!.teachingPath.grepGoalsIds;
      const msj = (typeof(grepGoals) === 'undefined') ? intl.get('edit_teaching_path.header.cant_publish_goals') : (grepGoals!.length === 0) ? intl.get('edit_teaching_path.header.cant_publish_goals') : intl.get('edit_teaching_path.header.cant_publish');
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
      isCopy && (
        /Copy$/.test(tpTitle) ||
        /Kopi$/.test(tpTitle) ||
        /copy$/.test(tpTitle) ||
        /kopi$/.test(tpTitle)
      )
    ) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: intl.get('new assignment.copy_title_not_allow')
      });

      return;
    }

    try {
      await editTeachingPathStore!.publish();

      Notification.create({
        type: NotificationTypes.SUCCESS,
        title: intl.get('edit_teaching_path.header.after_publishing')
      });

      if (userType === UserType.Teacher) {
        onlyPublish ? history.push('/teaching-paths/all') : history.push(`/teaching-paths/edit/${id}/distribute`);
      }

      if (userType === UserType.ContentManager) {
        history.push('/teaching-paths/all');
      }

    } catch (e) {
      if (e instanceof TeachingPathValidationError) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get(e.localizationKey)
        });
      }
    }
  }

  private onDistribute = async () => {
    const { editTeachingPathStore, history } = this.props;

    editTeachingPathStore!.distribute()
      .then(() => history.push({
        pathname: '/distributed',
        state: {
          entityType: 'teaching path',
          editPath: `/teaching-paths/edit/${editTeachingPathStore!.currentEntity!.id}`,
          exitPath: '/teaching-paths/all'
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
    const { editTeachingPathStore } = this.props;
    const currentLocale = editTeachingPathStore!.getCurrentLocale();

    return editTeachingPathStore!.getIsDraftSaving()
      ? intl.get('new assignment.Changes made')
      : `
        ${intl.get('new assignment.Last edit was made')}
        ${moment(editTeachingPathStore!.getUpdatedAt() || new Date())
        .locale(currentLocale)
        .fromNow()}
        `;
  }

  private onGoBack = () => {
    const { isCreation, isPublishing, isDistribution, teachingPathsListStore } = this.props;

    if (isCreation) {
      this.props.history.push(`/teaching-paths/${teachingPathsListStore!.typeOfTeachingPathsList}`);
    }
    if (isPublishing) {
      this.props.history.push(`/teaching-paths/edit/${this.props.match.params.id}/`);
    }

    if (isDistribution) {
      this.props.history.push(`/teaching-paths/edit/${this.props.match.params.id}/publish`);
    }
  }

  private renderDistributeButton = () => {
    const { editTeachingPathStore } = this.props;
    const userType = editTeachingPathStore!.getCurrentUser()!.type;

    if (userType !== UserType.ContentManager) {
      return (
        <button
          onClick={this.onPublish(false)}
          disabled={this.isDisabledPublishButton()}
          className="CreateButton"
          ref={this.refGoDistribution}
          title={intl.get('edit_teaching_path.header.publish_and_distribute_teaching_path')}
        >
          {intl.get('edit_teaching_path.header.publish_and_distribute_teaching_path')}
        </button>
      );
    }
  }

  public renderFunctionalSide = () => {
    const { isCreation, isDistribution, isPublishing, editTeachingPathStore } = this.props;
    if (isCreation) {
      return (
        <>
          <span>{this.checkUpdatedAt()}</span>
          <CreateButton
            onClick={this.onSave}
            disabled={this.isDisabledSaveButton()}
            title={intl.get('edit_teaching_path.header.save_teaching_path')}
          >
            {intl.get('edit_teaching_path.header.save_teaching_path')}
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
            disabled={this.isDisabledPublishButton()}
            className="CreateButton"
            ref={this.ref}
            title={intl.get('edit_teaching_path.header.publish_teaching_path')}
          >
            {intl.get('edit_teaching_path.header.publish_teaching_path')}
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
          title={intl.get('edit_teaching_path.header.distribute_teaching_path')}
        >
          {intl.get('edit_teaching_path.header.distribute_teaching_path')}
        </button>
      );
    }
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const classDivPath = (event.composedPath()[0] as Element).className;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    const qlEditorText = 'ql-editor';
    const { isCreation, isDistribution, isPublishing } = this.props;
    if (event.key === 'Escape') {
      if ((htmlPathArea !== htmlText) && (htmlPathArea !== inputText)) {
        if (!this.props.editTeachingPathStore!.currentNode) {
          this.onGoBack();
        }
      }
    }
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText && classDivPath !== qlEditorText) {
      if ((event.shiftKey && event.key === 'S') || (event.shiftKey && event.key === 's')) {
        if ((htmlPathArea !== htmlText) && (htmlPathArea !== inputText)) {
          if (isCreation) {
            if (!this.isDisabledSaveButton()) {
              this.onSave();
            }
          }
        }
      }
      if ((event.shiftKey && event.key === 'P') || (event.shiftKey && event.key === 'p')) {
        if ((htmlPathArea !== htmlText) && (htmlPathArea !== inputText)) {
          if (isPublishing) {
            if (!this.isDisabledPublishButton()) {
              this.ref.current!.click();
            }
          }
        }
      }
      if ((event.shiftKey && event.key === 'D') || (event.shiftKey && event.key === 'd')) {
        if ((htmlPathArea !== htmlText) && (htmlPathArea !== inputText)) {
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

  public async componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboardControl);
  }
  public componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public renderCreationItem = () => (
    <NavLink
      exact
      className="link flexBox alignCenter disabled-link"
      to={`/teaching-paths/edit/${this.props.match.params.id}`}
      activeClassName="activeRoute"
      aria-label={intl.get('edit_teaching_path.header.create_teaching_path')}
    >
      {intl.get('edit_teaching_path.header.create_teaching_path')}
    </NavLink>
  )

  public renderPublishingItem = () => (
    <NavLink
      className="link flexBox alignCenter disabled-link"
      to={`/teaching-paths/edit/${this.props.match.params.id}/publish`}
      activeClassName="activeRoute"
      aria-label={intl.get('edit_teaching_path.header.publish')}
    >
      {intl.get('edit_teaching_path.header.publish')}
    </NavLink>
  )

  public renderDistributionItem = () => {
    const { editTeachingPathStore, match, location } = this.props;

    const userType = editTeachingPathStore!.getCurrentUser()!.type;

    return !location.state && userType === UserType.Teacher ? (
      <NavLink
        className="link flexBox alignCenter disabled-link"
        to={`/teaching-paths/edit/${match.params.id}/distribute`}
        activeClassName="activeRoute"
        aria-label={intl.get('edit_teaching_path.header.distribute')}
      >
        {intl.get('edit_teaching_path.header.distribute')}
      </NavLink>
    ) : null;
  }

  public renderHeaderTabs = () => (
    <>
      <div className="flexBox assignmentTabs">
        {this.renderCreationItem()}
        {this.renderPublishingItem()}
        {this.renderDistributionItem()}
      </div>

      <div className="doneBox flexBox alignCenter">
        {this.renderFunctionalSide()}
      </div>
    </>
  )

  public render() {
    return (
      <div className="header flexBox spaceBetween alignCenter fw500">
        <div className="flexBox alignCenter back-button fs15" onClick={this.onGoBack}>
          <img src={backImg} alt="Back" />
          {intl.get('edit_teaching_path.header.go_back')}
        </div>
        {this.renderHeaderTabs()}
      </div>
    );
  }
}

export const Header = withRouter(HeaderComponent);
