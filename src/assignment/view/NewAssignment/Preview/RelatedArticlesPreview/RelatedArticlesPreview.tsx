import React, { ChangeEvent, Component, createRef } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import isNaN from 'lodash/isNaN';
import onClickOutside from 'react-onclickoutside';

import { NewAssignmentStore } from '../../NewAssignmentStore';
import { RelatedArticlesCard } from './RelatedArticlesCard';
import { AttachmentContentType, AttachmentContentTypeContext } from '../../AttachmentContentTypeContext';
import { Article, FilterArticlePanel, Grade, Subject, Greep } from 'assignment/Assignment';
import { TagProp } from 'components/common/TagInput/TagInput';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { lettersNoEn } from 'utils/lettersNoEn';
import { ReadingArticle } from 'components/pages/ReadingArticle/ReadingArticle';

import closeImg from 'assets/images/close-rounded-black.svg';
import tagsImg from 'assets/images/tags.svg';
import gradeImg from 'assets/images/grade.svg';
import cogsImg from 'assets/images/cogs.svg';
import coreImg from 'assets/images/core.svg';
import goalsImg from 'assets/images/goals.svg';
import backIcon from 'assets/images/back-arrow.svg';

import './RelatedArticlesPreview.scss';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { SCROLL_OFFSET } from 'utils/constants';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
}
interface State {
  isSortedByDate: boolean;
  appliedFilters: { [field: string]: number | string };
  greeddata: boolean;
  selectedArticle: Article | null | undefined;
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
  MySelectGrade: Array<number>;
  MySelectSubject: Array<number>;
  MySelectMulti: Array<number>;
  MySelectSource: Array<number>;
  showSourceFilter: boolean;
  userFilters: boolean;
  filtersisUsed: boolean;
  filtersAjaxLoading: boolean;
  filtersAjaxLoadingGoals: boolean;
  myValueCore: Array<any>;
  goalValueFilter: Array<any>;
}

