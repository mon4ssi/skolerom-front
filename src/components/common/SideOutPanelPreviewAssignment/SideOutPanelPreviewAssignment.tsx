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
import { Assignment, GenericGrepItem, Subject, LenguajesC } from 'assignment/Assignment';

import { deadlineDateFormat, thirdLevel, LANGUAGESC } from 'utils/constants';

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
import deleteImg from 'assets/images/trash-tp.svg';
import editImg from 'assets/images/edit-tp.svg';
import lang from 'assets/images/lang.svg';

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
  modalPreview: boolean;
  modalFunction: boolean;
  modalInsideView: boolean;
  modalInsidePreview: boolean;
  modalInsideEdit: boolean;
  modalInsideEditTeacher: boolean;
  modalInsideEditTeacherDistribute: boolean;
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
    modalPreview: false,
    modalFunction: false,
    modalInsideView: false,
    modalInsidePreview: false,
    modalInsideEdit: false,
    modalInsideEditTeacher: false,
    modalInsideEditTeacherDistribute: false
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
      <button disabled={!isPublished} onClick={() => this.openInNewTabView()} autoFocus title={view} >
        {view}
      </button>
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
      <button disabled={false} onClick={() => this.openInNewTabTeacherGuidance()} title={guidanceString} >
        {guidanceString}
      </button>
    </div>
  )

  public renderTeacherGuidanceButtonList = (guidanceString: string) =>
  (
    <li>
      <a href="javascript:void(0)" className="linkOpenSite LinkRollback" onClick={this.openInNewTabTeacherGuidance}>
        {guidanceString}
      </a>
    </li>
  )

  public openInNewTabEdit = (id: number) => {
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/assignments/edit/${id}`;
    window.open(urlForEditing);
  }

  public renderEditButton = (editString: string, history: any, id: number) =>
  (
    <div className="actionButton">
      <button disabled={false} onClick={() => { this.openInNewTabEdit(id); }} title={editString} >
        {editString}
      </button>
    </div>
  )

  public renderEditButtonClass = (editString: string, history: any, id: number) =>
  (
    <div className="actionButton actionboldButton">
      <button disabled={false} onClick={() => { this.openInNewTabEdit(id); }} title={editString} >
        {editString}
      </button>
    </div>
  )

  public renderDistributeSelectButton = (duplicateString: string) => {
    const simpleClassView = (this.state.modalInsideEditTeacherDistribute) ? 'modalContentInside active' : 'modalContentInside';
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
        translations
      } = currentAssignment!;
    const { history, isPublishedCurrentAssignment, view, store, canEditOrDeleteValue } = this.props;
    const arrayLenguajes : Array<LenguajesC> = [];
    if (translations) {
      translations.forEach((t) => {
        if (Boolean(t.value)) {
          const id = t.id;
          const names = (LANGUAGESC.find(x => x.id === id)) ? LANGUAGESC.find(x => x.id === id)!.name : '';
          const LANG = { id: t.id , name: names, code: LANGUAGESC.find(x => x.id === id)!.name };
          arrayLenguajes.push(LANG);
        }
      });
    }
    const contentReturn = (langid: number, code: string) => (
      <div>
        <a
          href="javascript:void(0)"
          // tslint:disable-next-line: jsx-no-lambda
          onClick={() => this.setViewButtonCopyByLenguajeDistribute(id, langid)}
          title={intl.get('preview.teaching_path.buttons.editbutton')}
        >
            <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill-rule="evenodd"><path fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z" /></svg>
        </a>
      </div>
    );
    const renderLanguage = (language: { name: string, id: number, code: string }) => (
      <li
        className="itemListFlex"
        key={language.id}
      >
        <p>{language.name}</p>
        {contentReturn(language.id, language.code)}
      </li>
    );
    return (
      <div className="actionDistribute">
        <div className="actionButton">
          <button title={duplicateString} className="CreateButton" onClick={this.insidechangeEditFunctionTeacherDistribute}>{duplicateString}</button>
        </div>
        <div className={simpleClassView}>
          <ul>
            {arrayLenguajes.map(renderLanguage)}
          </ul>
        </div>
      </div>
    );
  }

  public renderDistributeButton = (duplicateString: string) =>
  (
    <div className="actionButton">
      <CreateButton disabled={false} onClick={this.handleCopyDistribute} title={duplicateString} >
        {duplicateString}
      </CreateButton>
    </div>
  )

  public renderDuplicateButton = (duplicateString: string, classDuplicate?: string) => {
    const classNametest = `actionButton ${classDuplicate}`;
    return (
      <div className={classNametest}>
        <button disabled={false} onClick={this.handleCopy} title={duplicateString} >
          {duplicateString}
        </button>
      </div>
    );
  }

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
      this.props.newAssignmentStore!.setIsDisabledButtons();
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

  public renderLangs = () => {
    const mytranslations = this.props.store!.currentAssignment!.translations;
    const arrayLenguajes : Array<LenguajesC> = [];
    if (mytranslations) {
      mytranslations.forEach((t) => {
        if (Boolean(t.value)) {
          const id = t.id;
          const names = (LANGUAGESC.find(x => x.id === id)) ? LANGUAGESC.find(x => x.id === id)!.name : '';
          const namesingle = (LANGUAGESC.find(x => x.id === id)) ? LANGUAGESC.find(x => x.id === id)!.name : '';
          const LANG = { id: t.id , name: names, code: namesingle };
          arrayLenguajes.push(LANG);
        }
      });
    }
    const renderPreviewLanguage = (language: { name: string, id: number }) => (
      <li
        key={language.id}
      >
        {language.name}
      </li>
    );
    return (
      <div className="partsInfo partsInfoAssignments">
        <img src={lang} alt="langs" />
        <ul>
          {arrayLenguajes.map(renderPreviewLanguage)}
        </ul>
      </div>
    );
  }

  public changeOpenpreview = () => {
    this.setState({ modalFunction: false });
    if (this.state.modalPreview) {
      this.setState({ modalPreview: false });
    } else {
      this.setState({ modalPreview: true });
    }
  }

  public changeOpenFunction = () => {
    this.setState({ modalPreview: false });
    if (this.state.modalFunction) {
      this.setState({ modalFunction: false });
    } else {
      this.setState({ modalFunction: true });
    }
  }

  public insidechangeOpenFunction = () => {
    if (this.state.modalInsideView) {
      this.setState({ modalInsideView: false });
    } else {
      this.setState({ modalInsideView: true });
    }
  }

  public insidePreviewchangeOpenFunction = () => {
    if (this.state.modalInsidePreview) {
      this.setState({ modalInsidePreview: false });
    } else {
      this.setState({ modalInsidePreview: true });
    }
  }

  public insidechangeEditFunctionTeacherDistribute = () => {
    if (this.state.modalInsideEditTeacherDistribute) {
      this.setState({ modalInsideEditTeacherDistribute: false });
    } else {
      this.setState({ modalInsideEditTeacherDistribute: true });
    }
  }

  public insidechangeEditFunction = () => {
    if (this.state.modalInsideEdit) {
      this.setState({ modalInsideEdit: false });
    } else {
      this.setState({ modalInsideEdit: true });
    }
  }

  public insidechangeEditFunctionTeacher = () => {
    if (this.state.modalInsideEditTeacher) {
      this.setState({ modalInsideEditTeacher: false });
    } else {
      this.setState({ modalInsideEditTeacher: true });
    }
  }

  public setViewButtonByLenguaje = (idlenguaje : number) => {
    const { currentEntity: { id } } = this.props.store!;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/assignments/view/${id!}?locale_id=${idlenguaje}`;
    window.open(urlForEditing);
  }

  public setViewButtonCopyByLenguaje = async (id: number, lenguajeid: number) => {
    const { history } = this.props;
    const { currentEntity } = this.props.store!;

    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.copy')
    });

    if (isCopyApproved) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      const copyId = await this.assignmentService.copyAssignmentByLocale(id!, lenguajeid, false);
      history.push(`/assignments/edit/${copyId}`);
    }
  }

  public setViewButtonCopyByLenguajeDistribute = async (id: number, lenguajeid: number) => {
    const { history } = this.props;
    const { currentEntity } = this.props.store!;

    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('preview.teaching_path.buttons.distribuir')
    });

    if (isCopyApproved) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      const copyId = await this.assignmentService.copyAssignmentByLocale(id!, lenguajeid, true);
      const teachingPath = await this.props.newAssignmentStore!.getAssigmentForEditing(copyId);
      await this.props.newAssignmentStore!.save();
      await this.props.newAssignmentStore!.publish();
      this.props.newAssignmentStore!.setIsDisabledButtons();
      history.push(`/assignments/edit/${copyId}/distribute`);
    }
  }

  public setViewButtonEditByLenguaje = (id: number, lenguajeid: number) => {
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/assignments/edit/${id}?locale_id=${lenguajeid}`;
    window.open(urlForEditing);
  }

  public setViewButtonAddByLenguaje = (id: number, lenguajeid: number) => {
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/assignments/edit/${id}?locale_id=${lenguajeid}&add=true`;
    window.open(urlForEditing);
  }

  public setViewButtonDeleteByLenguaje = async (id: number, lenguajeid: number) => {
    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure')
    });

    if (isCopyApproved) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      await this.assignmentService.deleteAssignmentTranslation(id, lenguajeid);
      window.location.reload();
    }
  }

  public setPreViewButtonByLenguaje = (idlenguaje : number) => {
    const { currentEntity: { id } } = this.props.store!;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-path/preview/${id!}?locale_id=${idlenguaje}`;
    window.open(urlForEditing);
  }

  public contentIn = () => {
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
    const viewText = intl.get('preview.assignment.buttons.view');
    const guidanceText = intl.get('preview.assignment.buttons.teacher_guidance');
    return (
      <div className="modalContent">
        {isPublishedCurrentAssignment && (true || view === 'show' || view === 'edit') && this.renderViewButton(isPublishedCurrentAssignment!, history, id, viewText)}
        {hasGuidance && this.renderTeacherGuidanceButton(guidanceText)}
      </div>
    );
  }

  public contentInCM = () => {
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
        translations,
        isTranslations,
        originalLocaleId
      } = currentAssignment!;
    const { history, isPublishedCurrentAssignment, view, store, canEditOrDeleteValue } = this.props;
    const viewText = intl.get('preview.assignment.buttons.view');
    const guidanceText = intl.get('preview.assignment.buttons.teacher_guidance');
    const arrayLenguajes : Array<LenguajesC> = [];
    if (translations) {
      translations.forEach((t) => {
        if (Boolean(t.value)) {
          const id = t.id;
          const names = (LANGUAGESC.find(x => x.id === id)) ? LANGUAGESC.find(x => x.id === id)!.name : '';
          const singlename = (LANGUAGESC.find(x => x.id === id)) ? LANGUAGESC.find(x => x.id === id)!.name : '';
          const LANG = { id: t.id , name: names, code: singlename };
          arrayLenguajes.push(LANG);
        }
      });
    }
    const renderLanguage = (language: { name: string, id: number }) => (
      <li
        className="itemList"
        key={language.id}
      >
        <a
          href="javascript:void(0)"
          // tslint:disable-next-line: jsx-no-lambda
          onClick={() => this.setViewButtonByLenguaje(language.id)}
        >
          {language.name}
        </a>
      </li>
    );
    const renderPreviewLanguage = (language: { name: string, id: number }) => (
      <li
        className="itemList"
        key={language.id}
      >
        <a
          href="javascript:void(0)"
          // tslint:disable-next-line: jsx-no-lambda
          onClick={() => this.setPreViewButtonByLenguaje(language.id)}
        >
          {language.name}
        </a>
      </li>
    );
    const simpleClassView = (this.state.modalInsideView) ? 'modalContentInside active' : 'modalContentInside';
    const simpleClassPreview = (this.state.modalInsidePreview) ? 'modalContentInside active' : 'modalContentInside';
    return (
      <div className="modalContent">
        <ul>
          <li>
            <a href="javascript:void(0)" className="linkOpenSite" onClick={this.insidechangeOpenFunction}>{viewText}</a>
            <div className={simpleClassView}>
              <h2><a href="javascript:void(0)" onClick={this.insidechangeOpenFunction}>{viewText}</a></h2>
              <ul>
                {arrayLenguajes.map(renderLanguage)}
              </ul>
            </div>
          </li>
          {hasGuidance && this.renderTeacherGuidanceButtonList(guidanceText)}
        </ul>
      </div>
    );
  }

  public renderDuplicateButtonTeacher = (duplicateString: string, arrayLenguajes: Array<LenguajesC>) => {
    const simpleClassView = (this.state.modalInsideEditTeacher) ? 'modalContentInside active' : 'modalContentInside';
    const { currentEntity: { id } } = this.props.store!;
    const contentReturn = (langid: number, code: string) => (
      <div>
        <a
          href="javascript:void(0)"
          // tslint:disable-next-line: jsx-no-lambda
          onClick={() => this.setViewButtonCopyByLenguaje(id, langid)}
          title={intl.get('preview.teaching_path.buttons.editbutton')}
        >
            <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill-rule="evenodd"><path fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z" /></svg>
        </a>
      </div>
    );
    const renderLanguage = (language: { name: string, id: number, code: string }) => (
      <li
        className="itemListFlex"
        key={language.id}
      >
        <p>{language.name}</p>
        {contentReturn(language.id, language.code)}
      </li>
    );
    return (
      <div>
        <div className="actionButton actionboldButton actionAfter">
          <button title={duplicateString} onClick={this.insidechangeEditFunctionTeacher}>{duplicateString}</button>
        </div>
        <div className={simpleClassView}>
          <h2><a href="javascript:void(0)" onClick={this.insidechangeEditFunctionTeacher}>{duplicateString}</a></h2>
          <ul>
            {arrayLenguajes.map(renderLanguage)}
          </ul>
        </div>
      </div>
    );
  }

  public contentIntwoCMTeacher = () => {
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
        translations,
        isTranslations,
        createdAt,
      } = currentAssignment!;
    const { history, isPublishedCurrentAssignment, view, store, canEditOrDeleteValue } = this.props;
    /* const showPublishDate = this.userService.getCurrentUser()!.type === UserType.ContentManager; */
    const showPublishDate = authorRole === UserType.Teacher || !(authorRole === UserType.ContentManager && !(isPrivate!));
    const guidanceText = intl.get('preview.assignment.buttons.teacher_guidance');
    const editText = intl.get('preview.assignment.buttons.edit');
    const duplicateText = intl.get('preview.assignment.buttons.duplicate');
    const simpleClassView = (this.state.modalInsideEdit) ? 'modalContentInside active' : 'modalContentInside';
    const arrayLenguajes : Array<LenguajesC> = [];
    if (translations) {
      translations.forEach((t) => {
        if (Boolean(t.value)) {
          const id = t.id;
          const names = (LANGUAGESC.find(x => x.id === id)) ? LANGUAGESC.find(x => x.id === id)!.name : '';
          const LANG = { id: t.id , name: names, code: LANGUAGESC.find(x => x.id === id)!.name };
          arrayLenguajes.push(LANG);
        }
      });
    }
    return (
      <div className="modalContent">
        {canEditOrDeleteValue && this.renderEditButtonClass(editText, history, id)}
        {(isPublishedCurrentAssignment! || isMySchool) && this.renderDuplicateButtonTeacher(duplicateText, arrayLenguajes)}
      </div>
    );
  }

  public contentIntwo = () => {
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
    const guidanceText = intl.get('preview.assignment.buttons.teacher_guidance');
    const editText = intl.get('preview.assignment.buttons.edit');
    const duplicateText = intl.get('preview.assignment.buttons.duplicate');
    return (
      <div className="modalContent">
        {canEditOrDeleteValue && this.renderEditButton(editText, history, id)}
        {(isPublishedCurrentAssignment! || isMySchool) && this.renderDuplicateButton(duplicateText)}
      </div>
    );
  }
  public contentIntwoCM = () => {
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
        translations,
        originalLocaleId
      } = currentAssignment!;
    const { history, isPublishedCurrentAssignment, view, store, canEditOrDeleteValue } = this.props;
    const guidanceText = intl.get('preview.assignment.buttons.teacher_guidance');
    const editText = intl.get('preview.assignment.buttons.edit');
    const duplicateText = intl.get('preview.assignment.buttons.duplicate');
    const simpleClassView = (this.state.modalInsideEdit) ? 'modalContentInside active' : 'modalContentInside';
    const arrayLenguajes : Array<LenguajesC> = [];
    if (translations) {
      translations.forEach((t) => {
        const id = t.id;
        if (LANGUAGESC.find(x => x.id === id)) {
          const valueConst = Boolean(t.value) ? 'active' : 'add';
          const singlename = (LANGUAGESC.find(x => x.id === id)) ? LANGUAGESC.find(x => x.id === id)!.name : '';
          const LANG = { id: t.id , name: singlename, code: valueConst };
          arrayLenguajes.push(LANG);
        }
      });
    }
    const contentReturn = (langid: number, code: string) => {
      if (code === 'active') {
        const deleteFunction = (langid: number) => {
          if (langid !== originalLocaleId) {
            return (
              <a
                href="javascript:void(0)"
                // tslint:disable-next-line: jsx-no-lambda
                onClick={() => this.setViewButtonDeleteByLenguaje(id, langid)}
              >
                <img src={deleteImg} />
              </a>
            );
          }
        };
        return (
          <div>
            <a
              href="javascript:void(0)"
              // tslint:disable-next-line: jsx-no-lambda
              onClick={() => this.setViewButtonEditByLenguaje(id, langid)}
              title={intl.get('preview.teaching_path.buttons.editbutton')}
            >
                <img src={editImg} />
            </a>
            {deleteFunction(langid)}
          </div>
        );
      }
      return (
        <div>
          <a
            href="javascript:void(0)"
            // tslint:disable-next-line: jsx-no-lambda
            onClick={() => this.setViewButtonAddByLenguaje(id, langid)}
            title={intl.get('preview.teaching_path.buttons.add')}
          >
            <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill-rule="evenodd"><path fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z" /></svg>
          </a>
        </div>
      );
    };
    const renderLanguage = (language: { name: string, id: number, code: string }) => (
      <li
        className="itemListFlex"
        key={language.id}
      >
        <p>{language.name}</p>
        {contentReturn(language.id, language.code)}
      </li>
    );
    return (
      <div className="modalContent">
        <div className="actionButton actionboldButton actionAfter">
          <button title={editText} onClick={this.insidechangeEditFunction}>{editText}</button>
        </div>
        <div className={simpleClassView}>
          <h2><a href="javascript:void(0)" onClick={this.insidechangeEditFunction}>{editText}</a></h2>
          <ul>
            {arrayLenguajes.map(renderLanguage)}
          </ul>
        </div>
        {(isPublishedCurrentAssignment! || isMySchool) && this.renderDuplicateButton(duplicateText, 'actionboldButton')}
      </div>
    );
  }

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
        isTranslations
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
    const openPreview = (this.state.modalPreview) ? 'modalToggle active' : 'modalToggle';
    const openFunction = (this.state.modalFunction) ? 'modalToggle active' : 'modalToggle';
    const isTranslate = isTranslations ? isTranslations : false;
    const typeUser = this.userService.getCurrentUser()!.type;
    return (
      <div className={'previewModalInfo'} onClick={this.stopPropagation} tabIndex={0}>
        <div className="contentContainer">
          <div className={'NewheaderPanel'}>
            <div className="headerButtons">
              <div className="previewButtons">
                <a href="javascript:void(0)" className={openPreview} onClick={this.changeOpenpreview}>{intl.get('new assignment.Preview')}</a>
                {this.state.modalPreview && typeUser === UserType.Teacher && isTranslate && this.contentInCM()}
                {this.state.modalPreview && typeUser === UserType.Teacher && !isTranslate && this.contentIn()}
                {this.state.modalPreview && typeUser === UserType.ContentManager && isTranslate && this.contentInCM()}
                {this.state.modalPreview && typeUser === UserType.ContentManager && !isTranslate && this.contentIn()}
                {this.state.modalPreview && typeUser === UserType.Student && this.contentIn()}
              </div>
              <div className="functionsButtons">
                <a href="javascript:void(0)" className={openFunction} onClick={this.changeOpenFunction}>{editText}</a>
                {this.state.modalFunction && typeUser === UserType.Teacher && isTranslate && this.contentIntwoCMTeacher()}
                {this.state.modalFunction && typeUser === UserType.Teacher && !isTranslate && this.contentIntwo()}
                {this.state.modalFunction && typeUser === UserType.Student && this.contentIntwo()}
                {this.state.modalFunction && typeUser === UserType.ContentManager && isTranslate && this.contentIntwoCM()}
                {this.state.modalFunction && typeUser === UserType.ContentManager && !isTranslate && this.contentIntwo()}
              </div>
              <div className="DistributeButtons">
              {this.userService.getCurrentUser()!.type === UserType.Teacher && (isPublishedCurrentAssignment! || isMySchool) && !isTranslate && this.renderDistributeButton(distributeText)}
              {this.userService.getCurrentUser()!.type === UserType.Teacher && (isPublishedCurrentAssignment! || isMySchool) && isTranslate && this.renderDistributeSelectButton(distributeText)}
              </div>
            </div>
            <div className={'NewTitleHeader'}>
              <h2>{title}</h2>
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
            {isTranslate && this.renderLangs()}
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
        </div>
      </div >
    );
  }

}

export const SideOutPanelPreviewAssignment = withRouter(SideOutPanelPreviewAssignmentComponent);
