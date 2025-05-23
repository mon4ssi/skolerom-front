import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import isNull from 'lodash/isNull';

import articleImg from 'assets/images/article-eye.svg';
import reading from 'assets/images/reading-icon.svg';
import checkInactive from 'assets/images/ckeck-inactive.svg';
import checkActive from 'assets/images/check-active-green.svg';

import { CurrentQuestionaryStore } from '../CurrentQuestionaryStore';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import { Loader } from 'components/common/Loader/Loader';
import { Article } from 'assignment/Assignment';
import { ReadingArticle } from 'components/pages/ReadingArticle/ReadingArticle';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { UserType } from 'user/User';
import list from 'assets/images/list-placeholder.svg';

import './AssignmentArticlesToReading.scss';

interface Props {
  currentQuestionaryStore?: CurrentQuestionaryStore;
  readOnly: boolean;
}

interface State {
  isShowArticle: boolean;
  titleCurrentArticle: string;
  currentArticleChildren: Array<Article>;
  shownArticleId?: number | null;
  shownArticleLevelId: number;
  attachedArticleId: number;
}

@inject('currentQuestionaryStore')
@observer
export class AssignmentArticlesToReading extends Component<Props, State> {
  private subjectRef = React.createRef<HTMLAnchorElement>();
  public state = {
    isShowArticle: false,
    titleCurrentArticle: '',
    currentArticleChildren: [],
    attachedArticleId: -1,
    shownArticleId: null,
    shownArticleLevelId: -1,
    allArticlesRead: 0,
    allArticles: 0
  };

  public componentDidMount() {
    if (this.subjectRef.current) {
      this.subjectRef.current!.focus();
    }
    this.props.currentQuestionaryStore!.getRelatedArticles();
  }

  public openArticle = (article: Article) => () => {
    const { title, id, levels, correspondingLevelArticleId } = article;
    const isStudent = this.props.currentQuestionaryStore!.getCurrentUser()!.type === UserType.Student;
    if (!isStudent) {
      // const articleChildren = levels![0].childArticles!.length ? levels![0].childArticles! : [article];
      // const currentArticleLevelObject = articleChildren.find(article => article.id === correspondingLevelArticleId);

      this.setState({
        isShowArticle: true,
        titleCurrentArticle: title,
        // currentArticleChildren: articleChildren,
        attachedArticleId: id,
        shownArticleId: correspondingLevelArticleId || id,
        // shownArticleLevelId: currentArticleLevelObject ? currentArticleLevelObject.levels![0].wpId : article.levels![0].wpId
      });
    }

    // const articleChildren = levels![0].childArticles!.length ? levels![0].childArticles! : [article];
    // const currentArticleLevelObject = articleChildren.find(article => article.id === correspondingLevelArticleId);

    this.setState({
      isShowArticle: true,
      titleCurrentArticle: title,
      // currentArticleChildren: articleChildren,
      attachedArticleId: id,
      shownArticleId: correspondingLevelArticleId || id,
      // shownArticleLevelId: currentArticleLevelObject ? currentArticleLevelObject.levels![0].wpId : article.levels![0].wpId
    });
  }

  public closeArticle = () => {
    this.setState({
      isShowArticle: false,
      titleCurrentArticle: '',
      shownArticleLevelId: -1
    });
  }

  public renderArticlesCards = (article: Article) => {
    const { readOnly } = this.props;
    /* const levels = article.levels && article.levels.length && article.levels![0].childArticles!.length ? article.levels![0].childArticles!.map(
      (article: Article) => Number(article.levels![0].slug.split('-')[1])
    ) : [Number(article.levels![0].slug.split('-')[1])]; */
    this.state.allArticles += 1;
    if (article.isRead) {
      this.state.allArticlesRead += 1;
    }
    return (
      <div
        className={`AssignmentArticlesToReading__card ${article.isRead && 'cardBorder'} ${readOnly && 'AssignmentArticlesToReading__defaultCursor'}`}
        key={article.id}
      >
        <InfoCard
          type={'ARTICLE'}
          title={article.title}
          icon={article.isRead ? articleImg : reading}
          description={article.excerpt}
          grades={article.grades}
          img={article.images && article.images!.url}
          isReadArticle={article.isRead}
          onClick={this.openArticle(article)}
          hiddeIcons
          // levels={levels || []}
        />
      </div>
    );
  }

  public finishReading = (graduation: number) => { // TODO maybe it should be removed in future
    const { currentQuestionaryStore } = this.props;
    const { shownArticleLevelId, attachedArticleId } = this.state;
    const isStudent = this.props.currentQuestionaryStore!.getCurrentUser()!.type === UserType.Student;
    if (!isNull(attachedArticleId)) {
      this.props.currentQuestionaryStore!.setReadStatusToArticle(attachedArticleId!, shownArticleLevelId, graduation, isStudent);
      if (!isStudent) {
        return this.closeArticle();
      }
      this.closeArticle();
      Notification.create({
        type: NotificationTypes.SUCCESS,
        title: intl.get('current_assignment_page.after_article_submit')
      });
    }
  }

  public handleChangeLevel = (levelId: number) => {
    this.setState({ shownArticleLevelId: levelId });
  }

  public sendValidArticlesRead() {
    const { currentQuestionaryStore } = this.props;
    currentQuestionaryStore!.allArticlesread = false;
    if (this.state.allArticlesRead > 0) {
      if (this.state.allArticles === this.state.allArticlesRead) {
        currentQuestionaryStore!.allArticlesread = true;
      }
    }
  }

  public renderContent = () => {
    const {
      isShowArticle,
      titleCurrentArticle,
      currentArticleChildren,
      shownArticleId
    } = this.state;

    const { currentQuestionaryStore } = this.props;
    this.sendValidArticlesRead();
    if (isShowArticle) {
      return (
        <ReadingArticle
          titleCurrentArticle={titleCurrentArticle}
          currentArticleChildren={currentArticleChildren}
          shownArticleId={shownArticleId}
          closeArticle={this.closeArticle}
          finishReading={this.finishReading}
          handleChangeLevel={this.handleChangeLevel}
          notFinish={true}
        />
      );
    }
    if (currentQuestionaryStore!.isLoadingArticles) {
      return (
        <>
          <div className="AssignmentArticlesToReading__articles" >
            {currentQuestionaryStore!.relatedAllArticles.map(this.renderArticlesCards)}
          </div>
        </>
      );
    }
    return (<div className={'loading'}><Loader /></div>);
  }

  public render() {
    const { currentQuestionaryStore } = this.props;
    const background = (currentQuestionaryStore && currentQuestionaryStore!.backgroundImage) ? currentQuestionaryStore!.backgroundImage : list;
    return (
      <div className="AssignmentArticlesToReading">
        <div className="QuestionPreview__background AssignmentArticlesToReading__background" style={{ backgroundImage: `url(${background})` }} />
        <a href="#" className="AssignmentArticlesToReading__title" ref={this.subjectRef}>{intl.get('assignment preview.Assignment articles')}</a>
        {this.renderContent()}
      </div>
    );
  }
}
