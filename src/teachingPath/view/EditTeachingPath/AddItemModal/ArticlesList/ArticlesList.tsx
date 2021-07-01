import React, { Component, ChangeEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import isNaN from 'lodash/isNaN';

import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { ItemContentTypeContext } from 'teachingPath/view/EditTeachingPath/ItemContentTypeContext';
import { Article } from 'assignment/Assignment';
import { RelatedArticlesCard } from 'assignment/view/NewAssignment/Preview/RelatedArticlesPreview/RelatedArticlesCard';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { lettersNoEn } from 'utils/lettersNoEn';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { ReadingArticle } from 'components/pages/ReadingArticle/ReadingArticle';

import closeImg from 'assets/images/close-rounded-black.svg';
import tagsImg from 'assets/images/tags.svg';
import gradeImg from 'assets/images/grade.svg';

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
      expand: false,
      expandCore: false,
      expandGoals: false,
      expandSubjects: false,
      checkArticle: false
    };
  }

  private handleChangeFilters = async (filterName: string, filterValue: number | string) => {
    const { editTeachingPathStore } = this.props;
    editTeachingPathStore!.resetCurrentArticlesPage();
    editTeachingPathStore!.resetIsFetchedArticlesListFinished();
    const filters = { ...this.state.appliedFilters };

    if (!isNaN(filterValue)) {
      filters[filterName] = filterValue;
    } else {
      // tslint:disable-next-line:no-dynamic-delete
      delete filters[filterName];
    }

    this.setState({ appliedFilters: filters });

    if (filterName === 'searchTitle') {
      editTeachingPathStore!.getArticlesWithDebounce(filters);
    } else {
      await editTeachingPathStore!.getArticles(filters);
    }
  }

  private getAllChildrenItems = () => {
    const { currentNode } = this.props.editTeachingPathStore!;

    return currentNode!.children
      .map(child => child.items!.map(item => item.value))
      .flat() as Array<Article>;
  }

  public async componentDidMount() {
    const { appliedFilters } = this.state;
    const { articlesList } = this.props.editTeachingPathStore!;
    document.addEventListener('keyup', this.handleKeyboardControl);
    this.refButton.current!.focus();

    this.setState({ itemsForNewChildren: this.getAllChildrenItems() });
    const isNextPage = articlesList.length > 0;
    this.props.editTeachingPathStore!.getArticles({ isNextPage, ...appliedFilters });
    this.props.editTeachingPathStore!.getGrades();
    this.props.editTeachingPathStore!.getSubjects();
  }

  public componentWillUnmount() {
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

  public handleChangeSubject = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.handleChangeFilters('subjects', Number(e.target.value));
  }

  public handleChangeSearchQuery = async (e: ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.currentTarget.value)) {
      this.handleChangeFilters('searchTitle', e.currentTarget.value);
    }
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
    const { articlesList, fetchingArticles, articlesForSkeleton } = this.props.editTeachingPathStore!;

    const selectedAndLoadedArticles = this.addSelectedArticles(articlesList);

    const allCardsMargins = 129; // Left padding of container + all right margins of card
    const cardsInRow = 4;
    const cardWidthToHeightIndex = 1.28;

    const cardsContainer = document.getElementsByClassName('articlesListContainer')[0];
    const skeletonCardWidth = ((cardsContainer ? cardsContainer.clientWidth : 0) - allCardsMargins) / cardsInRow;
    const skeletonCardHeight = skeletonCardWidth * cardWidthToHeightIndex;

    if (fetchingArticles && !articlesList.length) {
      return articlesForSkeleton.map((skeletonArticle, index) => (
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
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    if (event.key === 'Escape') {
      this.closeModal();
    }
    if ((htmlPathArea !== htmlText) && (htmlPathArea !== inputText)) {
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
        return <span key={subject.id}>{title}</span>;
      });
      return (
        <div className="subjects">
          {visiblesubjects}
        </div>
      );
    }
    return (
      <div className="subjects" />
    );
  }

  public SelectedGreepCore = () => {
    const { selectedArticle } = this.state;
    return (
      <div className="greepContentList">
        <ul>
          <li>Core Element 1</li>
          <li>Core Element 2</li>
          <li>Core Element 3</li>
        </ul>
      </div>
    );
  }

  public SelectedCoreGoals = () => {
    const { selectedArticle } = this.state;
    return (
      <div className="greepContentList">
        <ul>
          <li>Educational goals 1</li>
          <li>Educational goals 2</li>
        </ul>
      </div>
    );
  }

  public SelectedCoreSubjects = () => {
    const { selectedArticle } = this.state;
    return (
      <div className="greepContentList">
        <ul>
          <li>Demokrati og medborgerskap</li>
          <li>Folkehelse og livsmestring</li>
        </ul>
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
            <img src={tagsImg} />
          </div>
          <div className="lisItemInsideText">
            <h5 onClick={this.toggleDataCore}>{intl.get('new assignment.greep.core')}</h5>
            {this.SelectedGreepCore()}
          </div>
        </div>
        <div className={`listItemInside listItemGreep ${expandGoals && 'active'}`}>
          <div className="lisItemInsideIcon">
            <img src={tagsImg} />
          </div>
          <div className="lisItemInsideText">
            <h5 onClick={this.toggleDataGoals}>{intl.get('new assignment.greep.goals')}</h5>
            {this.SelectedCoreGoals()}
          </div>
        </div>
        <div className={`listItemInside listItemGreep ${expandSubjects && 'active'}`}>
          <div className="lisItemInsideIcon">
            <img src={tagsImg} />
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

  public render() {
    const { appliedFilters, checkArticle, selectedArticle } = this.state;
    if (checkArticle) {
      return (
        <ReadingArticle
          titleCurrentArticle={selectedArticle!.title}
          shownArticleId={selectedArticle!.correspondingLevelArticleId || selectedArticle!.wpId}
          closeArticle={this.closeArticleReading}
          finishReading={this.finishReading}
        />
      );
    }
    return (
      <div className="addItemModal__content">
        <div className="addItemModal__left">
          {this.conditionalGreedData()}
        </div>
        <div className="addItemModal__right">
          <div className="ArticlesList flexBox dirColumn">
            {this.renderHeader()}

            <SearchFilter
              subject
              grade
              placeholder={intl.get('edit_teaching_path.modals.search_for_articles')}
              // METHODS
              handleChangeSubject={this.handleChangeSubject}
              handleChangeGrade={this.handleChangeGrade}
              handleInputSearchQuery={this.handleChangeSearchQuery}
              // VALUES
              subjectFilterValue={Number(appliedFilters.subjects)}
              gradeFilterValue={Number(appliedFilters.grades)}
              searchQueryFilterValue={appliedFilters.searchTitle as string}
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
