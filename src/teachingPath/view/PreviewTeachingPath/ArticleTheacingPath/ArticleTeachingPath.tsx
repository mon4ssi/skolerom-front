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
import { Loader } from '../../../../components/common/Loader/Loader';

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  content?: Array<EditableTeachingPathNode>;
  finishReading?(node: EditableTeachingPathNode | undefined): void;
}

interface State {
  shownArticleLevelId: number;
  attachedArticleId: number;
  nodeSelected: number;
  selectedArticle: Article | undefined;
  showMyarticles: boolean;
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
      selectedArticle: undefined,
      showMyarticles: false
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
      e.items!.forEach((item) => {
        if (item.type === TeachingPathNodeType.Article) {
          if (item.value as Article) {
            MyArticlesList.push(item.value as Article);
          }
        }
      });
    });
    MyArticlesList.forEach((e) => {
      MyArticlesListIds.push(e.wpId!);
    });
    await questionaryTeachingPathStore!.getCurrentArticlesList(MyArticlesListIds);
    this.setState({ showMyarticles: true });
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

    return questionaryTeachingPathStore!.currentArticlesList.map((item, index) => {
      const passedStyle = item.isSelected ? '' : '';
      return (
        <div className={passedStyle} key={item.id} role="region" aria-live="polite" aria-atomic="true" ref={this.ref}>
          <InfoCard
            icon={reading}
            title={item.title}
            grades={item.grades}
            description={item.excerpt}
            img={(item.images && item.images.url) ? item.images.url : listPlaceholderImg}
            onClick={this.chooseCard(item, index)}
            isReadArticle={item.isSelected}
            hiddeIcons
          />
        </div>
      );
    }
    );
  }

  public finishReading = async (graduation: number) => {
    const { content } = this.props;
    const MyArticlesList : Array<Article> = [];
    const MyArticlesListIds : Array<number> = [];
    const number = this.state.nodeSelected;
    content!.forEach((e) => {
      e.items!.forEach((item) => {
        if (item.type === TeachingPathNodeType.Article) {
          if (item.value as Article) {
            const articleWpId = (item.value as Article).wpId;
            if (articleWpId === this.state.attachedArticleId) {
              this.closeArticleReading();
              this.props.finishReading!(e);
            }
          }
        }
      });
    });
  }

  public handleChangeLevel = (levelId: number) => {
    this.setState({ shownArticleLevelId: levelId });
  }

  public chooseTitle = () => {
    const { questionaryTeachingPathStore } = this.props;
    const length = questionaryTeachingPathStore!.currentArticlesList.length;
    if (length > 1) {
      return (
        <span className={'chooseOne fs15'}>{intl.get('teaching path passing.choose one')}</span>
      );
    }
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
        {this.chooseTitle()}
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
