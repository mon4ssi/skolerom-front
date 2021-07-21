import React, { Component } from 'react';
import Select from 'react-select';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';
import classnames from 'classnames';

import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { Subject, Grade, FilterGrep, GreepSelectValue, GrepFilters, GoalsData } from 'assignment/Assignment';
import tagsImg from 'assets/images/tags.svg';
import gradeImg from 'assets/images/grade.svg';
import checkRounded from 'assets/images/check-rounded-white-bg.svg';
import checkActive from 'assets/images/check-active.svg';
import goalsImg from 'assets/images/goals.svg';
import settingsImg from 'assets/images/settings-slider.svg';
import visibilityImg from 'assets/images/visibility.svg';
import firstLevelImg from 'assets/images/level-1-blue.svg';
import secondLevelImg from 'assets/images/level-2-blue.svg';
import thirdLevelImg from 'assets/images/level-3-blue.svg';
import publicIconImg from 'assets/images/teacher-public.svg';
import privateIconImg from 'assets/images/private.svg';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import { TagInputComponent, TagProp } from 'components/common/TagInput/TagInput';
import { firstLevel, secondLevel, studentLevels } from 'utils/constants';

import './PublishingActions.scss';

interface Props {
  store?: NewAssignmentStore | EditTeachingPathStore;
  from?: string;
}

interface State {
  grepFiltersData: FilterGrep;
  optionsCore: Array<GreepSelectValue>;
  optionsMulti: Array<GreepSelectValue>;
  optionsReading: Array<GreepSelectValue>;
  optionsSubjects: Array<GrepFilters>;
  optionsGrades: Array<GrepFilters>;
  valueCoreOptions: Array<number>;
  valueMultiOptions: Array<number>;
  valuereadingOptions: number;
  valueGradesOptions: Array<number>;
  valueSubjectsOptions: Array<number>;
  optionsGoals: Array<GoalsData>;
  valueGoalsOptions: Array<number>;
}

