import React, { ChangeEvent, Component, createRef } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import isNaN from 'lodash/isNaN';
import onClickOutside from 'react-onclickoutside';

import { NewAssignmentStore } from '../../NewAssignmentStore';
import { RelatedArticlesCard } from './RelatedArticlesCard';
import { AttachmentContentType, AttachmentContentTypeContext } from '../../AttachmentContentTypeContext';
import { Article } from 'assignment/Assignment';
import { TagProp } from 'components/common/TagInput/TagInput';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { lettersNoEn } from 'utils/lettersNoEn';

import closeCross from 'assets/images/close-rounded-black.svg';

import './RelatedArticlesPreview.scss';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { SCROLL_OFFSET } from 'utils/constants';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
}
const PATHLENGTH = 4;
interface State {
  isSortedByDate: boolean;
  appliedFilters: { [field: string]: number | string };
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
      appliedFilters: {}
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
    newAssignmentStore!.resetCurrentArticlesPage();
    newAssignmentStore!.resetIsFetchedArticlesListFinished();
    const filters = { ...this.state.appliedFilters };

    if (!isNaN(filterValue)) {
      filters[filterName] = filterValue;
    } else {
      // tslint:disable-next-line:no-dynamic-delete
      delete filters[filterName];
    }

    this.setState({ appliedFilters: filters });

    if (filterName === 'searchTitle') {
      newAssignmentStore!.getArticlesWithDebounce(filters);
    } else {
      await newAssignmentStore!.getArticles(filters);
    }
  }

  public async componentDidMount() {
    const { newAssignmentStore } = this.props;
    const { appliedFilters } = this.state;
    if (this.refButton.current) {
      this.refButton.current!.focus();
    }

    const isNextPage = newAssignmentStore!.allArticles.length > 0;
    document.addEventListener('keyup', this.handleKeyboardControl);
    await newAssignmentStore!.getArticles({ isNextPage, ...appliedFilters });
    await newAssignmentStore!.getGrades();
    await newAssignmentStore!.getSubjects();
  }

  public componentWillUnmount() {
    const { newAssignmentStore } = this.props;
    document.removeEventListener('keyup', this.handleKeyboardControl);

    this.closePanel();
    newAssignmentStore!.resetCurrentArticlesPage();
    newAssignmentStore!.resetArticlesList();
    newAssignmentStore!.resetIsFetchedArticlesListFinished();
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const path = event.composedPath().length;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    if (event.key === 'Escape') {
      this.closePanel();
    }
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText) {
      if (event.shiftKey && event.key === 'A' || event.shiftKey && event.key === 'a') {
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
      if (this.isCheckedArticle(id)) {
        newAssignmentStore!.currentEntity!.removeArticle(article);
      } else {
        newAssignmentStore!.currentEntity!.addArticle(article);
      }
      newAssignmentStore!.currentEntity!.setFeaturedImage();
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

    const allCardsMargins = 65;
    const cardsInRow = 3;
    const cardWidthToHeightIndex = 1.28;

    const cardsContainer = document.getElementsByClassName('cards')[0];
    const skeletonCardWidth = ((cardsContainer ? cardsContainer.clientWidth : 0) - allCardsMargins) / cardsInRow;
    const skeletonCardHeight = skeletonCardWidth * cardWidthToHeightIndex;

    if (!selectedAndLoadedArticles.length) {
      return <div className={'noResults'}>{intl.get('new assignment.No results found')}</div>;
    }

    return selectedAndLoadedArticles.sort(this.sortSelectedCards).map((article, index) => article.id ? (
      <RelatedArticlesCard
        key={article.id}
        article={article}
        handleArticle={this.handleArticle(article.id)}
        isCheckedArticle={this.isCheckedArticle(article.id)}
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

  public onScroll = (): void => {
    const { newAssignmentStore } = this.props;
    const { appliedFilters } = this.state;

    if (
      this.ref.current!.scrollHeight - (this.ref.current!.clientHeight * SCROLL_OFFSET) <= this.ref.current!.scrollTop &&
      !this.props.newAssignmentStore!.isFetchedArticlesListFinished
    ) {
      newAssignmentStore!.getArticles({ isNextPage: true, ...appliedFilters });
      return;
    }
  }

  public render() {
    const { newAssignmentStore } = this.props;
    const selectedArticles = newAssignmentStore!.currentEntity!.getListOfArticles().map(this.articleToTagProp);

    return (
      <div className={'RelatedArticlesPreview'}>
        <div className="wrapperArticles">
          <div className="content">

            <div className="title">
              <span>{intl.get('new assignment.Set related article(s)')}</span>
              <button onClick={this.closePanel} title={intl.get('new assignment.Set related article(s)')} ref={this.refButton}><img src={closeCross} alt="Close"/></button>
            </div>

            <SearchFilter
              subject
              grade
              date
              placeholder={intl.get('assignments search.Search')}
              // METHODS
              handleChangeSubject={this.handleChangeSubject}
              handleChangeGrade={this.handleChangeGrade}
              switchNewestOldest={this.switchNewestOldest}
              handleInputSearchQuery={this.handleChangeSearchQuery}
              // VALUES
              subjectFilterValue={Number(this.state.appliedFilters.subjects)}
              gradeFilterValue={Number(this.state.appliedFilters.grades)}
              searchQueryFilterValue={this.state.appliedFilters.searchTitle as string}
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
