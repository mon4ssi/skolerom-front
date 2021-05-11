import React, { Component, MouseEvent } from 'react';
import back from 'assets/images/back-arrow-dark.svg';
import intl from 'react-intl-universal';
import classnames from 'classnames';
import isNull from 'lodash/isNull';

import { Article } from 'assignment/Assignment';

import { CreateButton } from 'components/common/CreateButton/CreateButton';

import './ReadingArticle.scss';
const PATHLENGTH = 4;
interface Props {
  titleCurrentArticle: string;
  currentArticleChildren?: Array<Article>;
  shownArticleId?: number | null;
  closeArticle(): void;
  finishReading(graduation: number): void;
  handleChangeLevel?(levelId: number): void;
}

interface State {
  newArticleId: number | null;
  graduation: number | null;
}

export class ReadingArticle extends Component<Props, State> {

  public state = {
    newArticleId: null,
    graduation: null,
  };

  private handleLevelClick = (graduation: number) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { currentArticleChildren, handleChangeLevel } = this.props;
    const value = Number(e.currentTarget.value);
    const currentLevelId = currentArticleChildren!.find(
      article => article.id === value
    )!.levels![0].wpId;

    this.setState({
      graduation,
      newArticleId: value,
    });
    handleChangeLevel!(currentLevelId);
  }

  private renderLevel = (article: Article, index: number) => {
    const title = article.levels![0].slug.split('-')[1];

    const classes = classnames('ReadingArticle__level', {
      ReadingArticle__level_active: this.state.newArticleId === article.id,
    });

    return (
      <button
        key={`key-${article.id}`}
        value={article.id}
        onClick={this.handleLevelClick(Number(title))}
        className={classes}
        title={title}
      >
        {title}
      </button>
    );
  }

  private renderLevels = () => {
    const { currentArticleChildren } = this.props;

    return currentArticleChildren && currentArticleChildren.length > 1 ? (
      <div className="ReadingArticle__levels">
        {currentArticleChildren.map(this.renderLevel)}
      </div>
    ) : null;
  }

  public finishReading = () => {
    this.props.finishReading(this.state.graduation!);
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const path = event.composedPath().length;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText) {
      if (event.shiftKey && event.key === 'F' || event.shiftKey && event.key === 'f') {
        this.props.finishReading(this.state.graduation!);
      }
    }
  }

  public componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboardControl);
    if (this.props.currentArticleChildren) {
      const currentArticle = this.props.currentArticleChildren.find(
        article => article.id === this.props.shownArticleId || article.wpId === this.props.shownArticleId
      )!;

      if (currentArticle && currentArticle.levels && currentArticle.levels[0]) {
        const graduation = currentArticle.levels[0].slug.split('-')[1];

        this.setState({
          newArticleId: this.props.shownArticleId || null,
          graduation: Number(graduation)
        });

        return;
      }
    }

    // FIXME bad solution, better to use grade or level from Student
    this.setState({
      newArticleId: this.props.shownArticleId || null,
      graduation: 2
    });
  }

  public render() {
    const { closeArticle, titleCurrentArticle, shownArticleId } = this.props;
    const { newArticleId } = this.state;
    const articleId = isNull(newArticleId) ? shownArticleId : newArticleId;

    return (
      <div className="ReadingArticle">
        <div className="ReadingArticle__headerWrapper">
          <div className="ReadingArticle__header">
            <button className="ReadingArticle__backButton" onClick={closeArticle} title="back">
              <img src={back} alt="back" title="back" />
              <span className="ReadingArticle__backButtonText">
                {intl.get('header.Article')}: {titleCurrentArticle}
              </span>
            </button>

            {this.renderLevels()}

            <div className="ReadingArticle__finishButton">
              <CreateButton
                children={intl.get('assignment preview.Finish reading article')}
                onClick={this.finishReading}
                title={intl.get('assignment preview.Finish reading article')}
              />
            </div>
          </div>
        </div>

        <div className="ReadingArticle__content">
          <iframe
            width="100%"
            height="100%"
            src={`${process.env.REACT_APP_WP_URL}/article-iframe/?id=${articleId}`}
            title={titleCurrentArticle}
          />
        </div>

      </div>
    );
  }
}
