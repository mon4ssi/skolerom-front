import React, { ChangeEvent, Component, createRef } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import isNaN from 'lodash/isNaN';
import onClickOutside from 'react-onclickoutside';

import { NewAssignmentStore } from '../../NewAssignmentStore';
import { RelatedArticlesCard } from './RelatedArticlesCard';
import { AttachmentContentType, AttachmentContentTypeContext } from '../../AttachmentContentTypeContext';
import { Article, FilterArticlePanel, Grade, Subject, Greep, GradeFilter, CoreFilter, CoreFilterItemGrades,
  MultiFilter, MultiFilterItemGrades, GoalsFilter, GoalsFilterItemGrades, SourceFilter, SourceFilterItemGrades } from 'assignment/Assignment';
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
  selectedGradeChildrenAll: Array<Grade>;
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
  MySelectCore: Array<number> | null;
  MySelectMulti: Array<number> | null;
  MySelectGoal: Array<number> | null;
  MySelectSource: Array<number> | null;
  showSourceFilter: boolean;
  userFilters: boolean;
  myValueCore: Array<any>;
  goalValueFilter: Array<any>;
  filtersisUsed: boolean;
  filtersAjaxLoading: boolean;
  filtersAjaxLoadingGoals: boolean;
  gradeParentId: number;
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
      selectedGradeChildrenAll: [],
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
      MySelectCore: [],
      MySelectMulti: [],
      MySelectGoal: [],
      MySelectSource: [],
      showSourceFilter: false,
      userFilters: false,
      filtersisUsed: false,
      filtersAjaxLoading: false,
      filtersAjaxLoadingGoals: false,
      myValueCore: [],
      goalValueFilter: [],
      gradeParentId: 0
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
    await newAssignmentStore!.getFiltersArticlePanel('');
    const dataArticles = newAssignmentStore!.getAllArticlePanelFilters();
    this.setState({
      grepDataFilters : dataArticles
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

    return selectedAndLoadedArticles.map((article, index) => article.id ? (
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
    this.props.newAssignmentStore!.relatedArticlesIsHidden();
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

  public getSelectedSource(): Array<any> | null {
    const { MySelectSource } = this.state;
    return MySelectSource;
  }

  public handleClickReset = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const GradeFilterGradeArray = Array.from(document.getElementsByClassName('gradesFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterGradeArray.forEach((e) => {
      e.classList.remove('active');
    });
    const GradeFilterSubjectArray = Array.from(document.getElementsByClassName('subjectsFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterSubjectArray.forEach((e) => {
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

    this.cleanHihtLightGradeSubject();

    this.setState(
      {
        filtersisUsed: false,
        MySelectGrade: [],
        MySelectSubject: [],
        MySelectCore: [],
        myValueCore: [],
        selectedCoresAll: [],
        MySelectMulti: [],
        MySelectGoal: [],
        goalValueFilter: [],
        selectedGoalsAll: [],
        MySelectSource: [],
        selectedGradeChildrenAll: []
      },
      () => {
        this.handleChangeFilters('none', 0);
        this.getGREPParametersSubject();
        this.getGREPParametersCoreElements();
        this.getGREPParametersDicipline();
        this.getGREPParametersGoals();
        this.getGREPParametersSources();
      });
  }

  public handleClickGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const newGradeId = Number(e.currentTarget.value);
    let filterGrade: Array<number> = [];
    let newArrayGradeChildren: Array<Grade> = [];

    if (!e.currentTarget.classList.contains('active')) {
      if (e.currentTarget.classList.contains('jrGradeChild')) {
        filterGrade = this.getGroupGrade(e.currentTarget.innerHTML);

        this.setState({ MySelectGrade: filterGrade }, () => {
          this.handleClickGradeAfter();
        });
      } else {
        const lstResp: Array<any> = this.getChildrenGrade(newGradeId);
        filterGrade = lstResp[0];
        newArrayGradeChildren = lstResp[1];

        this.setState(
          {
            gradeParentId: newGradeId,
            MySelectGrade: filterGrade,
            selectedGradeChildrenAll: []
          },
          () => {
            this.setState(
              {
                gradeParentId: newGradeId,
                MySelectGrade: filterGrade,
                selectedGradeChildrenAll: newArrayGradeChildren
              },
              () => { this.handleClickGradeAfter(); }
            );
          }
        );
      }
    } else {
      if (e.currentTarget.classList.contains('jrGradeChild')) {
        const lstResp: Array<any> = this.getChildrenGrade(this.state.gradeParentId);
        filterGrade = lstResp[0];
        newArrayGradeChildren = lstResp[1];
        this.setState(
          {
            MySelectGrade: [],
            selectedGradeChildrenAll: newArrayGradeChildren
          },
          () => { this.handleClickGradeAfter(); }
        );
      } else {
        this.setState(
          {
            gradeParentId: newGradeId,
            MySelectGrade: filterGrade,
            selectedGradeChildrenAll: newArrayGradeChildren
          },
          () => { this.handleClickGradeAfter(); }
        );
      }
    }
  }

  public handleClickGradeAfter() {
    this.handleChangeFilters('grades', String(this.getSelectedGrades()));
    this.getGREPParametersSubject();
    this.getGREPParametersCoreElements();
    this.getGREPParametersDicipline();
    this.getGREPParametersGoals();
    this.getGREPParametersSources();
    this.highLightGradeSubject();
  }

  public getGroupGrade(nameGroup:string) {
    const iGradeArr: Array<GradeFilter | undefined> = this.state.grepDataFilters!.grade_filter!.filter(w => w.grade_parent !== null);
    const filterGrade: Array<number> = [];

    iGradeArr.forEach((item: any) => {
      // tslint:disable-next-line: variable-name
      const lstGradesAllorArr: Array<string> = item.grade_parent;
      if (lstGradesAllorArr.includes(String(this.state.gradeParentId))) {
        const gradeSubName = item.name_sub;
        const gradeSubNameLst: Array<string> = gradeSubName.split(':');
        if (gradeSubNameLst.includes(nameGroup)) {
          // tslint:disable-next-line: variable-name
          filterGrade.push(Number(item.grade_id));
        }
      }
    });

    return filterGrade;
  }

  public getChildrenGrade(gradeIdParent: number): Array<any> {
    const lstResp:Array<any> = [];
    const lstChildren: Array<string> = [];
    const filterGrade: Array<number> = [];
    const newArrayGradeChildren: Array<Grade> = [];

    filterGrade.push(gradeIdParent);

    // tslint:disable-next-line: variable-name
    const iGradeArr: Array<GradeFilter | undefined> = this.state.grepDataFilters!.grade_filter!.filter(w => w.grade_parent !== null);
    iGradeArr.forEach((item: any) => {
      // tslint:disable-next-line: variable-name
      const lstGradesAllorArr: Array<string> = item.grade_parent;

      if (lstGradesAllorArr.includes(String(gradeIdParent))) {
        // tslint:disable-next-line: variable-name
        const gradeSubId = item.grade_id;
        filterGrade.push(Number(gradeSubId));

        // tslint:disable-next-line: variable-name
        const gradeSubName = item.name_sub;
        const gradeSubNameLst: Array<string> = gradeSubName.split(':');

        gradeSubNameLst.forEach((iGradeSubName: string) => {
          if (!lstChildren.includes(iGradeSubName)) {
            lstChildren.push(iGradeSubName);
          }
        });
      }
    });

    if (lstChildren.length > 0) {
      let numCont:number = 1;
      lstChildren.forEach((itemChild: any) => {
        const listGradeChildren:Array<string> = [];

        iGradeArr.forEach((item: any) => {
          // tslint:disable-next-line: variable-name
          const lstGradesAllorArr: Array<string> = item.grade_parent;

          if (lstGradesAllorArr.includes(String(gradeIdParent))) {

            // tslint:disable-next-line: variable-name
            const gradeSubName = item.name_sub;
            const gradeSubNameLst: Array<string> = gradeSubName.split(':');

            if (gradeSubNameLst.includes(itemChild)) {
              listGradeChildren.push(item.grade_id);
            }
          }
        });

        newArrayGradeChildren.push({
          id: numCont,
          title: itemChild,
          filterStatus: listGradeChildren.join()
        });

        numCont += 1;
      });
    }

    lstResp.push(filterGrade);
    lstResp.push(newArrayGradeChildren);

    return lstResp;
  }

  public getGREPParametersSubject() {
    const SubjectArr = this.state.grepDataFilters!.subject_filter!;

    const filterSubjectSelected: Array<number> = this.getSelectedSubjects()!;
    const filterSubject: Array<number> = [];
    const newArraySubject: Array<Subject> = [];

    const filterGrade: Array<number> = this.getSelectedGrades()!;
    SubjectArr.forEach((subject) => {
      const ListGradesAllowArr = subject.grade_ids!;
      let addSubject:boolean = (filterGrade.length === 0);

      if (!addSubject) {
        filterGrade!.some((iGrade: number) => {
          addSubject = ListGradesAllowArr.includes(String(iGrade));
          if (addSubject) return true;
        });
      }

      if (addSubject) {
        if (filterSubjectSelected!.includes(Number(subject.subject_id))) {
          filterSubject.push(Number(subject.subject_id));
        }

        newArraySubject.push({
          id: Number(subject.subject_id),
          title: subject.description!
        });
      }
    });

    this.setState({
      MySelectSubject: filterSubject,
      selectedSubjectsAll: newArraySubject
    });
  }

  public getGREPParametersCoreElements() {
    const coreElementArr = this.state.grepDataFilters!.core_elements_filter!;

    const newArrayCores: Array<Greep> = [];
    coreElementArr.forEach((item) => {
      if (this.getValidateInsertOptionCore(item)) {
        newArrayCores.push({
          id: Number(item.core_element_id),
          title: item.description
        });
      }
    });

    this.setState({
      selectedCoresAll: newArrayCores
    });
  }

  public getGREPParametersDicipline() {
    const diciplineArr = this.state.grepDataFilters!.multidisciplinay_filter!;
    const newArrayDicipline: Array<Greep> = [];
    const currentLstDicipline: Array<number> = [];

    diciplineArr.forEach((item) => {
      if (this.getValidateInsertOptionDisipline(item)) {
        newArrayDicipline.push({
          id: Number(item.main_topic_id),
          title: item.description
        });
        currentLstDicipline.push(Number(item.main_topic_id));
      }
    });

    const filterDicipline: Array<number> | null = this.state.MySelectMulti;
    if (filterDicipline!.length > 0) {
      filterDicipline!.forEach((item) => {
        if (!currentLstDicipline.includes(item)) {
          const itemSourceArr = diciplineArr.find(o => o.main_topic_id === String(item));
          if (typeof(itemSourceArr) !== 'undefined') {
            newArrayDicipline.push({
              id: Number(itemSourceArr.main_topic_id),
              title: itemSourceArr.description,
              alt: 'jrDelItem'
            });
          }
        }
      });
    }

    this.setState({
      selectedMultisAll: newArrayDicipline
    });
  }

  public getGREPParametersGoals() {
    const goalsArr = this.state.grepDataFilters!.goals_filter!;

    const newArrayGoal: Array<Greep> = [];
    goalsArr.forEach((item) => {
      if (this.getValidateInsertOptionGoal(item)) {
        newArrayGoal.push({
          id: Number(item.goal_id),
          title: item.description
        });
      }
    });

    this.setState({
      selectedGoalsAll: newArrayGoal
    });
  }

  public getGREPParametersSources() {
    const sourceArr = this.state.grepDataFilters!.source_filter!;
    const newArraySource: Array<Greep> = [];
    const currentLstSource: Array<number> = [];

    sourceArr.forEach((item) => {
      if (this.getValidateInsertOptionSource(item)) {
        newArraySource.push({
          id: Number(item.term_id),
          title: item.description
        });
        currentLstSource.push(Number(item.term_id));
      }
    });

    const filterSource: Array<number> | null = this.state.MySelectSource;
    if (filterSource!.length > 0) {
      filterSource!.forEach((item) => {
        if (!currentLstSource.includes(item)) {
          const itemSourceArr = sourceArr.find(o => o.term_id === String(item));
          if (typeof(itemSourceArr) !== 'undefined') {
            newArraySource.push({
              id: Number(itemSourceArr.term_id),
              title: itemSourceArr.description,
              alt: 'jrDelItem'
            });
          }
        }
      });
    }

    this.setState({
      selectedSourceAll: newArraySource
    });
  }

  public getValidateInsertOptionCore(item: CoreFilter): boolean {
    const { MySelectGrade, MySelectSubject } = this.state;

    // Grades
    let lstFoundGrade: Array<CoreFilterItemGrades> = [];
    if (MySelectGrade!.length > 0) {
      MySelectGrade!.forEach((iGrade: number) => {
        const itemGradeArr = item.grade_ids.find(w => w.grade_id === String(iGrade));
        if (typeof(itemGradeArr) !== 'undefined') lstFoundGrade.push(itemGradeArr);
      });
    } else {
      lstFoundGrade = item.grade_ids;
    }
    // EndGrades

    // Subject
    let lstFoundSubject: Array<CoreFilterItemGrades> = [];
    if (MySelectSubject!.length > 0) {
      lstFoundGrade.some((itemGradeArr) => {
        const listSubjectsAllowArr = itemGradeArr.subject_ids;
        MySelectSubject!.some((iSubject: number) => {
          if (listSubjectsAllowArr.includes(String(iSubject))) {
            lstFoundSubject.push(itemGradeArr);
            return true;
          }
        });
        if (lstFoundSubject.length > 0) return true;
      });
    } else {
      lstFoundSubject = lstFoundGrade;
    }
    // EndSubject

    return (lstFoundSubject.length > 0);
  }

  public getValidateInsertOptionDisipline(item: MultiFilter): boolean {
    const { MySelectGrade, MySelectSubject, MySelectCore } = this.state;

    // Grades
    let lstFoundGrade: Array<MultiFilterItemGrades> = [];
    if (MySelectGrade!.length > 0) {
      MySelectGrade!.forEach((iGrade: number) => {
        const itemGradeArr = item.grade_ids.find(w => w.grade_id === String(iGrade));
        if (typeof(itemGradeArr) !== 'undefined') lstFoundGrade.push(itemGradeArr);
      });
    } else {
      lstFoundGrade = item.grade_ids;
    }
    // EndGrades

    // Subject
    let lstFoundSubject: Array<MultiFilterItemGrades> = [];
    if (MySelectSubject!.length > 0) {
      lstFoundGrade.some((itemGradeArr) => {
        MySelectSubject!.some((iSubject: number) => {
          const itemSubjectArr = itemGradeArr.subject_ids.find(o => o.subject_id === String(iSubject));
          if (typeof(itemSubjectArr) !== 'undefined') {
            lstFoundSubject.push(itemGradeArr);
            return true;
          }
        });
        if (lstFoundSubject.length > 0) return true;
      });
    } else {
      lstFoundSubject = lstFoundGrade;
    }
    // EndSubject

    // Core
    let lstFoundCore: Array<MultiFilterItemGrades> = [];
    if (MySelectCore!.length > 0) {
      lstFoundSubject.some((itemGradeArr) => {
        itemGradeArr.subject_ids.some((itemSubjectArr) => {
          const listCoreAllowArr = itemSubjectArr.core_element_ids;
          MySelectCore!.some((iCore) => {
            if (listCoreAllowArr.includes(String(iCore))) {
              lstFoundCore.push(itemGradeArr);
              return true;
            }
          });
          if (lstFoundCore.length > 0) return true;
        });
        if (lstFoundCore.length > 0) return true;
      });
    } else {
      lstFoundCore = lstFoundSubject;
    }
    // EndCore

    return (lstFoundCore.length > 0);
  }

  public getValidateInsertOptionGoal(item: GoalsFilter): boolean {
    const { MySelectGrade, MySelectSubject, MySelectCore, MySelectMulti } = this.state;

    // Grades
    let lstFoundGrade: Array<GoalsFilterItemGrades> = [];
    if (MySelectGrade!.length > 0) {
      MySelectGrade!.forEach((iGrade: number) => {
        const itemGradeArr = item.grade_ids.find(w => w.grade_id === String(iGrade));
        if (typeof(itemGradeArr) !== 'undefined') lstFoundGrade.push(itemGradeArr);
      });
    } else {
      lstFoundGrade = item.grade_ids;
    }
    // EndGrades

    // Subject
    let lstFoundSubject: Array<GoalsFilterItemGrades> = [];
    if (MySelectSubject!.length > 0) {
      lstFoundGrade.some((itemGradeArr) => {
        MySelectSubject!.some((iSubject: number) => {
          const itemSubjectArr = itemGradeArr.subject_ids!.find(o => o.subject_id === String(iSubject));
          if (typeof(itemSubjectArr) !== 'undefined') {
            lstFoundSubject.push(itemGradeArr);
            return true;
          }
        });
        if (lstFoundSubject.length > 0) return true;
      });
    } else {
      lstFoundSubject = lstFoundGrade;
    }
    // EndSubject

    // Core
    let lstFoundCore: Array<GoalsFilterItemGrades> = [];
    if (MySelectCore!.length > 0) {
      lstFoundSubject.some((itemGradeArr) => {
        itemGradeArr.subject_ids!.some((itemSubjectArr) => {
          const listCoreAllowArr = itemSubjectArr.core_element_ids;
          MySelectCore!.some((iCore) => {
            const itemCoreArr = listCoreAllowArr.find(o => o.core_element_id === String(iCore));
            if (typeof(itemCoreArr) !== 'undefined') {
              lstFoundCore.push(itemGradeArr);
              return true;
            }
            if (lstFoundCore.length > 0) return true;
          });
          if (lstFoundCore.length > 0) return true;
        });
        if (lstFoundCore.length > 0) return true;
      });
    } else {
      lstFoundCore = lstFoundSubject;
    }
    // EndCore

    // MainTopic
    let lstFoundDicipline: Array<GoalsFilterItemGrades> = [];
    if (MySelectMulti!.length > 0) {
      lstFoundCore.some((itemGradeArr) => {
        itemGradeArr.subject_ids!.some((itemSubjectArr) => {
          itemSubjectArr.core_element_ids!.some((itemCoreArr) => {
            const listMaintopicAllowArr = itemCoreArr.main_topic_ids;
            MySelectMulti!.some((iDisipline) => {
              if (listMaintopicAllowArr.includes(String(iDisipline))) {
                lstFoundDicipline.push(itemGradeArr);
                return true;
              }
            });
            if (lstFoundDicipline.length > 0) return true;
          });
          if (lstFoundDicipline.length > 0) return true;
        });
        if (lstFoundDicipline.length > 0) return true;
      });
    } else {
      lstFoundDicipline = lstFoundCore;
    }
    // EndMainTopic

    return (lstFoundDicipline.length > 0);
  }

  public getValidateInsertOptionSource(item: SourceFilter): boolean {
    const { MySelectGrade, MySelectSubject, MySelectCore, MySelectMulti, MySelectGoal } = this.state;

    // Grades
    let lstFoundGrade: Array<SourceFilterItemGrades> = [];
    if (MySelectGrade!.length > 0) {
      MySelectGrade!.forEach((iGrade: number) => {
        const itemGradeArr = item.grade_ids.find(w => w.grade_id === String(iGrade));
        if (typeof(itemGradeArr) !== 'undefined') lstFoundGrade.push(itemGradeArr);
      });
    } else {
      lstFoundGrade = item.grade_ids;
    }
    // EndGrades

    // Subject
    let lstFoundSubject: Array<SourceFilterItemGrades> = [];
    if (MySelectSubject!.length > 0) {
      lstFoundGrade.some((itemGradeArr) => {
        MySelectSubject!.some((iSubject: number) => {
          const itemSubjectArr = itemGradeArr.subject_ids!.find(o => o.subject_id === String(iSubject));
          if (typeof(itemSubjectArr) !== 'undefined') {
            lstFoundSubject.push(itemGradeArr);
            return true;
          }
        });
        if (lstFoundSubject.length > 0) return true;
      });
    } else {
      lstFoundSubject = lstFoundGrade;
    }
    // EndSubject

    // Core
    let lstFoundCore: Array<SourceFilterItemGrades> = [];
    if (MySelectCore!.length > 0) {
      lstFoundSubject.some((itemGradeArr) => {
        itemGradeArr.subject_ids!.some((itemSubjectArr) => {
          const listCoreAllowArr = itemSubjectArr.core_element_ids;
          MySelectCore!.some((iCore) => {
            const itemCoreArr = listCoreAllowArr.find(o => o.core_element_id === String(iCore));
            if (typeof(itemCoreArr) !== 'undefined') {
              lstFoundCore.push(itemGradeArr);
              return true;
            }
            if (lstFoundCore.length > 0) return true;
          });
          if (lstFoundCore.length > 0) return true;
        });
        if (lstFoundCore.length > 0) return true;
      });
    } else {
      lstFoundCore = lstFoundSubject;
    }
    // EndCore

    // MainTopic
    let lstFoundDicipline: Array<SourceFilterItemGrades> = [];
    if (MySelectMulti!.length > 0) {
      lstFoundCore.some((itemGradeArr) => {
        itemGradeArr.subject_ids!.some((itemSubjectArr) => {
          itemSubjectArr.core_element_ids!.some((itemCoreArr) => {
            const listMaintopicAllowArr = itemCoreArr.main_topic_ids;
            MySelectMulti!.some((iDisipline) => {
              const itemDiciplineArr = listMaintopicAllowArr.find(o => o.main_topic_id === String(iDisipline));
              if (typeof(itemDiciplineArr) !== 'undefined') {
                lstFoundDicipline.push(itemGradeArr);
                return false;
              }
            });
            if (lstFoundDicipline.length > 0) return true;
          });
          if (lstFoundDicipline.length > 0) return true;
        });
        if (lstFoundDicipline.length > 0) return true;
      });
    } else {
      lstFoundDicipline = lstFoundCore;
    }
    // EndMainTopic

    // Goals
    let lstFoundGoal: Array<SourceFilterItemGrades> = [];
    if (MySelectGoal!.length > 0) {
      lstFoundDicipline.some((itemGradeArr) => {
        itemGradeArr.subject_ids!.some((itemSubjectArr) => {
          itemSubjectArr.core_element_ids!.some((itemCoreArr) => {
            itemCoreArr.main_topic_ids!.some((itemDiciplineArr) => {
              const listGoalAllowArr = itemDiciplineArr.goal_ids;
              MySelectGoal!.some((iGoal) => {
                if (listGoalAllowArr.includes(String(iGoal))) {
                  lstFoundGoal.push(itemGradeArr);
                  return true;
                }
              });
              if (lstFoundGoal.length > 0) return true;
            });
            if (lstFoundGoal.length > 0) return true;
          });
          if (lstFoundGoal.length > 0) return true;
        });
        if (lstFoundGoal.length > 0) return true;
      });
    } else {
      lstFoundGoal = lstFoundDicipline;
    }

    return (lstFoundGoal.length > 0);
  }

  public cleanHihtLightGradeSubject() {
    const GradeFilterGradeArray = Array.from(document.getElementsByClassName('gradesFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterGradeArray.forEach((e) => {
      e.classList.remove('downlight');
    });
    const GradeFilterSubjectArray = Array.from(document.getElementsByClassName('subjectsFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterSubjectArray.forEach((e) => {
      e.classList.remove('downlight');
    });
  }

  public getLstChildGrade(gradeIdParent: number): Array<any> {
    const { grepDataFilters } = this.state;
    const lstChilds: Array<number> = [];

    const gradeArr = grepDataFilters!.grade_filter!;
    gradeArr.forEach((item) => {
      if (item.grade_parent !== null) {
        const listGradesAllowArr = item.grade_parent;
        if (listGradesAllowArr.includes(String(gradeIdParent))) {
          lstChilds.push(Number(item.grade_id));
        }
      }
    });

    return lstChilds;
  }

  public highLightGradeSubject = () => {
    const { MySelectGrade, MySelectSubject } = this.state;
    const existFilterGrade = (MySelectGrade!.length > 0);
    const existFilterSubject = (MySelectSubject!.length > 0);

    this.cleanHihtLightGradeSubject();

    if (!existFilterGrade && !existFilterSubject) {
      const lstResponse: Array<any> = this.getGradeSubjectIdsBy();

      // Grade
      const lstGradeHighlight = lstResponse[0];
      if (lstGradeHighlight.length > 0) {
        const GradeFilterGradeArray = Array.from(document.getElementsByClassName('gradesFilterClass') as HTMLCollectionOf<HTMLElement>);
        GradeFilterGradeArray.forEach((e) => {
          const gradeId: number = Number(e.getAttribute('value'));
          if (!lstGradeHighlight.includes(gradeId)) {
            const lstChilds: Array<number> = this.getLstChildGrade(gradeId);
            let setDownlight = true;

            lstGradeHighlight.some((itemGh: number) => {
              if (lstChilds.includes(itemGh)) {
                setDownlight = false;
                return true;
              }
            });

            if (setDownlight) e.classList.add('downlight');
          }
        });
      }

      // Subject
      const lstSubjectHighlight = lstResponse[1];
      if (lstSubjectHighlight.length > 0) {
        const GradeFilterSubjectArray = Array.from(document.getElementsByClassName('subjectsFilterClass') as HTMLCollectionOf<HTMLElement>);
        GradeFilterSubjectArray.forEach((e) => {
          if (!lstSubjectHighlight.includes(Number(e.getAttribute('value')))) {
            e.classList.add('downlight');
          }
        });
      }
    }
  }

  public getGradeSubjectIdsBy(): Array<any> {
    const { MySelectCore, MySelectMulti, MySelectGoal, MySelectSource, grepDataFilters } = this.state;

    const lstResponse = [];
    const lstGradeHighlight: Array<number> = [];
    const lstSubjectHighlight: Array<number> = [];

    if (MySelectCore!.length > 0) {
      MySelectCore!.forEach((iCore) => {
        const itemCoreArr = grepDataFilters!.core_elements_filter!.find(o => o.core_element_id === String(iCore));
        if (typeof(itemCoreArr) !== 'undefined') {
          itemCoreArr.grade_ids.forEach((iGrade) => {
            // Grade
            if (!lstGradeHighlight.includes(Number(iGrade.grade_id))) {
              lstGradeHighlight.push(Number(iGrade.grade_id));
            }

            // Subject
            iGrade.subject_ids.forEach((iSubject) => {
              if (!lstSubjectHighlight.includes(Number(iSubject))) {
                lstSubjectHighlight.push(Number(iSubject));
              }
            });
          });
        }
      });
    }

    if (MySelectMulti!.length > 0) {
      MySelectMulti!.forEach((iDisipline) => {
        const itemDiciplineArr = grepDataFilters!.multidisciplinay_filter!.find(o => o.main_topic_id === String(iDisipline));
        if (typeof(itemDiciplineArr) !== 'undefined') {
          itemDiciplineArr.grade_ids.forEach((iGrade) => {
            // Grade
            if (!lstGradeHighlight.includes(Number(iGrade.grade_id))) {
              lstGradeHighlight.push(Number(iGrade.grade_id));
            }

            // Subject
            iGrade.subject_ids.forEach((iSubject) => {
              if (!lstSubjectHighlight.includes(Number(iSubject.subject_id))) {
                lstSubjectHighlight.push(Number(iSubject.subject_id));
              }
            });
          });
        }
      });
    }

    if (MySelectGoal!.length > 0) {
      MySelectGoal!.forEach((iGoal) => {
        const itemGoalArr = grepDataFilters!.goals_filter!.find(o => o.goal_id === String(iGoal));
        if (typeof(itemGoalArr) !== 'undefined') {
          itemGoalArr.grade_ids.forEach((iGrade) => {
            // Grade
            if (!lstGradeHighlight.includes(Number(iGrade.grade_id))) {
              lstGradeHighlight.push(Number(iGrade.grade_id));
            }

            // Subject
            iGrade.subject_ids!.forEach((iSubject) => {
              if (!lstSubjectHighlight.includes(Number(iSubject.subject_id))) {
                lstSubjectHighlight.push(Number(iSubject.subject_id));
              }
            });
          });
        }
      });
    }

    if (MySelectSource!.length > 0) {
      MySelectSource!.forEach((iSource) => {
        const itemSourceArr = grepDataFilters!.source_filter!.find(o => o.term_id === String(iSource));
        if (typeof(itemSourceArr) !== 'undefined') {
          itemSourceArr.grade_ids.forEach((iGrade) => {
            // Grade
            if (!lstGradeHighlight.includes(Number(iGrade.grade_id))) {
              lstGradeHighlight.push(Number(iGrade.grade_id));
            }

            // Subject
            iGrade.subject_ids!.forEach((iSubject) => {
              if (!lstSubjectHighlight.includes(Number(iSubject.subject_id))) {
                lstSubjectHighlight.push(Number(iSubject.subject_id));
              }
            });
          });
        }
      });
    }

    lstResponse.push(lstGradeHighlight);
    lstResponse.push(lstSubjectHighlight);

    return lstResponse;
  }

  public handleClickSubject = (e: React.MouseEvent<HTMLButtonElement>) => {
    const subjectId = Number(e.currentTarget.value);
    const filterSubject: Array<number> = this.getSelectedSubjects()!;

    if (filterSubject.includes(subjectId)) {
      filterSubject.splice(filterSubject.indexOf(subjectId), 1);
    } else {
      filterSubject.push(subjectId);
    }

    this.setState(
      {
        MySelectSubject: filterSubject
      },
      () => {
        this.handleChangeFilters('subjects', String(this.getSelectedSubjects()));
        this.getGREPParametersCoreElements();
        this.getGREPParametersDicipline();
        this.getGREPParametersGoals();
        this.getGREPParametersSources();
        this.highLightGradeSubject();
      }
    );
  }

  public handleClickMulti = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const newMainTopicId = Number(e.currentTarget.value);
    const filterDicipline: Array<number> = this.getSelectedMainTopics()!;

    if (filterDicipline.includes(newMainTopicId)) {
      filterDicipline.splice(filterDicipline.indexOf(newMainTopicId), 1);
    } else {
      filterDicipline.push(newMainTopicId);
    }

    this.setState(
      {
        MySelectMulti: filterDicipline
      },
      () => {
        this.handleChangeFilters('multi', String(this.getSelectedMainTopics()));
        this.getGREPParametersGoals();
        this.getGREPParametersSources();
        this.highLightGradeSubject();
      }
    );
  }

  public handleClickSource = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const newSourceId = Number(e.currentTarget.value);
    const filterSource: Array<number> = this.getSelectedSource()!;

    if (filterSource.includes(newSourceId)) {
      filterSource.splice(filterSource.indexOf(newSourceId), 1);
    } else {
      filterSource.push(newSourceId);
    }

    this.setState(
      {
        MySelectSource: filterSource
      },
      () => {
        this.handleChangeFilters('source', String(this.getSelectedSource()));
        this.highLightGradeSubject();
      }
    );
  }

  public handleChangeSelectCore = async (newValue: Array<any>) => {
    const filterCore: Array<number> = [];

    let singleString : string = '';
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
        filterCore.push(e.value);
      });
    }

    this.setState(
      {
        MySelectCore: filterCore,
        myValueCore: newValue
      },
      () => {
        this.handleChangeFilters('core', singleString);
        this.getGREPParametersDicipline();
        this.getGREPParametersGoals();
        this.getGREPParametersSources();
        this.highLightGradeSubject();
      }
    );
  }

  public handleChangeSelectGoals = async (newValue: Array<any>) => {
    const filterGoal: Array<number> = [];

    let singleString : string = '';
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
        filterGoal.push(e.value);
      });
    }

    this.setState(
      {
        MySelectGoal:filterGoal,
        goalValueFilter: newValue
      },
      () => {
        this.handleChangeFilters('goal', singleString);
        this.getGREPParametersSources();
        this.highLightGradeSubject();
      }
    );
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

  public customGradeChildrenList = () => {
    const { selectedGradeChildrenAll } = this.state;
    return selectedGradeChildrenAll;
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
                defaultValueMainFilter={String(this.state.MySelectMulti)}
                defaultValueSourceFilter={String(this.state.MySelectSource)}
                coreValueFilter={this.state.myValueCore}
                goalValueFilter={this.state.goalValueFilter}
                searchQueryFilterValue={this.state.appliedFilters.searchTitle as string}
                customGradesList={this.customGradesList()}
                customSubjectsList={this.mySubjects()}
                customGradeChildrenList={this.customGradeChildrenList()}
                customCoreList={this.customCoreList()}
                customMultiList={this.customMultiList()}
                customGoalsList={this.customGoalsList()}
                customSourceList={this.customSourceList()}
                highLightGradeSubject={this.highLightGradeSubject}
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
