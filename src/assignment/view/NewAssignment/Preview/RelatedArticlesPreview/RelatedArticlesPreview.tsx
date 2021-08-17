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
      expandCore: false,
      expandGoals: false,
      expandSubjects: false,
      checkArticle: false,
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
    this.props.newAssignmentStore!.visibilityArticles = true;
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
    this.setState({ greeddata: true });
    this.setState({ selectedArticle: article });
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

    const allCardsMargins = 129; // Left padding of container + all right margins of card
    const cardsInRow = 4;
    const cardWidthToHeightIndex = 1.2;

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

  public render() {
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
        />
      );
    }
    return (
      <div className={'RelatedArticlesPreview'}>
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
              <div className="content">
                {this.renderHeader()}
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
