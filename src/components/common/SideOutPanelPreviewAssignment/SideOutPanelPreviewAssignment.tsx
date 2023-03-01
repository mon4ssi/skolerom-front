import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { EvaluationLabel } from 'components/common/EvaluationLabel/EvaluationLabel';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { Assignment, GenericGrepItem, Subject } from 'assignment/Assignment';

import { deadlineDateFormat, thirdLevel } from 'utils/constants';

import clock from 'assets/images/clock.svg';
import close from 'assets/images/close.svg';

import question from 'assets/images/questions.svg';
import article from 'assets/images/article.svg';
import person from 'assets/images/person.svg';
import date from 'assets/images/date.svg';
import subject from 'assets/images/tags.svg';
import coreElement from 'assets/images/core.svg';
import multiSubject from 'assets/images/cogs.svg';
import source from 'assets/images/voice.svg';
import goals from 'assets/images/goals.svg';

import { TeachingPath, TeachingPathRepo, TEACHING_PATH_REPO } from 'teachingPath/TeachingPath';
import { injector } from 'Injector';
import { TeachingPathService, TEACHING_PATH_SERVICE } from 'teachingPath/service';
import { TeachingPathApi } from 'teachingPath/api';
import { UserType } from 'user/User';
import { Notification, NotificationTypes } from '../Notification/Notification';

import './SideOutPanelPreviewAssignment.scss';
import { AssignmentService, ASSIGNMENT_SERVICE } from 'assignment/service';
import { UserService } from 'user/UserService';

interface Props extends RouteComponentProps {
  canEditOrDeleteValue?: boolean;
  view?: string;
  store?: AssignmentListStore;
  newAssignmentStore?: NewAssignmentStore;
  isPublishedCurrentAssignment?: boolean;
  onClose?(e: SyntheticEvent): void;
}

interface SideOutPanelPreviewState {
  currentAssignment: undefined | Assignment;
  isSuperCMCurrentUser: boolean;
}

export const USER_SERVICE = 'USER_SERVICE';
@inject('newAssignmentStore')
@observer
class SideOutPanelPreviewAssignmentComponent extends Component<Props & RouteComponentProps, SideOutPanelPreviewState> {
  private assignmentService: AssignmentService = injector.get(ASSIGNMENT_SERVICE);
  private userService: UserService = injector.get<UserService>(USER_SERVICE);

  public state = {
    currentAssignment: undefined,
    isSuperCMCurrentUser: false,
  };

  private onClose = (e: SyntheticEvent) => {
    if (this.props.onClose) {
      this.props.onClose(e);
    }
  }

  public componentDidMount = () => {
    const { getCurrentUser } = this.props.store!;
    const isSuperCM = getCurrentUser()!.isSuperCM;
    this.setState({ isSuperCMCurrentUser: isSuperCM! });
  }

  public openInNewTabView = () => {
    const { currentEntity: { id } } = this.props.store!;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/assignments/view/${id!}`;
    window.open(urlForEditing);
  }

  public renderViewButton = (isPublished: boolean, history: any, id: number, view: string) =>
  (
    <div className="actionButton">
      <CreateButton disabled={!isPublished} onClick={() => this.openInNewTabView()} autoFocus title={view} >
        {view}
      </CreateButton>
    </div>
  )

  public checkForPåbygging = () => {
    const goalsList = this.props.store!.currentAssignment!.goalsItems;
    let counter = 0;
    goalsList.forEach((goal) => {
      if (goal.gradeDesc!.includes('påbygging')) {
        counter = counter + 1;
      }
    });
    const foundString = counter > 0 ? true : false;
    return foundString;
  }

  public openInNewTabTeacherGuidance = () => {
    const { currentEntity: { id } } = this.props.store!;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/assignments/view/${id!}/?open=tg`;
    localStorage.setItem('isOpen', 'tg');
    window.open(urlForEditing);
  }

  public renderTeacherGuidanceButton = (guidanceString: string) =>
  (
    <div className="actionButton">
      <CreateButton disabled={false} onClick={() => this.openInNewTabTeacherGuidance()} title={guidanceString} >
        {guidanceString}
      </CreateButton>
    </div>
  )

