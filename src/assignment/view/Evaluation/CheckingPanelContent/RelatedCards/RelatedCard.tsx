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
  level: number;
  title: string;
  questionCounter?: number;
  isChosen?: boolean;
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
    const { image, id, level, title, type, handleClick, questionCounter, isChosen } = this.props;
    const featuredImage = image ? image : type === 'ASSIGNMENT' ? placeholderAssignment : placeholderArticle ;

    return (
      <div
        key={id}
        id={`${id}`}
        onClick={handleClick}
        className={`relatedCard ${isChosen && 'isChosen'} ${!handleClick && 'withoutCursor'}`}
      >
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
      </div>
    );
  }
}
