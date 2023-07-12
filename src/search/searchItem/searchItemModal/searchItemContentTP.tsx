import React, { Component, SyntheticEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import moment from 'moment';
import { LocationDescriptor } from 'history';
import onClickOutside from 'react-onclickoutside';
import { injector } from 'Injector';
import { TeachingPathService, TEACHING_PATH_SERVICE } from 'teachingPath/service';
import { TeachingPath, TeachingPathRepo, TEACHING_PATH_REPO } from 'teachingPath/TeachingPath';
import { Assignment, GenericGrepItem, LenguajesB, LenguajesC, Translations } from 'assignment/Assignment';
import { UserType } from 'user/User';
import { UserService } from 'user/UserService';
import { Notification, NotificationTypes } from '../../../components/common/Notification/Notification';
import { Search, SimpleNumberData, SimpleStringData, SimpleGoalData, LvlData, SimpleNumberDataTitle } from '../../Search';
import { deadlineDateFormat, thirdLevel, LANGUAGESC, LANGUAGESD } from 'utils/constants';
import closeimg from 'assets/images/close-button.svg';
import gradeImg from 'assets/images/grade.svg';
import goalsImg from 'assets/images/goals.svg';
import steps from 'assets/images/teaching-path.svg';
import article from 'assets/images/article.svg';
import person from 'assets/images/person.svg';
import date from 'assets/images/date.svg';
import subject from 'assets/images/tags.svg';
import coreElement from 'assets/images/core.svg';
import multiSubject from 'assets/images/cogs.svg';
import sourceImg from 'assets/images/voice.svg';
import lang from 'assets/images/lang.svg';
import editImg from 'assets/images/edit-tp.svg';
import deleteImg from 'assets/images/trash-tp.svg';

interface Props {
  item: Search;
  onClose: () => void;
}

interface State {
  modalPreview: boolean;
  modalFunction: boolean;
  numberOfStepsMin: number;
  numberOfStepsMax: number;
  numberOfArticles: number;
  author: string;
  authorRole: string;
  isPrivate: boolean;
  createdAt: string;
  isTranslations: boolean;
  translations: Array<Translations>;
  modalInsideView: boolean;
  modalInsidePreview: boolean;
  modalInsideEdit: boolean;
  hasGuidance: boolean;
  modalInsideEditTeacher: boolean;
  originalLocaleId: number;
}
export const USER_SERVICE = 'USER_SERVICE';
class TPContent extends Component<Props, State> {
  private teachingPathService: TeachingPathService = injector.get(TEACHING_PATH_SERVICE);
  private userService: UserService = injector.get<UserService>(USER_SERVICE);

  public state = {
    modalPreview: false,
    modalFunction: false,
    numberOfStepsMin: 0,
    numberOfStepsMax: 0,
    numberOfArticles: 0,
    author: '',
    authorRole: '',
    isPrivate: false,
    createdAt: '',
    isTranslations: false,
    translations: [],
    modalInsideView: false,
    modalInsidePreview: false,
    modalInsideEdit: false,
    hasGuidance: false,
    modalInsideEditTeacher: false,
    originalLocaleId: 0
  };
  public handleClickOutside = () => this.props.onClose();
  public close = () => this.props.onClose();
  public renderNumberArrayTitle = (item: SimpleNumberDataTitle) => (
    <li className="item">
      {item.title}
    </li>
  )
  public renderNumberArray = (item: SimpleNumberData) => (
    <li className="item">
      {item.name}
    </li>
  )
  public renderStringArray = (item: SimpleStringData) => (
    <li className="item">
      {item.name}
    </li>
  )
  public insidechangeEditFunctionTeacher = () => {
    if (this.state.modalInsideEditTeacher) {
      this.setState({ modalInsideEditTeacher: false });
    } else {
      this.setState({ modalInsideEditTeacher: true });
    }
  }
  public renderGrepSubjectsArray = () => {
    const { subjects } = this.props.item;
    return (
      <div className="entityInfoBlock">
        <div className="imageGrep">
          <img className="imgInfo" src={subject} />
        </div>
        <div>
          <div className="title">{intl.get('preview.teaching_path.grep.subjects')}</div>
          <div>
            <ul className="listItem">
              {subjects.map(this.renderNumberArray)}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  public renderGrepCoreElements = () => {
    const { coreElements } = this.props.item;
    return (
      <div className="entityInfoBlock">
        <div className="imageGrep">
          <img className="imgInfo" src={coreElement} />
        </div>
        <div>
          <div className="title">{intl.get('preview.teaching_path.grep.core_elements')}</div>
          <div>
            <ul className="listItem">
              {coreElements.map(this.renderStringArray)}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  public renderGrepMultiSubjects = () => {
    const { topics } = this.props.item;
    return (
      <div className="entityInfoBlock">
        <div className="imageGrep">
          <img className="imgInfo" src={multiSubject} />
        </div>
        <div>
          <div className="title">{intl.get('preview.teaching_path.grep.multidisciplinary_subjects')}</div>
          <div>
            <ul className="listItem">
              {topics.map(this.renderStringArray)}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  public renderGrepSources = () => {
    const { sources } = this.props.item;
    return (
      <div className="entityInfoBlock">
        <div className="imageGrep">
          <img className="imgInfo" src={sourceImg} />
        </div>
        <div>
          <div className="title">{intl.get('preview.teaching_path.grep.sources')}</div>
          <div>
            <ul className="listItem">
              {sources.map(this.renderNumberArrayTitle)}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  public renderListGoal = (item: SimpleGoalData) => (
    <li className="goalData">
      <div className="goalData__grade">{item.grade_name}</div>
      <div className="goalData__subject">{item.subject_name}</div>
      <div className="goalData__name">{item.name}</div>
    </li>
  )
  public renderGrepEducationalGoals = () => {
    const { goals } = this.props.item;
    return (
      <>
        <div className="entityInfoBlockExpanded">
          <div className="imageGrep">
            <img className="imgInfo" src={goalsImg} />
          </div>
          <div className="title">{intl.get('preview.teaching_path.grep.educational_goals')}</div>
        </div>
        <div className="flexContainerExpanded">
          <ul className="listItem">
            {goals.map(this.renderListGoal)}
          </ul>
        </div>
      </>
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
  public renderPublishDate = (createdAt: string) =>
  (
    <div className="partsInfo">
      <img src={date} alt="date" />
      {`${moment(createdAt).format(deadlineDateFormat)}`}
    </div>
  )
  public renderLangs = () => {
    const mytranslations = this.state.translations as Array<Translations>;
    const arrayLenguajes : Array<LenguajesC> = [];
    if (mytranslations) {
      mytranslations.forEach((t) => {
        if (Boolean(t.value)) {
          const id = t.id;
          const names = (LANGUAGESD.find(x => x.id === id)) ? LANGUAGESD.find(x => x.id === id)!.name : '';
          const namesingle = (LANGUAGESD.find(x => x.id === id)) ? LANGUAGESD.find(x => x.id === id)!.name : '';
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
      <div className="partsInfo partsInfoList">
        <img src={lang} alt="langs" />
        <ul>
          {arrayLenguajes.map(renderPreviewLanguage)}
        </ul>
      </div>
    );
  }
  public setViewButtonByLenguaje = (idlenguaje : number) => {
    const { id } = this.props.item;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-paths/view/${id!}?locale_id=${idlenguaje}`;
    window.open(urlForEditing);
  }
  public setPreViewButtonByLenguaje = (idlenguaje : number) => {
    const { id } = this.props.item;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-path/preview/${id!}?locale_id=${idlenguaje}`;
    window.open(urlForEditing);
  }
  public openInNewTabTeacherGuidance = () => {
    const { id } = this.props.item;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-paths/view/${id!}/tg=true`;
    window.open(urlForEditing);
  }
  public openInNewTabPreView = () => {
    const { id } = this.props.item;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-path/preview/${id!}`;
    window.open(urlForEditing);
  }
  public insidePreviewchangeOpenFunction = () => {
    if (this.state.modalInsidePreview) {
      this.setState({ modalInsidePreview: false });
    } else {
      this.setState({ modalInsidePreview: true });
    }
  }
  public insidechangeOpenFunction = () => {
    if (this.state.modalInsideView) {
      this.setState({ modalInsideView: false });
    } else {
      this.setState({ modalInsideView: true });
    }
  }
  public insidechangeEditFunction = () => {
    if (this.state.modalInsideEdit) {
      this.setState({ modalInsideEdit: false });
    } else {
      this.setState({ modalInsideEdit: true });
    }
  }
  public renderTeacherGuidanceButtonList = (guidanceString: string) =>
  (
    <li>
      <a href="javascript:void(0)" className="linkOpenSite LinkRollback" onClick={this.openInNewTabTeacherGuidance}>
        {guidanceString}
      </a>
    </li>
  )
  public renderPreviewButon = (id: number, view: string) => (
    <div className="actionButton">
      <button onClick={() => this.openInNewTabPreView()} title={view}>
        {view}
      </button>
    </div>
  )

  public openInNewTabView = () => {
    const { id } = this.props.item;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-paths/view/${id!}`;
    window.open(urlForEditing);
  }
  public handleCopy = async () => {
    const { id } = this.props.item;
    const url: URL = new URL(window.location.href);
    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.copy')
    });

    if (isCopyApproved) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      const copyId = await this.teachingPathService.copyTeachingPath(id!);
      const urlForEditing: string = `${url.origin}/teaching-path/edit/${copyId!}`;
      window.open(urlForEditing);
    }
  }

  public openInNewTabEdit = () => {
    const { id } = this.props.item;
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-paths/edit/${id}`;
    window.open(urlForEditing);
  }

  public renderViewButton = (id: number, view: string) =>
  (
    <div className="actionButton">
      <button onClick={() => this.openInNewTabView()} title={view}>
        {view}
      </button>
    </div>
  )
  public renderTeacherGuidanceButton = (guidanceString: string) =>
  (
    <div className="actionButton">
      <button disabled={false} onClick={() => this.openInNewTabTeacherGuidance()} title={guidanceString} >
        {guidanceString}
      </button>
    </div>
  )
  public renderEditButtonClass = (editString: string) =>
  (
    <div className="actionButton actionboldButton">
      <button disabled={false} onClick={() => { this.openInNewTabEdit(); }} title={editString} >
        {editString}
      </button>
    </div>
  )
  public renderEditButton = (editString: string) =>
  (
    <div className="actionButton">
      <button disabled={false} onClick={() => { this.openInNewTabEdit(); }} title={editString} >
        {editString}
      </button>
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
  public setViewButtonCopyByLenguaje = async (id: number, lenguajeid: number) => {
    const url: URL = new URL(window.location.href);
    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.copy')
    });

    if (isCopyApproved) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      const copyId = await this.teachingPathService.copyTeachingPathByLocale(id!, lenguajeid, false);
      const urlForEditing: string = `${url.origin}/teaching-path/edit/${copyId!}`;
      window.open(urlForEditing);
    }
  }
  public renderDuplicateButtonTeacher = (duplicateString: string, arrayLenguajes: Array<LenguajesC>) => {
    const simpleClassView = (this.state.modalInsideEditTeacher) ? 'modalContentInside active' : 'modalContentInside';
    const { id } = this.props.item;
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
        <a
          href="javascript:void(0)"
          // tslint:disable-next-line: jsx-no-lambda
          onClick={() => this.setViewButtonCopyByLenguaje(id, language.id)}
          title={intl.get('preview.teaching_path.buttons.editbutton')}
        >
          <p>{language.name}</p>
        </a>
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
  public contentInCM = () => {
    const viewText = intl.get('preview.teaching_path.buttons.view');
    const guidanceText = intl.get('preview.assignment.buttons.teacher_guidance');
    const viewStudentText = intl.get('preview.teaching_path.buttons.viewstudent');
    const mytranslations = this.state.translations as Array<Translations>;
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
            <a href="javascript:void(0)" className="linkOpenSite" onClick={this.insidePreviewchangeOpenFunction}>{viewStudentText}</a>
            <div className={simpleClassPreview}>
              <h2><a href="javascript:void(0)" onClick={this.insidePreviewchangeOpenFunction}>{viewStudentText}</a></h2>
              <ul>
                {arrayLenguajes.map(renderPreviewLanguage)}
              </ul>
            </div>
          </li>
          <li>
            <a href="javascript:void(0)" className="linkOpenSite" onClick={this.insidechangeOpenFunction}>{viewText}</a>
            <div className={simpleClassView}>
              <h2><a href="javascript:void(0)" onClick={this.insidechangeOpenFunction}>{viewText}</a></h2>
              <ul>
                {arrayLenguajes.map(renderLanguage)}
              </ul>
            </div>
          </li>
          {this.state.hasGuidance && this.renderTeacherGuidanceButtonList(guidanceText)}
        </ul>
      </div>
    );
  }
  public contentIn = () => {
    const { id } = this.props.item;
    const viewText = intl.get('preview.teaching_path.buttons.view');
    const guidanceText = intl.get('preview.assignment.buttons.teacher_guidance');
    const viewStudentText = intl.get('preview.teaching_path.buttons.viewstudent');
    return (
      <div className="modalContent">
        {this.renderPreviewButon(id, viewStudentText)}
        {this.renderViewButton(id, viewText)}
        {this.state.hasGuidance && this.renderTeacherGuidanceButton(guidanceText)}
      </div>
    );
  }
  public setViewButtonDeleteByLenguaje = async (id: number, lenguajeid: number) => {
    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure')
    });

    if (isCopyApproved) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      await this.teachingPathService.deleteTeachingTranslation(id, lenguajeid);
      window.location.reload();
    }
  }
  public setViewButtonAddByLenguaje = (id: number, lenguajeid: number) => {
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-paths/edit/${id}?locale_id=${lenguajeid}&add=true`;
    window.open(urlForEditing);
  }
  public setViewButtonEditByLenguaje = (id: number, lenguajeid: number) => {
    const url: URL = new URL(window.location.href);
    const urlForEditing: string = `${url.origin}/teaching-paths/edit/${id}?locale_id=${lenguajeid}`;
    window.open(urlForEditing);
  }
  public contentIntwoCMTeacher = () => {
    const editText = intl.get('preview.teaching_path.buttons.edit');
    const viewText = intl.get('preview.teaching_path.buttons.view');
    const guidanceText = intl.get('preview.assignment.buttons.teacher_guidance');
    const viewStudentText = intl.get('preview.teaching_path.buttons.viewstudent');
    const duplicateText = intl.get('preview.assignment.buttons.duplicate');
    const mytranslations = this.state.translations as Array<Translations>;
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
    return (
      <div className="modalContent">
        {this.renderEditButtonClass(editText)}
        {this.renderDuplicateButtonTeacher(duplicateText, arrayLenguajes)}
      </div>
    );
  }
  public contentIntwo = () => {
    const { id } = this.props.item;
    const editText = intl.get('preview.assignment.buttons.edit');
    const duplicateText = intl.get('preview.assignment.buttons.duplicate');
    return (
      <div className="modalContent">
        {this.renderEditButton(editText)}
        {this.renderDuplicateButton(duplicateText)}
      </div>
    );
  }
  public contentIntwoCM = () => {
    const { id } = this.props.item;
    const viewText = intl.get('preview.teaching_path.buttons.view');
    const guidanceText = intl.get('preview.assignment.buttons.teacher_guidance');
    const viewStudentText = intl.get('preview.teaching_path.buttons.viewstudent');
    const duplicateText = intl.get('preview.assignment.buttons.duplicate');
    const editText = intl.get('preview.assignment.buttons.edit');
    const simpleClassView = (this.state.modalInsideEdit) ? 'modalContentInside active' : 'modalContentInside';
    const mytranslations = this.state.translations as Array<Translations>;
    const arrayLenguajes : Array<LenguajesC> = [];
    if (mytranslations) {
      mytranslations.forEach((t) => {
        const id = t.id;
        if (LANGUAGESC.find(x => x.id === id)) {
          const valueConst = Boolean(t.value) ? 'active' : 'add';
          const singleValueName = (LANGUAGESC.find(x => x.id === id)) ? LANGUAGESC.find(x => x.id === id)!.name : '';
          const LANG = { id: t.id , name: singleValueName, code: valueConst };
          arrayLenguajes.push(LANG);
        }
      });
    }
    const contentReturn = (langid: number, code: string) => {
      if (code === 'active') {
        const deleteFunction = (langid: number) => {
          if (langid !== this.state.originalLocaleId) {
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
        {this.renderDuplicateButton(duplicateText, 'actionboldButton')}
      </div>
    );
  }
  public async componentDidMount() {
    const { id } = this.props.item;
    const tpservice = await this.teachingPathService.getTeachingPathDataById(id);
    this.setState({
      numberOfStepsMax : tpservice.numberOfSteps.max!,
      numberOfStepsMin : tpservice.numberOfSteps.min!,
      numberOfArticles : tpservice.numberOfArticles!,
      author: tpservice.author!,
      authorRole: tpservice.authorRole!,
      isPrivate: tpservice.isPrivate,
      createdAt: tpservice.createdAt,
      isTranslations: tpservice.isTranslations!,
      translations: tpservice.translations!,
      hasGuidance: tpservice.hasGuidance,
      originalLocaleId: tpservice.originalLocaleId!
    });
  }
  public render() {
    const {
        description,
        grades,
        subjects,
        topics,
        goals,
        lvlArticles,
        title
    } = this.props.item;
    const showPublishDate = this.state.authorRole === UserType.Teacher || !(this.state.authorRole === UserType.ContentManager && !(this.state.isPrivate!));
    const openPreview = (this.state.modalPreview) ? 'modalToggle active' : 'modalToggle';
    const openFunction = (this.state.modalFunction) ? 'modalToggle active' : 'modalToggle';
    const isTranslate = this.state.isTranslations ? this.state.isTranslations : false;
    const typeUser = this.userService.getCurrentUser()!.type;
    return (
      <div className="previewModalInfoSearch" tabIndex={0}>
        <div className="previewModalInfoSearch__background" onClick={this.close} />
        <div className="previewModalInfoSearch__content">
          <div className="contentContainer">
            <div className="NewheaderPanel">
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
                  <a href="javascript:void(0)" className={openFunction} onClick={this.changeOpenFunction}>{intl.get('preview.teaching_path.buttons.edit')}</a>
                  {this.state.modalFunction && typeUser === UserType.Teacher && isTranslate && this.contentIntwoCMTeacher()}
                  {this.state.modalFunction && typeUser === UserType.Teacher && !isTranslate && this.contentIntwo()}
                  {this.state.modalFunction && typeUser === UserType.Student && this.contentIntwo()}
                  {this.state.modalFunction && typeUser === UserType.ContentManager && isTranslate && this.contentIntwoCM()}
                  {this.state.modalFunction && typeUser === UserType.ContentManager && !isTranslate && this.contentIntwo()}
                </div>
                <div className="DistributeButtons" />
              </div>
              <div className="NewTitleHeader">
                <h2>{title}</h2>
              </div>
            </div>
            <div className="entityInfo">
              <div className="partsInfo">
                <img src={steps} alt="question" />
                {this.state.numberOfStepsMin === this.state.numberOfStepsMax ? `${this.state.numberOfStepsMin}` : `${this.state.numberOfStepsMin}-${this.state.numberOfStepsMax}`} {`${intl.get('preview.teaching_path.headers.steps')}`}
              </div>
              <div className="partsInfo">
                <img src={article} alt="question" />
                {this.state.numberOfArticles ? this.state.numberOfArticles : intl.get('preview.teaching_path.headers.no')} {`${intl.get('preview.teaching_path.headers.articles')}`}
              </div>
              <div className="partsInfo partsInfoAutor">
                <img src={person} alt="question" />
                <p>{`${intl.get('preview.teaching_path.headers.by')}`} {this.state.author ? this.state.author : ''}</p>
              </div>
              {showPublishDate && this.renderPublishDate(this.state.createdAt)}
              {this.renderLangs()}
            </div>
            <div className="entityDescription">
              <div className="partsInfoDescription">
                {description ? description : ''}
              </div>
            </div>
            <div className="summary">
              {this.renderGrepSubjectsArray()}
              {this.renderGrepCoreElements()}
              {this.renderGrepMultiSubjects()}
              {this.renderGrepSources()}
              {this.renderGrepEducationalGoals()}
            </div>
          </div>
          <div className="footerButtons" />
        </div>
      </div>
    );
  }
}
const TPComponent = onClickOutside(TPContent);
export { TPComponent as TPContent };
