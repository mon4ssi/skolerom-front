import React, { Component, ChangeEvent, useState } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import isNaN from 'lodash/isNaN';

import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { ItemContentTypeContext } from 'teachingPath/view/EditTeachingPath/ItemContentTypeContext';
import { Article, Subject, Greep, FilterArticlePanel, Grade } from 'assignment/Assignment';
import { RelatedArticlesCard } from 'assignment/view/NewAssignment/Preview/RelatedArticlesPreview/RelatedArticlesCard';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { lettersNoEn } from 'utils/lettersNoEn';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { ReadingArticle } from 'components/pages/ReadingArticle/ReadingArticle';

import closeImg from 'assets/images/close-rounded-black.svg';
import tagsImg from 'assets/images/tags.svg';
import gradeImg from 'assets/images/grade.svg';
import cogsImg from 'assets/images/cogs.svg';
import coreImg from 'assets/images/core.svg';
import goalsImg from 'assets/images/goals.svg';
import backIcon from 'assets/images/back-arrow.svg';

import './ArticlesList.scss';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { SCROLL_OFFSET } from 'utils/constants';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

const showDelay = 500;
interface ArticleItemProps {
  editTeachingPathStore?: EditTeachingPathStore;
  article: Article;
  addItem: (item: Article) => void;
  removeItem: (item: Article) => void;
  toSelectArticle: (item: Article) => void;
  allItems: Array<Article>;
  isEdit?: boolean;
}

@inject('editTeachingPathStore')
@observer
class ArticleItem extends Component<ArticleItemProps> {

  public isArticleSelected = () => {
    const { article, allItems } = this.props;

    return !!allItems.find(
      item => item.id === article.id
    );
  }

  public isSelectedArticle = () => {
    const { article } = this.props;
    const RelatedArticlesCard = Array.from(document.getElementsByClassName('RelatedArticlesCard') as HTMLCollectionOf<HTMLElement>);
    RelatedArticlesCard.forEach((e) => {
      e.classList.remove('selectedArticle');
    });
    const rootDiv = document.getElementById(`relatedarticle_${article.id}`);
    if (typeof (rootDiv) !== 'undefined') {
      rootDiv!.classList.add('selectedArticle');
    }
  }

  public handleSelectArticle = () => {
    const { article, addItem, removeItem } = this.props;

    this.isArticleSelected() ?
      removeItem(article) :
      addItem(article);
  }
  public toSelectArticle = () => {
    const { toSelectArticle, article } = this.props;
    this.isSelectedArticle();
    toSelectArticle(article);
  }

  public render() {
    const { article } = this.props;
    return (
      <RelatedArticlesCard
        article={article}
        isCheckedArticle={this.isArticleSelected()}
        handleArticle={this.handleSelectArticle}
        toSelectArticle={this.toSelectArticle}
      />
    );
  }
}

interface Props {
  editTeachingPathStore?: EditTeachingPathStore;
}

interface State {
  itemsForNewChildren: Array<Article>;
  removingItems: Array<Article>;
  appliedFilters: { [field: string]: number | string };
  isRedirect: boolean;
  greeddata: boolean;
  selectedArticle: Article | null;
  expand: boolean;
  expandCore: boolean;
  expandGoals: boolean;
  expandSubjects: boolean;
  checkArticle: boolean;
  activeGrepFilters: boolean;
  grepDataFilters: FilterArticlePanel | null;
  selectedGradesFilter: Array<Grade>;
  selectedSubjectsFilter: Array<Subject>;
  selectedCoresFilter: Array<Greep>;
  selectedCoresAll: Array<Greep>;
  selectedGradesAll: Array<Grade>;
  selectedSubjectsAll: Array<Subject>;
  selectedMultiFilter: Array<Greep>;
  selectedMultisAll: Array<Greep>;
  selectedGoalsFilter: Array<Greep>;
  selectedGoalsAll: Array<Greep>;
  selectedSourceFilter: Array<Greep>;
  selectedSourceAll: Array<Greep>;
  valueGrade: string;
  valueSubject: string;
  MySelectGrade: Array<number> | null;
  MySelectSubject: Array<number> | null;
  MySelectMulti: Array<number> | null;
  MySelectSource: Array<number> | null;
  showSourceFilter: boolean;
  userFilters: boolean;
  myValueCore: Array<any>;
  goalValueFilter: Array<any>;
  filtersisUsed: boolean;
  filtersAjaxLoading: boolean;
  filtersAjaxLoadingGoals: boolean;
  isEdit: boolean;
  isEditSingle: boolean;
  isChangeArticle: boolean;
  idChangeArticle: number;
}

@inject('editTeachingPathStore')
@observer
export class ArticlesList extends Component<Props, State> {

