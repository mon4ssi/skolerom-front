import React, { Component, createRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import intl, { load } from 'react-intl-universal';
import './CustomTeachingPath.scss';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import { TeachingPathNodeType } from '../../../TeachingPath';
import reading from 'assets/images/reading-icon.svg';
import domainImg from 'assets/images/app-open-icon.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';
import assignment from 'assets/images/assignment.svg';
import { QuestionaryTeachingPathStore } from '../../../questionaryTeachingPath/questionaryTeachingPathStore';
import { ReadingArticle } from 'components/pages/ReadingArticle/ReadingArticle';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { Article, Domain } from 'assignment/Assignment';
import { Loader } from 'components/common/Loader/Loader';
import { parseQueryString } from 'utils/queryString';

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  finishReading?(graduation: number): void;
  finishReadingDomain?(): void;
}

interface State {
  shownArticleLevelId: number;
  attachedArticleId: number;
  canGoToNextQuestion: boolean;
  isLoadingFinished: boolean;
}

type ComponentProps = Props & RouteComponentProps;

@inject('questionaryTeachingPathStore')
@observer
export class CustomTeachingPathComponent extends Component<ComponentProps, State> {
  public ref = createRef<HTMLAnchorElement>();
  public state = {
    attachedArticleId: -1,
    shownArticleLevelId: -1,
    canGoToNextQuestion: false,
    isLoadingFinished: false,
  };
  public async componentDidMount() {
    const { questionaryTeachingPathStore } = this.props;
    const ids = questionaryTeachingPathStore!.idsItemsNode;
    let loadingFinished = false;
    /* this.props.questionaryTeachingPathStore!.domainFullInfo();
    this.props.questionaryTeachingPathStore!.assignmentFullInfo(); */
    await questionaryTeachingPathStore!.getCurrentArticlesList(ids);
    loadingFinished = true;
    this.setState({ isLoadingFinished: loadingFinished });
    if (this.state.isLoadingFinished) {
      this.props.questionaryTeachingPathStore!.domainFullInfo();
      this.props.questionaryTeachingPathStore!.assignmentFullInfo();
    }
    if (this.ref.current) {
      this.ref.current!.focus();
    }
  }
  public componentWillUnmount(): void {
    this.props.questionaryTeachingPathStore!.resetCurrentArticleList();
    this.props.questionaryTeachingPathStore!.resetCurrentDomainList();
    this.props.questionaryTeachingPathStore!.clearAssignmentFullInfo();
    this.setState({ isLoadingFinished: false });
  }

  public goToAssignment = (id: number, locale: number) => () => {
    const { questionaryTeachingPathStore } = this.props;
    questionaryTeachingPathStore!.handleAssignment(true);
    questionaryTeachingPathStore!.pickUpItem(id);
    /* tslint:disable:no-string-literal */
    const search = parseQueryString(window.location.search)['locale_id'];
    const urlbasic = (locale > 0) ? search ? `/assignments/view/${id}?locale_id=${locale}&teachingpathlocaleid=${search}` : `/assignments/view/${id}?locale_id=${locale}` : search ? `/assignments/view/${id}?teachingpathlocaleid=${search}` : `/assignments/view/${id}`;
    this.props.history.push(urlbasic, {
      teachingPath: questionaryTeachingPathStore!.teachingPathId,
      node: questionaryTeachingPathStore!.pickedItemAssignment!.idNode
    });
  }
  public renderCardsAssignment = () => {
    const { questionaryTeachingPathStore } = this.props;
    return questionaryTeachingPathStore!.currentListAssignment.map((item) => {
      const passedStyle = item.isSelected ? '' : '';
      const localeid = (item.locale_id) ? item.locale_id : -1;
      return (
        <div className={passedStyle} key={item.id}>
          <InfoCard
            icon={assignment}
            type="ASSIGNMENT"
            title={item.title}
            grades={item.grades}
            description={item.description}
            img={item.featuredImage ? item.featuredImage : listPlaceholderImg}
            numberOfQuestions={item.numberOfQuestions}
            isReadArticle={item.isSelected}
            onClick={this.goToAssignment(item.id, localeid)}
            hiddeIcons
          />
        </div>
      );
    }
    );
  }
  public closeArticleReading = () => {
    this.setState({
      attachedArticleId: -1,
      shownArticleLevelId: -1
    });
    this.props.questionaryTeachingPathStore!.handleIframe(false);
  }