  public openInNewTabEdit = (id: number) => {
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/assignments/edit/${id}`;
    window.open(urlForEditing);
  }

  public renderEditButton = (editString: string, history: any, id: number) =>
  (
    <div className="actionButton">
      <CreateButton disabled={false} onClick={() => { this.openInNewTabEdit(id); }} title={editString} >
        {editString}
      </CreateButton>
    </div>
  )

  public renderDistributeButton = (duplicateString: string) =>
  (
    <div className="actionButton">
      <CreateButton disabled={false} onClick={this.handleCopyDistribute} title={duplicateString} >
        {duplicateString}
      </CreateButton>
    </div>
  )

  public renderDuplicateButton = (duplicateString: string) =>
  (
    <div className="actionButton">
      <CreateButton disabled={false} onClick={this.handleCopy} title={duplicateString} >
        {duplicateString}
      </CreateButton>
    </div>
  )

  public stopPropagation = (e: SyntheticEvent) => {
    e.stopPropagation();
  }

  public handleTeacherGuidance = async () => {
    /* console.log('e'); */
    const { history } = this.props;
    const { currentEntity: { id } } = this.props.store!;
    localStorage.setItem('isOpen', 'tg');
    history.push(`/assignments/view/${id!}?open=tg`);
    /* currentEntity!.hasGuidance */
  }

  public handleCopy = async () => {
    const { history } = this.props;
    const { currentEntity: { id } } = this.props.store!;
    const { currentEntity } = this.props.store!;
    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.copy')
    });

    if (isCopyApproved) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      const copyId = await this.assignmentService.copyAssignment(id!);
      history.push(`/assignments/edit/${copyId}`);
    }
  }

  public handleCopyDistribute = async () => {
    const { history } = this.props;
    const { currentEntity: { id } } = this.props.store!;
    const { currentEntity } = this.props.store!;

    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('preview.teaching_path.buttons.distribuir')
    });

    if (isCopyApproved) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      const copyId = await this.assignmentService.copyAssignment(id!, true);
      const teachingPath = await this.props.newAssignmentStore!.getAssigmentForEditing(copyId);
      await this.props.newAssignmentStore!.save();
      await this.props.newAssignmentStore!.publish();
      history.push(`/assignments/edit/${copyId}/distribute`);
    }
  }

  public renderSubjectArray = (subjectsArray: Array<any>) => (
    subjectsArray.map(item => (
      <li key={item.id} className="item">
        {item.description || item.title}
      </li>
    ))
  )

  // Using any for this array of subjects just for avoid bugs in another functionalities *pending to measure its impact
  public renderGrepSubjectsArray = (subjectsArray: Array<any>) =>
  (
    <div className="entityInfoBlock">
      <div className="imageGrep">
        <img className="imgInfo" src={subject} />
      </div>
      <div>
        <div className="title">{intl.get('preview.assignment.grep.subjects')}</div>
        <div>
          <ul className="listItem">
            {this.renderSubjectArray(subjectsArray)}
          </ul>
        </div>
      </div>
    </div>
  )

  public renderCoreElementsArray = (coreElementsArray: Array<GenericGrepItem>) => (
    coreElementsArray.length !== 0 ?
      coreElementsArray.map(item => (
        <li key={item.id} className="item">
          {item.description}
        </li>
      )) :
      (
        <li className="item">
          {'Ingen data'}
        </li>
      )
  )

  public renderGrepCoreElements = (coreElementsArray: Array<GenericGrepItem>) =>
  (
    <div className="entityInfoBlock">
      <div className="imageGrep">
        <img className="imgInfo" src={coreElement} />
      </div>
      <div>
        <div className="title">{intl.get('preview.assignment.grep.core_elements')}</div>
        <div>
          <ul className="listItem">
            {this.renderCoreElementsArray(coreElementsArray)}
          </ul>
        </div>
      </div>
    </div>
  )

  public renderMultidisciplinarySubjectsArray = (multiSubjectsArray: Array<GenericGrepItem>) => (
    multiSubjectsArray.length !== 0 ?
      multiSubjectsArray.map(item => (
        <li key={item.id} className="item">
          {item.description}
        </li>
      )) :
      (
        <li className="item">
          {'Ingen data'}
        </li>
      )
  )

  public renderGrepMultiSubjects = (multiSubjectsArray: Array<GenericGrepItem>) =>
  (
    <div className="entityInfoBlock">
      <div className="imageGrep">
        <img className="imgInfo" src={multiSubject} />
      </div>
      <div>
        <div className="title">{intl.get('preview.assignment.grep.multidisciplinary_subjects')}</div>
        <div>
          <ul className="listItem">
            {this.renderMultidisciplinarySubjectsArray(multiSubjectsArray)}
          </ul>
        </div>
      </div>

    </div>
  )

  public renderSourcesArray = (sourcesArray: Array<GenericGrepItem>) => (
    sourcesArray.length !== 0 ?
      sourcesArray.map(item => (
        <li key={item.id} className="item">
          {item.description}
        </li>
      )) :
      (
        <li className="item">
          {'Ingen data'}
        </li>
      )
  )

  public renderGrepSources = (sourcesArray: Array<GenericGrepItem>) =>
  (
    <div className="entityInfoBlock">
      <div className="imageGrep">
        <img className="imgInfo" src={source} />
      </div>
      <div>
        <div className="title">{intl.get('preview.assignment.grep.sources')}</div>
        <div>
          <ul className="listItem">
            {this.renderSourcesArray(sourcesArray)}
          </ul>
        </div>
      </div>
    </div>
  )

  public renderGoalsArray = (goalsArray: Array<GenericGrepItem>) => (
    goalsArray.map(item => (
      <li key={item.id} className="itemExpanded">
        <div className="goalGrade">
          {item.gradeDesc}
        </div>
        <div className="goalDescription">
          {item.description}
        </div>
      </li>
    ))
  )

  public renderGrepEducationalGoals = (goalsArray: Array<GenericGrepItem>) => {
    const expandedStyle: boolean = this.checkForPåbygging();
    return (
      <>
        <div className="entityInfoBlockExpanded">
          <div className="imageGrep">
            <img className="imgInfo" src={goals} />
          </div>
          <div className="title">{intl.get('preview.assignment.grep.educational_goals')}</div>
        </div>
        <div className={expandedStyle ? 'flexContainerExpanded' : 'flexContainer'}>
          <ul className="listItem">
            {this.renderGoalsArray(goalsArray)}
          </ul>
        </div>
      </>
    );
  }

  public renderPublishDate = (createdAt: string) =>
  (
    <div className="partsInfo">
      <img src={date} alt="date" />
      {`${moment(createdAt).format(deadlineDateFormat)}`}
    </div>
  )

  public render() {
    const { currentAssignment } = this.props.store!;
    const { isSuperCMCurrentUser } = this.state;
    const
      {
        title,
        id,
        subjectItems,
        coreElementItems,
        sourceItems,
        multiSubjectItems,
        goalsItems,
        description,
        publishedAt,
        deadline,
        author,
        authorRole,
        numberOfQuestions,
        hasGuidance,
        isAnswered,
        isPublished,
        isMySchool,
        isPrivate,
        createdAt,
      } = currentAssignment!;
    const { history, isPublishedCurrentAssignment, view, store, canEditOrDeleteValue } = this.props;
    /* const showPublishDate = this.userService.getCurrentUser()!.type === UserType.ContentManager; */
    const showPublishDate = authorRole === UserType.Teacher || !(authorRole === UserType.ContentManager && !(isPrivate!));
    const viewText = intl.get('preview.assignment.buttons.view');
    const guidanceText = intl.get('preview.assignment.buttons.teacher_guidance');
    const editText = intl.get('preview.assignment.buttons.edit');
    const duplicateText = intl.get('preview.assignment.buttons.duplicate');
    const distributeText = intl.get('preview.teaching_path.buttons.distribuir');
    const activeGoals = !isPrivate || isMySchool;
    const selectedAssignment: Assignment = this.state.currentAssignment!;
    const expandedStyle: boolean = this.checkForPåbygging();
    return (
      <div className={'previewModalInfo'} onClick={this.stopPropagation} tabIndex={0}>
        <div className="contentContainer">
          <div className="close-panel">
            <img
              src={close}
              alt="close"
              className="close-button"
              onClick={this.onClose}
            />
          </div>
          <div className={'headerPanel'}>
            <div className="imageBlock">
              <div className={'shadow'} />
              {/* <img src={featuredImage ? featuredImage : bg} alt="img" className={'imagePlaceholder'}/> */}
            </div>
            <div className={'subjectInfo'}>
              <div className={'entityTitle'}>{title}</div>
            </div>
          </div>
          <div id="aux1" className="hidden">Not name</div>
          <input type="text" aria-labelledby="aux1" className="hidden" />
          <div className="entityInfo">
            <div className="partsInfo">
              <img src={question} alt="question" />
              {numberOfQuestions ? numberOfQuestions : intl.get('preview.assignment.headers.no')} {`${intl.get('preview.assignment.headers.questions')}`}
            </div>
            <div className="partsInfo">
              <img src={person} alt="question" />
              {`${intl.get('preview.assignment.headers.by')}`} {author ? author : ''}
            </div>
            {showPublishDate && this.renderPublishDate(createdAt)}
          </div>
          <div className="entityDescription">

            <div className="partsInfoDescription">
              {description ? description : ''}
              {/* Bli med på innsiden av kroppens immunsystem – ditt eget fantastiske forsvarsverk som holder deg frisk og rask. */}
            </div>
          </div>

          <div className="summary">
            {this.renderGrepSubjectsArray(subjectItems)}
            {this.renderGrepCoreElements(coreElementItems)}
            {this.renderGrepMultiSubjects(multiSubjectItems)}
            {this.renderGrepSources(sourceItems)}
            {activeGoals && this.renderGrepEducationalGoals(goalsItems)}
          </div>
        </div >

        <div className="footerButtons footerButtonsAssignments">
          {isPublishedCurrentAssignment && (true || view === 'show' || view === 'edit') && this.renderViewButton(isPublishedCurrentAssignment!, history, id, viewText)}
          {hasGuidance && this.renderTeacherGuidanceButton(guidanceText)}
          {canEditOrDeleteValue && this.renderEditButton(editText, history, id)}
          {(isPublishedCurrentAssignment! || isMySchool) && this.renderDuplicateButton(duplicateText)}
          {this.userService.getCurrentUser()!.type === UserType.Teacher && (isPublishedCurrentAssignment! || isMySchool) && this.renderDistributeButton(distributeText)}

        </div>
      </div >
    );
  }

}

export const SideOutPanelPreviewAssignment = withRouter(SideOutPanelPreviewAssignmentComponent);