@observer
export class PublishingActions extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      grepFiltersData: {},
      optionsCore: [],
      optionsMulti: [],
      optionsReading: [],
      optionsSubjects: [],
      optionsGrades: [],
      valueCoreOptions: [],
      valueMultiOptions: [],
      valuereadingOptions: 0,
      valueGradesOptions: [],
      valueSubjectsOptions: [],
      optionsGoals: [],
      valueGoalsOptions: []
    };
  }

  public async componentDidMount() {
    const { store, from } = this.props;
    const { valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions } = this.state;
    const grepFiltersDataAwait = await store!.getGrepFilters();
    const grepFiltergoalssDataAwait = await store!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions);
    this.setState({
      grepFiltersData : grepFiltersDataAwait
    });
    this.setState({
      optionsCore : this.renderValueOptions(grepFiltersDataAwait, 'core')
    });
    this.setState({
      optionsMulti : this.renderValueOptions(grepFiltersDataAwait, 'multi')
    });
    this.setState({
      optionsReading : this.renderValueOptions(grepFiltersDataAwait, 'reading')
    });
    this.setState({
      optionsSubjects : this.renderValueOptionsBasics(grepFiltersDataAwait, 'subject')
    });
    this.setState({
      optionsGrades : this.renderValueOptionsBasics(grepFiltersDataAwait, 'grade')
    });
    if (from === 'TEACHINGPATH') {
      if (!store!.getAllGrades().length) {
        store!.getGrades();
      }
      if (!store!.getAllSubjects().length) {
        store!.getSubjects();
      }
    }
    if (from === 'ASSIGNMENT') {
      if (!store!.getAllGrades().length) {
        store!.getGrades();
      }
      if (!store!.getAllSubjects().length) {
        store!.getSubjects();
      }
    }
    this.setState({
      optionsGoals : grepFiltergoalssDataAwait
    });
  }

  public renderValueOptions = (data: FilterGrep, type: string) => {
    const returnArray : Array<GreepSelectValue> = [];
    if (type === 'core') {
      data!.coreElementsFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.description
        });
      });
    }
    if (type === 'multi') {
      data!.mainTopicFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.description
        });
      });
    }
    if (type === 'reading') {
      data!.readingInSubjects!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.name
        });
      });
    }
    return returnArray;
  }

  public renderValueOptionsBasics = (data: FilterGrep, type: string) => {
    const returnArray : Array<GrepFilters> = [];
    if (type === 'subject') {
      data!.subjectFilters!.forEach((element) => {
        returnArray.push({
          id: Number(element.id),
          name: element.name,
          // tslint:disable-next-line: variable-name
          wp_id: element.wp_id
        });
      });
    }
    if (type === 'grade') {
      data!.gradeFilters!.forEach((element) => {
        returnArray.push({
          id: Number(element.id),
          name: element.name,
          // tslint:disable-next-line: variable-name
          wp_id: element.wp_id
        });
      });
    }
    return returnArray;
  }

  public subjectToTagProp = (subject: Subject): TagProp => ({
    id: subject.id,
    title: subject.title,
  })

  public addSubject = (id: number) => {
    const { store } = this.props;
    const subject = store!.getAllSubjects().find(subject => subject.id === id);

    if (subject) {
      store!.currentEntity!.addSubject(subject);
    }
  }

  public removeSubject = (id: number) => {
    const { store } = this.props;
    const subject = store!.getAllSubjects().find(subject => subject.id === id);

    if (subject) {
      store!.currentEntity!.removeSubject(subject);
    }
  }

  public gradeToTagProp = (grade: Grade): TagProp => ({
    id: grade.id,
    title: grade.title,
  })

  public addGrade = (id: number) => {
    const { store } = this.props;
    const grade = store!.getAllGrades().find(grade => grade.id === id);

    if (grade) {
      store!.currentEntity!.addGrade(grade);
    }
  }

  public handleSelectLevel = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { currentEntity } = this.props.store!;

    e.preventDefault();

    if (
      currentEntity!.levels.length > 1 ||
      (currentEntity!.levels.length === 1 && !currentEntity!.levels.includes(Number(e.currentTarget.value)))
    ) {
      currentEntity!.setLevels(Number(e.currentTarget.value));
    }
  }

  public removeGrade = (id: number) => {
    const { store } = this.props;
    const grade = store!.getAllGrades().find(grade => grade.id === id);

    if (grade) {
      store!.currentEntity!.removeGrade(grade);
    }
  }

  public handlePrivateOn = () => {
    this.props.store!.currentEntity!.setIsPrivate(true);
    this.props.store!.setIsActiveButtons();
  }

  public handlePrivateOff = async () => {

    const isCopy = this.props.store!.currentEntity!.isCopy;
    const assignmentTitle = this.props.store!.currentEntity!.title;
    if (
      isCopy && (
      /Copy$/.test(assignmentTitle) ||
      /Kopi$/.test(assignmentTitle) ||
      /copy$/.test(assignmentTitle) ||
      /kopi$/.test(assignmentTitle))
    ) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: intl.get('new assignment.copy_title_not_allow')
      });

      return;
    }
    this.props.store!.setIsActiveButtonsFalse();
    this.props.store!.currentEntity!.setIsPrivate(false);
  }

  public compareTwoArraysReturnValueSubject = (allGrades: Array<Subject>, selectedGrades: Array<Subject>) => {
    const arrayValue: Array<Subject> = [];
    selectedGrades.forEach((element) => {
      for (let i = 0; i < allGrades.length; i = i + 1) {
        if (element.id === allGrades[i].id) {
          arrayValue.push(element);
        }
      }
    });
    return arrayValue;
  }

  public renderSubjectInput = () => {
    const { store } = this.props;
    const { optionsSubjects, valueSubjectsOptions } = this.state;
    let myplaceholder = intl.get('publishing_page.subject');

    const subjects = store!.getAllSubjects().map(this.subjectToTagProp);
    const selectedSubjects = store!.currentEntity!.getListOfSubjects().map(this.subjectToTagProp);
    const filterSelectedSubjects = this.compareTwoArraysReturnValue(subjects, selectedSubjects);
    if (filterSelectedSubjects.length > 0) {
      myplaceholder = '';
    }
    if (filterSelectedSubjects.length > 1) {
      filterSelectedSubjects.forEach((element) => {
        for (let i = 0; i < optionsSubjects.length; i = i + 1) {
          // tslint:disable-next-line: variable-name
          if (element.id === optionsSubjects[i].wp_id) {
            if (!valueSubjectsOptions.includes(element.id)) {
              if (!valueSubjectsOptions.includes(optionsSubjects[i].id)) {
                valueSubjectsOptions.push(optionsSubjects[i].id);
              }
            }
          }
        }
      });
    }

    return (
      <div className="itemsFlex subject">
        <TagInputComponent
          dataid="renderSubjectInput"
          className="filterBy darkTheme"
          tags={subjects}
          addTag={this.addSubject}
          currentTags={filterSelectedSubjects}
          orderbyid={false}
          removeTag={this.removeSubject}
          placeholder={myplaceholder}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public compareTwoArraysReturnValue = (allGrades: Array<Grade>, selectedGrades: Array<Grade>) => {
    const arrayValue: Array<Grade> = [];
    selectedGrades.forEach((element) => {
      for (let i = 0; i < allGrades.length; i = i + 1) {
        if (element.id === allGrades[i].id) {
          arrayValue.push(element);
        }
      }
    });
    return arrayValue;
  }

  public renderGradeInput = () => {
    const { store } = this.props;
    const { optionsGrades, valueGradesOptions } = this.state;
    const { currentEntity } = store!;
    let myplaceholder = intl.get('publishing_page.grade');
    const grades = store!.getAllGrades().map(this.gradeToTagProp).sort((a, b) => a.id - b.id);
    const selectedGrades = currentEntity!.getListOfGrades().map(this.gradeToTagProp);
    const filterSelectedGrades = this.compareTwoArraysReturnValue(grades, selectedGrades);
    if (filterSelectedGrades.length > 0) {
      myplaceholder = '';
    }
    if (filterSelectedGrades.length > 1) {
      filterSelectedGrades.forEach((element) => {
        for (let i = 0; i < optionsGrades.length; i = i + 1) {
          // tslint:disable-next-line: variable-name
          if (element.id === optionsGrades[i].wp_id) {
            if (!valueGradesOptions.includes(optionsGrades[i].id)) {
              valueGradesOptions.push(optionsGrades[i].id);
            }
          }
        }
      });
    }

    return (
      <div className="itemsFlex grade">
        <TagInputComponent
          dataid="renderGradeInput"
          className="filterBy darkTheme"
          tags={grades}
          addTag={this.addGrade}
          currentTags={filterSelectedGrades}
          orderbyid={true}
          removeTag={this.removeGrade}
          placeholder={myplaceholder}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public renderLevelButton = (level: number) => {
    const { levels } = this.props.store!.currentEntity!;

    const buttonClassName = levels.includes(level) ? 'active' : undefined;
    const levelIcon = level === firstLevel ? firstLevelImg :
      level === secondLevel ? secondLevelImg :
      thirdLevelImg;

    return (
      <button
        key={`key-${level}`}
        value={level}
        className={buttonClassName}
        onClick={this.handleSelectLevel}
        title={`${level}-level-icon`}
      >
        <img src={levelIcon} alt={`${level}-level-icon`} title={`${level}-level-icon`} />
        {level}
      </button>
    );
  }

  public renderLevelChoice = () => (
    <div className="itemsFlex levels">
      <div className="flexBox">
        <img src={settingsImg} alt={intl.get('generals.student_level')} title={intl.get('generals.student_level')} />
        <div className={'title'}>{intl.get('publishing_page.student_level')}</div>
      </div>

      <div className="studentLevelButtons flexBox">

      {studentLevels.map(this.renderLevelButton)}
      </div>
    </div>
  )

  public renderVisibility = () => {
    const { store } = this.props;

    const privateButtonClassnames = classnames(
      'flexBox justifyCenter alignCenter w50',
      {
        active: store!.currentEntity!.isPrivate,
      }
    );

    const publicButtonClassnames = classnames(
      'flexBox justifyCenter alignCenter w50',
      {
        active: !store!.currentEntity!.isPrivate,
      }
    );

    return (
      <div className="visibility">
        <div className="flexBox flex-align">
          <img src={visibilityImg} alt={intl.get('generals.visibility')} title={intl.get('generals.visibility')} />
          <div className={'title'}>{intl.get('publishing_page.visibility')}</div>
        </div>
        <p>{intl.get('publishing_page.visibility_description')}</p>
        <div className="visibilityButtons flexBox">
          <button
            className={publicButtonClassnames}
            onClick={this.handlePrivateOff}
            title={intl.get('publishing_page.public')}
          >
            <img
              src={publicIconImg}
              alt="Public"
              title={intl.get('publishing_page.public')}
            />
            {intl.get('publishing_page.public')}
          </button>

          <button
            className={privateButtonClassnames}
            onClick={this.handlePrivateOn}
            title={intl.get('publishing_page.private')}
          >
            <img
              src={privateIconImg}
              alt="Private"
              title={intl.get('publishing_page.private')}
            />
            {intl.get('publishing_page.private')}
          </button>
        </div>
      </div>
    );
  }

  public handleChangeSelectCore = async (newValue: any) => {
    const { currentEntity } = this.props.store!;
    const { valueCoreOptions } = this.state;
    if (!valueCoreOptions.includes(newValue.value)) {
      this.setState({
        valueCoreOptions: [...valueCoreOptions, newValue.value]
      });
      currentEntity!.setGrepCoreElementsIds([newValue.value]);
    }
  }

  public renderCoreElements = () => {
    const { optionsCore } = this.state;
    const customStyles = {
      menu: () => ({
        width: '320px',
        fontSize: '14px',
        border: '1px solid #939fa7',
      }),
      control: () => ({
        width: '320px',
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      })
    };
    return (
      <div className="itemsFlex">
        <Select
          width="320px"
          styles={customStyles}
          options={optionsCore}
          onChange={this.handleChangeSelectCore}
          placeholder={intl.get('assignments search.Choose Core')}
        />
      </div>
    );
  }

  public handleChangeSelectMulti = async (newValue: any) => {
    const { currentEntity } = this.props.store!;
    const { valueMultiOptions } = this.state;
    if (!valueMultiOptions.includes(newValue.value)) {
      this.setState({
        valueMultiOptions: [...valueMultiOptions, newValue.value]
      });
      currentEntity!.setGrepMainTopicsIds([newValue.value]);
    }
  }

  public renderMultiDisciplinary = () => {
    const { optionsMulti } = this.state;
    const customStyles = {
      menu: () => ({
        width: '320px',
        fontSize: '14px',
        border: '1px solid #939fa7',
      }),
      control: () => ({
        width: '320px',
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      })
    };
    return (
      <div className="itemsFlex">
        <Select
          width="320px"
          styles={customStyles}
          options={optionsMulti}
          onChange={this.handleChangeSelectMulti}
          placeholder={intl.get('assignments search.Choose Multi')}
        />
      </div>
    );
  }

  public handleChangeSelectReading = async (newValue: any) => {
    const { currentEntity } = this.props.store!;
    const { valuereadingOptions } = this.state;
    this.setState({
      valuereadingOptions: newValue.value
    });
    currentEntity!.setGrepReadingInSubjectId(newValue.value);
  }

  public renderReadingInSubject = () => {
    const { optionsReading } = this.state;
    const customStyles = {
      menu: () => ({
        width: '320px',
        fontSize: '14px',
        border: '1px solid #939fa7',
      }),
      control: () => ({
        width: '320px',
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      })
    };
    return (
      <div className="itemsFlex">
        <Select
          width="320px"
          styles={customStyles}
          options={optionsReading}
          onChange={this.handleChangeSelectReading}
          placeholder={intl.get('assignments search.Choose reading')}
        />
      </div>
    );
  }

  public sendTableBodyGoal = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { valueGoalsOptions } = this.state;
    const { currentEntity } = this.props.store!;
    const target = e.currentTarget;
    const value = Number(target!.value);
    if (target.classList.contains('active')) {
      target.classList.remove('active');
    } else {
      target.classList.add('active');
    }
    if (valueGoalsOptions.includes(value)) {
      const index = valueGoalsOptions.indexOf(value);
      if (index > -1) {
        valueGoalsOptions.splice(index, 1);
      }
    } else {
      valueGoalsOptions.push(value);
    }
    currentEntity!.setGrepGoalsIds(valueGoalsOptions);
    if (valueGoalsOptions.length > 1) {
      this.props.store!.setIsActiveButtons();
    } else {
      this.props.store!.setIsActiveButtonsFalse();
    }
  }

  public renderTableHeader = () => {
    const { store } = this.props;
    return (
      <div className="itemTablesHeader">
        <div className="itemTablesTh">
          <div className="itemTablesTd icons" />
          <div className="itemTablesTd grade">{intl.get('new assignment.Grade')}</div>
          <div className="itemTablesTd core">{intl.get('new assignment.greep.core')}</div>
          <div className="itemTablesTd goals">{intl.get('new assignment.greep.goals')}</div>
        </div>
      </div>
    );
  }

  public renderTableBody = () => {
    const { optionsGoals } = this.state;
    let activeVisibleGoals = false;
    if (typeof(optionsGoals) !== 'undefined') {
      activeVisibleGoals = true;
    }
    const visibleGoals = optionsGoals.map((goal) => {
      const visibleGoalsGrade = goal!.grades!.map((grade) => {
        const title = grade.name.split('.', 1);
        return <span key={grade.id}>{title}</span>;
      });
      const visibleGoalsCore = goal!.coreElements!.map((core) => {
        const title = core.description;
        return <span key={core.id}>{title}</span>;
      });
      return (
        <div className="itemTablesTr" key={goal!.id}>
          <div className="itemTablesTd icons">
            <button value={goal.id} onClick={this.sendTableBodyGoal}>
              <img src={checkRounded} alt="Check" title="check" className={'checkImg'} />
              <img src={checkActive} alt="Check" title="check" className={'checkImgFalse'} />
            </button>
          </div>
          <div className="itemTablesTd grade">{visibleGoalsGrade} {intl.get('new assignment.grade')}</div>
          <div className="itemTablesTd core">{visibleGoalsCore}</div>
          <div className="itemTablesTd goals">{goal!.description}</div>
        </div>
      );
    });
    return (
      <div className="itemTablesBody">
        {activeVisibleGoals && visibleGoals}
      </div>
    );
  }

  public render() {
    return (
      <div className="PublishingActions flexBox dirColumn">
        <div className="infoContainer">
          <div className="infoContainer__top">
            {this.renderVisibility()}
          </div>
          <div className="infoContainer__hidden">
            {this.renderLevelChoice()}
          </div>
          <div className="infoContainer__bottom">
            <div className="infoContainer__secondTitle">
              <h2>{intl.get('publishing_page.grep.title')}</h2>
              <p>{intl.get('publishing_page.grep.description')}</p>
            </div>
            <div className="infoContainer__filters">
              {this.renderSubjectInput()}
              {this.renderGradeInput()}
              {this.renderCoreElements()}
              {this.renderMultiDisciplinary()}
              {this.renderReadingInSubject()}
            </div>
            <div className="infoContainer__body">
              <div className="infoContainer__body__title">
                <img src={goalsImg} />
                <h3>{intl.get('new assignment.greep.goals')}</h3>
              </div>
              <div className="infoContainer__body__table">
                {this.renderTableHeader()}
                {this.renderTableBody()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
