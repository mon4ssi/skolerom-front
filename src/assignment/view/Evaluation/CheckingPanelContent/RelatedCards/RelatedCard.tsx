import React, { Component, MouseEvent } from 'react';
import intl from 'react-intl-universal';

import { firstLevel, secondLevel } from 'utils/constants';

import placeholderArticle from 'assets/images/placeholder.svg';
import placeholderAssignment from 'assets/images/list-placeholder.svg';
import firstLevelImg from 'assets/images/level-1-blue.svg';
import secondLevelImg from 'assets/images/level-2-blue.svg';

import thirdLevelImg from 'assets/images/level-3-blue.svg';
import './RelatedCard.scss';

interface Props {
  id: number;
  type: string;
  image?: string;
  level?: number;
  title: string;
  questionCounter?: number;
  isChosen?: boolean;
  url?: string;
  handleClick?(e: MouseEvent<HTMLDivElement>): void;
}

export class RelatedCard extends Component<Props> {

  public renderQuestionCounter = () => {
    const { questionCounter } = this.props;

    return (
      <div className={'relatedCard_questionCounter'}>
        <span>{questionCounter} {questionCounter! > 1 ? intl.get('answers.questions') : intl.get('answers.question')}</span>
      </div>
    );
  }

  public renderLevel = (level?: number) => {
    const readLevelImg = level === firstLevel ? firstLevelImg : level === secondLevel ? secondLevelImg : thirdLevelImg;

    return level ? (
      <div className="relatedCard__level">
        <img src={readLevelImg} alt="read-level" />
        {level}
      </div>
    ) : null;
  }

  public render() {
    const { image, id, url, level, title, type, handleClick, questionCounter, isChosen } = this.props;
    let featuredImage;
    if (image) {
      featuredImage = image;
    } else {
      if (type === 'ASSIGNMENT') {
        featuredImage = placeholderAssignment;
      }
      if (type === 'ARTICLE') {
        featuredImage = placeholderArticle;
      }
      if (type === 'DOMAIN') {
        featuredImage = placeholderArticle;
      }
    }

    return (
      <div
        key={id}
        id={`${id}`}
        data-url={url}
        onClick={handleClick}
        className={`relatedCard ${isChosen && 'isChosen'} ${!handleClick && 'withoutCursor'}`}
      >
        <a href="javascript:void(0)">
          <div className="relatedCard__blockMain">
            <img
              src={featuredImage}
              alt="article-img"
              className="relatedCard__featuredImage"
            />
            <p className={`relatedCard__title ${isChosen && 'isChosenTitle'}`}>
              {title}
            </p>
          </div>

          <div className="relatedCard__blockSecondary">
            {type === 'ASSIGNMENT' && questionCounter && this.renderQuestionCounter()}
            {this.renderLevel(level)}
          </div>
        </a>
      </div>
    );
  }
}
