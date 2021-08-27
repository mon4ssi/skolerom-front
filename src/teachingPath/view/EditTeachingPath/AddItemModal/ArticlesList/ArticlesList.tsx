import React, { Component, ChangeEvent, useState } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import isNaN from 'lodash/isNaN';

import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
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
const showDelay = 500;
interface ArticleItemProps {
  editTeachingPathStore?: EditTeachingPathStore;
  article: Article;
  addItem: (item: Article) => void;
  removeItem: (item: Article) => void;
  allItems: Array<Article>;
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

  public handleSelectArticle = () => {
    const { article, addItem, removeItem } = this.props;

    this.isArticleSelected() ?
      removeItem(article) :
      addItem(article);
  }

  public render() {
    const { article } = this.props;

    return (
      <RelatedArticlesCard
        article={article}
        isCheckedArticle={this.isArticleSelected()}
        handleArticle={this.handleSelectArticle}
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
      expandCore: false,
      expandGoals: false,
      expandSubjects: false,
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
    };
  }

  private handleChangeFilters = async (filterName: string, filterValue: number | string) => {
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

  private getAllChildrenItems = () => {
    const { currentNode } = this.props.editTeachingPathStore!;

    return currentNode!.children
      .map(child => child.items!.map(item => item.value))
      .flat() as Array<Article>;
  }

  public async componentDidMount() {
    const newArrayGrades : Array<Grade> = [];
    const newArraySubjects : Array<Subject> = [];
    const newArrayGrepCore : Array<Greep> = [];
    const newArrayGrepMulti : Array<Greep> = [];
    const newArrayGrepGoals : Array<Greep> = [];
    const newArrayGrepSource : Array<Greep> = [];
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
    await this.props.editTeachingPathStore!.getFiltersArticlePanel();
    const dataArticles = this.props.editTeachingPathStore!.getAllArticlePanelFilters();
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
        title: element.description!
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
        id: Number(element.multidisciplinay_id),
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
        id: Number(element.source_id),
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

  public handleChangeCore = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.handleChangeFilters('core', Number(e.target.value));
  }

  public handleChangeGoals = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.handleChangeFilters('goal', Number(e.target.value));
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
  }

