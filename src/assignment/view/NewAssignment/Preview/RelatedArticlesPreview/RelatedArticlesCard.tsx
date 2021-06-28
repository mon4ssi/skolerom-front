import React from 'react';
import intl from 'react-intl-universal';

import { Article } from 'assignment/Assignment';

import { getStudentLevelsRange } from 'utils/studentLevelsRange';
import { ArticleLevels } from 'utils/enums';

import checkRounded from 'assets/images/check-rounded-white-bg.svg';
import checkActive from 'assets/images/check-active.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';
import firstLevelImg from 'assets/images/level-1-blue.svg';
import secondLevelImg from 'assets/images/level-2-blue.svg';
import thirdLevelImg from 'assets/images/level-3-blue.svg';

import './RelatedArticlesPreview.scss';

const twoGrades = 2;
const threeGrades = 3;

interface Props {
  article: Article;
  isCheckedArticle: boolean;

  handleArticle(): void;
}

export const RelatedArticlesCard = (props: Props) => {
  const { article } = props;

  const renderImageArticle = () => {
    if (article.images && article.images.url) {
      return <img src={article.images!.url} alt={article.title} title={article.title} />;
    }
    return <img className="listImage" src={listPlaceholderImg} title={article.title} alt={article.title}/>;
  };

  const renderGrades = () => {
    const amountOfGrades = article.grades ? article.grades.length : 0;
    if (amountOfGrades > 0) {
      const visibleGrades = article.grades!
        .slice(0, amountOfGrades === threeGrades ? threeGrades : twoGrades)
        .map((grade) => {
          const title = grade.title.split('.', 1);
          return <span key={grade.id}>{title}{intl.get('new assignment.grade')}</span>;
        });

      return (
        <div className="grades">
          {visibleGrades}
          {amountOfGrades > twoGrades && amountOfGrades !== threeGrades && <span>{intl.get('assignment list.Others')}</span>}
        </div>
      );
    }
    return (
      <div className="grades" />
    );
  };

  const renderLevels = () => {
    const { levels } = article;

    const childArticles = levels![0] && levels![0].childArticles ? levels![0].childArticles : [];
    const childArticlesLevels = childArticles.map(article => article.levels![0] && article.levels![0].slug);

    const childArticlesLevelImage = childArticlesLevels.includes(ArticleLevels.THIRD_LEVEL) ? thirdLevelImg :
      childArticlesLevels.includes(ArticleLevels.SECOND_LEVEL) ? secondLevelImg :
      childArticlesLevels.includes(ArticleLevels.FIRST_LEVEL) ? firstLevelImg :
      undefined;

    const levelImage = levels![0] && levels![0].slug === ArticleLevels.FIRST_LEVEL ? firstLevelImg :
      levels![0] && levels![0].slug === ArticleLevels.SECOND_LEVEL ? secondLevelImg :
      levels![0] && levels![0].slug === ArticleLevels.THIRD_LEVEL ? thirdLevelImg :
      undefined;

    const studentLevelsRange = getStudentLevelsRange(
      childArticlesLevels!.length ?
        childArticlesLevels.map(slug => Number(slug!.split('-')[1])) :
        [Number(levels![0].slug.split('-')[1])]
    );

    return (
      <div className="levels flexBox alignCenter">
        {levelImage && <img src={childArticlesLevelImage || levelImage} alt="levels" />}
        {studentLevelsRange}
      </div>
    );
  };

  return (
    <div className={'RelatedArticlesCard'} onClick={props.handleArticle}>
      <div className="image">
        {renderImageArticle()}
        <button className="check" title="check">
          <img src={props.isCheckedArticle ? checkActive : checkRounded} alt="Check" title="check" className={'checkImg'}/>
        </button>
      </div>
      <div className="info">
        <div>
          <div className="titleText fw500">
            {article.title}
          </div>
          <div className="cardDescription fw300">
            {article.excerpt}
          </div>
        </div>
      </div>
    </div>
  );
};
