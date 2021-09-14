import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import './ArticleTeachingPath.scss';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import reading from 'assets/images/reading-icon.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';
import { QuestionaryTeachingPathStore } from '../../../questionaryTeachingPath/questionaryTeachingPathStore';
import { ReadingArticle } from 'components/pages/ReadingArticle/ReadingArticle';
import { Article } from 'assignment/Assignment';

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  finishReading(graduation: number): void;
}

interface State {
  shownArticleLevelId: number;
  attachedArticleId: number;
}

@inject('questionaryTeachingPathStore')
@observer
export class ArticleTeachingPath extends Component<Props, State> {
  public ref = createRef<HTMLDivElement>();

  public state = {
    attachedArticleId: -1,
    shownArticleLevelId: -1,
  };

  public async componentDidMount() {
    const { questionaryTeachingPathStore } = this.props;
    const ids = questionaryTeachingPathStore!.idsItemsNode;
    await questionaryTeachingPathStore!.getCurrentArticlesList(ids);
    questionaryTeachingPathStore!.setFetchingDataStatus(false);
    if (this.ref.current) {
      this.ref.current!.focus();
    }
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

  public renderCards = () => {
    const { questionaryTeachingPathStore } = this.props;

    return questionaryTeachingPathStore!.currentArticlesList.map((item) => {
      const passedStyle = item.isSelected ? 'passedStyle' : '';
      return (
        <div className={passedStyle} key={item.id} role="region" aria-live="polite" aria-atomic="true" ref={this.ref}>
          <InfoCard
            icon={reading}
            title={item.title}
            grades={item.grades}
            description={item.excerpt}
            img={(item.images && item.images.url) ? item.images.url : listPlaceholderImg}
            onClick={this.chooseCard(item)}
          />
        </div>
      );
    }
    );
  }

  public finishReading = async (graduation: number) => {
    this.closeArticleReading();
    this.props.finishReading(graduation);
  }

  public handleChangeLevel = (levelId: number) => {
    this.setState({ shownArticleLevelId: levelId });
  }

  public renderContent = () => {
    const { questionaryTeachingPathStore } = this.props;

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

    return (
      <div className={'articleTeachingPath'}>
        <span className={'chooseOne fs15'}>{intl.get('teaching path passing.choose one')}</span>
        <span className={'title'}>{questionaryTeachingPathStore!.currentNode!.selectQuestion}</span>
        <div className="cards">
          {this.renderCards()}
        </div>
      </div>
    );
  }

  public render() {
    return this.renderContent();
  }
}