  public static contextType = ItemContentTypeContext;
  public ref = React.createRef<HTMLDivElement>();
  public refButton = React.createRef<HTMLButtonElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      itemsForNewChildren: [],
      removingItems: [],
      appliedFilters: {},
      isRedirect: false,
      greeddata: false,
      selectedArticle: null,
      expand: true,
      expandCore: true,
      expandGoals: true,
      expandSubjects: true,
      checkArticle: false,
      grepDataFilters: null,
      selectedSubjectsFilter: [],
      selectedGradesFilter: [],
      selectedSubjectsAll: [],
      selectedGradesAll: [],
      selectedCoresAll: [],
      selectedCoresFilter: [],
      selectedMultisAll: [],
      selectedMultiFilter: [],
      selectedGoalsAll: [],
      selectedGoalsFilter: [],
      selectedSourceAll: [],
      selectedSourceFilter: [],
      valueGrade: '',
      valueSubject: '',
      activeGrepFilters: false,
      MySelectGrade: [],
      MySelectSubject: [],
      MySelectMulti: [],
      MySelectSource: [],
      showSourceFilter: false,
      userFilters: false,
      myValueCore: [],
      goalValueFilter: [],
      filtersisUsed: false,
      filtersAjaxLoading: false,
      filtersAjaxLoadingGoals: false,
      isEdit: this.props.editTeachingPathStore!.returnIsEditArticles()!,
      isEditSingle: false,
      isChangeArticle: false,
      idChangeArticle: 0
    };
  }

  public handleChangeFilters = async (filterName: string, filterValue: number | string) => {

    const { editTeachingPathStore } = this.props;
    const allModal = Array.from(document.getElementsByClassName('addItemModal__right') as HTMLCollectionOf<HTMLElement>);
    editTeachingPathStore!.resetCurrentArticlesPage();
    editTeachingPathStore!.resetIsFetchedArticlesListFinished();
    let filters = { ...this.state.appliedFilters };
    allModal[0].classList.add('loadingdata');

    if (!isNaN(filterValue)) {
      filters[filterName] = filterValue;
    } else {
      // tslint:disable-next-line:no-dynamic-delete
      delete filters[filterName];
    }
    if (filterName === 'order') {
      if (filterValue === 'asc') {
        filters.order = filterValue;
      } else {
        delete filters.order;
      }
    }
    if (filterName === 'none') {
      this.setState({ appliedFilters: {} });
      filters = {};
    }

    this.setState({ appliedFilters: filters });
    this.setState({ userFilters: true });
    if (filters.subjects || filters.grades || filters.core || filters.multi || filters.goal || filters.source) {
      this.setState({ filtersisUsed: true });
    } else {
      this.setState({ filtersisUsed: false });
    }
    if (filterName === 'searchTitle') {
      editTeachingPathStore!.getArticlesWithDebounce(filters);
      allModal[0].classList.remove('loadingdata');
    } else {
      await editTeachingPathStore!.getArticles(filters);
      allModal[0].classList.remove('loadingdata');
    }
  }

  public getAllChildrenItems = () => {
    const { currentNode } = this.props.editTeachingPathStore!;
    const EditArticlesSeleted: Array<Article> = [];
    if (this.state.isEdit) {
      currentNode!.items!.forEach((el) => {
        if (Number(el.value.id) === this.props.editTeachingPathStore!.getArticleInEdit()) {
          EditArticlesSeleted.push(el.value as Article);
        }
      });
      this.setState({ idChangeArticle: EditArticlesSeleted[0].id });
      return EditArticlesSeleted;
    }
    return currentNode!.children
      .map(child => child.items!.map(item => item.value))
      .flat() as Array<Article>;
  }

  public getSubjectFromDataArticles = (dataArticles: any) => {
    const newArraySubjects: Array<Subject> = [];
    dataArticles!.subject_filter!.forEach((element: any) => { // subjeeeect filterr
      newArraySubjects.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.subject_id),
        title: element.description!
      });
    });
    return newArraySubjects;
  }

  public async componentDidMount() {
    const newArrayGrades: Array<Grade> = [];
    let newArraySubjects: Array<Subject> = [];
    const newArrayGrepCore: Array<Greep> = [];
    const newArrayGrepMulti: Array<Greep> = [];
    const newArrayGrepGoals: Array<Greep> = [];
    const newArrayGrepSource: Array<Greep> = [];
    const { appliedFilters } = this.state;
    const { articlesList } = this.props.editTeachingPathStore!;
    document.addEventListener('keyup', this.handleKeyboardControl);
    this.refButton.current!.focus();
    if (!this.props.editTeachingPathStore!.fetchingArticles) {
      this.setState({
        userFilters: false
      });
    }
    this.setState({ itemsForNewChildren: this.getAllChildrenItems() });
    const isNextPage = articlesList.length > 0;
    this.props.editTeachingPathStore!.getArticles({ isNextPage, ...appliedFilters });
    this.props.editTeachingPathStore!.getGrades();
    this.props.editTeachingPathStore!.getSubjects();
    this.setState({ filtersAjaxLoading: true });
    this.setState({ filtersAjaxLoadingGoals: true });

    await this.props.editTeachingPathStore!.getFiltersArticlePanel();
    const dataArticles = this.props.editTeachingPathStore!.getAllArticlePanelFilters();

    this.setState({
      grepDataFilters: dataArticles
    });

    // tslint:disable-next-line: variable-name
    dataArticles!.grade_filter!.forEach((element) => {
      if (element.grade_parent === null) {
        newArrayGrades.push({
          // tslint:disable-next-line: variable-name
          id: Number(element.grade_id),
          title: element.description!
        });
      }
    });

    this.setState({
      selectedGradesAll: newArrayGrades
    });
    // tslint:disable-next-line: variable-name

    newArraySubjects = this.getSubjectFromDataArticles(dataArticles);
    this.setState({
      selectedSubjectsAll: newArraySubjects
    });

    // tslint:disable-next-line: variable-name
    dataArticles!.core_elements_filter!.forEach((element) => {
      newArrayGrepCore.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.core_element_id),
        title: element.description!
      });
    });
    this.setState({
      selectedCoresAll: newArrayGrepCore
    });

    // tslint:disable-next-line: variable-name
    dataArticles!.multidisciplinay_filter!.forEach((element) => {
      newArrayGrepMulti.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.main_topic_id),
        title: element.description!
      });
    });
    this.setState({
      selectedMultisAll: newArrayGrepMulti
    });

    // tslint:disable-next-line: variable-name
    dataArticles!.goals_filter!.forEach((element) => {
      newArrayGrepGoals.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.goal_id),
        title: element.description!
      });
    });
    this.setState({
      selectedGoalsAll: newArrayGrepGoals.sort((a, b) => (a.title > b.title) ? 1 : -1)
    });

    // tslint:disable-next-line: variable-name
    dataArticles!.source_filter!.forEach((element) => {
      newArrayGrepSource.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.term_id),
        title: element.description!
      });
    });

    this.setState(
      {
        selectedSourceAll: newArrayGrepSource
      },
      () => {
        if (this.state.selectedSourceAll.length > 1) {
          this.setState({ showSourceFilter: true });
        } else {
          this.setState({ showSourceFilter: false });
        }
      }
    );
    this.setState({
      activeGrepFilters: true
    });
    this.setState({ filtersAjaxLoading: false });
    this.setState({ filtersAjaxLoadingGoals: false });
  }

  public async componentWillUnmount() {
    if (!this.state.isRedirect) {
      this.props.editTeachingPathStore!.setCurrentNode(null);
    }
    this.props.editTeachingPathStore!.resetCurrentArticlesPage();
    this.props.editTeachingPathStore!.resetArticlesList();
    this.props.editTeachingPathStore!.resetIsFetchedArticlesListFinished();
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public handleChangeGrade = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.handleChangeFilters('grades', Number(e.target.value));
  }

  public arraysEqual(a: Array<any>, b: Array<any>) {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i = i + 1) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  public refreshAppliedFilters(
    fn: Function,
  ) {
    const gradesForFilters = this.getSelectedGrades();
    const subjectsForFilters = this.getSelectedSubjects();
    const coreElementsForFilter = this.getSelectedCoreElements();
    const mainTopicsForFilter = this.getSelectedMainTopics();
    const goalsForFilter = this.getSelectedGoals();

    const filters = { ...this.state.appliedFilters };
    this.setState({ appliedFilters: {} }, () => {

      /* tslint:disable:no-string-literal */
      filters['subjects'] = String(subjectsForFilters);
      filters['grades'] = String(gradesForFilters);
      filters['core'] = String(coreElementsForFilter);
      filters['multi'] = String(mainTopicsForFilter);
      filters['goal'] = String(goalsForFilter);
      /* tslint:enable:no-string-literal */

      this.setState({ appliedFilters: filters }, () => {

        if (
          filters.subjects ||
          filters.grades ||
          filters.core ||
          filters.multi ||
          filters.goal ||
          filters.source
        ) {
          this.setState({ filtersisUsed: true }, () => {
            this.updateFilters();
            fn();
          });
        } else {

          this.setState({ filtersisUsed: false }, () => {
            this.updateFilters();
            fn();
          });
        }
      });
    });
  }

  public existInGrepList(grepList: Array<Greep>, id: number | Number): boolean {
    let valueReturn = false;
    grepList.forEach((grepElement) => {
      if (grepElement.id === id) {
        valueReturn = true;
      }
    });
    return valueReturn;
  }

  public updateFilters() {
    // let grades = this.getSelectedGrades()!.length === 0 ? this.getAllGrades() : this.getSelectedGrades();
    const grades = this.updateGradesFilters();
    const gradeForFilters = this.getSelectedGrades()!.length === 0 ?
      grades :
      this.getSelectedGrades();

    // subjects
    const subjectResults = this.updateSubjectsFilters(gradeForFilters);
    const subjectForFilters = this.getSelectedSubjects()!.length === 0 ?
      this.getAllSubjects() :
      this.getSelectedSubjects();

    // coreElements
    const coreElementsResult = this.updateCoreElementsFilters(grades, subjectForFilters);
    const coreElementsForFilter = this.getSelectedCoreElements()!.length === 0 ?
      this.getAllCoreElements() :
      this.getSelectedCoreElements();

    // mainTopics
    const mainTopicsResult = this.updateMainTopicsFilters(grades, subjectForFilters, coreElementsForFilter);
    const mainTopicsForFilter = this.getSelectedMainTopics()!.length === 0 ?
      this.getAllMainTopics() :
      this.getSelectedMainTopics();

    // goals
    const goalsResult = this.updateGoalsFilters(grades, subjectForFilters, coreElementsForFilter, mainTopicsForFilter);
    const goalsForFilter = this.getSelectedGoals()!.length === 0 ?
      this.getAllGoals() :
      this.getSelectedGoals();

  }

  public updateHTMLFilters() {

    const grades = this.getSelectedGrades();
    const subjectForFilters = this.getSelectedSubjects();
    const coreElementsForFilter = this.getSelectedCoreElements();
    const mainTopicsForFilter = this.getSelectedMainTopics();
    const goalsForFilter = this.getSelectedGoals();

    // if(grades!.length > 0) {
    //   // ReactDOM.findDOMNode(self.refs.coreElements);
    // }

  }

  public getSubjectsByCoreElements(coreElements: Array<any>) {
    const newSubjects: Array<any> = [];
    this.state.grepDataFilters!.core_elements_filter!.forEach(((coreElement) => {
      if (coreElements.includes(Number(coreElement.core_element_id))) {
        coreElement.grade_ids!.forEach((grade) => {
          grade.subject_ids!.forEach((subjectId) => {
            if (!newSubjects.includes(Number(subjectId))) {
              newSubjects.push(Number(subjectId));
            }
          });
        });
      }
    }));

    return newSubjects;
  }

  public getGradesByCoreElements(coreElements: Array<any>) {
    const newGrades: Array<any> = [];
    this.state.grepDataFilters!.core_elements_filter!.forEach(((coreElement) => {
      if (coreElements.includes(Number(coreElement.core_element_id))) {
        coreElement.grade_ids!.forEach((grade) => {

          if (!newGrades.includes(Number(grade.grade_id!))) {
            newGrades.push(Number(grade.grade_id!));
          }

        });
      }
    }));

    return newGrades;
  }

  public updateGradesFilters(): Array<any> {
    const newArrayGrade: Array<Grade> = [];

    this.state.grepDataFilters!.grade_filter!.forEach(((grade) => {

      // set status
      if (
        this.getSelectedGrades()!.length === 0 &&
        this.getSelectedSubjects()!.length === 0 &&
        this.getSelectedCoreElements()!.length !== 0
      ) {

        const findedGrades = this.getGradesByCoreElements(this.getSelectedCoreElements()!);

        const filterStatus = (findedGrades.length === 0) ? 'active' : findedGrades.includes(Number(grade.grade_id)) ? 'active' : 'inactive';
        const newGrade = {
          // tslint:disable-next-line: variable-name
          filterStatus,
          id: Number(grade.grade_id),
          title: grade.description!
        };
        if (!this.existInGrepList(newArrayGrade, newGrade.id)) {
          newArrayGrade.push(newGrade);
        }
      } else {
        const newGrade = {
          // tslint:disable-next-line: variable-name
          id: Number(grade.grade_id),
          title: grade.description!,
          // filterStatus: 'inactive'
          filterStatus: 'active'
        };
        if (!this.existInGrepList(newArrayGrade, newGrade.id)) {
          newArrayGrade.push(newGrade);
        }
      }

    }));

    this.setState({
      selectedGradesFilter: newArrayGrade
    });
    return newArrayGrade.map(grade => grade.id);
  }

  public updateSubjectsFilters(grades: Array<any> | null = this.getSelectedGrades()): Array<any> {
    const newArraySubject: Array<Subject> = [];
    this.state.grepDataFilters!.subject_filter!.forEach((subject) => {
      // tslint:disable-next-line: variable-name
      subject.grade_ids!.forEach((gradeId) => {

        if (grades!.includes(Number(gradeId))) {
          // set status
          if (
            this.getSelectedGrades()!.length === 0 &&
            this.getSelectedSubjects()!.length === 0 &&
            this.getSelectedCoreElements()!.length !== 0
          ) {
            const findedSubjects = this.getSubjectsByCoreElements(this.getSelectedCoreElements()!);
            const filterStatus = (findedSubjects.length === 0) ? 'active' : findedSubjects.includes(Number(subject.subject_id)) ? 'active' : 'inactive';
            const newSubject = {
              // tslint:disable-next-line: variable-name
              filterStatus,
              id: Number(subject.subject_id),
              title: subject.description!
              // filterStatus: 'inactive'
            };
            if (!this.existInGrepList(newArraySubject, newSubject.id)) {
              newArraySubject.push(newSubject);
            }
          } else {
            // end set status
            const newSubject = {
              // tslint:disable-next-line: variable-name
              id: Number(subject.subject_id),
              title: subject.description!,
              // filterStatus: 'inactive'
              filterStatus: 'active'
            };
            if (!this.existInGrepList(newArraySubject, newSubject.id)) {
              newArraySubject.push(newSubject);
            }
          }

        }
      });

    });

    this.setState({
      selectedSubjectsFilter: newArraySubject
    });

    return newArraySubject.map(subject => subject.id);
  }

  public updateCoreElementsFilters(
    grades: Array<any> | null = this.getSelectedGrades(),
    subjects: Array<any> | null = this.getSelectedSubjects()
  ) {

    const newCoreElements: Array<Greep> = [];

    this.state.grepDataFilters!.core_elements_filter!.forEach(((coreElement) => {
      // tslint:disable-next-line: variable-name
      const allSympSubjects: Array<string> = [];

      coreElement.grade_ids!.forEach(grade =>
        grade.subject_ids!.forEach((subjectId) => {
          if (
            grades!.includes(Number(grade.grade_id)) &&
            subjects!.includes(Number(subjectId))
          ) {
            const newCoreElement = {
              // tslint:disable-next-line: variable-name
              id: Number(coreElement.core_element_id),
              title: coreElement.description!
            };
            if (!this.existInGrepList(newCoreElements, newCoreElement.id)) {
              newCoreElements.push(newCoreElement);
            }
          }
        })
      );

    }));
    this.setState({
      selectedCoresFilter: newCoreElements,
      selectedCoresAll: newCoreElements
    });

    return newCoreElements.map(coreElement => coreElement.id);
  }

  public updateMainTopicsFilters(
    grades: Array<any> | null = this.getSelectedGrades(),
    subjects: Array<any> | null = this.getSelectedSubjects(),
    coreElements: Array<any> | null = this.getSelectedCoreElements()
  ) {
    const newMainTopics: Array<Greep> = [];

    this.state.grepDataFilters!.multidisciplinay_filter!.forEach(((mainTopic) => {
      // tslint:disable-next-line: variable-name

      mainTopic.grade_ids!.forEach(grade =>
        grade.subject_ids!.forEach((subject) => {
          subject.core_element_ids!.forEach((coreElementId) => {
            if (
              grades!.includes(Number(grade.grade_id)) &&
              subjects!.includes(Number(subject.subject_id)) &&
              coreElements!.includes(Number(coreElementId))
            ) {
              const newMainTopic = {
                // tslint:disable-next-line: variable-name
                id: Number(mainTopic.main_topic_id),
                title: mainTopic.description!
              };
              if (!this.existInGrepList(newMainTopics, newMainTopic.id)) {
                newMainTopics.push(newMainTopic);
              }
            }
          });
        })
      );
    }));

    this.setState({
      selectedMultisAll: newMainTopics,
      selectedMultiFilter: newMainTopics,
    });

    return newMainTopics.map(mainTopic => mainTopic.id);
  }

  public updateGoalsFilters(
    grades: Array<any> | null = this.getSelectedGrades(),
    subjects: Array<any> | null = this.getSelectedSubjects(),
    coreElements: Array<any> | null = this.getSelectedSubjects(),
    mainTopics: Array<any> | null = this.getSelectedSubjects()
  ) {
    const newGoals: Array<Greep> = [];

    this.state.grepDataFilters!.goals_filter!.forEach(((goal) => {
      // tslint:disable-next-line: variable-name

      goal.grade_ids!.forEach(grade =>
        grade.subject_ids!.forEach((subject) => {
          subject.core_element_ids!.forEach((coreElement) => {
            coreElement.main_topic_ids!.forEach((mainTopicId) => {
              if (
                grades!.includes(Number(grade.grade_id)) &&
                subjects!.includes(Number(subject.subject_id)) &&
                coreElements!.includes(Number(coreElement.core_element_id)) &&
                mainTopics!.includes(Number(mainTopicId))
              ) {
                const newGoal = {
                  // tslint:disable-next-line: variable-name
                  id: Number(goal.goal_id),
                  title: goal.description!
                };
                if (!this.existInGrepList(newGoals, newGoal.id)) {
                  newGoals.push(newGoal);
                }
              }
            });
          });
        })
      );

    }));
    this.setState({
      selectedGoalsFilter: newGoals,
      selectedGoalsAll: newGoals
    });

    return newGoals.map(goal => goal.id);
  }

  public getAllGrades() {
    const newGrades: Array<Greep> = [];
    this.state.grepDataFilters!.grade_filter!.forEach(((grade) => {
      // tslint:disable-next-line: variable-name
      newGrades.push({
        // tslint:disable-next-line: variable-name
        id: Number(grade.grade_id),
        title: grade.description!
      });

    }));
    return newGrades.map(grade => grade.id);
  }

  public getAllSubjects() {
    const newSubjects: Array<Greep> = [];
    this.state.grepDataFilters!.subject_filter!.forEach(((subject) => {
      // tslint:disable-next-line: variable-name
      newSubjects.push({
        // tslint:disable-next-line: variable-name
        id: Number(subject.subject_id),
        title: subject.description!
      });
    }));
    return newSubjects.map(subject => subject.id);
  }

  public getAllCoreElements() {
    const newCoreElements: Array<Greep> = [];
    this.state.grepDataFilters!.core_elements_filter!.forEach(((coreElement) => {
      // tslint:disable-next-line: variable-name
      newCoreElements.push({
        // tslint:disable-next-line: variable-name
        id: Number(coreElement.core_element_id),
        title: coreElement.description!
      });
    }));
    return newCoreElements.map(coreElement => coreElement.id);
  }

  public getAllMainTopics() {
    const newMainTopics: Array<Greep> = [];
    this.state.grepDataFilters!.multidisciplinay_filter!.forEach(((mainTopic) => {
      // tslint:disable-next-line: variable-name
      newMainTopics.push({
        // tslint:disable-next-line: variable-name
        id: Number(mainTopic.main_topic_id),
        title: mainTopic.description!
      });
    }));
    return newMainTopics.map(mainTopic => mainTopic.id);
  }

  public getAllGoals() {
    const newGoals: Array<Greep> = [];
    this.state.grepDataFilters!.goals_filter!.forEach(((goal) => {
      // tslint:disable-next-line: variable-name
      newGoals.push({
        // tslint:disable-next-line: variable-name
        id: Number(goal.goal_id),
        title: goal.description!
      });

    }));
    return newGoals.map(goal => goal.id);
  }

  public getSelectedGrades(): Array<any> | null {
    const { MySelectGrade } = this.state;
    return MySelectGrade;
  }

  public getSelectedSubjects(): Array<any> | null {
    const { MySelectSubject } = this.state;
    return MySelectSubject;
  }

  public getSelectedCoreElements(): Array<any> | null {
    const { myValueCore } = this.state;
    return myValueCore;
  }

  public getSelectedMainTopics(): Array<any> | null {
    const { MySelectMulti } = this.state;
    return MySelectMulti;
  }

  public getSelectedGoals(): Array<any> | null {
    const { goalValueFilter } = this.state;
    return goalValueFilter;
  }

  public setSelectedGrade(gradeId: number, fn: Function) {
    this.setState(
      {
        MySelectGrade: [gradeId]
      },
      () => {
        fn();
      }
    );
  }

  public setSelectedSubjects(subjects: Array<any>, fn: Function) {
    this.setState(
      {
        MySelectSubject: subjects
      },
      () => {
        fn();
      });
  }

  public setSelectedCoreElements(coreElements: Array<any>, fn: Function) {
    this.setState(
      {
        myValueCore: coreElements!
      },
      () => {
        fn();
      });
  }

  public setSelectedMainTopics(mainTopics: Array<any>, fn: Function) {
    this.setState(
      {
        MySelectMulti: mainTopics!
      },
      () => {
        fn();
      });
  }

  public setSelectedGoals(goals: Array<any>, fn: Function) {
    this.setState(
      {
        goalValueFilter: goals!
      },
      () => {
        fn();
      });

  }

  public addSelectedSubjects(subjectId: number, fn: Function) {
    const currentSelectedSubjects = this.getSelectedSubjects();
    currentSelectedSubjects!.push(subjectId);
    this.setState(
      {
        MySelectSubject: currentSelectedSubjects
      },
      () => {
        fn();
      });

  }

  public addSelectedCoreElements(coreElementId: number, fn: Function) {

    const currentSelectedCoreElements = this.getSelectedCoreElements();
    currentSelectedCoreElements!.push(coreElementId);
    this.setState(
      {
        myValueCore: currentSelectedCoreElements!
      },
      () => {
        fn();
      }
    );

  }

  public addSelectedMainTopics(mainTopicId: number, fn: Function) {

    const currentSelectedMainTopics = this.getSelectedMainTopics();
    currentSelectedMainTopics!.push(mainTopicId);
    this.setState(
      {
        MySelectMulti: currentSelectedMainTopics!
      },
      () => {
        fn();
      });

  }

  public removeSelectedFilter(
    filterToReset: string,
    elementId: number | Number,
    fn: Function,
    e: React.MouseEvent<HTMLButtonElement> | null = null
  ) {

    let selectedElements: Array<any> = [];

    switch (filterToReset) {
      case 'subjects':
        selectedElements = this.getSelectedSubjects()!;
        break;
      case 'grades':
        selectedElements = this.getSelectedGrades()!;
        break;
      case 'coreElements':
        selectedElements = this.getSelectedCoreElements()!;
        break;
      case 'mainTopics':
        selectedElements = this.getSelectedMainTopics()!;
        break;
      case 'goals':
        selectedElements = this.getSelectedGoals()!;
        break;

      default:
        break;
    }

    if (selectedElements.length !== 0) {
      const indexSelected = selectedElements!.indexOf(elementId);
      if (indexSelected > -1) {
        selectedElements!.splice(indexSelected, 1);
      }
      if (this.state.activeGrepFilters && e !== null) {
        e.currentTarget.classList.remove('active');
      }
    }

    switch (filterToReset) {
      case 'subjects':
        this.setSelectedSubjects(selectedElements, fn);
        break;
      case 'grades':
        this.setSelectedGrade(selectedElements[0], fn);
        break;
      case 'coreElements':
        this.setSelectedCoreElements(selectedElements, fn);
        break;
      case 'mainTopics':
        this.setSelectedMainTopics(selectedElements, fn);
        break;
      case 'goals':
        this.setSelectedGoals(selectedElements, fn);
        break;

      default:
        break;
    }

  }

  public waitForIt(fn: Function, willRun: boolean) {
    if (willRun) {
      fn();
    }
  }

  public resetFilters(filters: Array<any>, fn: Function) {
    if (filters.length === 0) {
      fn();
    }
    filters.forEach((filterToReset, index) => {

      if (filterToReset === 'subjects') {

        this.setState(
          {
            MySelectSubject: []
          },
          () => {
            this.waitForIt(fn, filters.length === (index + 1));
          }
        );

      } else if (filterToReset === 'grades') {
        this.setState(
          {
            MySelectGrade: []
          },
          () => {
            this.waitForIt(fn, filters.length === (index + 1));
          }
        );

      } else if (filterToReset === 'coreElements') {
        this.waitForIt(fn, filters.length === (index + 1));
        // this.setState({
        //   myValueCore: []
        // },
        //   () => {
        //     this.waitForIt(fn, filters.length === (index + 1))
        //   });

      } else if (filterToReset === 'mainTopics') {
        this.setState({
          MySelectMulti: []
        });
      } else if (filterToReset === 'goals') {
        this.waitForIt(fn, filters.length === (index + 1));
        // this.setState({
        //   goalValueFilter: []
        // },
        //   () => {
        //     this.waitForIt(fn, filters.length === (index + 1))
        //   });
      }
    });
  }

  public addSelectedGoals(goalId: number, fn: Function) {

    const currentSelectedGoals = this.getSelectedGoals();
    currentSelectedGoals!.push(goalId);
    this.setState(
      {
        goalValueFilter: currentSelectedGoals!
      },
      () => {
        fn();
      }
    );
  }

  public handleChangeSelectCore = async (newValues: Array<any>) => {
    const _newValues = newValues.map(value => value.value);

    this.setSelectedCoreElements(_newValues, () => {
      this.resetFilters(['mainTopics', 'goals'], () => {
        this.refreshAppliedFilters(() => {
          this.handleChangeFilters('core', String(this.getSelectedCoreElements()));
        });
      });
    });
  }

  public handleChangeCore = async (e: React.ChangeEvent<HTMLSelectElement>) => {

    const value = e.currentTarget.value;
    // const valueSelectedGrades = this.state.MySelectGrade;
    let valueSelectedGrades: Array<number> = [];
    if (!this.state.MySelectGrade!.includes(Number(value))) {
      valueSelectedGrades!.push(Number(value));
      if (this.state.activeGrepFilters) {
        e.currentTarget.classList.add('active');

      }
    } else {
      /*const indexSelected = valueSelectedGrades!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedGrades!.splice(indexSelected, 1);
      }*/
      valueSelectedGrades = [];
      if (this.state.activeGrepFilters) {
        e.currentTarget.classList.remove('active');
      }

      this.fillAllSubjects();

      this.resetSubjectFilter();
    }
    this.handleChangeFilters('core', Number(e.target.value));
    this.setState({
      MySelectGrade: valueSelectedGrades
    });

  }

  public handleChangeGoals = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.handleChangeFilters('goal', Number(e.target.value));
  }

  public handleChangeSelectGoals = async (newValues: Array<any>) => {

    if (newValues.length !== 0) {
      const newGoal = Number(newValues[newValues.length - 1].value);
      const selectedGoals = this.getSelectedGoals()!;

      if (!selectedGoals.includes(newGoal)) {

        this.addSelectedGoals(newGoal, () => {
          this.resetFilters(
            [],
            () => {
              this.refreshAppliedFilters(() => {
                this.handleChangeFilters('goal', String(this.getSelectedGoals()));
              });
            }
          );
        });
      } else { // ??

        this.removeSelectedFilter(
          'goals',
          newGoal,
          () => {
            this.refreshAppliedFilters(
              () => {
                this.handleChangeFilters('goal', String(this.getSelectedGoals()));
              });
          },
          null
        );
      }

    } else {
      this.setSelectedGoals([], () => {
        this.resetFilters([], () => {
          this.refreshAppliedFilters(() => {
            this.handleChangeFilters('goal', String(this.getSelectedGoals()));
          });
        });
      });
    }
  }

  public handleChangeSubject = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.handleChangeFilters('subjects', Number(e.target.value));
  }

  public handleChangeSearchQuery = async (e: ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.currentTarget.value)) {
      this.handleChangeFilters('searchTitle', e.currentTarget.value);
    }
  }

  public handleChangeSorting = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.handleChangeFilters('order', e.currentTarget.value);
  }

  public handleClickReset = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const dataCores = this.state.selectedCoresAll;
    const dataCoresFilter = this.state.selectedGoalsFilter;
    const newArrayGrepCore: Array<Greep> = [];
    const newArrayGrepMulti: Array<Greep> = [];
    this.handleChangeFilters('none', 0);
    const GradeFilterSubjectArray = Array.from(document.getElementsByClassName('subjectsFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterSubjectArray.forEach((e) => {
      e.classList.remove('active');
    });
    const GradeFilterGradeArray = Array.from(document.getElementsByClassName('gradesFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterGradeArray.forEach((e) => {
      e.classList.remove('active');
    });
    const GradeFilterMultiArray = Array.from(document.getElementsByClassName('multiFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterMultiArray.forEach((e) => {
      e.classList.remove('active');
    });
    const GradeFilterArray = Array.from(document.getElementsByClassName('sourceFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterArray.forEach((e) => {
      e.classList.remove('active');
    });
    this.setState({ filtersisUsed: false });
    this.setState({ MySelectGrade: [] });
    this.setState({ MySelectSubject: [] });
    this.setState({ MySelectMulti: [] });
    this.setState({ MySelectSource: [] });
    this.setState({ myValueCore: [] });
    this.setState({ goalValueFilter: [] });
    this.setState({ filtersAjaxLoading: true });
    this.setState({ filtersAjaxLoadingGoals: true });
    await this.props.editTeachingPathStore!.getFiltersArticlePanel();
    const dataArticles = this.props.editTeachingPathStore!.getAllArticlePanelFilters();
    // tslint:disable-next-line: variable-name
    dataArticles!.core_elements_filter!.forEach((element) => {
      newArrayGrepCore.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.core_element_id),
        title: element.description!
      });
    });
    // tslint:disable-next-line: variable-name
    dataArticles!.multidisciplinay_filter!.forEach((element) => {
      newArrayGrepMulti.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.main_topic_id),
        title: element.description!
      });
    });
    this.setState({
      selectedCoresAll: newArrayGrepCore,
      selectedMultisAll: newArrayGrepMulti
    });
    this.setState({ filtersAjaxLoading: false });
    this.setState({ filtersAjaxLoadingGoals: false });
  }

  public customReset = async (targets: Array<string>) => {

    // this.handleChangeFilters('none', 0);

    this.setState({ filtersAjaxLoading: true });
    this.setState({ filtersAjaxLoadingGoals: true });

    this.setState({ filtersisUsed: true });
    this.setState({ MySelectGrade: [] });
    this.setState({ MySelectSubject: [] });
    this.setState({ MySelectMulti: [] });
    this.setState({ MySelectSource: [] });
    this.setState({ myValueCore: [] });
    this.setState({ goalValueFilter: [] });
    this.setState({ filtersAjaxLoading: true });
    this.setState({ filtersAjaxLoadingGoals: true });

    targets.forEach((target) => {

      let grepDataFilterTarget: Array<any> = [];
      if (target === 'subjects') {
        const GradeFilterSubjectArray = Array.from(document.getElementsByClassName('subjectsFilterClass') as HTMLCollectionOf<HTMLElement>);
        GradeFilterSubjectArray.forEach((e) => {
          e.classList.remove('active');
        });
        grepDataFilterTarget = this.state.grepDataFilters!.subject_filter!;
      } else if (target === 'coreElements') {
        grepDataFilterTarget = this.state.grepDataFilters!.core_elements_filter!;
      } else if (target === 'mainTopics') {
        const GradeFilterMultiArray = Array.from(document.getElementsByClassName('multiFilterClass') as HTMLCollectionOf<HTMLElement>);
        GradeFilterMultiArray.forEach((e) => {
          e.classList.remove('active');
        });
        grepDataFilterTarget = this.state.grepDataFilters!.multidisciplinay_filter!;
      } else if (target === 'goals') {
        grepDataFilterTarget = this.state.grepDataFilters!.goals_filter!;
      }

      const newArray: Array<Greep> = [];

      grepDataFilterTarget!.forEach((element) => {
        newArray.push({
          id: Number(element.main_topic_id),
          title: element.description!
        });
      });

      if (target === 'subjects') {
        this.setState({
          selectedSubjectsAll: newArray,
          selectedSubjectsFilter: newArray,
          MySelectSubject: []
        });
      } else if (target === 'coreElements') {
        this.setState({
          selectedCoresAll: [],
          selectedCoresFilter: [],
          myValueCore: []
        });
      } else if (target === 'mainTopics') {
        this.setState({
          selectedMultisAll: newArray,
          selectedMultiFilter: newArray,
          MySelectMulti: []
        });
      } else if (target === 'goals') {
        this.setState({
          selectedGoalsAll: newArray,
          selectedGoalsFilter: newArray,
          goalValueFilter: []
        });
      }
    });
    this.setState({ filtersAjaxLoading: false });
    this.setState({ filtersAjaxLoadingGoals: false });

  }

  public resetSubjectFilter() {
    const GradeFilterSubjectArray = Array.from(document.getElementsByClassName('subjectsFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterSubjectArray.forEach((e) => {
      e.classList.remove('active');
    });
    this.setState({
      valueSubject: ''
    });
  }

  public getAllSubjectsFromFilter() {
    return this.state.grepDataFilters!.subject_filter!.map(subject =>
    ({
      id: Number(subject.subject_id),
      title: subject.description!
    })
    );
  }

  public fillAllSubjects() {
    this.setState({
      selectedSubjectsFilter: this.getAllSubjectsFromFilter()
    });
  }

  public handleClickGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const newGradeId = Number(e.currentTarget.value);
    const selectedGrades = this.getSelectedGrades()!;
    if (!selectedGrades.includes(newGradeId)) {
      this.setSelectedGrade(newGradeId, () => {
        this.resetFilters(['subjects', 'coreElements', 'mainTopics', 'goals'], () => {
          this.refreshAppliedFilters(() => {
            this.handleChangeFilters('grades', String(this.getSelectedGrades()));
          });
        });
      });
    } else {

      this.removeSelectedFilter(
        'grades',
        newGradeId,
        () => {
          this.refreshAppliedFilters(
            () => {
              this.handleChangeFilters(
                'grades',
                String(this.getSelectedGrades()));
            });
        },
        e
      );
    }
  }

  public setStateMultiFilter(newArrayMulti: Array<Greep>) {
    const arrayMulti: Array<Greep> = this.uniqueArrayMulti(newArrayMulti);
    this.setState({
      selectedMultiFilter: arrayMulti,
      selectedMultisAll: arrayMulti
    });
  }

  public uniqueArrayMulti(arrayMulti: Array<Greep>) {
    const newArray: Array<Greep> = [];
    arrayMulti.forEach((mainTopic) => {
      if (!this.findInArrayMulti(newArray, mainTopic.id)) {
        newArray.push(mainTopic);
      }
    });
    return newArray;
  }

  public findInArrayMulti(arrayMulti: Array<Greep>, value: number) {
    let found: boolean = false;
    arrayMulti.forEach((mainTopic) => {
      if (mainTopic.id === value) {
        found = true;
      }
    });
    return found;
  }

  public handleClickSubject = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newSubjectId = Number(e.currentTarget.value);
    const selectedSubjects = this.getSelectedSubjects()!;

    if (!selectedSubjects.includes(newSubjectId)) {
      this.addSelectedSubjects(
        Number(e.currentTarget.value),
        () => {
          this.resetFilters(
            ['coreElements', 'mainTopics', 'goals'],
            () => {
              this.refreshAppliedFilters(
                () => {
                  this.handleChangeFilters('subjects', String(this.getSelectedSubjects()));
                });
            });
        });
    } else {
      this.removeSelectedFilter(
        'subjects',
        newSubjectId,
        () => {
          this.refreshAppliedFilters(
            () => {
              this.handleChangeFilters('subjects', String(this.getSelectedSubjects()));
            });
        },
        e
      );
    }
  }

  public handleClickMulti = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const newMainTopicId = Number(target.value);
    const selectedMainTopics = this.getSelectedMainTopics()!;

    if (!selectedMainTopics.includes(newMainTopicId)) {
      this.addSelectedMainTopics(Number(newMainTopicId), () => {

        // target.classList.add('active');
        this.resetFilters(['goals'], () => {
          this.refreshAppliedFilters(() => {
            this.handleChangeFilters('multi', String(this.getSelectedMainTopics()));
          });
        });
      });
    } else {
      this.removeSelectedFilter(
        'mainTopics',
        newMainTopicId,
        () => {
          this.refreshAppliedFilters(() => {
            this.handleChangeFilters('multi', String(this.getSelectedSubjects()));
          });
        },
        e
      );
    }
  }

  public handleClickSource = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const valueSelectedSource = this.state.MySelectSource;
    if (!valueSelectedSource!.includes(Number(value))) {
      valueSelectedSource!.push(Number(value));
      e.currentTarget.classList.add('active');
    } else {
      const indexSelected = valueSelectedSource!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedSource!.splice(indexSelected, 1);
      }
      e.currentTarget.classList.remove('active');
    }
    this.setState({
      MySelectSource: valueSelectedSource
    });
    this.handleChangeFilters('source', String(valueSelectedSource));
  }

  public addItemToNewChild = (item: Article) => {

    const { currentNode } = this.props.editTeachingPathStore!;
    const ifAddingItemIsSaved = !!currentNode!.children.filter(
      child => child.items!.find(el => el.value.id === item.id)
    ).length;
    if (this.state.isEdit) {
      if (this.state.isEditSingle) {
        this.setState({ itemsForNewChildren: [...this.state.itemsForNewChildren, item] });
        this.setState({ greeddata: true });
        this.setState({ selectedArticle: item });
        this.setState({ isEditSingle: false });
      } else {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('edit_teaching_path.notifications.neccesary_edit')
        });
      }
    } else {
      if (ifAddingItemIsSaved) {
        this.setState({ removingItems: this.state.removingItems.filter((el: Article) => el.id !== item.id) });
      }
      this.setState({ itemsForNewChildren: [...this.state.itemsForNewChildren, item] });
      this.setState({ greeddata: true });
      this.setState({ selectedArticle: item });
    }
  }

  public toSelectArticle = (article: Article) => {
    this.setState({
      greeddata: true,
      selectedArticle: article
    });
  }

  public removeItemFromNewChild = async (item: Article) => {
    const { currentNode } = this.props.editTeachingPathStore!;

    const ifRemovableItemIsSaved = !!currentNode!.children.filter(
      child => child.items!.find(el => el.value.id === item.id)
    ).length;

    if (ifRemovableItemIsSaved) {
      this.setState({ removingItems: [...this.state.removingItems, item] });
    }
    if (this.state.isEdit) {
      this.setState({ isEditSingle: true });
      this.setState({ isChangeArticle: true });
    }

    this.setState((state) => {
      const itemsForNewChildren = state.itemsForNewChildren.filter(
        (currentItem: Article) => currentItem.id !== item.id
      );
      return { itemsForNewChildren };
    });
  }

  public closeModal = () => {
    const { editTeachingPathStore, } = this.props;
    const { itemsForNewChildren } = this.state;
    if (this.state.isEdit) {
      if (itemsForNewChildren.length) {
        if (this.state.isChangeArticle) {
          editTeachingPathStore!.currentNode!.editItem(this.state.idChangeArticle, itemsForNewChildren[0]);
          editTeachingPathStore!.currentEntity!.save();
        }
        this.context.changeContentType(null);
        editTeachingPathStore!.setCurrentNode(null);
      } else {
        editTeachingPathStore!.currentEntity!.save();
        this.context.changeContentType(null);
        editTeachingPathStore!.setCurrentNode(null);
      }
      editTeachingPathStore!.falseIsEditArticles();
    } else {
      if (itemsForNewChildren.length) {
        const newChildren = itemsForNewChildren.map(
          item => editTeachingPathStore!.createNewNode(
            item,
            TeachingPathNodeType.Article
          )
        );
        newChildren.forEach(child => editTeachingPathStore!.addChildToCurrentNode(child));
        editTeachingPathStore!.currentNode!.children.forEach(
          (child) => {
            this.state.removingItems.forEach(
              (item: Article) => {
                if (child.items!.filter(el => el.value.id === item.id)) {
                  child.removeItem(item.id);
                }
              }
            );
            if (!child.items!.length) {
              editTeachingPathStore!.currentNode!.removeChild(child);
            }
          }
        );
      } else {
        editTeachingPathStore!.currentNode!.setChildren([]);
      }

      editTeachingPathStore!.currentEntity!.save();

      this.context.changeContentType(null);
      editTeachingPathStore!.setCurrentNode(null);
    }
  }

  public onScroll = (): void => {
    const { editTeachingPathStore } = this.props;
    const { appliedFilters } = this.state;
    this.setState({
      userFilters: false
    });

    if (
      this.ref.current!.scrollHeight - (this.ref.current!.clientHeight * SCROLL_OFFSET) <= this.ref.current!.scrollTop &&
      !editTeachingPathStore!.isFetchedArticlesListFinished
    ) {
      editTeachingPathStore!.getArticles({ isNextPage: true, ...appliedFilters });
      return;
    }
  }

  public redirectAssigment = () => {
    const { currentNode } = this.props.editTeachingPathStore!;
    const { editTeachingPathStore } = this.props;
    editTeachingPathStore!.setCurrentNode(currentNode);
    this.setState({ isRedirect: true });
    setTimeout(
      () => {
        this.context.changeContentType(1);
      },
      showDelay
    );
  }

  public renderHeader = () => {
    if (this.state.isEdit) {
      return (
        <div className="articlesListHeader flexBox spaceBetween" tabIndex={0}>
          <div className="articlesListHeader__left">
            <p className="active">{intl.get('edit_teaching_path.modals.articles')}</p>
          </div>
          <div className="articlesListHeader__right">
            <button ref={this.refButton} onClick={this.closeModal} title={intl.get('generals.close')}>
              <img
                src={closeImg}
                alt={intl.get('generals.close')}
                title={intl.get('generals.close')}
              />
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="articlesListHeader flexBox spaceBetween" tabIndex={0}>
        <div className="articlesListHeader__left">
          <p className="active">{intl.get('edit_teaching_path.modals.articles')}</p>
          {/* <a href="javascript:void(0)" onClick={this.redirectAssigment}>{intl.get('edit_teaching_path.modals.assignmetns')}</a> */}
        </div>
        <div className="articlesListHeader__right">
          <button ref={this.refButton} onClick={this.closeModal} title={intl.get('generals.close')}>
            <img
              src={closeImg}
              alt={intl.get('generals.close')}
              title={intl.get('generals.close')}
            />
          </button>
        </div>
      </div>
    );
  }

  public renderArticle = (article: Article, index: number) => (
    <ArticleItem
      key={article.id + index}
      article={article}
      allItems={this.state.itemsForNewChildren}
      addItem={this.addItemToNewChild}
      removeItem={this.removeItemFromNewChild}
      toSelectArticle={this.toSelectArticle}
    />
  )

  public addSelectedArticles = (mainArray: Array<Article>) => {
    const { appliedFilters } = this.state;
    const selectedArticles = this.state.itemsForNewChildren.slice();
    const initialArray = mainArray.slice();

    if (appliedFilters.subjects || appliedFilters.grades || appliedFilters.searchTitle) {
      return mainArray;
    }

    const tempArray = selectedArticles.slice();
    tempArray.forEach((item) => {
      const index = initialArray.findIndex(element => element.id === item.id);
      if (index > -1) {
        initialArray.splice(index, 1);
      }
    });
    return selectedArticles.concat(initialArray);
  }

  public renderArticlesList() {
    const { articlesList, fetchingArticles, articlesForSkeletonEight } = this.props.editTeachingPathStore!;
    const selectedAndLoadedArticles = this.addSelectedArticles(articlesList);

    const allCardsMargins = 129; // Left padding of container + all right margins of card
    const cardsInRow = 4;
    const cardWidthToHeightIndex = 1.2;

    const cardsContainer = document.getElementsByClassName('articlesListContainer')[0];
    const skeletonCardWidth = ((cardsContainer ? cardsContainer.clientWidth : 0) - allCardsMargins) / cardsInRow;
    const skeletonCardHeight = skeletonCardWidth * cardWidthToHeightIndex;

    if (fetchingArticles && articlesList.length === 0) {
      return articlesForSkeletonEight.map((skeletonArticle, index) => (

        <SkeletonLoader
          key={index}
          className="RelatedArticlesCard"
          width={skeletonCardWidth}
          height={skeletonCardHeight}
        />
      )
      );
    }
    if (fetchingArticles && this.state.userFilters) {
      return articlesForSkeletonEight.map((skeletonArticle, index) => (
        <SkeletonLoader
          key={index}
          className="RelatedArticlesCard"
          width={skeletonCardWidth}
          height={skeletonCardHeight}
        />
      )
      );
    }

    if (!selectedAndLoadedArticles.length) {
      return <div className={'noResults'}>{intl.get('edit_teaching_path.No results found')}</div>;
    }

    const sortedArticles = selectedAndLoadedArticles.sort(
      (article) => {
        const isSelected = !!this.state.itemsForNewChildren.filter(
          (item: Article) => item.id === article.id
        ).length;
        if (isSelected) {
          return -1;
        }
        return 0;
      }
    );

    return (
      sortedArticles.map(this.renderArticle)
    );
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const classDivPath = (event.composedPath()[0] as Element).className;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    const qlEditorText = 'ql-editor';
    if (event.key === 'Escape') {
      this.closeModal();
    }
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText && classDivPath !== qlEditorText) {
      if (this.state.itemsForNewChildren.length > 0) {
        if (event.shiftKey && event.key === 'A' || event.shiftKey && event.key === 'a') {
          this.closeModal();
        }
      }
    }
  }

  public renderSubmitFooter = () => (
    <div className="articlesListFooter flexBox alignCenter">
      <div className="flexBox alignCenter justifyCenter selectedArticles">
        {intl.get('edit_teaching_path.modals.articles_selected', { number: this.state.itemsForNewChildren.length })}
      </div>
      <div onClick={this.closeModal}>
        <CreateButton
          disabled={!this.state.itemsForNewChildren.length}
          title={intl.get('edit_teaching_path.modals.add_articles')}
        >
          {intl.get('edit_teaching_path.modals.add_articles')}
        </CreateButton>
      </div>
    </div>
  )

  public toggleData = () => {
    const { expand } = this.state;
    if (expand) {
      this.setState({ expand: false });
    } else {
      this.setState({ expand: true });
    }
  }

  public SelectedGrades = () => {
    const { selectedArticle } = this.state;
    const amountOfGrades = selectedArticle!.grades ? selectedArticle!.grades.length : 0;
    if (amountOfGrades > 0) {
      const visibleGrades = selectedArticle!.grades!.sort((a, b) => a.id - b.id).map((grade) => {
        const title = grade.title.split('.', 1);
        return <span key={grade.id}>{title}{intl.get('new assignment.grade')}</span>;
      });
      return (
        <div className="grades">
          {visibleGrades}
        </div>
      );
    }
    return (
      <div className="grades" />
    );
  }

  public SelectedSubjects = () => {
    const { selectedArticle } = this.state;
    const amountSubjects = selectedArticle!.subjects ? selectedArticle!.subjects.length : 0;
    if (amountSubjects > 0) {
      const visiblesubjects = selectedArticle!.subjects!.sort((a, b) => a.id - b.id).map((subject) => {
        const title = subject.title;
        return <li key={subject.id}>{title}</li>;
      });
      return (
        <div className="subjects">
          <ul>
            {visiblesubjects}
          </ul>
        </div>
      );
    }
    return (
      <div className="subjects" />
    );
  }

  public SelectedGreepCore = () => {
    const { selectedArticle } = this.state;

    const amountCoreElements = selectedArticle!.grepCoreelements ? selectedArticle!.grepCoreelements.length : 0;
    if (amountCoreElements > 0) {
      const visibilityCores = selectedArticle!.grepCoreelements!.map((corelement) => {
        const description = corelement.description;
        return <li key={corelement.kode}>{description}</li>;
      });
      return (
        <div className="greepContentList">
          <ul>
            {visibilityCores}
          </ul>
        </div>
      );
    }
    return (
      <div className="greepContentList">
        {intl.get('activity_page.No available content')}
      </div>
    );
  }

  public SelectedCoreGoals = () => {
    const { selectedArticle } = this.state;
    const amountGoalsElements = selectedArticle!.grepGoals ? selectedArticle!.grepGoals.length : 0;
    if (amountGoalsElements > 0) {
      const visibilityGoals = selectedArticle!.grepGoals!.map((corelement) => {
        const description = corelement.description;
        return <li key={corelement.kode}>{description}</li>;
      });
      return (
        <div className="greepContentList">
          <ul>
            {visibilityGoals}
          </ul>
        </div>
      );
    }
    return (
      <div className="greepContentList">
        {intl.get('activity_page.No available content')}
      </div>
    );
  }

  public SelectedCoreSubjects = () => {
    const { selectedArticle } = this.state;
    const amountSubjectsElements = selectedArticle!.grepMaintopic ? selectedArticle!.grepMaintopic.length : 0;
    if (amountSubjectsElements > 0) {
      const visibilityGoals = selectedArticle!.grepMaintopic!.map((corelement) => {
        const description = corelement.description;
        return <li key={corelement.kode}>{description}</li>;
      });
      return (
        <div className="greepContentList">
          <ul>
            {visibilityGoals}
          </ul>
        </div>
      );
    }
    return (
      <div className="greepContentList">
        {intl.get('activity_page.No available content')}
      </div>
    );
  }

  public toggleDataCore = () => {
    const { expandCore } = this.state;
    if (expandCore) {
      this.setState({ expandCore: false });
    } else {
      this.setState({ expandCore: true });
    }
  }

  public toggleDataGoals = () => {
    const { expandGoals } = this.state;
    if (expandGoals) {
      this.setState({ expandGoals: false });
    } else {
      this.setState({ expandGoals: true });
    }
  }

  public toggleDataSubjects = () => {
    const { expandSubjects } = this.state;
    if (expandSubjects) {
      this.setState({ expandSubjects: false });
    } else {
      this.setState({ expandSubjects: true });
    }
  }

  public renderInsideData = () => {
    const { expandGoals, expandCore, expandSubjects } = this.state;
    return (
      <div className="defaultContentModal__inside">
        <div className="listItemInside">
          <div className="lisItemInsideIcon">
            <img src={gradeImg} />
          </div>
          <div className="lisItemInsideText">
            <h5>{intl.get('generals.grade')}</h5>
            {this.SelectedGrades()}
          </div>
        </div>
        <div className="listItemInside">
          <div className="lisItemInsideIcon">
            <img src={tagsImg} />
          </div>
          <div className="lisItemInsideText">
            <h5>{intl.get('new assignment.Subject')}</h5>
            {this.SelectedSubjects()}
          </div>
        </div>
        <div className={`listItemInside listItemGreep ${expandCore && 'active'}`}>
          <div className="lisItemInsideIcon">
            <img src={coreImg} />
          </div>
          <div className="lisItemInsideText">
            <h5 onClick={this.toggleDataCore}>{intl.get('new assignment.greep.core')}</h5>
            {this.SelectedGreepCore()}
          </div>
        </div>
        <div className={`listItemInside listItemGreep ${expandGoals && 'active'}`}>
          <div className="lisItemInsideIcon">
            <img src={goalsImg} />
          </div>
          <div className="lisItemInsideText">
            <h5 onClick={this.toggleDataGoals}>{intl.get('new assignment.greep.goals')}</h5>
            {this.SelectedCoreGoals()}
          </div>
        </div>
        <div className={`listItemInside listItemGreep ${expandSubjects && 'active'}`}>
          <div className="lisItemInsideIcon">
            <img src={cogsImg} />
          </div>
          <div className="lisItemInsideText">
            <h5 onClick={this.toggleDataSubjects}>{intl.get('new assignment.greep.subjects')}</h5>
            {this.SelectedCoreSubjects()}
          </div>
        </div>
      </div>
    );
  }

  public renderInformationContent = () => {
    const { selectedArticle, expand } = this.state;
    const textexpand = expand ? intl.get('edit_teaching_path.modals.expandclose') : intl.get('edit_teaching_path.modals.expand');
    return (
      <div className="defaultContentModal" data-id={selectedArticle!.id}>
        <h2>{intl.get('edit_teaching_path.modals.articles_title')}</h2>
        <div className="defaultContentModal__content">
          <h3>{selectedArticle!.title}</h3>
          <p>{selectedArticle!.excerpt}</p>
          <a href="javascript:void(0)" className="CreateButton" onClick={this.openArticleReading}>{intl.get('edit_teaching_path.modals.articles_read')}</a>
        </div>
        <div className="defaultContentModal__expand">
          <div className={`expandContent ${expand && 'active'}`} onClick={this.toggleData}>{textexpand}</div>
          {expand && this.renderInsideData()}
        </div>
      </div>
    );
  }

  public renderInformationContentDefault = () => {
    const { contentType } = this.context;
    return (
      <div className="defaultContentModal">
        <h2>{intl.get('edit_teaching_path.modals.articles_title')}</h2>
        <div>
          <p>{intl.get('edit_teaching_path.modals.articles_default')}</p>
        </div>
      </div>
    );
  }

  public conditionalGreedData = () => {
    const { greeddata } = this.state;
    if (greeddata) {
      return this.renderInformationContent();
    }
    return this.renderInformationContentDefault();
  }

  public openArticleReading = () => {
    this.setState({
      checkArticle: true
    });
  }

  public closeArticleReading = () => {
    this.setState({
      checkArticle: false
    });
  }

  public finishReading = () => {
    this.setState({
      checkArticle: false
    });
  }

  public customGradesList = () => {
    const { selectedGradesAll, selectedGradesFilter } = this.state;
    if (selectedGradesFilter.length) {
      return selectedGradesFilter;
    }
    return selectedGradesAll;
  }

  public mySubjects = () => {
    const { selectedSubjectsAll, selectedSubjectsFilter } = this.state;
    if (selectedSubjectsFilter.length) {
      return selectedSubjectsFilter;
    }
    return selectedSubjectsAll;
  }

  public customCoreList = () => {
    const { selectedCoresAll, selectedCoresFilter } = this.state;
    if (selectedCoresFilter.length) {
      return selectedCoresFilter;
    }
    return selectedCoresAll;
  }

  public customMultiList = () => {
    const { selectedMultisAll, selectedMultiFilter } = this.state;
    if (selectedMultiFilter.length) {
      return selectedMultiFilter;
    }
    return selectedMultisAll;
  }

  public customGoalsList = () => {
    const { selectedGoalsAll, selectedGoalsFilter } = this.state;
    if (selectedGoalsFilter.length) {
      return selectedGoalsFilter;
    }
    return selectedGoalsAll;
  }

  public customSourceList = () => {
    const { selectedSourceAll, selectedSourceFilter } = this.state;
    if (selectedSourceFilter.length) {
      return selectedSourceFilter;
    }
    return selectedSourceAll;
  }

  public render() {
    const { appliedFilters, checkArticle, selectedArticle } = this.state;
    if (checkArticle) {
      return (
        <ReadingArticle
          titleCurrentArticle={selectedArticle!.title}
          shownArticleId={selectedArticle!.correspondingLevelArticleId || selectedArticle!.wpId || selectedArticle!.id}
          closeArticle={this.closeArticleReading}
          finishReading={this.finishReading}
          notFinish={false}
        />
      );
    }

    return (
      <div className="addItemModal__content">
        <div className="addItemModal__left">
          <button className="back-buttonAbs" onClick={this.closeModal}>
            <img src={backIcon} alt="Back" />
            {intl.get('new assignment.go_back')}
          </button>
          {this.conditionalGreedData()}
        </div>
        <div className="addItemModal__right">
          <div className="ArticlesList flexBox dirColumn">
            {this.renderHeader()}

            <SearchFilter
              subject
              grade
              placeholder={intl.get('edit_teaching_path.modals.search_for_articles')}
              date
              isArticlesListPage
              filtersisUsed={this.state.filtersisUsed}
              filtersAjaxLoading={this.state.filtersAjaxLoading}
              filtersAjaxLoadingGoals={this.state.filtersAjaxLoadingGoals}
              // METHODS
              handleChangeSubject={this.handleChangeSubject}
              handleChangeGrade={this.handleChangeGrade}
              handleChangeCore={this.handleChangeCore}
              handleChangeGoals={this.handleChangeGoals}
              handleInputSearchQuery={this.handleChangeSearchQuery}
              handleClickGrade={this.handleClickGrade}
              handleClickSubject={this.handleClickSubject}
              handleClickMulti={this.handleClickMulti}
              handleClickSource={this.handleClickSource}
              handleChangeSelectCore={this.handleChangeSelectCore}
              handleChangeSelectGoals={this.handleChangeSelectGoals}
              handleClickReset={this.handleClickReset}
              switchNewestOldest={this.handleChangeSorting}
              showSourceFilter={this.state.showSourceFilter}

              // VALUES
              // subjectFilterValue={Number(appliedFilters.subjects)}
              // gradeFilterValue={Number(appliedFilters.grades)}
              coreFilterValue={Number(appliedFilters.core)}
              goalsFilterValue={Number(appliedFilters.goal)}
              defaultValueGradeFilter={String(appliedFilters.grades)}
              defaultValueSubjectFilter={String(appliedFilters.subjects)}

              defaultValueMainFilter={String(this.state.MySelectMulti)}

              coreValueFilter={this.state.myValueCore}
              goalValueFilter={this.state.goalValueFilter}
              searchQueryFilterValue={appliedFilters.searchTitle as string}
              customGradesList={this.customGradesList()}
              customSubjectsList={this.mySubjects()}
              customCoreList={this.customCoreList()}
              customMultiList={this.customMultiList()}
              customGoalsList={this.customGoalsList()}
              customSourceList={this.customSourceList()}
            />

            <div
              className="articlesListContainer flexBox"
              ref={this.ref}
              onScroll={this.onScroll}
              aria-live="polite"
              id="List"
            >
              {this.renderArticlesList()}
            </div>

            {this.renderSubmitFooter()}

          </div>
        </div>
      </div>
    );
  }
}
