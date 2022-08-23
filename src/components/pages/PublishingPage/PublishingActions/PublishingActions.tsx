import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Subject, Grade, FilterGrep, GreepSelectValue, GrepFilters, GoalsData, Source, Keyword } from 'assignment/Assignment';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { TagInputComponent, TagProp } from 'components/common/TagInput/TagInput';
import { LANGUAGES } from 'utils/constants';
import './PublishingActions.scss';
import { GreepElements } from 'assignment/factory';
import { UserType } from 'user/User';
import { TagKeywordInputComponent, TagKeywordProp } from 'components/common/TagInput/TagInputKeyword/TagInputKeyword';
import {
  PublishingActionsProps, PublishingActionsState, TagPropSource,
  MAGICNUMBER1, MAGICNUMBER100, SETTIMEOUT,
  PublishingActionsIcons, initializePublishingActionsState,
  LabelsUIList, LabelsList
} from './PublishingActionsAux';

@observer
export class PublishingActions extends Component<PublishingActionsProps, PublishingActionsState> {
  private labels: LabelsList = LabelsUIList;
  constructor(props: PublishingActionsProps) {
    super(props);
    this.state = initializePublishingActionsState();
  }

  public async componentDidMount() {
    const { store, from } = this.props;
    const arraySelectedIdsGrades: Array<number> = [];
    const arraySelectedIdsSubjects: Array<number> = [];
    const arraySelectedIdsNewsGrades: Array<number> = [];
    const arraySelectedIdsNewsSubjects: Array<number> = [];
    const arraySelectedIdsNewsManagemdGrades: Array<number> = [];
    const arraySelectedIdsNewsManagemdSubjects: Array<number> = [];
    let listGoals: Array<string> = [];
    this.props.store!.setIsDisabledButtonsFalse();
    this.setState({ IsVisibilityButtons: true });

    if (from === 'TEACHINGPATH') {
      if (!store!.getAllGrades().length) {
        store!.getGrades();
      }
      if (!store!.getAllSubjects().length) {
        store!.getSubjects();
      }
      if (!store!.getAllSources().length) {
        store!.getSources();
      }
      store!.getKeywords();
      if (typeof (store!.currentEntity!.getListOfGoals()) !== 'undefined') {
        listGoals = this.transformDataToString(store!.currentEntity!.getListOfGoals()!);
      }
    }
    if (from === 'ASSIGNMENT') {
      if (!store!.getAllGrades().length) {
        store!.getGrades();
      }
      if (!store!.getAllSubjects().length) {
        store!.getSubjects();
      }
      if (!store!.getAllSources().length) {
        store!.getSources();
      }
      store!.getKeywords();
      if (typeof (store!.getGoalsByArticle()) !== 'undefined') {
        listGoals = store!.getGoalsByArticle().split(',');
      }
    }
    this.setState({ isOpen: store!.currentEntity!.open });
    await new Promise(resolve => setTimeout(resolve, SETTIMEOUT));
    const selectedGradesNature = store!.currentEntity!.getListOfGrades();
    const selectedSubjectsNature = store!.currentEntity!.getListOfSubjects();
    const selectedGrades = selectedGradesNature.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    const selectedSubjects = selectedSubjectsNature.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

    selectedGrades.forEach((ee) => {
      arraySelectedIdsNewsGrades.push(Number(ee.id));
    });
    const newSelectGrades: Array<Grade> = await store!.getGradeWpIds(arraySelectedIdsNewsGrades);
    newSelectGrades.forEach((ee) => {
      arraySelectedIdsGrades.push(Number(ee.id));
      arraySelectedIdsNewsManagemdGrades.push(Number(ee.managementId));
    });
    this.setState({
      optionsMyGrades: newSelectGrades
    });

    selectedSubjects.forEach((ee) => {
      arraySelectedIdsNewsSubjects.push(Number(ee.id));
    });
    const newselectedSubjects: Array<Subject> = await store!.getSubjectWpIds(arraySelectedIdsNewsSubjects);
    newselectedSubjects.forEach((ee) => {
      arraySelectedIdsSubjects.push(Number(ee.id));
      arraySelectedIdsNewsManagemdSubjects.push(Number(ee.managementId));
    });
    this.setState({
      valueSubjectsOptions: arraySelectedIdsSubjects,
      optionsMySubjects: newselectedSubjects
    });
    await new Promise(resolve => setTimeout(resolve, SETTIMEOUT));
    const grepFiltersDataAwait = await store!.getGrepFilters(String(arraySelectedIdsGrades), String(arraySelectedIdsSubjects));

    this.setState({
      grepFiltersData: grepFiltersDataAwait,
      optionsCore: this.renderValueOptions(grepFiltersDataAwait, 'core'),
      optionsMulti: this.renderValueOptions(grepFiltersDataAwait, 'multi'),
      optionsReading: this.renderValueOptions(grepFiltersDataAwait, 'reading'),
      optionsSubjects: this.renderValueOptionsBasics(grepFiltersDataAwait, 'subject'),
      optionsGrades: this.renderValueOptionsBasics(grepFiltersDataAwait, 'grade'),
      editValueCoreOptions: store!.currentEntity!.getListOfgrepCoreElementsIds()!,
      editvalueGoalsOptions: store!.currentEntity!.getListOfgrepGoalsIds()!,
      editvalueMultiOptions: store!.currentEntity!.getListOfgrepMainTopicsIds()!,
      editvaluereadingOptions: store!.currentEntity!.getListOfgrepReadingInSubjectId()!
    });
    if (typeof (store!.currentEntity!.getListOfgrepGoalsIds()) !== 'undefined') {
      this.setState(
        {
          valueGoalsOptions: store!.currentEntity!.getListOfgrepGoalsIds()!
        }
      );
    }
    if (store!.currentEntity!.isPrivate) {
      this.setState(
        {
          isValid: true,
          isValidPrivate: true
        },
        () => {
          if (store!.currentEntity!.isMySchool) {
            this.setState(
              {
                isMyStateSchool: true,
                isValidPrivate: false
              }
            );
            this.props.store!.currentEntity!.setIsMySchool(true);
          } else {
            this.setState(
              {
                isMyStateSchool: false,
                isValidPrivate: true
              }
            );
            this.props.store!.currentEntity!.setIsMySchool(false);
          }
          this.sendValidbutton();
        }
      );
    } else {
      this.setState(
        {
          isValidPrivate: false,
          isMyStateSchool: false
        }
      );
      this.props.store!.currentEntity!.setIsMySchool(false);
      this.sendValidbutton();
    }
    this.setState({ IsVisibilityButtons: false });
    const myschools = store!.getCurrentUser()!.schools;
    const arraySchoolIds = this.state.optionsMySchool;
    const editSchools = this.props.store!.currentEntity!.getMySchool();
    if (editSchools && editSchools!.length > 0) {
      editSchools!.forEach((school) => {
        arraySchoolIds.push(school.id);
      });
    } else {
      myschools.forEach((school) => {
        arraySchoolIds.push(school.id);
      });
    }
    this.setState({ optionsMySchool: arraySchoolIds });
    this.props.store!.currentEntity!.setMySchool(String(arraySchoolIds));
    if (typeof (store!.currentEntity!.getListOfSources()) !== 'undefined') {
      this.setState(
        {
          valueSourceOptions: store!.currentEntity!.getListOfSources()!
        }
      );
    }
    if (typeof (store!.currentEntity!.getListOfKeywords()) !== 'undefined') {
      this.setState(
        {
          valueKeywordsOptions: store!.currentEntity!.getListOfKeywords()!
        }
      );
    }
    if (typeof (store!.currentEntity!.localeId!) !== 'undefined' && store!.currentEntity!.localeId! !== null) {
      this.setState({ valueLocaleId: store!.currentEntity!.localeId! });
    } else {
      const currentLang = LANGUAGES.find(i => i.shortName === localStorage.getItem('currentLocale'))!;
      this.setState({
        valueLocaleId: currentLang.langId
      },
        () => {
          store!.currentEntity!.setLocaleId(currentLang.langId);
        });
    }
    if (typeof (store!.currentEntity!.getListOfgrepCoreElementsIds()) !== 'undefined') {
      this.setState({
        valueCoreOptions: store!.currentEntity!.getListOfgrepCoreElementsIds()!
      });
    }
    if (typeof (store!.currentEntity!.getListOfgrepMainTopicsIds()) !== 'undefined') {
      this.setState({
        valueMultiOptions: store!.currentEntity!.getListOfgrepMainTopicsIds()!
      });
    }
    if (typeof (store!.currentEntity!.getListOfgrepReadingInSubjectId()) !== 'undefined') {
      this.setState(
        {
          valuereadingOptions: store!.currentEntity!.getListOfgrepReadingInSubjectId()!
        }
      );
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
    const grepFiltergoalssDataAwait = await store!.getGrepGoalsFilters(this.state.valueCoreOptions, this.state.valueMultiOptions, arraySelectedIdsNewsManagemdGrades, arraySelectedIdsNewsManagemdSubjects, listGoals, MAGICNUMBER100, MAGICNUMBER1);
    this.setState(
      {
        optionsGoals: grepFiltergoalssDataAwait.data,
      },
      () => {
        if (this.state.editvalueGoalsOptions !== null && typeof (this.state.editvalueGoalsOptions) !== 'undefined') {
          if (this.state.editvalueGoalsOptions!.length === 0) {
            this.setState(
              {
                valueGoalsOptions: this.transformDataToStringDat(listGoals, this.state.optionsGoals).sort((a, b) => a - b)
              },
              () => {
                this.comparativeGoalsValueToFilter();
              }
            );
          }
        } else {
          this.setState(
            {
              valueGoalsOptions: this.transformDataToStringDat(listGoals, this.state.optionsGoals).sort((a, b) => a - b)
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
        page: grepFiltergoalssDataAwait.total_pages
      }
    );
    if (grepFiltergoalssDataAwait.data.length > 0) { this.setState({ loadingGoals: false }); }
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
            optionsGoals: allOptions
          },
          () => {
            this.sendValidbutton();
          }
        );
      }
    }
  }

