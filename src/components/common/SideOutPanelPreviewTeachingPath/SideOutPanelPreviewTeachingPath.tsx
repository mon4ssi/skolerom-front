import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { EvaluationLabel } from 'components/common/EvaluationLabel/EvaluationLabel';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { Assignment, GenericGrepItem, Subject } from 'assignment/Assignment';

import { deadlineDateFormat, thirdLevel } from 'utils/constants';

import clock from 'assets/images/clock.svg';
import close from 'assets/images/close.svg';

import steps from 'assets/images/teaching-path.svg';
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

import './SideOutPanelPreviewTeachingPath.scss';
import { UserService } from 'user/UserService';
import { Url } from 'url';

interface Props extends RouteComponentProps {
  view: string;
  currentCanEditOrDelete?: boolean;
  store?: TeachingPathsListStore;
  isPublishedCurrentTeachingPath?: boolean;
  editTeachingPathStore?: EditTeachingPathStore;
  onClose?(e: SyntheticEvent): void;
}

interface SideOutPanelPreviewState {
  currentTeachingPath: undefined | TeachingPath;
}

export const USER_SERVICE = 'USER_SERVICE';
@inject('editTeachingPathStore')
@observer
class SideOutPanelPreviewTeachingPathComponent extends Component<Props & RouteComponentProps, SideOutPanelPreviewState> {
  private teachingPathService: TeachingPathService = injector.get(TEACHING_PATH_SERVICE);
  private userService: UserService = injector.get<UserService>(USER_SERVICE);

  public state = {
    currentTeachingPath: undefined,
  };

  private onClose = (e: SyntheticEvent) => {
    if (this.props.onClose) {
      this.props.onClose(e);
    }
  }

  public openInNewTabView = () => {
    const { currentEntity: { id } } = this.props.store!;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-paths/view/${id!}`;
    window.open(urlForEditing);
  }

  public openInNewTabPreView = () => {
    const { currentEntity: { id } } = this.props.store!;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-path/preview/${id!}`;
    window.open(urlForEditing);
  }

  public renderViewButton = (isPublished: boolean, history: any, id: number, view: string) =>
  (
    <div className="actionButton">
      <CreateButton disabled={!isPublished} onClick={() => this.openInNewTabView()} title={view} autoFocus>
        {view}
      </CreateButton>
    </div>
  )

  public renderPreviewButon = (isPublished: boolean, id: number, view: string) => (
    <div className="actionButton">
      <CreateButton disabled={!isPublished} onClick={() => this.openInNewTabPreView()} title={view}>
        {view}
      </CreateButton>
    </div>
  )