@inject('newAssignmentStore')
@observer
class RelatedArticlesPreviewComponent extends Component<Props, State> {
  public static contextType = AttachmentContentTypeContext;
  public ref = createRef<HTMLDivElement>();
  public refButton = createRef<HTMLButtonElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      isSortedByDate: false,
      appliedFilters: {},
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
      filtersisUsed: false,
      filtersAjaxLoading: false,
      filtersAjaxLoadingGoals: false,
      myValueCore: [],
      goalValueFilter: []
    };
  }

  private articleToTagProp = (article: Article): TagProp => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    images: article.images,
    grades: article.grades,
    levels: article.levels
  })

  private handleChangeFilters = async (filterName: string, filterValue: number | string) => {
    const { newAssignmentStore } = this.props;
    const allModal = Array.from(document.getElementsByClassName('filtersContent') as HTMLCollectionOf<HTMLElement>);
    newAssignmentStore!.resetCurrentArticlesPage();
    newAssignmentStore!.resetIsFetchedArticlesListFinished();
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
      newAssignmentStore!.getArticlesWithDebounce(filters);
      allModal[0].classList.remove('loadingdata');
    } else {
      await newAssignmentStore!.getArticles(filters);
      allModal[0].classList.remove('loadingdata');
    }
  }

  public async componentDidMount() {
    const newArrayGrades : Array<Grade> = [];
    const newArraySubjects : Array<Subject> = [];
    const newArrayGrepCore : Array<Greep> = [];
    const newArrayGrepMulti : Array<Greep> = [];
    const newArrayGrepGoals : Array<Greep> = [];
    const newArrayGrepSource : Array<Greep> = [];
    const { newAssignmentStore } = this.props;
    const { appliedFilters } = this.state;
    if (this.refButton.current) {
      this.refButton.current!.focus();
    }
    if (!this.props.newAssignmentStore!.fetchingArticles) {
      this.setState({
        userFilters: false
      });
    }

    const isNextPage = newAssignmentStore!.allArticles.length > 0;
    document.addEventListener('keyup', this.handleKeyboardControl);
    this.setState({ filtersAjaxLoading: true });
    this.setState({ filtersAjaxLoadingGoals: true });
    await newAssignmentStore!.getArticles({ isNextPage, ...appliedFilters });
    await newAssignmentStore!.getGrades();
    await newAssignmentStore!.getSubjects();
    this.props.newAssignmentStore!.visibilityArticles = true;
    await newAssignmentStore!.getFiltersArticlePanel();
    const dataArticles = newAssignmentStore!.getAllArticlePanelFilters();
    this.setState({
      grepDataFilters : dataArticles
    });
    // tslint:disable-next-line: variable-name
    dataArticles!.grade_filter!.forEach((element) => {
      newArrayGrades.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.grade_id),
        title: element.description!
      });
    });
    this.setState({
      selectedGradesAll : newArrayGrades
    });
    // tslint:disable-next-line: variable-name
    dataArticles!.subject_filter!.forEach((element) => {
      newArraySubjects.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.subject_id),
        title: element.description!,
        filterStatus: null
      });
    });
    this.setState({
      selectedSubjectsAll : newArraySubjects
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
      selectedCoresAll : newArrayGrepCore
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
      selectedMultisAll : newArrayGrepMulti
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
      selectedGoalsAll : newArrayGrepGoals.sort((a, b) => (a.title > b.title) ? 1 : -1)
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
        selectedSourceAll : newArrayGrepSource
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
      activeGrepFilters : true
    });
    this.setState({ filtersAjaxLoading: false });
    this.setState({ filtersAjaxLoadingGoals: false });
  }

  public componentWillUnmount() {
    const { newAssignmentStore } = this.props;
    document.removeEventListener('keyup', this.handleKeyboardControl);

    this.closePanel();
    newAssignmentStore!.resetCurrentArticlesPage();
    newAssignmentStore!.resetArticlesList();
    newAssignmentStore!.resetIsFetchedArticlesListFinished();
    this.props.newAssignmentStore!.visibilityArticles = false;
    document.getElementById('newAnswerRelatedButton')!.focus();
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const classDivPath = (event.composedPath()[0] as Element).className;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    const qlEditorText = 'ql-editor';
    if (event.key === 'Escape') {
      this.closePanel();
    }
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText && classDivPath !== qlEditorText) {
      if ((event.shiftKey && event.key === 'A') || (event.shiftKey && event.key === 'a')) {
        this.closePanel();
      }
    }
  }

  public isCheckedArticle = (id: number) => {
    const { newAssignmentStore } = this.props;
    return !!newAssignmentStore!.currentEntity!.relatedArticles.find(article => article.id === id);
  }

  public handleArticle = (id: number) => () => {
    const { newAssignmentStore } = this.props;
    const article = newAssignmentStore!.getAllArticles().find(article => article.id === id);
    if (article) {
      this.setState({ greeddata: true });
      this.setState({ selectedArticle: article });
      if (this.isCheckedArticle(id)) {
        newAssignmentStore!.currentEntity!.removeArticle(article);
      } else {
        newAssignmentStore!.currentEntity!.addArticle(article);
      }
      newAssignmentStore!.currentEntity!.setFeaturedImage();
    }
  }

  public toSelectArticle = (article: Article) => () => {
    this.setState({
      greeddata: true,
      selectedArticle: article
    });
    const RelatedArticlesCard = Array.from(document.getElementsByClassName('RelatedArticlesCard') as HTMLCollectionOf<HTMLElement>);
    RelatedArticlesCard.forEach((e) => {
      e.classList.remove('selectedArticle');
    });
    const rootDiv = document.getElementById(`relatedarticle_${article.id}`);
    if (typeof(rootDiv) !== 'undefined') {
      rootDiv!.classList.add('selectedArticle');
    }
  }

  public sortSelectedCards = (cardA: TagProp): number => {
    const { newAssignmentStore } = this.props;
    if (this.state.isSortedByDate) {
      return 0;
    }
    const myArticles = newAssignmentStore!.currentEntity!.relatedArticles;
    if (myArticles.find(i => i.id === cardA.id)) {
      return -1;
    }
    return 0;
  }

  public addSelectedArticles = (mainArray: Array<TagProp>) => {
    const { newAssignmentStore } = this.props;
    const { appliedFilters, isSortedByDate } = this.state;
    const selectedArticles = newAssignmentStore!.currentEntity!.relatedArticles.slice();
    const initialArray = mainArray.slice();

    if (appliedFilters.subjects || appliedFilters.grades || appliedFilters.searchTitle || isSortedByDate) {
      return mainArray;
    }

    const tempArray = selectedArticles.slice();
    tempArray.forEach((item) => {
      const tempItem = toJS(item) as Article;
      const index = initialArray.findIndex(element => element.id === tempItem.id);
      if (index > -1) {
        initialArray.splice(index, 1);
      }
    });
    return selectedArticles.concat(initialArray);
  }

  public renderCards = () => {
    const { newAssignmentStore } = this.props;
    const articles = newAssignmentStore!.fetchingArticles && !newAssignmentStore!.getAllArticles().length ?
      newAssignmentStore!.articlesForSkeleton :
      newAssignmentStore!.getAllArticles();

    const selectedAndLoadedArticles = this.addSelectedArticles(articles);

    const allCardsMargins = 129; // Left padding of container + all right margins of card
    const cardsInRow = 4;
    const cardWidthToHeightIndex = 1.2;

    const cardsContainer = document.getElementsByClassName('cards')[0];
    const skeletonCardWidth = ((cardsContainer ? cardsContainer.clientWidth : 0) - allCardsMargins) / cardsInRow;
    const skeletonCardHeight = skeletonCardWidth * cardWidthToHeightIndex;

    if (!selectedAndLoadedArticles.length) {
      return <div className={'noResults'}>{intl.get('new assignment.No results found')}</div>;
    }

    if (newAssignmentStore!.fetchingArticles && this.state.userFilters) {
      return selectedAndLoadedArticles.map((article, index) => (
        <SkeletonLoader
          key={index}
          className="RelatedArticlesCard"
          width={skeletonCardWidth}
          height={skeletonCardHeight}
        />
      )
      );
    }

    return selectedAndLoadedArticles.sort(this.sortSelectedCards).map((article, index) => article.id ? (
      <RelatedArticlesCard
        key={article.id}
        article={article}
        handleArticle={this.handleArticle(article.id)}
        isCheckedArticle={this.isCheckedArticle(article.id)}
        toSelectArticle={this.toSelectArticle(article)}
      />
    ) : (
        <SkeletonLoader
          key={index}
          className="RelatedArticlesCard"
          width={skeletonCardWidth}
          height={skeletonCardHeight}
        />
      ));
  }

  public closePanel = () => {
    this.props.newAssignmentStore!.setPreviewQuestionByIndex(0);
    this.context.changeContentType(AttachmentContentType.text);
    this.props.newAssignmentStore!.visibilityArticles = false;
  }

  public switchNewestOldest = async (e: ChangeEvent<HTMLSelectElement>) => {
    const { newAssignmentStore } = this.props;
    const filters = { ...this.state.appliedFilters };
    if (e.target.value === 'asc') {
      filters.order = e.target.value;
    } else {
      delete filters.order;
    }
    newAssignmentStore!.resetCurrentArticlesPage();
    await newAssignmentStore!.getArticles(filters);
    this.setState({
      isSortedByDate: true,
      appliedFilters: filters
    });
  }

  public handleChangeGrade = async (e: ChangeEvent<HTMLSelectElement>) => {
    this.handleChangeFilters('grades', Number(e.target.value));
  }

  public handleChangeSubject = async (e: ChangeEvent<HTMLSelectElement>) => {
    this.handleChangeFilters('subjects', Number(e.target.value));
  }

  public handleChangeSearchQuery = async (e: ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.currentTarget.value)) {
      this.handleChangeFilters('searchTitle', e.currentTarget.value);
    }
  }

  public handleClickReset = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const newArrayGrepCore : Array<Greep> = [];
    const newArrayGrepMulti : Array<Greep> = [];
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
    this.setState({ MySelectGrade: [] });
    this.setState({ MySelectSubject: [] });
    this.setState({ MySelectMulti: [] });
    this.setState({ MySelectSource: [] });
    this.setState({ myValueCore: [] });
    this.setState({ goalValueFilter: [] });
    this.setState({ filtersAjaxLoading: true });
    this.setState({ filtersAjaxLoadingGoals: true });
    await this.props.newAssignmentStore!.getFiltersArticlePanel();
    const dataArticles = this.props.newAssignmentStore!.getAllArticlePanelFilters();
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
      selectedCoresAll : newArrayGrepCore,
      selectedMultisAll : newArrayGrepMulti
    });
    this.setState({ filtersAjaxLoading: false });
    this.setState({ filtersAjaxLoadingGoals: false });
  }

  public handleClickGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const newArraySubject : Array<Subject> = [];
    const newArrayCore : Array<Greep> = [];
    const newArrayMulti : Array<Greep> = [];
    const newArrayGoals : Array<Greep> = [];
    const newArraySource : Array<Greep> = [];
    const value = e.currentTarget.value;
    // const valueSelectedGrades = this.state.MySelectGrade;
    let valueSelectedGrades: Array<number> = [];
    if (!this.state.MySelectGrade!.includes(Number(value))) {
      valueSelectedGrades!.push(Number(value));
      if (this.state.activeGrepFilters) {
        e.currentTarget.classList.add('active');
        this.state.grepDataFilters!.subject_filter!.forEach((element) => {
          // tslint:disable-next-line: variable-name
          const allSympGrades = element.grade_ids;
          const allSympGradesLength = allSympGrades!.length;
          if (allSympGradesLength > 1) {
            newArraySubject.push({
              // tslint:disable-next-line: variable-name
              id: Number(element.subject_id),
              title: element.description!
            });
          }
        });
        this.setState({
          selectedSubjectsFilter : newArraySubject
        });
        this.setState({
          valueGrade: value
        });
        this.state.grepDataFilters!.core_elements_filter!.forEach((element) => {
          // tslint:disable-next-line: variable-name
          const allSympGrades = element.grade_ids!.map(grade => grade.grade_id);
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueSubject.length > 0) {
            element.grade_ids!.forEach((grade) => {
              if (grade.grade_id === value) {
                const allSympSubjects = grade.subject_ids;
                allSympSubjectsLength = allSympSubjects!.includes(this.state.valueSubject);
              }
            });
            if (allSympGradesLength && allSympSubjectsLength) {
              newArrayCore.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.core_element_id),
                title: element.description!
              });
            }
          } else {
            if (allSympGradesLength) {
              newArrayCore.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.core_element_id),
                title: element.description!
              });
            }
          }
        });
        this.setState({
          selectedCoresFilter : newArrayCore
        });
        this.state.grepDataFilters!.multidisciplinay_filter!.forEach((element) => {
          // tslint:disable-next-line: variable-name
          const allSympGrades : Array<string> = [];
          element.grade_ids!.forEach((grade) => {
            grade.subject_ids!.forEach(subject =>
              allSympGrades.push(subject.subject_id!)
            );
          });
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueSubject.length > 0) {
            element.grade_ids!.forEach((grade) => {
              if (grade.grade_id === value) {
                const allSympSubjects = grade.subject_ids!.map(subject => subject.subject_id);
                allSympSubjectsLength = allSympSubjects!.includes(this.state.valueSubject);
              }
            });
            if (allSympGradesLength && allSympSubjectsLength) {
              newArrayMulti.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.main_topic_id),
                title: element.description!
              });
            }
          } else {
            if (allSympGradesLength) {
              newArrayMulti.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.main_topic_id),
                title: element.description!
              });
            }
          }
        });
        this.setState({
          selectedMultiFilter : newArrayMulti
        });
        this.state.grepDataFilters!.goals_filter!.forEach((element) => {
          // tslint:disable-next-line: variable-name
          const allSympGrades = element.grade_ids!.map(grade => grade.grade_id);
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueSubject.length > 0) {
            element.grade_ids!.forEach((grade) => {
              if (grade.grade_id === value) {
                const allSympSubjects = grade.subject_ids!.map(subject => subject.subject_id);
                allSympSubjectsLength = allSympSubjects!.includes(this.state.valueSubject);
              }
            });
            if (allSympGradesLength && allSympSubjectsLength) {
              newArrayGoals.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.goal_id),
                title: element.description!
              });
            }
          } else {
            if (allSympGradesLength) {
              newArrayGoals.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.goal_id),
                title: element.description!
              });
            }
          }
        });
        this.setState({
          selectedGoalsFilter : newArrayGoals.sort((a, b) => (a.title > b.title) ? 1 : -1)
        });
        // this.state.grepDataFilters!.source_filter!.forEach((element) => {
        //   // tslint:disable-next-line: variable-name
        //   const allSympGrades = element.grade_ids;
        //   const allSympGradesLength = allSympGrades!.includes(value);
        //   let allSympSubjectsLength = false;
        //   if (this.state.valueSubject.length > 0) {
        //     element.grade_subjects!.forEach((item) => {
        //       if (item.grade_id === value) {
        //         const allSympSubjects = item.subjects_relations;
        //         allSympSubjectsLength = allSympSubjects!.includes(this.state.valueSubject);
        //       }
        //     });
        //     if (allSympGradesLength && allSympSubjectsLength) {
        //       newArraySource.push({
        //         // tslint:disable-next-line: variable-name
        //         id: Number(element.source_id),
        //         title: element.description!
        //       });
        //     }
        //   } else {
        //     if (allSympGradesLength) {
        //       newArraySource.push({
        //         // tslint:disable-next-line: variable-name
        //         id: Number(element.source_id),
        //         title: element.description!
        //       });
        //     }
        //   }
        // });
        this.setState(
          {
            selectedSourceFilter : newArraySource
          },
          () => {
            if (this.state.selectedSourceFilter.length > 1) {
              this.setState({ showSourceFilter: true });
            } else {
              this.setState({ showSourceFilter: false });
            }
          }
        );
      }
    } else {
      /*const indexSelected = valueSelectedGrades!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedGrades!.splice(indexSelected, 1);
      }
      if (this.state.activeGrepFilters) {
        e.currentTarget.classList.remove('active');
        e.currentTarget.focus();
      }*/
      valueSelectedGrades = [];
      if (this.state.activeGrepFilters) {
        e.currentTarget.classList.remove('active');
      }
    }
    this.handleChangeFilters('grades', String(valueSelectedGrades));
    this.setState({
      MySelectGrade : valueSelectedGrades
    });
  }

  public handleClickSubject = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newArrayCore : Array<Greep> = [];
    const newArrayMulti : Array<Greep> = [];
    const newArrayGoals : Array<Greep> = [];
    const newArraySource : Array<Greep> = [];
    const value = e.currentTarget.value;
    const valueSelectedSubject = this.state.MySelectSubject;
    if (!valueSelectedSubject!.includes(Number(value))) {
      valueSelectedSubject!.push(Number(value));
      if (this.state.activeGrepFilters) {
        e.currentTarget.classList.add('active');
        this.setState({
          valueSubject: value
        });
        this.state.grepDataFilters!.core_elements_filter!.forEach((element) => {
          // tslint:disable-next-line: variable-name
          const allSympGrades: Array<string> = [];
          element.grade_ids!.forEach(grade => grade.subject_ids!.forEach(subjectId => allSympGrades.push(subjectId)));
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueGrade.length > 0) {
            element.grade_ids!.forEach((grade) => {
              if (grade.grade_id === this.state.valueGrade) {
                const allSympSubjects = grade.subject_ids;
                allSympSubjectsLength = allSympSubjects!.includes(value);
              }
            });
            if (allSympGradesLength && allSympSubjectsLength) {
              newArrayCore.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.core_element_id),
                title: element.description!
              });
            }
          } else {
            if (allSympGradesLength) {
              newArrayCore.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.core_element_id),
                title: element.description!
              });
            }
          }
        });
        this.setState({
          selectedCoresFilter : newArrayCore
        });
        this.state.grepDataFilters!.multidisciplinay_filter!.forEach((element) => {
          // tslint:disable-next-line: variable-name
          const allSympGrades: Array<string> = [];
          element.grade_ids!.forEach((grade) => {
            grade.subject_ids!.forEach((subject) => {
              allSympGrades.push(subject.subject_id!);
            });
          });
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueGrade.length > 0) {
            element.grade_ids!.forEach((grade) => {
              if (grade.grade_id === this.state.valueGrade) {
                const allSympSubjects = grade.subject_ids!.map(subject => subject.subject_id);
                allSympSubjectsLength = allSympSubjects!.includes(value);
              }
            });
            if (allSympGradesLength && allSympSubjectsLength) {
              newArrayMulti.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.main_topic_id),
                title: element.description!
              });
            }
          } else {
            if (allSympGradesLength) {
              newArrayMulti.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.main_topic_id),
                title: element.description!
              });
            }
          }
        });
        this.setState({
          selectedMultiFilter : newArrayMulti
        });
        this.state.grepDataFilters!.goals_filter!.forEach((element) => {
          // tslint:disable-next-line: variable-name
          const allSympGrades : Array<string> = [];
          element.grade_ids!.forEach((grade) => {
            grade.subject_ids!.forEach((subject) => {
              allSympGrades.push(subject.subject_id!);
            });
          });
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueGrade.length > 0) {
            element.grade_ids!.forEach((grade) => {
              if (grade.grade_id === this.state.valueGrade) {
                const allSympSubjects = grade.subject_ids!.map(subject => subject.subject_id);
                allSympSubjectsLength = allSympSubjects!.includes(value);
              }
            });
            if (allSympGradesLength && allSympSubjectsLength) {
              newArrayGoals.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.goal_id),
                title: element.description!
              });
            }
          } else {
            if (allSympGradesLength) {
              newArrayGoals.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.goal_id),
                title: element.description!
              });
            }
          }
        });
        this.setState({
          selectedGoalsFilter : newArrayGoals.sort((a, b) => (a.title > b.title) ? 1 : -1)
        });
        // this.state.grepDataFilters!.source_filter!.forEach((element) => {
        //   // tslint:disable-next-line: variable-name
        //   const allSympGrades = element.subject_ids;
        //   const allSympGradesLength = allSympGrades!.includes(value);
        //   let allSympSubjectsLength = false;
        //   if (this.state.valueGrade.length > 0) {
        //     element.grade_subjects!.forEach((item) => {
        //       if (item.grade_id === this.state.valueGrade) {
        //         const allSympSubjects = item.subjects_relations;
        //         allSympSubjectsLength = allSympSubjects!.includes(value);
        //       }
        //     });
        //     if (allSympGradesLength && allSympSubjectsLength) {
        //       newArraySource.push({
        //         // tslint:disable-next-line: variable-name
        //         id: Number(element.source_id),
        //         title: element.description!
        //       });
        //     }
        //   } else {
        //     if (allSympGradesLength) {
        //       newArraySource.push({
        //         // tslint:disable-next-line: variable-name
        //         id: Number(element.source_id),
        //         title: element.description!
        //       });
        //     }
        //   }
        // });
        this.setState(
          {
            selectedSourceFilter : newArraySource
          },
          () => {
            if (this.state.selectedSourceFilter.length > 1) {
              this.setState({ showSourceFilter: true });
            } else {
              this.setState({ showSourceFilter: false });
            }
          }
        );
      }
    } else {
      const indexSelected = valueSelectedSubject!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedSubject!.splice(indexSelected, 1);
      }
      if (this.state.activeGrepFilters) {
        e.currentTarget.classList.remove('active');
      }
    }
    this.handleChangeFilters('subjects', String(valueSelectedSubject));
    this.setState({
      MySelectSubject : valueSelectedSubject
    });
  }

  public handleClickMulti = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const valueSelectedMulti = this.state.MySelectMulti;
    if (!valueSelectedMulti!.includes(Number(value))) {
      valueSelectedMulti!.push(Number(value));
      e.currentTarget.classList.add('active');
    } else {
      const indexSelected = valueSelectedMulti!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedMulti!.splice(indexSelected, 1);
      }
      e.currentTarget.classList.remove('active');
    }
    this.handleChangeFilters('multi', String(valueSelectedMulti));
    this.setState({
      MySelectMulti : valueSelectedMulti
    });
  }

  public handleClickSource = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const valueSelectedSource = this.state.MySelectSource;
    if (!valueSelectedSource!.includes(Number(value))) {
      this.handleChangeFilters('source', Number(value));
      e.currentTarget.classList.add('active');
    } else {
      const indexSelected = valueSelectedSource!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedSource!.splice(indexSelected, 1);
      }
      e.currentTarget.classList.remove('active');
    }
    this.setState({
      MySelectSource : valueSelectedSource
    });
    this.handleChangeFilters('source', String(valueSelectedSource));
  }

  public handleChangeSelectGoals = async (newValue: Array<any>) => {
    let singleString : string = '';
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
      });
    }
    this.setState({ goalValueFilter : newValue });
    this.handleChangeFilters('goal', singleString);
  }

  public handleChangeSelectCore = async (newValue: Array<any>) => {
    let singleString : string = '';
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
      });
    }
    this.setState({ myValueCore: newValue });
    this.handleChangeFilters('core', singleString);
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

  public onScroll = (): void => {
    const { newAssignmentStore } = this.props;
    const { appliedFilters } = this.state;
    this.setState({
      userFilters: false
    });
    if (
      this.ref.current!.scrollHeight - (this.ref.current!.clientHeight * SCROLL_OFFSET) <= this.ref.current!.scrollTop &&
      !this.props.newAssignmentStore!.isFetchedArticlesListFinished
    ) {
      newAssignmentStore!.getArticles({ isNextPage: true, ...appliedFilters });
      return;
    }
  }

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
    if (selectedArticle) {
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

  public finishReading = () => {
    this.setState({
      checkArticle: false
    });
  }

  public conditionalGreedData = () => {
    const { greeddata } = this.state;
    if (greeddata) {
      return this.renderInformationContent();
    }
    return this.renderInformationContentDefault();
  }

  public renderHeader = () => (
    <div className="articlesListHeader flexBox spaceBetween" tabIndex={0}>
      <div className="articlesListHeader__left">
        <p className="active">{intl.get('new assignment.Set related article(s)')}</p>
      </div>
      <div className="articlesListHeader__right">
        <button ref={this.refButton} onClick={this.closePanel} title={intl.get('generals.close')}>
          <img
            src={closeImg}
            alt={intl.get('generals.close')}
            title={intl.get('generals.close')}
          />
        </button>
      </div>
    </div>
  )

  public myRender() {
    const { newAssignmentStore } = this.props;
    const { checkArticle, selectedArticle } = this.state;
    const selectedArticles = newAssignmentStore!.currentEntity!.getListOfArticles().map(this.articleToTagProp);
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
      <div className="RelatedArticlesPreview__content">
        <div className="RelatedArticlesPreview__left">
          <button className="back-buttonAbs" onClick={this.closePanel}>
            <img src={backIcon} alt="Back" />
            {intl.get('new assignment.go_back')}
          </button>
          {this.conditionalGreedData()}
        </div>
        <div className="RelatedArticlesPreview__right">
          <div className="wrapperArticles">
            <div className="content filtersContent">
              {this.renderHeader()}
              <SearchFilter
                subject
                grade
                date
                placeholder={intl.get('assignments search.Search')}
                isArticlesListPage
                filtersisUsed={this.state.filtersisUsed}
                filtersAjaxLoading={this.state.filtersAjaxLoading}
                filtersAjaxLoadingGoals={this.state.filtersAjaxLoadingGoals}
                // METHODS
                handleChangeSubject={this.handleChangeSubject}
                handleChangeGrade={this.handleChangeGrade}
                switchNewestOldest={this.switchNewestOldest}
                handleInputSearchQuery={this.handleChangeSearchQuery}
                handleClickGrade={this.handleClickGrade}
                handleClickSubject={this.handleClickSubject}
                handleClickMulti={this.handleClickMulti}
                handleClickSource={this.handleClickSource}
                handleChangeSelectCore={this.handleChangeSelectCore}
                handleChangeSelectGoals={this.handleChangeSelectGoals}
                handleClickReset={this.handleClickReset}
                showSourceFilter={this.state.showSourceFilter}
                // VALUES
                // subjectFilterValue={Number(this.state.appliedFilters.subjects)}
                // gradeFilterValue={Number(this.state.appliedFilters.grades)}
                coreFilterValue={Number(this.state.appliedFilters.core)}
                goalsFilterValue={Number(this.state.appliedFilters.goal)}
                defaultValueGradeFilter={String(this.state.appliedFilters.grades)}
                defaultValueSubjectFilter={String(this.state.appliedFilters.subjects)}
                coreValueFilter={this.state.myValueCore}
                goalValueFilter={this.state.goalValueFilter}
                searchQueryFilterValue={this.state.appliedFilters.searchTitle as string}
                customGradesList={this.customGradesList()}
                customSubjectsList={this.mySubjects()}
                customCoreList={this.customCoreList()}
                customMultiList={this.customMultiList()}
                customGoalsList={this.customGoalsList()}
                customSourceList={this.customSourceList()}
              />

              <div className="cards" ref={this.ref} onScroll={this.onScroll}>
                {this.renderCards()}
              </div>

            </div>

            <div className={'selectedArticles'}>
              <div className={'counter'}>{selectedArticles.length} {intl.get('new assignment.articles selected')}</div>
              <CreateButton onClick={this.closePanel} disabled={selectedArticles.length === 0} title={intl.get('new assignment.Set as related articles')}>
                {intl.get('new assignment.Set as related articles')}
              </CreateButton>
            </div>

          </div>
        </div>
      </div>
    );
  }

  public render() {
    const { newAssignmentStore } = this.props;
    const { checkArticle, selectedArticle } = this.state;
    const selectedArticles = newAssignmentStore!.currentEntity!.getListOfArticles().map(this.articleToTagProp);
    return (
      <div className={'RelatedArticlesPreview'}>
        {this.myRender()}
      </div>
    );
  }
}

class RelatedArticlesPreviewWrapper extends Component<Props> {
  public static contextType = AttachmentContentTypeContext;
  public handleClickOutside = () => {
    this.context.changeContentType(AttachmentContentType.text);
  }
  public render() {
    return this.context.contentType === AttachmentContentType.articles && <RelatedArticlesPreviewComponent {...this.props} />;
  }
}

export const RelatedArticlesPreview = onClickOutside(RelatedArticlesPreviewWrapper);
