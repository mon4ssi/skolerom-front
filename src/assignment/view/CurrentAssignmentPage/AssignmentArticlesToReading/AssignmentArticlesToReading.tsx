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

  public refArticle = React.createRef<HTMLDivElement>();

  public openArticle = (article: Article) => () => {
    const { title, id, levels, correspondingLevelArticleId } = article;
    const isStudent = this.props.currentQuestionaryStore!.getCurrentUser()!.type === UserType.Student;

    if (!isStudent) {
      const articleChildren = levels![0].childArticles!.length ? levels![0].childArticles! : [article];
      const currentArticleLevelObject = articleChildren.find(article => article.id === correspondingLevelArticleId);

      this.setState({
        isShowArticle: true,
        titleCurrentArticle: title,
        currentArticleChildren: articleChildren,
        attachedArticleId: id,
        shownArticleId: correspondingLevelArticleId || id,
        shownArticleLevelId: currentArticleLevelObject ? currentArticleLevelObject.levels![0].wpId : article.levels![0].wpId
      });
    }

    const articleChildren = levels![0].childArticles!.length ? levels![0].childArticles! : [article];
    const currentArticleLevelObject = articleChildren.find(article => article.id === correspondingLevelArticleId);

    this.setState({
      isShowArticle: true,
      titleCurrentArticle: title,
      currentArticleChildren: articleChildren,
      attachedArticleId: id,
      shownArticleId: correspondingLevelArticleId || id,
      shownArticleLevelId: currentArticleLevelObject ? currentArticleLevelObject.levels![0].wpId : article.levels![0].wpId
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
        onClick={this.openArticle(article)}
      >
        <InfoCard
          type={'ARTICLE'}
          title={article.title}
          icon={article.isRead ? articleImg : reading}
          description={article.excerpt}
          grades={article.grades}
          img={article.images && article.images!.url}

        // levels={levels || []}
        />
        <img src={article.isRead ? checkActive : checkInactive} alt="checkbox" className="AssignmentArticlesToReading__checkbox"/>
      </div>
    );
  }

  public finishReading = (graduation: number) => { // TODO maybe it should be removed in future
    const { currentQuestionaryStore } = this.props;
    const { shownArticleLevelId, attachedArticleId } = this.state;
    const isStudent = this.props.currentQuestionaryStore!.getCurrentUser()!.type === UserType.Student;

    if (!isNull(attachedArticleId)) {
      if (!isStudent) {
        return this.closeArticle();
      }
      this.props.currentQuestionaryStore!.setReadStatusToArticle(attachedArticleId!, shownArticleLevelId, graduation);
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
          <span className="AssignmentArticlesToReading__title">{intl.get('assignment preview.Assignment articles')}</span>
          <div className="AssignmentArticlesToReading__articles" ref={this.refArticle}>
            {currentQuestionaryStore!.relatedAllArticles.map(this.renderArticlesCards)}
          </div>
        </>
      );
    }
    return (<div className={'loading'}><Loader /></div>);
  }

  public render() {
    return (
      <div className="AssignmentArticlesToReading">
        {this.renderContent()}
      </div>
    );
  }
}