  public handleClickGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const newArraySubject : Array<Subject> = [];
    const newArrayCore : Array<Greep> = [];
    const newArrayMulti : Array<Greep> = [];
    const newArrayGoals : Array<Greep> = [];
    const newArraySource : Array<Greep> = [];
    const value = e.currentTarget.value;
    const valueSelectedGrades = this.state.MySelectGrade;
    if (!valueSelectedGrades!.includes(Number(value))) {
      valueSelectedGrades!.push(Number(value));
      if (this.state.activeGrepFilters) {
        e.currentTarget.classList.add('active');
        this.state.grepDataFilters!.subject_filter!.forEach((element) => {
          // tslint:disable-next-line: variable-name
          const allSympGrades = element.grade_ids;
          const allSympGradesLength = allSympGrades!.split(value).length;
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
          const allSympGrades = element.grade_ids;
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueSubject.length > 0) {
            element.grade_subjects!.forEach((item) => {
              if (item.grade_id === value) {
                const allSympSubjects = item.subjects_relations;
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
          const allSympGrades = element.grade_ids;
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueSubject.length > 0) {
            element.grade_subjects!.forEach((item) => {
              if (item.grade_id === value) {
                const allSympSubjects = item.subjects_relations;
                allSympSubjectsLength = allSympSubjects!.includes(this.state.valueSubject);
              }
            });
            if (allSympGradesLength && allSympSubjectsLength) {
              newArrayMulti.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.multidisciplinay_id),
                title: element.description!
              });
            }
          } else {
            if (allSympGradesLength) {
              newArrayMulti.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.multidisciplinay_id),
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
          const allSympGrades = element.grade_ids;
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueSubject.length > 0) {
            element.grade_subjects!.forEach((item) => {
              if (item.grade_id === value) {
                const allSympSubjects = item.subjects_relations;
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
        this.state.grepDataFilters!.source_filter!.forEach((element) => {
          // tslint:disable-next-line: variable-name
          const allSympGrades = element.grade_ids;
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueSubject.length > 0) {
            element.grade_subjects!.forEach((item) => {
              if (item.grade_id === value) {
                const allSympSubjects = item.subjects_relations;
                allSympSubjectsLength = allSympSubjects!.includes(this.state.valueSubject);
              }
            });
            if (allSympGradesLength && allSympSubjectsLength) {
              newArraySource.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.source_id),
                title: element.description!
              });
            }
          } else {
            if (allSympGradesLength) {
              newArraySource.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.source_id),
                title: element.description!
              });
            }
          }
        });
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
      const indexSelected = valueSelectedGrades!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedGrades!.splice(indexSelected, 1);
      }
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
          const allSympGrades = element.subject_ids;
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueGrade.length > 0) {
            element.grade_subjects!.forEach((item) => {
              if (item.grade_id === this.state.valueGrade) {
                const allSympSubjects = item.subjects_relations;
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
          const allSympGrades = element.subject_ids;
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueGrade.length > 0) {
            element.grade_subjects!.forEach((item) => {
              if (item.grade_id === this.state.valueGrade) {
                const allSympSubjects = item.subjects_relations;
                allSympSubjectsLength = allSympSubjects!.includes(value);
              }
            });
            if (allSympGradesLength && allSympSubjectsLength) {
              newArrayMulti.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.multidisciplinay_id),
                title: element.description!
              });
            }
          } else {
            if (allSympGradesLength) {
              newArrayMulti.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.multidisciplinay_id),
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
          const allSympGrades = element.subject_ids;
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueGrade.length > 0) {
            element.grade_subjects!.forEach((item) => {
              if (item.grade_id === this.state.valueGrade) {
                const allSympSubjects = item.subjects_relations;
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
        this.state.grepDataFilters!.source_filter!.forEach((element) => {
          // tslint:disable-next-line: variable-name
          const allSympGrades = element.subject_ids;
          const allSympGradesLength = allSympGrades!.includes(value);
          let allSympSubjectsLength = false;
          if (this.state.valueGrade.length > 0) {
            element.grade_subjects!.forEach((item) => {
              if (item.grade_id === this.state.valueGrade) {
                const allSympSubjects = item.subjects_relations;
                allSympSubjectsLength = allSympSubjects!.includes(value);
              }
            });
            if (allSympGradesLength && allSympSubjectsLength) {
              newArraySource.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.source_id),
                title: element.description!
              });
            }
          } else {
            if (allSympGradesLength) {
              newArraySource.push({
                // tslint:disable-next-line: variable-name
                id: Number(element.source_id),
                title: element.description!
              });
            }
          }
        });
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
      MySelectSource : valueSelectedSource
    });
    this.handleChangeFilters('source', String(valueSelectedSource));
  }

  public addItemToNewChild = (item: Article) => {
    const { currentNode } = this.props.editTeachingPathStore!;
    const ifAddingItemIsSaved = !!currentNode!.children.filter(
      child => child.items!.find(el => el.value.id === item.id)
    ).length;

    if (ifAddingItemIsSaved) {
      this.setState({ removingItems: this.state.removingItems.filter((el: Article) => el.id !== item.id) });
    }
    this.setState({ itemsForNewChildren: [...this.state.itemsForNewChildren, item] });
    this.setState({ greeddata: true });
    this.setState({ selectedArticle: item });
  }

  public removeItemFromNewChild = async (item: Article) => {
    const { currentNode } = this.props.editTeachingPathStore!;

    const ifRemovableItemIsSaved = !!currentNode!.children.filter(
      child => child.items!.find(el => el.value.id === item.id)
    ).length;

    if (ifRemovableItemIsSaved) {
      this.setState({ removingItems: [...this.state.removingItems, item] });
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

  public renderHeader = () => (
    <div className="articlesListHeader flexBox spaceBetween" tabIndex={0}>
      <div className="articlesListHeader__left">
        <p className="active">{intl.get('edit_teaching_path.modals.articles')}</p>
        <a href="javascript:void(0)" onClick={this.redirectAssigment}>{intl.get('edit_teaching_path.modals.assignmetns')}</a>
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
  )

  public renderArticle = (article: Article, index: number) => (
    <ArticleItem
      key={article.id}
      article={article}
      allItems={this.state.itemsForNewChildren}
      addItem={this.addItemToNewChild}
      removeItem={this.removeItemFromNewChild}
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
    return (
      <div className="defaultContentModal" data-id={selectedArticle!.id}>
        <h2>{intl.get('edit_teaching_path.modals.articles_title')}</h2>
        <div className="defaultContentModal__content">
          <h3>{selectedArticle!.title}</h3>
          <p>{selectedArticle!.excerpt}</p>
          <a href="javascript:void(0)" className="CreateButton" onClick={this.openArticleReading}>{intl.get('edit_teaching_path.modals.articles_read')}</a>
        </div>
        <div className="defaultContentModal__expand">
          <div className={`expandContent ${expand && 'active'}`} onClick={this.toggleData}>{intl.get('edit_teaching_path.modals.expand')}</div>
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