  public checkForPåbygging = () => {
    const goalsList = this.props.store!.currentEntity!.goalsItems;
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
    const urlForEditing: string = `${url.origin}/teaching-paths/view/${id!}/tg=true`;
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
    const urlForEditing: string = `${url.origin}/teaching-paths/edit/${id}`;
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

  public renderDuplicateButton = (duplicateString: string) =>
  (
    <div className="actionButton">
      <CreateButton disabled={false} onClick={this.handleCopy} title={duplicateString} >
        {duplicateString}
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

  public stopPropagation = (e: SyntheticEvent) => {
    e.stopPropagation();
  }

  public handleTeacherGuidance = async () => {
    /* console.log('e'); */
    const { history } = this.props;
    const { currentEntity: { id } } = this.props.store!;
    history.push(`/teaching-paths/view/${id!}/tg=true`);
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
      const copyId = await this.teachingPathService.copyTeachingPath(id!);
      history.push(`/teaching-paths/edit/${copyId}`);
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
      const copyId = await this.teachingPathService.copyTeachingPath(id!, true);
      const teachingPath = await this.props.editTeachingPathStore!.getTeachingPathForEditing(copyId);
      await this.props.editTeachingPathStore!.save();
      await this.props.editTeachingPathStore!.publish();
      this.props.editTeachingPathStore!.setIsDisabledButtons();
      history.push(`/teaching-paths/edit/${copyId}/distribute`);
    }
  }

  public renderSubjectArray = (subjectsArray: Array<any>) => (
    subjectsArray.map(item => (
      <li key={item.id} className="item">
        {item.description}
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
        <div className="title">{intl.get('preview.teaching_path.grep.subjects')}</div>
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
        <div className="title">{intl.get('preview.teaching_path.grep.core_elements')}</div>
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
        <div className="title">{intl.get('preview.teaching_path.grep.multidisciplinary_subjects')}</div>
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
        <div className="title">{intl.get('preview.teaching_path.grep.sources')}</div>
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
          <div className="title">{intl.get('preview.teaching_path.grep.educational_goals')}</div>
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
    const { currentEntity } = this.props.store!;
    const
      {
        title,
        ownedByMe,
        createdAt,
        subjectItems,
        coreElementItems,
        sourceItems,
        multiSubjectItems,
        numberOfSteps,
        goalsItems,
        description,
        author,
        authorRole,
        isPrivate,
        numberOfQuestions,
        hasGuidance,
        numberOfArticles,
        isMySchool,
      } = currentEntity;
    const { currentEntity: { id } } = this.props.store!;
    const { history, isPublishedCurrentTeachingPath, view, currentCanEditOrDelete } = this.props;
    /* const showPublishDate = this.userService.getCurrentUser()!.type === UserType.ContentManager; */
    const showPublishDate = authorRole === UserType.Teacher || !(authorRole === UserType.ContentManager && !(isPrivate!));
    const viewText = intl.get('preview.teaching_path.buttons.view');
    const viewStudentText = intl.get('preview.teaching_path.buttons.viewstudent');
    const guidanceText = intl.get('preview.teaching_path.buttons.teacher_guidance');
    const editText = intl.get('preview.teaching_path.buttons.edit');
    const duplicateText = intl.get('preview.teaching_path.buttons.duplicate');
    const distributeText = intl.get('preview.teaching_path.buttons.distribuir');
    const activeGoals = !isPrivate || isMySchool;
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
              <img src={steps} alt="question" />
              {numberOfSteps.min === numberOfSteps.max ? `${numberOfSteps.min}` : `${numberOfSteps.min}-${numberOfSteps.max}`} {`${intl.get('preview.teaching_path.headers.steps')}`}
            </div>
            <div className="partsInfo">
              <img src={article} alt="question" />
              {numberOfArticles ? numberOfArticles : intl.get('preview.teaching_path.headers.no')} {`${intl.get('preview.teaching_path.headers.articles')}`}
            </div>
            <div className="partsInfo">
              <img src={person} alt="question" />
              {`${intl.get('preview.teaching_path.headers.by')}`} {author ? author : ''}
            </div>
            {showPublishDate && this.renderPublishDate(createdAt)}
          </div>
          <div className="entityDescription">
            <div className="partsInfoDescription">
              {description ? description : ''}
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

        <div className="footerButtons">
          {isPublishedCurrentTeachingPath! && (view === 'show' || view === 'edit') && this.renderViewButton(isPublishedCurrentTeachingPath!, history, id, viewText)}
          {hasGuidance && this.renderTeacherGuidanceButton(guidanceText)}
          {currentCanEditOrDelete && this.renderEditButton(editText, history, id)}
          {isPublishedCurrentTeachingPath! && this.renderDuplicateButton(duplicateText)}
          {this.userService.getCurrentUser()!.type === UserType.Teacher && isPublishedCurrentTeachingPath! && this.renderDistributeButton(distributeText)}
          {isPublishedCurrentTeachingPath! && this.renderPreviewButon(isPublishedCurrentTeachingPath!, id, viewStudentText)}
        </div>
      </div >
    );
  }

}

export const SideOutPanelPreviewTeachingPath = withRouter(SideOutPanelPreviewTeachingPathComponent);
