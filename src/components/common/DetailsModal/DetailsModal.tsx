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
import { GenericGrepItem, GoalsData, Subject } from 'assignment/Assignment';
import { TeachingPath } from 'teachingPath/TeachingPath';
import { AssignmentService, ASSIGNMENT_SERVICE } from 'assignment/service';

interface Props {
  isTeachingPath?: boolean;
  isAssignment?: boolean;
  editTeachingPathStore?: EditTeachingPathStore;
  currentEntityTeachingPath?: DraftTeachingPath;
  newAssignmentStore?: NewAssignmentStore;
  drafAssignment?: DraftAssignment;
  currentQuestionaryStore?: NewAssignmentStore;
  id?: number;
}

interface GoalsAux {
  gradeDesc: string | null | undefined;
  description: string;
}

interface GoalsInterface {
  subjectId: number;
  subjectDesc: string;
  goalsArray: Array<GoalsAux>;
}

interface State {
  isOpen: boolean;
  subjects: Array<string> | null;
  coreElements: Array<string> | null;
  multiSubjects: Array<string> | null;
  sources: Array<string> | null;
  goals: Array<GenericGrepItem> | null;
  entityTeachingPath: TeachingPath | undefined;
}

@inject('questionaryTeachingPathStore')
@inject('newAssignmentStore')
@observer

export class DetailsModal extends Component<Props, State> {
  private teachingPathService: TeachingPathService = injector.get(TEACHING_PATH_SERVICE);
  private assignmentService: AssignmentService = injector.get(ASSIGNMENT_SERVICE);
  public state = {
    isOpen: false,
    subjects: [],
    coreElements: [],
    multiSubjects: [],
    sources: [],
    goals: [],
    entityTeachingPath: undefined,

  };

  public convertToGoal = (item: GenericGrepItem): GenericGrepItem => {
    const newItem: GenericGrepItem = {
      gradeDesc: item.gradeDesc!,
      description: item.description!,
      id: 0
    };
    return newItem!;
  }

  public componentDidMount = async () => {

    const { isTeachingPath, isAssignment } = this.props;
    if (isTeachingPath) {
      const response = await this.teachingPathService.getTeachingPathDataById(this.props.currentEntityTeachingPath!.id);
      let subjectItems = null;
      let coreElementItems = null;
      let multiSubjectItems = null;
      let sourceItems = null;
      let goalsItems = null;
      if (response !== null && response !== undefined) {
        this.setState({ entityTeachingPath: response });
        subjectItems = response.subjectItems!.map(item => item.description!);
        coreElementItems = response.coreElementItems!.map(item => item.description!);
        multiSubjectItems = response.multiSubjectItems!.map(item => item.description!);
        sourceItems = response.sourceItems!.map(item => item.description!);
        goalsItems = response.goalsItems!.map(
          /* item => this.convertToGoal(item)); */
          item => item);
      }
      this.setState({
        subjects: subjectItems,
        coreElements: coreElementItems,
        multiSubjects: multiSubjectItems,
        sources: sourceItems,
        goals: goalsItems,
      });
    } else {
      if (isAssignment) {
        const response = this.props.drafAssignment! ? await this.assignmentService.getAssignmentById(this.props.drafAssignment!.id!) :
          await this.assignmentService.getAssignmentById(this.props.id!);
        let subjectItems = null;
        let coreElementItems = null;
        let multiSubjectItems = null;
        let sourceItems = null;
        let goalsItems = null;
        if (response !== null && response !== undefined) {
          subjectItems = response.subjectItems!.map(item => item.title!);
          coreElementItems = response.coreElementItems!.map(item => item.description!);
          multiSubjectItems = response.multiSubjectItems!.map(item => item.description!);
          sourceItems = response.sourceItems!.map(item => item.description!);
          goalsItems = response.goalsItems!.map(
            /*  */
            item => item);
        }
        this.setState({
          subjects: subjectItems,
          coreElements: coreElementItems,
          multiSubjects: multiSubjectItems,
          sources: sourceItems,
          goals: goalsItems,
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

  public renderGoal = (item: any) => (
    <div>
      <li className="itemExpanded" key={item}>
        {/* tslint:disable-next-line:no-string-literal  */}
        <div className="grade" key={1}>{item!['gradeDesc']}</div>
        {/* tslint:disable-next-line:no-string-literal  */}
        <div className="description" key={1}>{item!['description']}</div>
      </li>
    </div>
  )

  public transformGoals = () => {
    const { editTeachingPathStore, currentEntityTeachingPath, drafAssignment, isAssignment, isTeachingPath } = this.props;
    const newGoalsArray: Array<GoalsInterface> = [];
    this.state!.goals!.forEach((goal) => {
      const newGoal = {} as GoalsInterface;
      const newGoals = {} as GoalsAux;
      {/* tslint:disable-next-line:no-string-literal  */}
      const goalindex = newGoalsArray.map(e => e.subjectId).indexOf(goal['subjectId']);
      if (goalindex < 0) {
        {/* tslint:disable-next-line:no-string-literal  */}
        newGoal.subjectId = goal['subjectId'];
        {/* tslint:disable-next-line:no-string-literal  */}
        newGoal.subjectDesc = goal['subjectDesc'];
        {/* tslint:disable-next-line:no-string-literal  */}
        newGoal.goalsArray = [];
        {/* tslint:disable-next-line:no-string-literal  */}
        newGoals.gradeDesc = goal['gradeDesc'];
        {/* tslint:disable-next-line:no-string-literal  */}
        newGoals.description = goal['description'];
        newGoal.goalsArray.push(newGoals);
        newGoalsArray.push(newGoal);
      } else {
        {/* tslint:disable-next-line:no-string-literal  */}
        newGoals.gradeDesc = goal['gradeDesc'];
        {/* tslint:disable-next-line:no-string-literal  */}
        newGoals.description = goal['description'];
        newGoalsArray[goalindex].goalsArray.push(newGoals);
      }
    });
    return newGoalsArray;
  }

  public goalsRender = () => {
    const { isOpen } = this.state;
    const { goals } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={goalsIcon} /> {intl.get('preview.teaching_path.grep.educational_goals')}</h3>
        <ul className="modalContentTG__body__listGoals">
        {this.transformGoals().map(item => <li key={item.subjectId}><div className="subjectTitle">{item.subjectDesc}<div className="description"><ul>{item.goalsArray.map(li => <li key={item.subjectId} className="goalsItem"><div className="goalsItem__grade">{li.gradeDesc}</div><div className="goalsItem__description">{li.description}</div></li>)}</ul></div></div></li>)}
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
