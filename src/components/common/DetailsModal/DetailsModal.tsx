import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import isNull from 'lodash/isNull';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { CurrentQuestionaryStore } from 'assignment/view/CurrentAssignmentPage/CurrentQuestionaryStore';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import detailModalImg from 'assets/images/goals-white.svg';
import subject from 'assets/images/tags.svg';
import coreElement from 'assets/images/core.svg';
import multiSubject from 'assets/images/cogs.svg';
import source from 'assets/images/voice.svg';
import goalsIcon from 'assets/images/goals.svg';
import './DetailsModal.scss';
import { injector } from 'Injector';
import { TeachingPathService, TEACHING_PATH_SERVICE } from 'teachingPath/service';
import { GoalsData, Subject } from 'assignment/Assignment';
import { TeachingPath } from 'teachingPath/TeachingPath';

interface Props {
  isTeachingPath?: boolean;
  isAssignment?: boolean;
  editTeachingPathStore?: EditTeachingPathStore;
  currentEntityTeachingPath?: DraftTeachingPath;
  newAssignmentStore?: NewAssignmentStore;
  drafAssignment?: DraftAssignment;
  currentQuestionaryStore?: CurrentQuestionaryStore;
}

interface GoalsAux {
  gradeDesc: string | null | undefined;
  description: string;
}

interface State {
  isOpen: boolean;
  subjects: Array<string>;
  coreElements: Array<string>;
  multiSubjects: Array<string>;
  sources: Array<string>;
  goals: Array<GoalsAux>;
  entityTeachingPath: TeachingPath | undefined;
}

@inject('questionaryTeachingPathStore')
@inject('newAssignmentStore')
@observer

export class DetailsModal extends Component<Props, State> {
  private teachingPathService: TeachingPathService = injector.get(TEACHING_PATH_SERVICE);
  public state = {
    isOpen: false,
    subjects: [],
    coreElements: [],
    multiSubjects: [],
    sources: [],
    goals: [],
    entityTeachingPath: undefined,

  };

  public componentDidMount = async () => {
    const { isTeachingPath } = this.props;
    if (isTeachingPath) {
      const response = await this.teachingPathService.getTeachingPathDataById(this.props.currentEntityTeachingPath!.id);
      if (response !== null && response !== undefined) {
        this.setState({ entityTeachingPath: response });
        const subjectItems = response.subjectItems!.map(item => item.description!);
        const coreElementItems = response.coreElementItems!.map(item => item.description!);
        const multiSubjectItems = response.multiSubjectItems!.map(item => item.description!);
        const sourceItems = response.sourceItems!.map(item => item.description!);
        /* const goalsItems = response.goalsItems!.map(
          item => {
            const newItem: GoalsAux = {
              gradeDesc: item.gradeDesc!,
              description: item.description!,
            };
            return newItem;
          }); */
        /* console.log(subjectItems);
        console.log(coreElementItems);
        console.log(multiSubjectItems);
        console.log(sourceItems);
        console.log(goalsItems); */

        this.setState({
          subjects: subjectItems,
          coreElements: coreElementItems,
          multiSubjects: multiSubjectItems,
          sources: sourceItems,
        });
      }
    }
  }

  public openModalDetail = () => {
    this.setState({ isOpen: true });
  }
  public closeModalDetail = () => {
    this.setState({ isOpen: false });
  }
  public buttonOpenDetailsModal = () => {
    const { isOpen } = this.state;
    return (
      <CreateButton title={intl.get('generals.viewdetails')} onClick={this.openModalDetail}>
        <img src={detailModalImg} alt={intl.get('generals.viewdetails')} />
        {intl.get('generals.viewdetails')}
      </CreateButton>
    );
  }
  public subjectRender = () => {
    const { isOpen } = this.state;
    const { subjects } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={subject} /> {intl.get('preview.teaching_path.grep.subjects')}</h3>
        <ul className="modalContentTG__body__list">
          {subjects.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>
    );
  }
  public coreElementsRender = () => {
    const { isOpen } = this.state;
    const { coreElements } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={coreElement} /> {intl.get('preview.teaching_path.grep.core_elements')}</h3>
        <ul className="modalContentTG__body__list">
          {coreElements.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>
    );
  }
  public multiSubjectsRender = () => {
    const { isOpen } = this.state;
    const { multiSubjects } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={multiSubject} /> {intl.get('preview.teaching_path.grep.multidisciplinary_subjects')}</h3>
        <ul className="modalContentTG__body__list">
          {multiSubjects.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>
    );
  }
  public sourcesRender = () => {
    const { isOpen } = this.state;
    const { sources } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={source} /> {intl.get('preview.teaching_path.grep.sources')}</h3>
        <ul className="modalContentTG__body__list">
          {sources.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>
    );
  }
  public goalsRender = () => {
    const { isOpen } = this.state;
    const { goals } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={goalsIcon} /> {intl.get('preview.teaching_path.grep.educational_goals')}</h3>
        <ul className="modalContentTG__body__listGoals">
          <li>
            <div className="grade" key={1}>{'Hola'}</div>
            <div className="description" key={1}>{'Hola'}</div>
          </li>
        </ul>
      </div>
    );
  }
  public contentDetailModal = () => {
    const { isOpen } = this.state;
    return (
      <div className="modalContentTG open">
        <div className="modalContentTG__header">
          <h1>{intl.get('generals.viewdetails_title')}</h1>
          <div className="modalContentTG__header__close" onClick={this.closeModalDetail}>
            <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path className="roundedCircle" fill-rule="evenodd" clip-rule="evenodd" d="M15.2476 0.9375C23.0138 0.9375 29.3101 7.23375 29.3101 15C29.3101 22.7663 23.0138 29.0625 15.2476 29.0625C7.48131 29.0625 1.18506 22.7663 1.18506 15C1.18506 7.23375 7.48131 0.9375 15.2476 0.9375Z" stroke="#0B2541" fill="white" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9.62256 20.625L20.8713 9.375" stroke="#0B2541" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M20.8726 20.625L9.62134 9.375" stroke="#0B2541" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
        <div className="modalContentTG__body">
          {this.subjectRender()}
          {this.coreElementsRender()}
          {this.multiSubjectsRender()}
          {this.sourcesRender()}
          {this.goalsRender()}
        </div>
      </div>
    );
  }
  public backgroundDetailModal = () => {
    const { isOpen } = this.state;
    return (
      <div className="modalContentTGBackground" onClick={this.closeModalDetail} />
    );
  }
  public render() {
    return (
      <div className="detailsModal">
        {this.buttonOpenDetailsModal()}
        {this.state.isOpen && this.contentDetailModal()}
        {this.state.isOpen && this.backgroundDetailModal()}
      </div>
    );
  }
}
