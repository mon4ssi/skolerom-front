import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { NavLink, withRouter, RouteComponentProps } from 'react-router-dom';
import intl from 'react-intl-universal';
import moment from 'moment';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { EditTeachingPathStore } from '../EditTeachingPathStore';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { DraftTeachingPath, EditableTeachingPathNode, TeachingPathValidationError } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { DistributionValidationError } from 'distribution/Distribution';
import { UserType } from 'user/User';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import backImg from 'assets/images/back-arrow.svg';

import './Header.scss';
import { TeachingPathItem, TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { Assignment } from 'assignment/Assignment';
import { LANGUAGES } from 'utils/constants';

const PATHLENGTH1 = 11;
const PATHLENGTH2 = 12;
interface MatchProps {
  id: string;
}

let continueValidateOpenAssignments = true;
let cantAssigmentsResp = 0;
let listItemAssignmentResp: Array<Assignment> = [];
const waitTimeOut: number = 100;

interface Props extends RouteComponentProps<MatchProps> {
  editTeachingPathStore?: EditTeachingPathStore;
  teachingPathsListStore?: TeachingPathsListStore;
  isCreation?: boolean;
  isPublishing?: boolean;
  isDistribution?: boolean;
  readOnly?: boolean;
  id?: number;
}

@inject('editTeachingPathStore', 'teachingPathsListStore')
@observer
export class HeaderComponent extends Component<Props> {

  private ref = React.createRef<HTMLButtonElement>();
  private refGoDistribution = React.createRef<HTMLButtonElement>();
  private refFinalDistribution = React.createRef<HTMLButtonElement>();
  private isDisabledSaveButton = () => false;
  private isDisabledPublishButton = (): boolean => {
    const { isDisabledButtons } = this.props.editTeachingPathStore!;
    return !isDisabledButtons;
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
      if (history.location.search) {
        const searchvalue = history.location.search;
        history.push({
          pathname: `/teaching-paths/edit/${id}/publish`,
          search: searchvalue
        });
      } else {
        history.push({
          pathname: `/teaching-paths/edit/${id}/publish`,
        });
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

  private getListOfAssignmentsWithoutRepeat = (itemTP: DraftTeachingPath) => {
    let children: Array<EditableTeachingPathNode> = [];
    let childrenTmp: Array<EditableTeachingPathNode> = itemTP.content.children;
    let continueLoop = true;
    let nroNodes: number = 0;
    const listItemAssignment: Array<TeachingPathItem> = [];
    const listItemAssignmentById: Array<number> = [];

    while (continueLoop) {
      nroNodes = 0;
      children = childrenTmp;
      childrenTmp = [];

      ////
      children.some((itemNode) => {
        itemNode.items!.forEach((itemAssig) => {
          if (itemAssig.type === TeachingPathNodeType.Assignment) {
            if (!listItemAssignmentById.includes(itemAssig.value.id)) {
              listItemAssignmentById.push(itemAssig.value.id);
              listItemAssignment.push(itemAssig);
            }
          }
        });

        if (itemNode.children.length > 0) {
          itemNode.children.forEach((child) => {
            child.items!.forEach((item) => {
              if (item.type === TeachingPathNodeType.Assignment) {
                if (!listItemAssignmentById.includes(item.value.id)) {
                  listItemAssignmentById.push(item.value.id);
                  listItemAssignment.push(item);
                }
              }
            });

            if (child.children.length > 0) {
              childrenTmp.push(child);
            }
          });

          nroNodes += 1;
        }
      });
      ///

      continueLoop = (nroNodes > 0);
    }

    return listItemAssignment;
  }

  private onPublish = (onlyPublish: boolean) => async () => {
    /* console.log('publish'); */
    const { editTeachingPathStore, history } = this.props;
    const { id } = editTeachingPathStore!.currentEntity!;
    const userType = editTeachingPathStore!.getCurrentUser()!.type;
    const tpTitle = editTeachingPathStore!.teachingPathContainer!.teachingPath!.title;
    const isPrivate = editTeachingPathStore!.teachingPathContainer!.teachingPath!.isPrivate;
    const isCopy = editTeachingPathStore!.teachingPathContainer!.teachingPath!.isCopy;
    const sources = editTeachingPathStore!.teachingPathContainer!.teachingPath!.sources;
    const displayInOpenSite = editTeachingPathStore!.teachingPathContainer!.teachingPath!.open;
    if (!editTeachingPathStore!.isActiveButtons) {
      const grepGoals = editTeachingPathStore!.teachingPathContainer!.teachingPath.grepGoalsIds;
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

    if (userType === UserType.ContentManager) {
      const localeId = editTeachingPathStore!.teachingPathContainer!.teachingPath!.localeId;

      if (typeof(localeId) === 'undefined' || localeId === null) {
        if (!isPrivate) {
          Notification.create({
            type: NotificationTypes.ERROR,
            title: intl.get('edit_teaching_path.header.language_required')
          });
          return;
        }
        const currentLang = LANGUAGES.find(i => i.shortName === localStorage.getItem('currentLocale'))!;
        editTeachingPathStore!.teachingPathContainer!.teachingPath!.setLocaleId(currentLang.langId);
      }
    }

    if (userType === UserType.ContentManager && !isPrivate && displayInOpenSite) {
      const listItemAssignment: Array<TeachingPathItem> = this.getListOfAssignmentsWithoutRepeat(editTeachingPathStore!.teachingPathContainer!.teachingPath!);
      const cantAssigments = listItemAssignment.length;

      if (cantAssigments > 0) {
        if (continueValidateOpenAssignments) {

          cantAssigmentsResp = 0;
          listItemAssignmentResp = [];

          this.validateIfExistsOpenAssignments(onlyPublish, true, listItemAssignment);
          return;
        }
        let cantAssigmentsOpen = 0;
        continueValidateOpenAssignments = true;

        let msjNotExistsEnabledOpenSite: string = intl.get('edit_teaching_path.header.assignmets_not_enabled_open_site');
        let msjAssigments: string = '<ul style="list-style-type:disc;margin:8px 0px 8px 20px; ">';

        listItemAssignmentResp.forEach((assig: Assignment) => {
          if (assig.open) {
            cantAssigmentsOpen += 1;
          } else {
            msjAssigments += `<li>${assig.title}</li>`;
          }
        });

        msjAssigments += '</ul>';
        msjNotExistsEnabledOpenSite = msjNotExistsEnabledOpenSite.replace('[|content|]', msjAssigments);

        if (cantAssigments !== cantAssigmentsOpen) {
          const isDisplayInOpenSite = await Notification.create({
            type: NotificationTypes.CONFIRM,
            title: msjNotExistsEnabledOpenSite,
            isTitleHTML: true,
            hideIcon: true,
            submitButtonTitle: intl.get('notifications.yes'),
            cancelButtonTitle: intl.get('notifications.no')
          });

          if (!isDisplayInOpenSite) {
            return;
          }
        }
      }
    }

    try {
      await editTeachingPathStore!.publish();
      /* console.log('ssdfdsfsdfdsfd'); */

     /*  const url: string = localStorage!.getItem('url') !== null ? localStorage!.getItem('url')!.toString().split('?')[1] : ''; */
      Notification.create({
        type: NotificationTypes.SUCCESS,
        title: intl.get('edit_teaching_path.header.after_publishing')
      });
      if (userType === UserType.Teacher) {
        /* if (onlyPublish) {
          console.log('publish!!!');
          console.log(url);
          this.props.history.push(`/teaching-paths/all?${url}`);
          localStorage.removeItem('url');
        } else {
          history.push(`/teaching-paths/edit/${id}/distribute`);
        } */
        onlyPublish ? history.push('/teaching-paths/all') : history.push(`/teaching-paths/edit/${id}/distribute`);
      }

      if (userType === UserType.ContentManager) {
        history.push('/teaching-paths/all');
        /* this.props.history.push(`/teaching-paths/all?${url}`);
        localStorage.removeItem('url'); */
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

  private validateIfExistsOpenAssignments = (onlyPublish: boolean, isFirstCall: boolean, listItemAssignment: Array<TeachingPathItem>) => {
    const { editTeachingPathStore } = this.props;

    if (isFirstCall) {
      listItemAssignment.forEach((assig: any) => {
        editTeachingPathStore!.getAssignmentById(assig.value!.id).then((itemAssignment) => {
          listItemAssignmentResp.push(itemAssignment);
        });
      });

      setTimeout(() => { this.validateIfExistsOpenAssignments(onlyPublish, false, listItemAssignment); }, waitTimeOut);
    } else {
      if (listItemAssignmentResp!.length === listItemAssignment!.length) {
        continueValidateOpenAssignments = false;
        this.ref.current!.click();
      } else {
        setTimeout(() => { this.validateIfExistsOpenAssignments(onlyPublish, false, listItemAssignment); }, waitTimeOut);
      }
    }
  }

  private onDistribute = async () => {
    /* console.log('distribute'); */
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
    const { isCreation, isPublishing, isDistribution, teachingPathsListStore, history } = this.props;
    const searchvalue = history.location.search;
    if (searchvalue) {
      if (isCreation) {
        history.push({
          pathname: `/teaching-paths/${teachingPathsListStore!.typeOfTeachingPathsList}`,
          search: searchvalue
        });
      }
      if (isPublishing) {
        history.push({
          pathname: `/teaching-paths/edit/${this.props.match.params.id}`,
          search: searchvalue
        });
      }
      if (isDistribution) {
        history.push({
          pathname: `/teaching-paths/edit/${this.props.match.params.id}/publish`,
          search: searchvalue
        });
      }

    } else {
      if (isCreation) {
        this.props.history.push(`/teaching-paths/${teachingPathsListStore!.typeOfTeachingPathsList}`);
        /* const url: string = localStorage!.getItem('url') !== null ? localStorage!.getItem('url')!.toString().toString().split('?')[1] : '';
        this.props.history.push(`/teaching-paths/all?${url}`);
        localStorage.removeItem('url'); */
        /* localStorage.clear(); */
      }
      if (isPublishing) {
        this.props.history.push(`/teaching-paths/edit/${this.props.match.params.id}/`);
      }

      if (isDistribution) {
        this.props.history.push(`/teaching-paths/edit/${this.props.match.params.id}/publish`);
      }
    }
  }

  private renderDistributeButton = () => {
    const { editTeachingPathStore } = this.props;
    const currentUser = editTeachingPathStore!.getCurrentUser()!;
    const userType = currentUser!.type;
    const isteacherTrial = currentUser!.teacherTrial;

    if (userType !== UserType.ContentManager) {
      if (!isteacherTrial) {
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
  }

  public handlePreview = () => {
    const { id, history } = this.props;
    const win = window.open(`/teaching-path/preview/${id}`, '_blank');
    win!.focus();
  }

  public renderButtonPreview = () => (
    <CreateButton
      className="viewInFlex"
      onClick={this.handlePreview}
      title={intl.get('preview.teaching_path.buttons.viewstudent')}
    >
      {intl.get('preview.teaching_path.buttons.viewstudent')}
    </CreateButton>
  )

  public renderFunctionalSide = () => {
    const { isCreation, isDistribution, isPublishing, editTeachingPathStore, teachingPathsListStore } = this.props;
    const isPublish = (editTeachingPathStore!.getPublishAt().length > 0) ? true : false;
    if (isCreation) {
      return (
        <>
          <span>{this.checkUpdatedAt()}</span>
          {isPublish && this.renderButtonPreview()}
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
      <div className="header creationHeader flexBox spaceBetween alignCenter fw500">
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