  public transformDataToStringDat = (data: Array<String>, options: Array<GoalsData>) => {
    const returnArray: Array<number> = [];
    data!.forEach((element) => {
      for (let i = 0; i < options.length; i = i + 1) {
        if (element === options[i].code) {
          if (!returnArray.includes(options[i].id!)) {
            returnArray.push(options[i].id!);
          }
        }
      }
    });
    return returnArray;
  }

  public transformDataToString = (data: Array<GreepElements>) => {
    const returnArray: Array<string> = [];
    data!.forEach((element) => {
      if (typeof (element) !== 'undefined') {
        returnArray.push(element.kode);
      }
    });
    return returnArray;
  }

  public transformDataToStringOrString = (data: Array<GreepElements>) => {
    const returnArray: Array<string> = [];
    if (data.length > 0) {
      data!.forEach((element) => {
        if (typeof (element) !== 'undefined') {
          returnArray.push(element.kode);
        }
      });
    }
    return returnArray;
  }

  public renderValueOptions = (data: FilterGrep, type: string) => {
    const returnArray: Array<GreepSelectValue> = [];
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
    const returnArray: Array<GrepFilters> = [];
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

  public sourceToTagProp = (source: Source): TagPropSource => ({
    id: source.id,
    title: source.title,
    default: source.default,
  })

  public keywordToTagProp = (keyword: Keyword): TagKeywordProp => ({
    description: keyword.description,
  })

  public filterGrepGoals = async (coreoptions: Array<number>, multioptions: Array<number>, gradeoptions: Array<number>, subjectsoptions: Array<number>, goalsoptions: Array<string>) => {
    await new Promise(resolve => setTimeout(resolve, SETTIMEOUT));
    const grepFiltergoalssDataAwait = await this.props.store!.getGrepGoalsFilters(coreoptions, multioptions, gradeoptions, subjectsoptions, goalsoptions, MAGICNUMBER100, MAGICNUMBER1);
    return grepFiltergoalssDataAwait;
  }

  public addSubject = async (id: number) => {
    const { store } = this.props;
    const subject = store!.getAllSubjects().find(subject => subject.id === id);
    if (subject) {
      store!.currentEntity!.addSubject(subject);
      this.setState({ loadingGoals: true });
      this.setState(
        {
          optionsMySubjects: [...this.state.optionsMySubjects, subject]
        },
        () => {
          this.forceUpdate();
        }
      );
    }
  }

  public forceUpdate = async () => {
    const { store } = this.props;
    // updatedata
    const arraySelectedIdsGrades: Array<number> = [];
    const arraySelectedIdsSubjects: Array<number> = [];
    const arraySelectedIdsGradesManagmend: Array<number> = [];
    const arraySelectedIdsSubjectsManagmend: Array<number> = [];
    this.state.optionsMyGrades.forEach((ee) => {
      arraySelectedIdsGrades.push(Number(ee.id));
      arraySelectedIdsGradesManagmend.push(Number(ee.managementId));
    });
    this.state.optionsMySubjects.forEach((ee) => {
      arraySelectedIdsSubjects.push(Number(ee.id));
      arraySelectedIdsSubjectsManagmend.push(Number(ee.managementId));
    });
    const grepFiltersDataAwait = await store!.getGrepFilters(String(arraySelectedIdsGrades), String(arraySelectedIdsSubjects));
    this.setState({
      grepFiltersData: grepFiltersDataAwait,
      optionsCore: this.renderValueOptions(grepFiltersDataAwait, 'core'),
      optionsMulti: this.renderValueOptions(grepFiltersDataAwait, 'multi')
    });
    /* tslint:disable-next-line:max-line-length */
    const grepFiltergoalssDataAwait = await this.filterGrepGoals(this.state.valueCoreOptions, this.state.valueMultiOptions, arraySelectedIdsGradesManagmend, arraySelectedIdsSubjectsManagmend, this.state.valueStringGoalsOptions);
    this.setState(
      {
        optionsGoals: grepFiltergoalssDataAwait.data
      },
      () => {
        this.sendValidbutton();
      }
    );
    this.setState(
      {
        // tslint:disable-next-line: variable-name
        page: grepFiltergoalssDataAwait.total_pages,
        // valueGoalsOptions : [],
        loadingGoals: false
      }
    );
    this.comparativeGoalsValueToFilter();
    this.setState({ pageCurrent: MAGICNUMBER1 });
  }

  public removeSubject = async (id: number) => {
    const { store } = this.props;
    const subject = store!.getAllSubjects().find(subject => subject.id === id);
    const arrayRemove: Array<Subject> = [];
    if (subject) {
      store!.currentEntity!.removeSubject(subject);
      this.setState({ loadingGoals: true });
      this.state.optionsMySubjects.forEach((e) => {
        if (e.id !== subject.id) { arrayRemove.push(e); }
      });
      this.setState(
        {
          optionsMySubjects: arrayRemove
        },
        () => {
          this.forceUpdate();
        }
      );
    }
  }

  public gradeToTagProp = (grade: Grade): TagProp => ({
    id: grade.id,
    title: grade.title,
  })

  public addGrade = async (id: number) => {
    const { store } = this.props;
    const grade = store!.getAllGrades().find(grade => grade.id === id);
    if (grade) {
      store!.currentEntity!.addGrade(grade);
      this.setState({
        loadingGoals: true,
        optionsMyGrades: [...this.state.optionsMyGrades, grade]
      },
        () => {
          this.forceUpdate();
        }
      );
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
    const grade = store!.getAllGrades().find(grade => grade.id === id);
    const arrayRemove: Array<Grade> = [];
    if (grade) {
      store!.currentEntity!.removeGrade(grade);
      this.setState({ loadingGoals: true });
      this.state.optionsMyGrades.forEach((e) => {
        if (e.id !== grade.id) { arrayRemove.push(e); }
      });
      this.setState(
        {
          optionsMyGrades: arrayRemove
        },
        () => {
          this.forceUpdate();
        }
      );
    }
  }

  public validateAddTeacherContentDefault = (isPrivate: boolean) => {
    const { store } = this.props;
    if (store!.getCurrentUser()!.type === UserType.Teacher) {
      const source = store!.getAllSources().map(this.sourceToTagProp).find(w => w.default);
      if (source !== undefined) {
        const teacherContentId = source!.id as number;
        if (!(isPrivate)) {
          this.addSource(teacherContentId);
        } else {
          this.removeSource(teacherContentId);
        }
      }
    }
  }
  public handlePrivateOn = () => {
    this.setState(
      {
        isValid: true,
        isValidPrivate: true,
        isMyStateSchool: false
      },
      () => {
        this.validateAddTeacherContentDefault(true);
        this.sendValidbutton();
        if (this.props.store!.getCurrentUser()!.type === UserType.ContentManager) {
          this.props.store!.currentEntity!.setGrepSourcesIds([]);
          this.props.store!.currentEntity!.setOpen(false);
          this.setState({ isOpen: false });
        }
      }
    );
    this.props.store!.currentEntity!.setIsPrivate(true);
    this.props.store!.currentEntity!.setIsMySchool(false);
  }

  public handleMySchoolOn = () => {
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
        title: this.labels.copyWordInTitleNotAllowed
      });

      return;
    }
    this.setState(
      {
        isValid: true,
        isValidPrivate: false,
        isMyStateSchool: true
      },
      () => {
        this.validateAddTeacherContentDefault(true);
        this.sendValidbutton();
      }
    );
    this.props.store!.currentEntity!.setIsPrivate(true);
    this.props.store!.currentEntity!.setIsMySchool(true);
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
        title: this.labels.copyWordInTitleNotAllowed,
      });

      return;
    }
    this.setState(
      {
        isValid: false,
        isValidPrivate: false,
        isMyStateSchool: false
      },
      () => {
        this.validateAddTeacherContentDefault(false);
        this.sendValidbutton();
      }
    );
    this.props.store!.currentEntity!.setIsPrivate(false);
    this.props.store!.currentEntity!.setIsMySchool(false);
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

  public removeSource = async (id: number) => {
    const { currentEntity } = this.props.store!;
    const { valueSourceOptions } = this.state;
    const ArrayValueSource = this.state.valueSourceOptions;
    const index = ArrayValueSource.indexOf(id);

    if (index > -1) {
      ArrayValueSource.splice(index, 1);
    }

    if (!valueSourceOptions.includes(id)) {
      this.setState(
        {
          valueSourceOptions: ArrayValueSource
        },
        () => {
          currentEntity!.setGrepSourcesIds(this.state.valueSourceOptions);
        }
      );
    }
  }

  public addSource = async (id: number) => {
    const { currentEntity } = this.props.store!;
    /* const { valueSourceOptions } = this.state; */
    const ArrayValueSource = this.state.valueSourceOptions;
    ArrayValueSource.push(id);
    const uniqueArray = ArrayValueSource.filter((item, pos) => (ArrayValueSource.indexOf(item) === pos));
    this.setState(
      {
        valueSourceOptions: uniqueArray
      },
      () => {
        currentEntity!.setGrepSourcesIds(this.state.valueSourceOptions);
      }
    );
  }

  public toggleisOpen = () => {
    const { store, from } = this.props;
    const myisOpen = this.state.isOpen;
    if (myisOpen) {
      store!.currentEntity!.setOpen(false);
      this.setState({ isOpen: false });
    } else {
      store!.currentEntity!.setOpen(true);
      this.setState({ isOpen: true });
    }
  }

  public renderSourceInput = () => {
    const { store, from } = this.props;
    const sources = store!.getAllSources().map(this.sourceToTagProp);
    const selectedSources = this.grepNumbersToTagprop(store!.currentEntity!.getListOfSources(), sources);
    const myplaceholder = (selectedSources.length > 0) ? '' : this.labels.labelSource;
    const isOpen = this.state.isOpen;
    const isChecked = (isOpen) ? PublishingActionsIcons.checkActive : PublishingActionsIcons.checkRounded;
    const textIsOpen = (from === 'TEACHINGPATH') ? this.labels.isOpenTeachingPath : this.labels.isOpenAssignment;
    let classHidden = 'InformationSource hidden';
    if (store!.getCurrentUser()!.type === UserType.ContentManager) { classHidden = 'InformationSource'; }

    return (
      <div className={classHidden}>
        <div className="infoContainer__secondTitle">
          <h2>{this.labels.labelTitleIsOpen}</h2>
          <div className="itemsFlex subject">
            <TagInputComponent
              className="filterBy darkTheme"
              tags={sources}
              addTag={this.addSource}
              currentTags={selectedSources}
              orderbyid={false}
              removeTag={this.removeSource}
              placeholder={myplaceholder}
              listView
              temporaryTagsArray
            />
            <div className="filterCheck isOpen" onClick={this.toggleisOpen}>
              <img src={isChecked} />
              <p>{textIsOpen}</p>
            </div>
          </div>
          {this.renderKeywordsInput()}
          {this.renderLanguagesInput()}
        </div>
      </div>
    );
  }

  public addKeyword = async (description: string) => {
    const { currentEntity } = this.props.store!;
    const ArrayValueKeywords = this.state.valueKeywordsOptions;
    ArrayValueKeywords.push(description);
    const uniqueArray = ArrayValueKeywords.filter((item, pos) => (ArrayValueKeywords.indexOf(item) === pos));
    this.setState(
      {
        valueKeywordsOptions: uniqueArray
      },
      () => {
        currentEntity!.setGrepKeywordsIds(this.state.valueKeywordsOptions);
      }
    );

  }

  public removeKeyword = async (description: string) => {
    const { currentEntity } = this.props.store!;
    const { valueKeywordsOptions } = this.state;
    const ArrayValueKeywords = this.state.valueKeywordsOptions;
    const index = ArrayValueKeywords.indexOf(description);

    if (index > -1) {
      ArrayValueKeywords.splice(index, 1);
    }

    if (!valueKeywordsOptions.includes(description)) {
      this.setState(
        {
          valueKeywordsOptions: ArrayValueKeywords
        },
        () => {
          currentEntity!.setGrepKeywordsIds(this.state.valueKeywordsOptions);
        }
      );
    }

  }

  public renderKeywordsInput = () => {
    const { store, from } = this.props;
    const { valueKeywordsOptions } = this.state;
    const selected = valueKeywordsOptions!.map(item => new Keyword(item)).map(this.keywordToTagProp);
    const keywords = [...store!.getAllKeywords().map(this.keywordToTagProp), ...selected];
    const selectedKeywords = this.grepNumbersToTagKeywordProp(store!.currentEntity!.getListOfKeywords(), keywords).length > 0 ?
      this.grepNumbersToTagKeywordProp(store!.currentEntity!.getListOfKeywords(), keywords).filter((v, i, a) => a.findIndex(v2 => (v2.description === v.description)) === i) : selected!;
    const listAndSelectedKeywords = [...keywords!, ...selected!].filter((v, i, a) => a.findIndex(v2 => (v2.description === v.description)) === i);
    const myplaceholder = (selectedKeywords.length > 0) ? '' : this.labels.placeholderKeywords;
    return (
      <div>
        <TagKeywordInputComponent
          className="filterBy darkTheme"
          store={store}
          tags={listAndSelectedKeywords}
          addTag={this.addKeyword}
          currentTags={selectedKeywords}
          orderbydescription={false}
          removeTag={this.removeKeyword}
          placeholder={myplaceholder}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public renderLanguagesInput = () => {
    const { valueLocaleId } = this.state;

    const languages: Array<TagProp> = [];
    LANGUAGES.forEach((item) => { languages.push({ id: Number(item.langId), title: item.shortDescription }); });

    const selectedLanguage: Array<TagProp> = [];
    if (valueLocaleId !== null) { selectedLanguage.push(languages.find(i => i.id === valueLocaleId)!); }

    const myplaceholder = (selectedLanguage.length > 0) ? '' : this.labels.placeholderLanguages;

    return (
      <div>
        <TagInputComponent
          className="filterBy darkTheme"
          tags={languages}
          addTag={this.addLanguage}
          currentTags={selectedLanguage}
          orderbyid={false}
          removeTag={this.removeLanguage}
          placeholder={myplaceholder}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public addLanguage = async (id: number) => {
    const { currentEntity } = this.props.store!;

    this.setState(
      {
        valueLocaleId: id
      },
      () => {
        currentEntity!.setLocaleId(id);
      }
    );
  }

  public removeLanguage = async (id: number) => {
    const { currentEntity } = this.props.store!;
    this.setState(
      {
        valueLocaleId: null
      },
      () => {
        currentEntity!.setLocaleId(null);
      }
    );
  }

  public renderSubjectInput = () => {
    const { store } = this.props;
    const selectedSubjects = this.state.optionsMySubjects.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i).map(this.gradeToTagProp);
    const myplaceholder = (selectedSubjects.length > 0) ? '' : this.labels.placeholderSubjects;
    const subjects = store!.getAllSubjects().filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i).map(this.subjectToTagProp);
    return (
      <div className="itemsFlex subject">
        <TagInputComponent
          dataid="renderSubjectInput"
          className="filterBy darkTheme"
          tags={subjects}
          addTag={this.addSubject}
          currentTags={selectedSubjects}
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
    const selectedGrades = this.state.optionsMyGrades.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i).map(this.gradeToTagProp);
    const myplaceholder = (selectedGrades.length > 0) ? '' : this.labels.placeholderGrades;
    const grades = store!.getAllGrades().filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i).map(this.gradeToTagProp).sort((a, b) => a.id - b.id);
    return (
      <div className="itemsFlex grade">
        <TagInputComponent
          dataid="renderGradeInput"
          className="filterBy darkTheme"
          tags={grades}
          addTag={this.addGrade}
          currentTags={selectedGrades}
          orderbyid={true}
          removeTag={this.removeGrade}
          placeholder={myplaceholder}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public renderVisibility = () => {
    const { store } = this.props;
    const isTeacher = (store!.getCurrentUser()!.type !== UserType.Teacher) ? true : false;

    const privateButtonClassnames = classnames(
      'flexBox justifyCenter alignCenter w50',
      {
        active: store!.currentEntity!.isPrivate && !this.state.isMyStateSchool,
      }
    );

    const publicButtonClassnames = classnames(
      'flexBox justifyCenter alignCenter w50',
      {
        active: !store!.currentEntity!.isPrivate && !this.state.isMyStateSchool,
      }
    );

    const mySchoolButtonClassnames = classnames(
      'flexBox justifyCenter alignCenter w50',
      {
        active: store!.currentEntity!.isPrivate && this.state.isMyStateSchool,
        hidden: isTeacher
      }
    );

    const IsVisibilityButtons = (this.state.IsVisibilityButtons) ? 'visibilityButtons flexBox preloading' : 'visibilityButtons flexBox';

    return (
      <div className="visibility">
        <div className="flexBox flex-align">
          <img src={PublishingActionsIcons.visibilityImg} alt={this.labels.textVisibilityForImage} title={this.labels.textVisibilityForImage} />
          <div className={'title'}>{this.labels.labelVisibility}</div>
        </div>
        <p>{this.labels.textvisibilityDescription}</p>
        <div className={IsVisibilityButtons}>
          <button
            className={mySchoolButtonClassnames}
            onClick={this.handleMySchoolOn}
            title={this.labels.labelMySchoolButton}
          >
            <img
              src={PublishingActionsIcons.publicIconImg}
              alt="Public"
              title={this.labels.labelMySchoolButton}
            />
            {this.labels.labelMySchoolButton}
          </button>
          <button
            className={publicButtonClassnames}
            onClick={this.handlePrivateOff}
            title={this.labels.labelPublicButton}
          >
            <img
              src={PublishingActionsIcons.publicIconImg}
              alt="Public"
              title={this.labels.labelPublicButton}
            />
            {this.labels.labelPublicButton}
          </button>

          <button
            className={privateButtonClassnames}
            onClick={this.handlePrivateOn}
            title={this.labels.labelPrivateButton}
          >
            <img
              src={PublishingActionsIcons.privateIconImg}
              alt="Private"
              title={this.labels.labelPrivateButton}
            />
            {this.labels.labelPrivateButton}
          </button>
        </div>
      </div>
    );
  }

  public searchValueInArrays = (emisor: Array<GreepSelectValue>, receptor: Array<number> | undefined) => {
    let valueCoreElement: any = emisor[0];
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
      this.setState({ loadingGoals: true });
      /* tslint:disable-next-line:max-line-length */
      const grepFiltergoalssDataAwait = await this.filterGrepGoals(newValue.value, this.state.valueMultiOptions, this.state.valueGradesOptions, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions);
      this.setState({
        optionsGoals: grepFiltergoalssDataAwait.data
      });
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page: grepFiltergoalssDataAwait.total_pages,
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
      this.setState({ loadingGoals: true });
      /* tslint:disable-next-line:max-line-length */
      const grepFiltergoalssDataAwait = await this.filterGrepGoals([], this.state.valueMultiOptions, this.state.valueGradesOptions, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions);
      this.setState({
        optionsGoals: grepFiltergoalssDataAwait.data
      });
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page: grepFiltergoalssDataAwait.total_pages,
          // valueGoalsOptions : [],
          loadingGoals: false
        }
      );
      this.setState({
        pageCurrent: MAGICNUMBER1,
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

  public grepToTagProp = (grade: GreepSelectValue): TagProp => ({
    id: Number(grade.value),
    title: grade.label,
  })

  public grepNumbersToTagprop = (data: Array<Number> | undefined, validArray: Array<TagProp>) => {
    const returnArray: Array<TagProp> = [];
    if (typeof (validArray) !== 'undefined') {
      validArray.forEach((e) => {
        if (data !== null) {
          if (typeof (data) !== 'undefined') {
            if (data!.includes(Number(e.id))) {
              returnArray.push(
                {
                  id: e.id,
                  title: e.title
                }
              );
            }
          }
        }
      });
    }
    return returnArray;
  }

  public grepNumbersToTagKeywordProp = (data: Array<string> | undefined, validArray: Array<TagKeywordProp>) => {
    const returnArray: Array<TagKeywordProp> = [];
    if (typeof (validArray) !== 'undefined') {
      validArray.forEach((e) => {
        if (data !== null) {
          if (typeof (data) !== 'undefined') {
            if (data!.includes(String(e.description))) {
              returnArray.push(
                {
                  description: e.description
                }
              );
            }
          }
        }
      });
    }
    return returnArray;
  }

  public addCore = async (id: number) => {
    const { store } = this.props;
    const ArrayValueCores = this.state.valueCoreOptions;
    ArrayValueCores.push(id);
    const uniqueArray = ArrayValueCores.filter((item, pos) => (ArrayValueCores.indexOf(item) === pos));
    this.setState({ loadingGoals: true });
    this.setState(
      {
        valueCoreOptions: uniqueArray
      },
      () => {
        this.forceUpdate();
        store!.currentEntity!.setGrepCoreElementsIds(this.state.valueCoreOptions);
      }
    );
  }

  public removeCore = async (id: number) => {
    const { currentEntity } = this.props.store!;
    const { valueCoreOptions } = this.state;
    const ArrayValueCores = this.state.valueCoreOptions;
    const index = ArrayValueCores.indexOf(id);
    if (index > -1) {
      ArrayValueCores.splice(index, 1);
    }
    this.setState({ loadingGoals: true });
    if (!valueCoreOptions.includes(id)) {
      this.setState(
        {
          valueCoreOptions: ArrayValueCores
        },
        () => {
          this.forceUpdate();
          currentEntity!.setGrepCoreElementsIds(this.state.valueCoreOptions);
        }
      );
    }
  }

  public renderCoreElements = () => {
    const { store } = this.props;
    const { optionsCore } = this.state;
    const newOptionsCore = optionsCore.map(this.grepToTagProp);
    const selectedCore = this.grepNumbersToTagprop(store!.currentEntity!.getListOfgrepCoreElementsIds(), newOptionsCore);
    const myplaceholder = (selectedCore.length > 0) ? '' : this.labels.placeholderCoreElements;
    return (
      <div className="itemsFlex grade">
        <TagInputComponent
          dataid="renderGradeInput"
          className="filterBy darkTheme"
          tags={newOptionsCore}
          addTag={this.addCore}
          currentTags={selectedCore}
          orderbyid={true}
          removeTag={this.removeCore}
          placeholder={myplaceholder}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public handleChangeSelectMulti = async (newValue: any) => {
    const { currentEntity } = this.props.store!;
    const { valueMultiOptions } = this.state;
    if (newValue.value !== 0) {
      this.setState({ loadingGoals: true });
      /* tslint:disable-next-line:max-line-length */
      const grepFiltergoalssDataAwait = await this.filterGrepGoals(this.state.valueCoreOptions, newValue.value, this.state.valueGradesOptions, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions);
      this.setState({
        optionsGoals: grepFiltergoalssDataAwait.data,
        // tslint:disable-next-line: variable-name
        page: grepFiltergoalssDataAwait.total_pages,
        loadingGoals: false
      }
      );
      this.comparativeGoalsValueToFilter();
      this.setState({
        pageCurrent: MAGICNUMBER1,
        valueMultiOptions: [...valueMultiOptions, newValue.value]
      },
        () => {
          this.sendValidbutton();
        }
      );
      currentEntity!.setGrepMainTopicsIds([newValue.value]);
    } else {
      this.setState({ loadingGoals: true });
      const grepFiltergoalssDataAwait = await this.filterGrepGoals(this.state.valueCoreOptions, [], this.state.valueGradesOptions, this.state.valueSubjectsOptions, this.state.valueStringGoalsOptions);
      this.setState({
        optionsGoals: grepFiltergoalssDataAwait.data
      });
      this.setState(
        {
          // tslint:disable-next-line: variable-name
          page: grepFiltergoalssDataAwait.total_pages,
          // valueGoalsOptions : [],
          loadingGoals: false
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

  public addMulti = async (id: number) => {
    const { currentEntity } = this.props.store!;
    const ArrayValueMulti = this.state.valueMultiOptions;
    ArrayValueMulti.push(id);
    const uniqueArray = ArrayValueMulti.filter((item, pos) => (ArrayValueMulti.indexOf(item) === pos));
    this.setState({ loadingGoals: true });
    this.setState(
      {
        valueMultiOptions: uniqueArray
      },
      () => {
        this.forceUpdate();
        currentEntity!.setGrepMainTopicsIds(this.state.valueMultiOptions);
      }
    );
  }

  public removeMulti = async (id: number) => {
    const { currentEntity } = this.props.store!;
    const { valueMultiOptions } = this.state;
    const ArrayValueMulti = this.state.valueMultiOptions;
    const index = ArrayValueMulti.indexOf(id);
    if (index > -1) {
      ArrayValueMulti.splice(index, 1);
    }
    this.setState({ loadingGoals: true });
    if (!valueMultiOptions.includes(id)) {
      this.setState(
        {
          valueMultiOptions: ArrayValueMulti
        },
        () => {
          this.forceUpdate();
          currentEntity!.setGrepMainTopicsIds(this.state.valueMultiOptions);
        }
      );
    }
  }

  public renderMultiDisciplinary = () => {
    const { store } = this.props;
    const { optionsMulti } = this.state;
    const newOptionsMulti = optionsMulti.map(this.grepToTagProp);
    const selectedMulti = this.grepNumbersToTagprop(store!.currentEntity!.getListOfgrepMainTopicsIds(), newOptionsMulti);
    const myplaceholder = (selectedMulti.length > 0) ? '' : this.labels.placeholderMultiDisciplinarySubjects;
    return (
      <div className="itemsFlex grade">
        <TagInputComponent
          dataid="renderGradeInput"
          className="filterBy darkTheme"
          tags={newOptionsMulti}
          addTag={this.addMulti}
          currentTags={selectedMulti}
          orderbyid={true}
          removeTag={this.removeMulti}
          placeholder={myplaceholder}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public searchValueInNumbers = (emisor: Array<GreepSelectValue>, receptor: number | undefined) => {
    let valueCoreElement: any = emisor[0];
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

  public addReading = async (id: number) => {
    const { currentEntity } = this.props.store!;
    const { valuereadingOptions } = this.state;
    const ArrayValueReading = (this.state.valuereadingOptions === null) ? [] : this.state.valuereadingOptions;
    ArrayValueReading.push(id);
    const uniqueArray = ArrayValueReading.filter((item, pos) => (ArrayValueReading.indexOf(item) === pos));
    this.setState(
      {
        valuereadingOptions: uniqueArray
      }
    );
    currentEntity!.setGrepReadingInSubjectId(uniqueArray);
  }

  public removeReading = async (id: number) => {
    const { currentEntity } = this.props.store!;
    const { valuereadingOptions } = this.state;
    const ArrayValueReading = this.state.valuereadingOptions;
    const index = ArrayValueReading.indexOf(id);
    if (index > -1) {
      ArrayValueReading.splice(index, 1);
    }
    if (!valuereadingOptions.includes(id)) {
      this.setState(
        {
          valuereadingOptions: ArrayValueReading
        }
      );
      currentEntity!.setGrepReadingInSubjectId(ArrayValueReading);
    }
  }

  public renderReadingInSubject = () => {
    const { store } = this.props;
    const { optionsReading, editvaluereadingOptions } = this.state;
    const newOptionsReading = optionsReading.map(this.grepToTagProp);
    const valueReading = (store!.currentEntity!.getListOfgrepReadingInSubjectId() !== undefined) ? store!.currentEntity!.getListOfgrepReadingInSubjectId() : [];
    const selectedReading = this.grepNumbersToTagprop(valueReading, newOptionsReading);
    const myplaceholder = (selectedReading.length > 0) ? '' : this.labels.placeholderReadingInSubject;
    return (
      <div className="itemsFlex grade">
        <TagInputComponent
          dataid="renderGradeInput"
          className="filterBy darkTheme"
          tags={newOptionsReading}
          addTag={this.addReading}
          currentTags={selectedReading}
          orderbyid={true}
          removeTag={this.removeReading}
          placeholder={myplaceholder}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public sendValidbutton = () => {
    if (!this.state.isValid) {
      if (this.state.optionsMyGrades.length > 0 && this.state.optionsMySubjects.length > 0) {
        this.props.store!.setIsDisabledButtons();
      } else {
        this.props.store!.setIsDisabledButtonsFalse();
      }
      if (this.state.optionsMyGrades.length > 0 && this.state.optionsMySubjects.length > 0 && this.state.valueGoalsOptions.length > 0) {
        this.props.store!.setIsActiveButtons();
      } else {
        if (typeof (this.state.editvalueGoalsOptions) !== 'undefined') {
          if (this.state.editvalueGoalsOptions!.length > 0) {
            if (this.state.optionsMyGrades.length > 0 && this.state.optionsMySubjects.length > 0 && this.state.valueGoalsOptions.length > 0) {
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
      if (this.state.optionsMyGrades.length > 0 && this.state.optionsMySubjects.length > 0) {
        this.props.store!.setIsDisabledButtons();
      } else {
        this.props.store!.setIsDisabledButtonsFalse();
      }
      this.props.store!.setIsActiveButtons();
    }
  }

  public sendTableBodyGoal = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { valueGoalsOptions } = this.state;
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
    const { optionsGoals } = this.state;
    const { currentEntity } = this.props.store!;
    const returnArray: Array<number> = [];
    optionsGoals!.forEach((element) => {
      for (let i = 0; i < this.state.valueGoalsOptions.length; i = i + 1) {
        if (element.id === this.state.valueGoalsOptions[i]) {
          returnArray.push(this.state.valueGoalsOptions[i]);
        }
      }
    });
    this.setState(
      {
        valueGoalsOptions: returnArray
      },
      () => {
        currentEntity!.setGrepGoalsIds(this.state.valueGoalsOptions);
        if (this.props.from === 'TEACHINGPATH') {
          currentEntity!.setListgrepGoalsIds(this.state.valueGoalsOptions);
        }
        this.sendValidbutton();
      }
    );
  }

  public renderTableHeader = () => (
    <div className="itemTablesHeader">
      <div className="itemTablesTh">
        <div className="itemTablesTd icons" />
        <div className="itemTablesTd grade">{this.labels.goalsTableHeaderGrade}</div>
        <div className="itemTablesTd subjects">{this.labels.goalsTableHeaderSubject}</div>
        <div className="itemTablesTd core">{this.labels.goalsTableHeaderCoreElements}</div>
        <div className="itemTablesTd goals">{this.labels.goalsTableHeaderGoalInfo}</div>
      </div>
    </div>
  )

  public transformData = (data: Array<GreepElements>, options: Array<GoalsData>) => {
    const returnArray: Array<number> = [];
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
    const { optionsGoals } = this.state;
    const listGoals = this.state.valueGoalsOptions;
    const myOptionGoals = this.state.optionsGoals;
    const goalsNotSelected: Array<GoalsData> = [];
    let anotherGoals: Array<GoalsData> = [];
    let realOptionsGoals: Array<GoalsData> = [];
    let visibleGoals;
    let activeVisibleGoals = false;
    if (typeof (optionsGoals) !== 'undefined') {
      activeVisibleGoals = true;
    }
    if (listGoals !== null && typeof (listGoals) !== 'undefined') {
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
          const mytitle = (grade.name.split('.').length === 1) ? title : `${title} ${this.labels.labelGrades}`;
          return <span key={grade.id}>{mytitle}</span>;
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
                <img src={PublishingActionsIcons.checkRounded} alt="Check" title="check" className={'checkImg'} />
                <img src={PublishingActionsIcons.checkActive} alt="Check" title="check" className={'checkImgFalse'} />
              </button>
            </div>
            <div className="itemTablesTd grade">{visibleGoalsGrade} </div>
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
          {this.labels.notDdataGoals}
        </div>
      );
    }
    return (
      <div className="itemTablesBody">
        {activeVisibleGoals && visibleGoals}
      </div>
    );
  }

  public renderGoals = () => (
    <div className="infoContainer__body">
      <div className="infoContainer__body__title">
        <img src={PublishingActionsIcons.goalsImg} />
        <h3>{this.labels.labelGoals}</h3>
      </div>
      <div className="infoContainer__body__table">
        {this.renderTableHeader()}
        {this.renderTableBody()}
      </div>
    </div>
  )

  public addSkole = async (id: number) => {
    const { store } = this.props;
    const arraySchool: Array<TagProp> = [];
    const myschools = store!.getCurrentUser()!.schools;
    myschools.forEach((school) => {
      arraySchool.push({
        id: school.id,
        title: school.name
      });
    });
    const skole = myschools.find(skole => skole.id === id);
    if (skole) {
      this.setState(
        {
          optionsMySchool: [...this.state.optionsMySchool, skole.id]
        },
        () => {
          store!.currentEntity!.setMySchool(String(this.state.optionsMySchool));
        }
      );
    }
  }

  public removeSkole = async (id: number) => {
    const { store } = this.props;
    const arraySchool: Array<TagProp> = [];
    const myschools = store!.getCurrentUser()!.schools;
    myschools.forEach((school) => {
      arraySchool.push({
        id: school.id,
        title: school.name
      });
    });
    const skole = myschools.find(skole => skole.id === id);
    const arrayRemove: Array<number> = [];
    if (skole) {
      if (this.state.optionsMySchool.length > 1) {
        this.state.optionsMySchool.forEach((e) => {
          if (e !== skole.id) { arrayRemove.push(e); }
        });
        this.setState(
          {
            optionsMySchool: arrayRemove
          },
          () => {
            store!.currentEntity!.setMySchool(String(this.state.optionsMySchool));
          }
        );
      } else {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: this.labels.dontEmpty
        });
      }
    }
  }

  public renderSkoleInput = (allSkole: Array<TagProp>) => {
    const selectedMySkole = this.state.optionsMySchool;
    const selectedMySkoleTagProp: Array<TagProp> = [];
    allSkole.forEach((skole) => {
      if (selectedMySkole.includes(skole.id)) {
        selectedMySkoleTagProp.push(skole);
      }
    });
    const myplaceholder = (selectedMySkoleTagProp.length > 0) ? '' : this.labels.selectedMySchools;

    return (
      <div className="itemsFlex grade">
        <TagInputComponent
          dataid="renderGradeInput"
          className="filterBy darkTheme"
          tags={allSkole}
          addTag={this.addSkole}
          currentTags={selectedMySkoleTagProp}
          orderbyid={true}
          removeTag={this.removeSkole}
          placeholder={myplaceholder}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public renderMySchool = () => {
    const { store } = this.props;
    const isTeacher = (store!.getCurrentUser()!.type === UserType.Teacher) ? true : false;
    const arraySchool: Array<TagProp> = [];
    const myschools = store!.getCurrentUser()!.schools;
    myschools.forEach((school) => {
      arraySchool.push({
        id: school.id,
        title: school.name
      });
    });

    if (isTeacher && myschools.length > 1) {
      return (
        <div className="infoContainer__top__skole">
          <p>{this.labels.selectedMySchools}</p>
          <div className="skoleInput">
            {this.renderSkoleInput(arraySchool)}
          </div>
        </div>
      );
    }
  }

  public render() {
    const { from } = this.props;
    const titleSimple = (this.state.isValidPrivate) ? this.labels.titleForPrivateSelected : this.labels.titleVariantPrivateNotSelected;
    const descriptionText = (this.state.isValid) ? this.labels.descriptionForPrivateSelected : (from === 'TEACHINGPATH') ? this.labels.descriptionForPublicSelectedTeachingPath : this.labels.descriptionForPublicSelectedAssignment;
    return (
      <div className="PublishingActions flexBox dirColumn">
        <div className="infoContainer">
          <div className="infoContainer__top">
            {this.renderVisibility()}
            {this.state.isMyStateSchool && this.renderMySchool()}
          </div>
          <div className="infoContainer__bottom">
            {!this.state.isValidPrivate && this.renderSourceInput()}
            <div className="infoContainer__secondTitle">
              <h2>{titleSimple}</h2>
              <p>{!this.state.isValidPrivate && descriptionText}</p>
            </div>
            <div className="infoContainer__filters">
              {this.renderGradeInput()}
              {this.renderSubjectInput()}
              {false && !this.state.isValidPrivate && this.renderCoreElements()}
              {false && !this.state.isValidPrivate && this.renderMultiDisciplinary()}
              {!this.state.isValidPrivate && this.renderReadingInSubject()}
            </div>
            {!this.state.isValidPrivate && this.renderGoals()}
          </div>
        </div>
      </div>
    );
  }
}
