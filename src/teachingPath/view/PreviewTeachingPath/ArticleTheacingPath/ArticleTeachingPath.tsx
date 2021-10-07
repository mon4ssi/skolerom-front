import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import './ArticleTeachingPath.scss';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import { TeachingPathNodeType } from '../../../TeachingPath';
import reading from 'assets/images/reading-icon.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';
import { QuestionaryTeachingPathStore } from '../../../questionaryTeachingPath/questionaryTeachingPathStore';
import { ReadingArticle } from 'components/pages/ReadingArticle/ReadingArticle';
import { Article, Assignment } from 'assignment/Assignment';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  content?: Array<EditableTeachingPathNode>;
  finishReading(node: EditableTeachingPathNode | undefined): void;
}

interface State {
  shownArticleLevelId: number;
  attachedArticleId: number;
  nodeSelected: number;
  selectedArticle: Article | undefined;
}

@inject('questionaryTeachingPathStore')
@observer
export class ArticleTeachingPath extends Component<Props, State> {
  public ref = createRef<HTMLDivElement>();
  constructor(props: Props) {
    super(props);
    this.state = {
      attachedArticleId: -1,
      shownArticleLevelId: -1,
      nodeSelected: 0,
      selectedArticle: undefined
    };
  }

  public async componentDidMount() {
    const { questionaryTeachingPathStore } = this.props;
    if (this.ref.current) {
      this.ref.current!.focus();
    }
    const { content } = this.props;
    const MyArticlesList : Array<Article> = [];
    const MyArticlesListIds : Array<number> = [];
    content!.forEach((e) => {
      if (e.items![0].type === TeachingPathNodeType.Article) {
        if (e.items![0].value as Article) {
          MyArticlesList.push(e.items![0].value as Article);
        }
      }
    });
    MyArticlesList.forEach((e) => {
      MyArticlesListIds.push(e.wpId!);
    });

    await questionaryTeachingPathStore!.getCurrentArticlesList(MyArticlesListIds);
  }

  public closeArticleReading = () => {
    this.setState({
      attachedArticleId: -1,
      shownArticleLevelId: -1,
      selectedArticle: undefined
    });
    this.props.questionaryTeachingPathStore!.handleIframe(false);
  }

  public chooseCard = (article: Article, index: number) => () => {
    const { id, wpId, correspondingLevelArticleId } = article;
    this.props.questionaryTeachingPathStore!.handleIframe(true);

    this.setState({
      attachedArticleId: id,
      shownArticleLevelId: wpId!,
      selectedArticle: article,
      nodeSelected: index
    });
  }

  public renderCards = () => {
    const { questionaryTeachingPathStore } = this.props;
    const { content } = this.props;
    return questionaryTeachingPathStore!.currentArticlesList.map((item, index) => {
      const passedStyle = item.isSelected ? 'passedStyle' : '';
      return (
        <div className={passedStyle} key={item.id} role="region" aria-live="polite" aria-atomic="true" ref={this.ref}>
          <InfoCard
            icon={reading}
            title={item.title}
            grades={item.grades}
            description={item.excerpt}
            img={(item.images && item.images.url) ? item.images.url : listPlaceholderImg}
            onClick={this.chooseCard(item, index)}
          />
        </div>
      );
    }
    );
  }

  public finishReading = async (graduation: number) => {
    const { content } = this.props;
    const number = this.state.nodeSelected;
    this.closeArticleReading();
    this.props.finishReading(content![Number(number)]);
  }

  public handleChangeLevel = (levelId: number) => {
    this.setState({ shownArticleLevelId: levelId });
  }

  public renderContent = () => {
    const { questionaryTeachingPathStore, content } = this.props;
    const { selectedArticle } = this.state;
    if (typeof(selectedArticle) !== 'undefined') {
      return (
        <ReadingArticle
          titleCurrentArticle={selectedArticle!.title}
          shownArticleId={selectedArticle!.id}
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
        <span className={'title'}>{content![0].selectQuestion}</span>
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
