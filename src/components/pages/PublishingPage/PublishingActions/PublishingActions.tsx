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
import { GreepElements } from 'assignment/factory';

const MAGICNUMBER100 = 100;
const MAGICNUMBER1 = 1;

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
  valueStringGoalsOptions: Array<string>;
  valueGoalsOptions: Array<number>;
  editValueCoreOptions: Array<number> | undefined;
  editvalueMultiOptions: Array<number> | undefined;
  editvaluereadingOptions: number | undefined;
  editvalueGoalsOptions: Array<number> | undefined;
  page: number;
  pageCurrent: number;
  isValid: boolean;
  loadingGoals: boolean;
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
      valueStringGoalsOptions: [],
      valueGoalsOptions: [],
      editValueCoreOptions: [],
      editvalueMultiOptions: [],
      editvaluereadingOptions: 0,
      editvalueGoalsOptions: [],
      isValid: false,
      page: MAGICNUMBER1,
      pageCurrent: MAGICNUMBER1,
      loadingGoals: true
    };
  }

  public async componentDidMount() {
    const { store, from } = this.props;
    const { valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions, valuereadingOptions } = this.state;
    const selectedGrades = store!.currentEntity!.getListOfGrades().map(this.gradeToTagProp);
    const selectedSubjects = store!.currentEntity!.getListOfSubjects().map(this.subjectToTagProp);
    const arraySelectedIdsGrades: Array<number> = [];
    const arraySelectedIdsSubjects: Array<number> = [];
    selectedGrades.forEach((ee) => {
      arraySelectedIdsGrades.push(Number(ee.id));
    });
    selectedSubjects.forEach((ee) => {
      arraySelectedIdsSubjects.push(Number(ee.id));
    });
    const grepFiltersDataAwait = await store!.getGrepFilters(String(arraySelectedIdsGrades), String(arraySelectedIdsSubjects));
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
    this.setState({
      editValueCoreOptions : store!.currentEntity!.getListOfgrepCoreElementsIds()!
    });
    this.setState({
      editvalueGoalsOptions : store!.currentEntity!.getListOfgrepGoalsIds()!
    });
    this.setState({
      editvalueMultiOptions : store!.currentEntity!.getListOfgrepMainTopicsIds()!
    });
    this.setState({
      editvaluereadingOptions : store!.currentEntity!.getListOfgrepReadingInSubjectId()!
    });
    if (store!.currentEntity!.isPrivate) {
      this.setState(
        { isValid: true },
        () => {
          this.sendValidbutton();
        }
      );
    } else {
      this.sendValidbutton();
    }
    if (typeof(store!.currentEntity!.getListOfgrepGoalsIds()) !== 'undefined') {
      this.setState(
        {
          valueGoalsOptions: store!.currentEntity!.getListOfgrepGoalsIds()!
        }
      );
    }
    if (typeof(store!.currentEntity!.getListOfgrepCoreElementsIds()) !== 'undefined') {
      this.setState({
        valueCoreOptions: store!.currentEntity!.getListOfgrepCoreElementsIds()!
      });
    }
    if (typeof(store!.currentEntity!.getListOfgrepMainTopicsIds()) !== 'undefined') {
      this.setState({
        valueMultiOptions: store!.currentEntity!.getListOfgrepMainTopicsIds()!
      });
    }
    if (typeof(store!.currentEntity!.getListOfgrepReadingInSubjectId()) !== 'undefined') {
      this.setState({
        valuereadingOptions: store!.currentEntity!.getListOfgrepReadingInSubjectId()!
      });
    }
    const arrayForGrades : Array<number> = [];
    if (selectedGrades.length > 0) {
      selectedGrades.forEach((element) => {
        for (let i = 0; i < this.state.optionsGrades.length; i = i + 1) {
          // tslint:disable-next-line: variable-name
          if (Number(element.id) === Number(this.state.optionsGrades[i].wp_id)) {
            if (!this.state.valueGradesOptions.includes(this.state.optionsGrades[i].id)) {
              arrayForGrades.push(this.state.optionsGrades[i].id);
            }
          }
        }
      });
      this.setState({
        valueGradesOptions: arrayForGrades!
      });
    }
    const arrayForSubjects : Array<number> = [];
    if (selectedSubjects.length > 0) {
      selectedSubjects.forEach((element) => {
        for (let i = 0; i < this.state.optionsSubjects.length; i = i + 1) {
          // tslint:disable-next-line: variable-name
          if (Number(element.id) === Number(this.state.optionsSubjects[i].wp_id)) {
            if (!this.state.valueSubjectsOptions.includes(this.state.optionsSubjects[i].id)) {
              arrayForSubjects.push(this.state.optionsSubjects[i].id);
            }
          }
        }
      });
      this.setState({
        valueSubjectsOptions: arrayForSubjects!
      });
    }
    let listGoals: Array<string> = [];

    if (from === 'TEACHINGPATH') {
      if (!store!.getAllGrades().length) {
        store!.getGrades();
      }
      if (!store!.getAllSubjects().length) {
        store!.getSubjects();
      }
      listGoals = this.transformDataToString(store!.currentEntity!.getListOfGoals()!);
    }
    if (from === 'ASSIGNMENT') {
      if (!store!.getAllGrades().length) {
        store!.getGrades();
      }
      if (!store!.getAllSubjects().length) {
        store!.getSubjects();
      }
      if (store!.getGoalsByArticle()) {
        listGoals = store!.getGoalsByArticle().split(',');
      }
    }
    if (listGoals.length > 0) {
      localStorage.setItem('goals', String(listGoals));
    } else {
      if (localStorage.getItem('goals')) {
        listGoals = localStorage.getItem('goals')!.split(',');
        if (selectedGrades.length === 0 && selectedSubjects.length === 0) {
          listGoals = [''];
        }
      }
    }
    this.setState({
      valueStringGoalsOptions: listGoals
    });
    const grepFiltergoalssDataAwait = await store!.getGrepGoalsFilters(this.state.valueCoreOptions, this.state.valueMultiOptions, arrayForGrades, arrayForSubjects, listGoals, MAGICNUMBER100, MAGICNUMBER1);
    this.setState(
      {
        optionsGoals : grepFiltergoalssDataAwait.data,
      },
      () => {
        if (typeof(this.state.editvalueGoalsOptions) !== 'undefined') {
          if (this.state.editvalueGoalsOptions!.length === 0) {
            this.setState(
              {
                valueGoalsOptions: this.transformDataToStringDat(listGoals, this.state.optionsGoals)
              },
              () => {
                this.comparativeGoalsValueToFilter();
              }
            );
          }
        } else {
          this.setState(
            {
              valueGoalsOptions: this.transformDataToStringDat(listGoals, this.state.optionsGoals)
            },
            () => {
              this.comparativeGoalsValueToFilter();
            }
          );
        }
      }
    );
    this.setState(
      {
        // tslint:disable-next-line: variable-name
        page : grepFiltergoalssDataAwait.total_pages,
      }
    );
    if (grepFiltergoalssDataAwait.data.length > 0) { this.setState({ loadingGoals : false }); }
    if (document.getElementById('publishingInfo')) {
      document.getElementById('publishingInfo')!.addEventListener('scroll', this.handerScroll);
    }
  }

  public handerScroll = async () => {
    const { store } = this.props;
    const IDHtml = document.getElementById('publishingInfo')! as HTMLElement;
    let allOptions = this.state.optionsGoals;
    let getNumberInThis = this.state.pageCurrent;
    if (IDHtml.scrollHeight - Math.abs(IDHtml.scrollTop) === IDHtml.clientHeight) {
      getNumberInThis = getNumberInThis + MAGICNUMBER1;
      if (getNumberInThis <= this.state.page) {
        this.setState({ pageCurrent: getNumberInThis });
        /* tslint:disable-next-line:max-line-length */
        const grepFiltergoalssDataAwait = await store!.getGrepGoalsFilters(this.state.valueCoreOptions, this.state.valueMultiOptions, this.state.valueGradesOptions, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, getNumberInThis);
        allOptions = allOptions.concat(grepFiltergoalssDataAwait.data);
        this.setState(
          {
            optionsGoals : allOptions
          },
          () => {
            this.sendValidbutton();
          }
        );
      }
    }
  }

  public transformDataToStringDat = (data: Array<String>, options: Array<GoalsData>) => {
    const returnArray : Array<number> = [];
    data!.forEach((element) => {
      for (let i = 0; i < options.length; i = i + 1) {
        if (element === options[i].code) {
          returnArray.push(options[i].id!);
        }
      }
    });
    return returnArray;
  }

  public transformDataToString = (data: Array<GreepElements>) => {
    const returnArray : Array<string> = [];
    data!.forEach((element) => {
      returnArray.push(element.kode);
    });
    return returnArray;
  }

  public transformDataToStringOrString = (data: Array<GreepElements>) => {
    const returnArray : Array<string> = [];
    if (data.length > 0) {
      data!.forEach((element) => {
        returnArray.push(element.kode);
      });
    }
    return returnArray;
  }

  public renderValueOptions = (data: FilterGrep, type: string) => {
    const returnArray : Array<GreepSelectValue> = [];
    if (type === 'core') {
      returnArray.push({
        value: 0,
        label: intl.get('assignments search.Choose Core')
      });
      data!.coreElementsFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.description
        });
      });
    }
    if (type === 'multi') {
      returnArray.push({
        value: 0,
        label: intl.get('assignments search.Choose Multi')
      });
      data!.mainTopicFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.description
        });
      });
    }
    if (type === 'reading') {
      returnArray.push({
        value: 0,
        label: intl.get('assignments search.Choose reading')
      });
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

  public addSubject = async (id: number) => {
    const { optionsSubjects, valueSubjectsOptions } = this.state;
    const { store } = this.props;
    const arrayValueSubjects = this.state.valueSubjectsOptions;
    const subject = store!.getAllSubjects().find(subject => subject.id === id);
    if (subject) {
      store!.currentEntity!.addSubject(subject);
      this.setState({ loadingGoals : true });
      for (let i = 0; i < optionsSubjects.length; i = i + 1) {
        // tslint:disable-next-line: variable-name
        if (subject.id === optionsSubjects[i].wp_id) {
          if (!arrayValueSubjects.includes(optionsSubjects[i].id)) {
            arrayValueSubjects.push(optionsSubjects[i].id);
          }
        }
      }
      this.setState({
        valueSubjectsOptions : arrayValueSubjects
      });
      /* tslint:disable-next-line:max-line-length */
      const grepFiltergoalssDataAwait = await this.props.store!.getGrepGoalsFilters(this.state.valueCoreOptions, this.state.valueMultiOptions, this.state.valueGradesOptions, arrayValueSubjects, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
      this.setState(
        {
          optionsGoals : grepFiltergoalssDataAwait.data
        },
        () => {
          this.sendValidbutton();
        }
      );
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page : grepFiltergoalssDataAwait.total_pages,
          loadingGoals: false
        }
      );
      this.comparativeGoalsValueToFilter();
      this.setState({ pageCurrent: MAGICNUMBER1 });
      // updatedata
      const selectedGrades = store!.currentEntity!.getListOfGrades().map(this.gradeToTagProp);
      const selectedSubjects = store!.currentEntity!.getListOfSubjects().map(this.subjectToTagProp);
      const arraySelectedIdsGrades: Array<number> = [];
      const arraySelectedIdsSubjects: Array<number> = [];
      selectedGrades.forEach((ee) => {
        arraySelectedIdsGrades.push(Number(ee.id));
      });
      selectedSubjects.forEach((ee) => {
        arraySelectedIdsSubjects.push(Number(ee.id));
      });
      const grepFiltersDataAwait = await store!.getGrepFilters(String(arraySelectedIdsGrades), String(arraySelectedIdsSubjects));
      this.setState({
        grepFiltersData : grepFiltersDataAwait
      });
      this.setState({
        optionsCore : this.renderValueOptions(grepFiltersDataAwait, 'core')
      });
    }
  }

  public removeSubject = async (id: number) => {
    const { optionsSubjects, valueSubjectsOptions } = this.state;
    const { store } = this.props;
    const subject = store!.getAllSubjects().find(subject => subject.id === id);
    const arrayValueSubjects = this.state.valueSubjectsOptions;
    if (subject) {
      store!.currentEntity!.removeSubject(subject);
      this.setState({ loadingGoals : true });
      for (let i = 0; i < optionsSubjects.length; i = i + 1) {
        // tslint:disable-next-line: variable-name
        if (subject.id === optionsSubjects[i].wp_id) {
          const index = arrayValueSubjects.indexOf(optionsSubjects[i].id);
          if (index > -1) {
            arrayValueSubjects.splice(index, 1);
          }
        }
      }
      this.setState({
        valueSubjectsOptions : arrayValueSubjects
      });
      /* tslint:disable-next-line:max-line-length */
      const grepFiltergoalssDataAwait = await this.props.store!.getGrepGoalsFilters(this.state.valueCoreOptions, this.state.valueMultiOptions, this.state.valueGradesOptions, arrayValueSubjects, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
      this.setState(
        {
          optionsGoals : grepFiltergoalssDataAwait.data
        },
        () => {
          this.sendValidbutton();
        }
      );
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page : grepFiltergoalssDataAwait.total_pages,
          loadingGoals: false
        }
      );
      this.comparativeGoalsValueToFilter();
      this.setState({ pageCurrent: MAGICNUMBER1 });
      // updatedata
      const selectedGrades = store!.currentEntity!.getListOfGrades().map(this.gradeToTagProp);
      const selectedSubjects = store!.currentEntity!.getListOfSubjects().map(this.subjectToTagProp);
      const arraySelectedIdsGrades: Array<number> = [];
      const arraySelectedIdsSubjects: Array<number> = [];
      selectedGrades.forEach((ee) => {
        arraySelectedIdsGrades.push(Number(ee.id));
      });
      selectedSubjects.forEach((ee) => {
        arraySelectedIdsSubjects.push(Number(ee.id));
      });
      const grepFiltersDataAwait = await store!.getGrepFilters(String(arraySelectedIdsGrades), String(arraySelectedIdsSubjects));
      this.setState({
        grepFiltersData : grepFiltersDataAwait
      });
      this.setState({
        optionsCore : this.renderValueOptions(grepFiltersDataAwait, 'core')
      });
    }
  }

  public gradeToTagProp = (grade: Grade): TagProp => ({
    id: grade.id,
    title: grade.title,
  })

  public addGrade = async (id: number) => {
    const { optionsGrades, valueGradesOptions } = this.state;
    const arrayValueGrades = this.state.valueGradesOptions;
    const { store } = this.props;
    const grade = store!.getAllGrades().find(grade => grade.id === id);
    if (grade) {
      store!.currentEntity!.addGrade(grade);
      this.setState({ loadingGoals : true });
      for (let i = 0; i < optionsGrades.length; i = i + 1) {
        // tslint:disable-next-line: variable-name
        if (grade.id === optionsGrades[i].wp_id) {
          if (!arrayValueGrades.includes(optionsGrades[i].id)) {
            arrayValueGrades.push(optionsGrades[i].id);
          }
        }
      }
      this.setState({
        valueGradesOptions : arrayValueGrades
      });
      /* tslint:disable-next-line:max-line-length */
      const grepFiltergoalssDataAwait = await this.props.store!.getGrepGoalsFilters(this.state.valueCoreOptions, this.state.valueMultiOptions, arrayValueGrades, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
      this.setState(
        {
          optionsGoals : grepFiltergoalssDataAwait.data
        },
        () => {
          this.sendValidbutton();
        }
      );
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page : grepFiltergoalssDataAwait.total_pages,
          loadingGoals: false
        }
      );
      this.comparativeGoalsValueToFilter();
      this.setState({ pageCurrent: MAGICNUMBER1 });
      // updatedata
      const selectedGrades = store!.currentEntity!.getListOfGrades().map(this.gradeToTagProp);
      const selectedSubjects = store!.currentEntity!.getListOfSubjects().map(this.subjectToTagProp);
      const arraySelectedIdsGrades: Array<number> = [];
      const arraySelectedIdsSubjects: Array<number> = [];
      selectedGrades.forEach((ee) => {
        arraySelectedIdsGrades.push(Number(ee.id));
      });
      selectedSubjects.forEach((ee) => {
        arraySelectedIdsSubjects.push(Number(ee.id));
      });
      const grepFiltersDataAwait = await store!.getGrepFilters(String(arraySelectedIdsGrades), String(arraySelectedIdsSubjects));
      this.setState({
        grepFiltersData : grepFiltersDataAwait
      });
      this.setState({
        optionsCore : this.renderValueOptions(grepFiltersDataAwait, 'core')
      });
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

  public removeGrade = async (id: number) => {
    const { store } = this.props;
    const { optionsGrades, valueGradesOptions } = this.state;
    const arrayValueGrades = this.state.valueGradesOptions;
    const grade = store!.getAllGrades().find(grade => grade.id === id);

    if (grade) {
      store!.currentEntity!.removeGrade(grade);
      this.setState({ loadingGoals : true });
      for (let i = 0; i < optionsGrades.length; i = i + 1) {
        // tslint:disable-next-line: variable-name
        if (grade.id === optionsGrades[i].wp_id) {
          const index = arrayValueGrades.indexOf(optionsGrades[i].id);
          if (index > -1) {
            arrayValueGrades.splice(index, 1);
          }
        }
      }
      this.setState({
        valueGradesOptions : arrayValueGrades
      });
      /* tslint:disable-next-line:max-line-length */
      const grepFiltergoalssDataAwait = await this.props.store!.getGrepGoalsFilters(this.state.valueCoreOptions, this.state.valueMultiOptions, arrayValueGrades, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
      this.setState(
        {
          optionsGoals : grepFiltergoalssDataAwait.data
        },
        () => {
          this.sendValidbutton();
        }
      );
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page : grepFiltergoalssDataAwait.total_pages,
          loadingGoals: false
        }
      );
      this.comparativeGoalsValueToFilter();
      this.setState({ pageCurrent: MAGICNUMBER1 });
      // updatedata
      const selectedGrades = store!.currentEntity!.getListOfGrades().map(this.gradeToTagProp);
      const selectedSubjects = store!.currentEntity!.getListOfSubjects().map(this.subjectToTagProp);
      const arraySelectedIdsGrades: Array<number> = [];
      const arraySelectedIdsSubjects: Array<number> = [];
      selectedGrades.forEach((ee) => {
        arraySelectedIdsGrades.push(Number(ee.id));
      });
      selectedSubjects.forEach((ee) => {
        arraySelectedIdsSubjects.push(Number(ee.id));
      });
      const grepFiltersDataAwait = await store!.getGrepFilters(String(arraySelectedIdsGrades), String(arraySelectedIdsSubjects));
      this.setState({
        grepFiltersData : grepFiltersDataAwait
      });
      this.setState({
        optionsCore : this.renderValueOptions(grepFiltersDataAwait, 'core')
      });
    }
  }

  public handlePrivateOn = () => {
    this.setState(
      {
        isValid: true
      },
      () => {
        this.sendValidbutton();
      }
    );
    this.props.store!.currentEntity!.setIsPrivate(true);
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
    this.setState(
      {
        isValid: false
      },
      () => {
        this.sendValidbutton();
      }
    );
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
    let filterSelectedSubjects = this.compareTwoArraysReturnValue(subjects, selectedSubjects);
    if (selectedSubjects.length > 0) {
      myplaceholder = '';
    }
    if (filterSelectedSubjects.length === 0) {
      filterSelectedSubjects = selectedSubjects;
    }
    if (filterSelectedSubjects.length > 0) {
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
    let filterSelectedGrades = this.compareTwoArraysReturnValue(grades, selectedGrades);
    if (selectedGrades.length > 0) {
      myplaceholder = '';
    }
    if (filterSelectedGrades.length === 0) {
      filterSelectedGrades = selectedGrades;
    }
    if (filterSelectedGrades.length > 0) {
      filterSelectedGrades.forEach((element) => {
        for (let i = 0; i < optionsGrades.length; i = i + 1) {
          // tslint:disable-next-line: variable-name
          if (element.id === optionsGrades[i].wp_id) {
            if (!this.state.valueGradesOptions.includes(optionsGrades[i].id)) {
              this.state.valueGradesOptions.push(optionsGrades[i].id);
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

  public searchValueInArrays = (emisor: Array<GreepSelectValue>, receptor: Array<number> | undefined) => {
    let valueCoreElement:any = emisor[0];
    emisor.forEach((a) => {
      receptor!.forEach((b) => {
        if (a.value === b) {
          valueCoreElement = a;
        }
      });
    });
    return valueCoreElement;
  }

  public searchStringValueInArrays = (emisor: Array<GreepSelectValue>, receptor: Array<number> | undefined) => {
    let valueCoreElement = '';
    emisor.forEach((a) => {
      receptor!.forEach((b) => {
        if (a.value === b) {
          valueCoreElement = a.label;
        }
      });
    });
    return valueCoreElement;
  }

  public handleChangeSelectCore = async (newValue: any) => {
    const { currentEntity } = this.props.store!;
    const { valueCoreOptions } = this.state;
    if (newValue.value !== 0) {
      this.setState({ loadingGoals : true });
      /* tslint:disable-next-line:max-line-length */
      const grepFiltergoalssDataAwait = await this.props.store!.getGrepGoalsFilters(newValue.value, this.state.valueMultiOptions, this.state.valueGradesOptions, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
      this.setState({
        optionsGoals : grepFiltergoalssDataAwait.data
      });
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page : grepFiltergoalssDataAwait.total_pages,
          loadingGoals: false
        }
      );
      this.comparativeGoalsValueToFilter();
      this.setState({ pageCurrent: MAGICNUMBER1 });
      if (!valueCoreOptions.includes(newValue.value)) {
        this.setState(
          {
            valueCoreOptions: [...valueCoreOptions, newValue.value]
          },
          () => {
            this.sendValidbutton();
          }
        );
        currentEntity!.setGrepCoreElementsIds([newValue.value]);
      }
    } else {
      this.setState({ loadingGoals : true });
      /* tslint:disable-next-line:max-line-length */
      const grepFiltergoalssDataAwait = await this.props.store!.getGrepGoalsFilters([], this.state.valueMultiOptions, this.state.valueGradesOptions, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
      this.setState({
        optionsGoals : grepFiltergoalssDataAwait.data
      });
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page : grepFiltergoalssDataAwait.total_pages,
          loadingGoals: false
        }
      );
      this.setState({ pageCurrent: MAGICNUMBER1 });
      this.setState(
        {
          valueCoreOptions: []
        },
        () => {
          this.sendValidbutton();
        }
      );
      this.comparativeGoalsValueToFilter();
      currentEntity!.setGrepCoreElementsIds([]);
    }
  }

  public renderCoreElements = () => {
    const { optionsCore, editValueCoreOptions, valueCoreOptions } = this.state;
    const customStyles = {
      option: () => ({
        fontSize: '14px',
        padding: '5px',
        borderBottom: '1px solid #e7ecef',
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      })
    };
    if (typeof(editValueCoreOptions) !== 'undefined') {
      if (editValueCoreOptions!.length > 0) {
        const value = this.searchValueInArrays(optionsCore, editValueCoreOptions);
        const placehol = this.searchStringValueInArrays(optionsCore, editValueCoreOptions);
        return (
          <div className="itemsFlex">
            <Select
              styles={customStyles}
              options={optionsCore}
              onChange={this.handleChangeSelectCore}
              placeholder={placehol}
            />
          </div>
        );
      }
    }
    return (
      <div className="itemsFlex">
        <Select
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
    if (newValue.value !== 0) {
      this.setState({ loadingGoals : true });
      /* tslint:disable-next-line:max-line-length */
      const grepFiltergoalssDataAwait = await this.props.store!.getGrepGoalsFilters(this.state.valueCoreOptions, newValue.value, this.state.valueGradesOptions, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
      this.setState({
        optionsGoals : grepFiltergoalssDataAwait.data
      });
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page : grepFiltergoalssDataAwait.total_pages,
          loadingGoals : false
        }
      );
      this.comparativeGoalsValueToFilter();
      this.setState({ pageCurrent: MAGICNUMBER1 });
      this.setState(
        {
          valueMultiOptions: [...valueMultiOptions, newValue.value]
        },
        () => {
          this.sendValidbutton();
        }
      );
      currentEntity!.setGrepMainTopicsIds([newValue.value]);
    } else {
      this.setState({ loadingGoals : true });
      const grepFiltergoalssDataAwait = await this.props.store!.getGrepGoalsFilters(this.state.valueCoreOptions, [], this.state.valueGradesOptions, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
      this.setState({
        optionsGoals : grepFiltergoalssDataAwait.data
      });
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page : grepFiltergoalssDataAwait.total_pages,
          loadingGoals : false
        }
      );
      this.setState({ pageCurrent: MAGICNUMBER1 });
      this.setState(
        {
          valueMultiOptions: []
        },
        () => {
          this.sendValidbutton();
        }
      );
      this.comparativeGoalsValueToFilter();
      currentEntity!.setGrepMainTopicsIds([]);
    }
  }

  public renderMultiDisciplinary = () => {
    const { optionsMulti, editvalueMultiOptions } = this.state;
    const customStyles = {
      option: () => ({
        fontSize: '14px',
        padding: '5px',
        borderBottom: '1px solid #e7ecef',
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      })
    };
    if (typeof(editvalueMultiOptions) !== 'undefined') {
      if (editvalueMultiOptions!.length > 0) {
        const value = this.searchValueInArrays(optionsMulti, editvalueMultiOptions);
        const placehol = this.searchStringValueInArrays(optionsMulti, editvalueMultiOptions);
        return (
          <div className="itemsFlex">
            <Select
              styles={customStyles}
              options={optionsMulti}
              onChange={this.handleChangeSelectMulti}
              placeholder={placehol}
            />
          </div>
        );
      }
    }
    return (
      <div className="itemsFlex">
        <Select
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
    if (newValue !== 0) {
      this.setState(
        {
          valuereadingOptions: newValue.value
        },
        () => {
          this.sendValidbutton();
        }
      );
    } else {
      this.setState(
        {
          valuereadingOptions: 0
        },
        () => {
          this.sendValidbutton();
        }
      );
    }
    currentEntity!.setGrepReadingInSubjectId(newValue.value);
  }

  public searchValueInNumbers = (emisor: Array<GreepSelectValue>, receptor: number | undefined) => {
    let valueCoreElement:any = emisor[0];
    emisor.forEach((a) => {
      if (a.value === receptor) {
        valueCoreElement = a;
      }
    });
    return valueCoreElement;
  }

  public searchStringValueInNumbers = (emisor: Array<GreepSelectValue>, receptor: number | undefined) => {
    let valueCoreElement = '';
    emisor.forEach((a) => {
      if (a.value === receptor) {
        valueCoreElement = a.label;
      }
    });
    return valueCoreElement;
  }

  public renderReadingInSubject = () => {
    const { optionsReading, editvaluereadingOptions } = this.state;
    const customStyles = {
      option: () => ({
        fontSize: '14px',
        padding: '5px',
        borderBottom: '1px solid #e7ecef',
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      })
    };
    if (typeof(editvaluereadingOptions) !== 'undefined') {
      if (editvaluereadingOptions! > 0) {
        const value = this.searchValueInNumbers(optionsReading, editvaluereadingOptions);
        const placeho = this.searchStringValueInNumbers(optionsReading, editvaluereadingOptions);
        return (
          <div className="itemsFlex">
            <Select
              styles={customStyles}
              options={optionsReading}
              onChange={this.handleChangeSelectReading}
              placeholder={placeho}
            />
          </div>
        );
      }
    }
    return (
      <div className="itemsFlex">
        <Select
          styles={customStyles}
          options={optionsReading}
          onChange={this.handleChangeSelectReading}
          placeholder={intl.get('assignments search.Choose reading')}
        />
      </div>
    );
  }

  public sendValidbutton = () => {
    if (!this.state.isValid) {
      if (this.state.valueGradesOptions.length > 0 && this.state.valueGoalsOptions.length > 0 && this.state.valuereadingOptions !== null && this.state.valuereadingOptions !== 0) {
        this.props.store!.setIsActiveButtons();
      } else {
        if (typeof(this.state.editvalueGoalsOptions) !== 'undefined') {
          if (this.state.editvalueGoalsOptions!.length > 0) {
            if (this.state.valueGradesOptions.length > 0 && this.state.valueGoalsOptions.length > 0 && this.state.valuereadingOptions !== null && this.state.valuereadingOptions !== 0) {
              this.props.store!.setIsActiveButtons();
            } else {
              this.props.store!.setIsActiveButtonsFalse();
            }
          } else {
            this.props.store!.setIsActiveButtonsFalse();
          }
        } else {
          this.props.store!.setIsActiveButtonsFalse();
        }
      }
    } else {
      this.props.store!.setIsActiveButtons();
    }
  }

  public sendTableBodyGoal = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { editvalueGoalsOptions, valueGoalsOptions } = this.state;
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
    this.comparativeGoalsValueToFilter();
  }

  public comparativeGoalsValueToFilter = () => {
    const { optionsGoals, valueGoalsOptions } = this.state;
    const { currentEntity } = this.props.store!;
    const returnArray : Array<number> = [];
    optionsGoals!.forEach((element) => {
      for (let i = 0; i < valueGoalsOptions.length; i = i + 1) {
        if (element.id === valueGoalsOptions[i]) {
          returnArray.push(valueGoalsOptions[i]);
        }
      }
    });
    this.setState(
      {
        valueGoalsOptions : returnArray
      },
      () => {
        currentEntity!.setGrepGoalsIds(valueGoalsOptions);
        this.sendValidbutton();
      }
    );
  }

  public renderTableHeader = () => {
    const { store } = this.props;
    return (
      <div className="itemTablesHeader">
        <div className="itemTablesTh">
          <div className="itemTablesTd icons" />
          <div className="itemTablesTd grade">{intl.get('new assignment.Grade')}</div>
          <div className="itemTablesTd subjects">{intl.get('new assignment.Subjects')}</div>
          <div className="itemTablesTd core">{intl.get('new assignment.greep.core')}</div>
          <div className="itemTablesTd goals">{intl.get('new assignment.greep.goals')}</div>
        </div>
      </div>
    );
  }

  public transformData = (data: Array<GreepElements>, options: Array<GoalsData>) => {
    const returnArray : Array<number> = [];
    data!.forEach((element) => {
      for (let i = 0; i < options.length; i = i + 1) {
        if (element.kode === options[i].code) {
          returnArray.push(options[i].id!);
        }
      }
    });
    return returnArray;
  }

  public renderTableBody = () => {
    const { store, from } = this.props;
    const { optionsGoals, editvalueGoalsOptions } = this.state;
    const listGoals = this.state.valueGoalsOptions;
    const myOptionGoals = this.state.optionsGoals;
    const goalsNotSelected: Array<GoalsData> = [];
    let anotherGoals: Array<GoalsData> = [];
    let realOptionsGoals: Array<GoalsData> = [];
    let visibleGoals;
    let activeVisibleGoals = false;
    if (typeof(optionsGoals) !== 'undefined') {
      activeVisibleGoals = true;
    }
    if (typeof(listGoals) !== 'undefined') {
      // step 1: frag in two arrays
      myOptionGoals!.forEach((goal) => {
        if (listGoals!.includes(Number(goal!.id))) {
          const myGoal = goal;
          anotherGoals.push(myGoal);
        } else {
          goalsNotSelected.push(goal);
        }
      });
      // step 2: reOrder goals from array
      if (anotherGoals.length > 0) {
        anotherGoals = anotherGoals!.sort((a, b) => (a!.grades![0].id > b!.grades![0].id) ? 1 : (b!.grades![0].id > a!.grades![0].id) ? -1 : 0);
      }
      // step 3: concat goals from new array
      realOptionsGoals = anotherGoals.concat(goalsNotSelected);
      // step 4: print goals
      visibleGoals = realOptionsGoals!.map((goal) => {
        const visibleGoalsGrade = goal!.grades!.map((grade) => {
          const title = grade.name.split('.', 1);
          return <span key={grade.id}>{title}</span>;
        });
        const visibleGoalsCore = goal!.coreElements!.map((core) => {
          const title = core.description;
          return <span key={core.id}>{title}</span>;
        });
        let activeCrop = '';
        if (listGoals!.length > 0) {
          if (listGoals!.includes(Number(goal!.id))) {
            activeCrop = 'active';
          }
        }
        return (
          <div className="itemTablesTr" key={goal!.id}>
            <div className="itemTablesTd icons">
              <button value={goal.id} onClick={this.sendTableBodyGoal} className={activeCrop}>
                <img src={checkRounded} alt="Check" title="check" className={'checkImg'} />
                <img src={checkActive} alt="Check" title="check" className={'checkImgFalse'} />
              </button>
            </div>
            <div className="itemTablesTd grade">{visibleGoalsGrade} {intl.get('new assignment.grade')}</div>
            <div className="itemTablesTd subjects">{goal!.subject!.name}</div>
            <div className="itemTablesTd core">{visibleGoalsCore}</div>
            <div className="itemTablesTd goals">{goal!.description}</div>
          </div>
        );
      });
    }
    if (this.state.loadingGoals) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    if (optionsGoals.length === 0) {
      return (
        <div className="itemTablesBody">
          {intl.get('edit_teaching_path.header.notdata_goals')}
        </div>
      );
    }
    return (
      <div className="itemTablesBody">
        {activeVisibleGoals && visibleGoals}
      </div>
    );
  }

  public render() {
    const { store, from } = this.props;
    const descriptionText = (this.state.isValid) ? intl.get('publishing_page.grep.description_privado') : (from === 'TEACHINGPATH') ? intl.get('publishing_page.grep.description') : intl.get('publishing_page.grep.descrption_assignment');
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
              <p>{descriptionText}</p>
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