  public chooseCard = (article: Article) => () => {
    const { id, levels, correspondingLevelArticleId } = article;
    const articleChildren = levels![0].childArticles!;
    const currentArticleLevelObject = articleChildren.find(article => article.wpId === correspondingLevelArticleId);
    this.props.questionaryTeachingPathStore!.handleIframe(true);
    this.props.questionaryTeachingPathStore!.pickUpItem(id);
    this.setState({
      attachedArticleId: id,
      shownArticleLevelId: currentArticleLevelObject ? currentArticleLevelObject.levels![0].wpId : article.levels![0].wpId
    });
  }
  public renderCardsArticles = () => {
    const { questionaryTeachingPathStore } = this.props;
    return questionaryTeachingPathStore!.currentArticlesList.map((item) => {
      const passedStyle = item.isSelected ? '' : '';
      return (
        <div className={passedStyle} key={item.id} role="region" aria-live="polite" aria-atomic="true">
          <InfoCard
            icon={reading}
            title={item.title}
            grades={item.grades}
            description={item.excerpt}
            img={(item.images && item.images.url) ? item.images.url : listPlaceholderImg}
            onClick={this.chooseCard(item)}
            isReadArticle={item.isSelected}
            hiddeIcons
          />
        </div>
      );
    }
    );
  }

  public chooseCardDomain = (domain: Domain) => () => {
    const { id, url } = domain;
    this.props.questionaryTeachingPathStore!.pickUpItem(id);
    this.setState({ canGoToNextQuestion: true });
    window.open(`${url}`, '_blank');
  }

  public renderCardsDomain = () => {
    const { questionaryTeachingPathStore } = this.props;
    const length = questionaryTeachingPathStore!.currentDomainList.length;
    return questionaryTeachingPathStore!.currentDomainList.map((item, index) => {
      if (item) {
        const passedStyle = item.isRead ? '' : '';
        return (
          <div className={passedStyle} key={item.id} role="region" aria-live="polite" aria-atomic="true">
            <InfoCard
              icon={domainImg}
              title={item.title}
              type="DOMAIN"
              grades={item.grades}
              description={item.description}
              img={(item.featuredImage) ? item.featuredImage : listPlaceholderImg}
              urldomain={item.url}
              onClick={this.chooseCardDomain(item)}
              isReadArticle={item.isRead}
              hiddeIcons
            />
          </div>
        );
      }
    }
    );
  }
  public finishReading = async (graduation: number) => {
    this.closeArticleReading();
    if (this.props.finishReading) {
      this.props.finishReading(graduation);
    }
  }
  public finishReadingDomain = () => {
    if (this.props.finishReadingDomain) {
      this.props.finishReadingDomain();
    }
  }
  public handleChangeLevel = (levelId: number) => {
    this.setState({ shownArticleLevelId: levelId });
  }
  public nextButtonDomain = () => {
    const { questionaryTeachingPathStore } = this.props;
    if (questionaryTeachingPathStore!.currentDomainList.length > 0) {
      return (
        <div className="buttonDomain">
          <button
            className="CreateButton"
            onClick={this.finishReadingDomain}
            disabled={!this.state.canGoToNextQuestion}
            title="Next"
          >
            {intl.get('pagination.Next page')}
          </button>
        </div>
      );
    }
  }
  public chooseTitle = () => {
    const { questionaryTeachingPathStore } = this.props;
    const length = questionaryTeachingPathStore!.currentArticlesList.length;
    const lengthDomain = questionaryTeachingPathStore!.currentDomainList.length;
    const sumLength = length + lengthDomain;
    if (sumLength > 1) {
      return (
        <span className={'chooseOne fs15'}>{intl.get('teaching path passing.choose one')}</span>
      );
    }
  }
  public renderContent = () => {
    const { questionaryTeachingPathStore } = this.props;
    questionaryTeachingPathStore!.setFetchingDataStatusCustom(true);
    if (questionaryTeachingPathStore!.isOpenedIframe && questionaryTeachingPathStore!.pickedItemArticle) {
      const article = questionaryTeachingPathStore!.pickedItemArticle!.item;
      const articleChildren = article.levels![0].childArticles!.length ? article.levels![0].childArticles : [article];
      return (
        <ReadingArticle
          titleCurrentArticle={article.title}
          currentArticleChildren={articleChildren}
          shownArticleId={article.correspondingLevelArticleId || article.wpId}
          closeArticle={this.closeArticleReading}
          finishReading={this.finishReading}
          handleChangeLevel={this.handleChangeLevel}
          notFinish={true}
        />
      );
    }
    if (!this.state.isLoadingFinished) {
      return (
        <div className={'articleTeachingPath'}>
          {this.chooseTitle()}
          <a href="#" className={'title'} ref={this.ref}>{questionaryTeachingPathStore!.currentNode!.selectQuestion}</a>
        </div>
      );
    }
    return (
      <div className={'articleTeachingPath'}>
        {this.chooseTitle()}
        <a href="#" className={'title'} ref={this.ref}>{questionaryTeachingPathStore!.currentNode!.selectQuestion}</a>
        <div className="cards">
          {(questionaryTeachingPathStore!.currentArticlesList.length > 0) && this.renderCardsArticles()}
          {(questionaryTeachingPathStore!.currentDomainList.length > 0) && this.renderCardsDomain()}
          {(questionaryTeachingPathStore!.currentListAssignment.length > 0) && this.renderCardsAssignment()}
        </div>
        {this.nextButtonDomain()}
      </div>
    );
  }
  public render() {
    return this.renderContent();
  }
}

export const CustomTeachingPath = withRouter(CustomTeachingPathComponent);
