import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { EvaluationLabel } from 'components/common/EvaluationLabel/EvaluationLabel';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
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

interface Props extends RouteComponentProps {
  view?: string;
  store?: AssignmentListStore;
  isPublishedCurrentAssignment?: boolean;
  onClose?(e: SyntheticEvent): void;
}

interface SideOutPanelPreviewState {
  currentAssignment: undefined | Assignment;
  isSuperCMCurrentUser: boolean;
}

export const USER_SERVICE = 'ASSIGNMENT_SERVICE';

@observer
class SideOutPanelPreviewAssignmentComponent extends Component<Props & RouteComponentProps, SideOutPanelPreviewState> {
  private assignmentService: AssignmentService = injector.get(ASSIGNMENT_SERVICE);

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

  public renderViewButton = (isPublished: boolean, history: any, id: number, view: string) =>
  (
    <div className="actionButton">
      <CreateButton disabled={!isPublished} onClick={() => { history.push(`/assignments/view/${id}`); }} title={view} >
        {view}
      </CreateButton>
    </div>
  )

  public renderTeacherGuidanceButton = (guidanceString: string) =>
  (
    <div className="actionButton">
      <CreateButton disabled={false} onClick={this.handleTeacherGuidance} title={guidanceString} >
        {guidanceString}
      </CreateButton>
    </div>
  )

  public renderEditButton = (editString: string, history: any, id: number) =>
  (
    <div className="actionButton">
      <CreateButton disabled={false} onClick={() => { history.push(`/assignments/edit/${id}`); }} title={editString} >
        {editString}
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

  /* public renderGrepSubjects = () =>
  (
    <div className="entityInfoBlock">
      <div className="image">
        <img className="imgInfo" src={subject} />
      </div>
      <div>
        <div className="title">{'Subject'}</div>
        <div>
          <ul className="listItem">
            <li className="item">
              {'Science'}
            </li>
            <li className="item">
              {'Health'}
            </li>
            <li className="item">
              {'Mathematics'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  ) */

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
      <div className="image">
        <img className="imgInfo" src={subject} />
      </div>
      <div>
        <div className="title">{'Subject'}</div>
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
      <div className="image">
        <img className="imgInfo" src={coreElement} />
      </div>
      <div>
        <div className="title">{'Core Element'}</div>
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
      <div className="image">
        <img className="imgInfo" src={multiSubject} />
      </div>
      <div>
        <div className="title">{'Multidisciplinary subjects'}</div>
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
      <div className="image">
        <img className="imgInfo" src={source} />
      </div>
      <div>
        <div className="title">{'Source'}</div>
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

  public renderGrepEducationalGoals = (goalsArray: Array<GenericGrepItem>) =>
  (
    <>
      <div className="entityInfoBlockExpanded">
        <div className="image">
          <img className="imgInfo" src={goals} />
        </div>
        <div className="title">{'Educational goals'}</div>
      </div>
      <div className="flexContainer">
        <ul className="listItem">
          {this.renderGoalsArray(goalsArray)}
        </ul>

      </div>
    </>
  )

  public render() {
    const { currentAssignment } = this.props.store!;
    const { isSuperCMCurrentUser } = this.state;
    const
      {
        title,
        isPublished,
        isOwnedByMe,
        id,
        subjectItems,
        coreElementItems,
        sourceItems,
        multiSubjectItems,
        goalsItems,
        description,
        deadline,
        author,
        numberOfQuestions,
        hasGuidance,
        isAnswered,
        createdAt,
        ownedByMe,
        /* view */
      } = currentAssignment!;
    const isPassedDeadline = moment(createdAt).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD');
    const disableViewButton = (!isAnswered && isPassedDeadline) || !isPassedDeadline;
    /* const { currentAssignment: { id } } = this.props.store!; */
    const { history, isPublishedCurrentAssignment, view } = this.props;
    const viewText = currentAssignment instanceof Assignment ? 'View assignment' : 'View teaching path';
    const guidanceText = currentAssignment instanceof Assignment ? 'Teacher guidance' : 'Teacher guidance';
    const editText = currentAssignment instanceof Assignment ? 'Edit' : 'Edit';
    const duplicateText = currentAssignment instanceof Assignment ? 'Duplicate' : 'Duplicate';

    const selectedAssignment: Assignment = this.state.currentAssignment!;

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
          <input type="text" aria-labelledby="aux1" autoFocus className="hidden" />
          <div className="entityInfo">
            <div className="partsInfo">
              <img src={question} alt="question" />
              {numberOfQuestions ? numberOfQuestions : 'No'} questions
            </div>
            <div className="partsInfo">
              <img src={person} alt="question" />
              By {author ? author : ''}
            </div>
            <div className="partsInfo">
              <img src={date} alt="date" />
              {isPassedDeadline ? intl.get('answers.past') : `${moment(deadline).format(deadlineDateFormat)}`}
            </div>
          </div>
          <div className="entityDescription">

            <div className="partsInfo">
              {description ? description : ''}
              {/* Bli med på innsiden av kroppens immunsystem – ditt eget fantastiske forsvarsverk som holder deg frisk og rask. */}
            </div>
          </div>

          <div className="summary">
            {this.renderGrepSubjectsArray(subjectItems)}
            {this.renderGrepCoreElements(coreElementItems)}
            {this.renderGrepMultiSubjects(multiSubjectItems)}
            {this.renderGrepSources(sourceItems)}
            {this.renderGrepEducationalGoals(goalsItems)}
          </div>
        </div >

        <div className="footerButtons">
          {isPublishedCurrentAssignment! && (view === 'show' || view === 'edit') && this.renderViewButton(isPublishedCurrentAssignment!, history, id, viewText)}
          {hasGuidance && this.renderTeacherGuidanceButton(guidanceText)}
          {(view === 'edit') && this.renderEditButton(editText, history, id)}
          {isPublishedCurrentAssignment! && this.renderDuplicateButton(duplicateText)}

        </div>
      </div >
    );
  }

}

export const SideOutPanelPreviewAssignment = withRouter(SideOutPanelPreviewAssignmentComponent);
