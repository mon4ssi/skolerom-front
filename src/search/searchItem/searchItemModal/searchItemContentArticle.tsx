import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import { Link } from 'react-router-dom';
import { LocationDescriptor } from 'history';
import onClickOutside from 'react-onclickoutside';
import { Search, SimpleNumberData, SimpleStringData, SimpleGoalData, LvlData } from '../../Search';
import closeimg from 'assets/images/close-button.svg';
import langImg from 'assets/images/lang.svg';
import gradeImg from 'assets/images/grade.svg';
import tagsImg from 'assets/images/tags.svg';
import cogsImg from 'assets/images/cogs.svg';
import goalsImg from 'assets/images/goals.svg';

interface Props {
  item: Search;
  onClose: () => void;
}

class ArticleContent extends Component<Props> {
  public handleClickOutside = () => this.props.onClose();
  public close = () => this.props.onClose();
  public lvlArticles = (item: LvlData) => {
    const link = `${process.env.REACT_APP_WP_URL}?p=${item.article_id}`;
    const name = `${intl.get('assignment preview.Level')} ${item.level}`;
    return (
      <li>
        <a className="CreateButton" href={link} target="_blank">
          {name}
        </a>
      </li>
    );
  }
  public relatedArticles = () => {
    const {
        relatedArticles
    } = this.props.item;
    if (relatedArticles && relatedArticles.length > 0) {
      const link = `${process.env.REACT_APP_WP_URL}/undervisning/?fwp_ids=${String(relatedArticles)}`;
      return (
        <li><a href={link} target="_blank">{intl.get('edit_teaching_path.modals.articles')}</a></li>
      );
    }
  }
  public relatedTP = () => {
    const {
        relatedTp
    } = this.props.item;
    if (relatedTp && relatedTp.length > 0) {
      const url: URL = new URL(window.location.origin);
      const link = `${url}teaching-paths/all?articles=${String(relatedTp)}`;
      return (
        <li><a href={link} target="_blank">{intl.get('teaching path')}</a></li>
      );
    }
  }
  public relatedAssignments = () => {
    const {
        relatedAssignment
    } = this.props.item;
    if (relatedAssignment && relatedAssignment.length > 0) {
      const url: URL = new URL(window.location.origin);
      const link = `${url}assignments/all?articles=${String(relatedAssignment)}`;
      return (
        <li><a href={link} target="_blank">{intl.get('assignment')}</a></li>
      );
    }
  }
  public renderListNumberGrade = (item: SimpleNumberData) => {
    const gradetitle: Array<string> = item.name.split('. ');
    let title:string = gradetitle[0];
    if (gradetitle.length > 1) {
      title = gradetitle[0] + intl.get('new assignment.grade');
    }
    return (
      <li>{title}</li>
    );
  }
  public renderListNumber = (item: SimpleNumberData) => (
    <li>{item.name}</li>
  )
  public renderListString = (item: SimpleStringData) => (
    <li>{item.name}</li>
  )
  public renderListGoal = (item: SimpleGoalData) => (
    <li className="goalData">
      <div className="goalData__grade">{item.grade_name}</div>
      <div className="goalData__subject">{item.subject_name}</div>
      <div className="goalData__name">{item.name}</div>
    </li>
  )
  public render() {
    const {
        description,
        grades,
        subjects,
        topics,
        goals,
        lvlArticles
    } = this.props.item;
    return (
      <div className="cardTemplateArticle">
        <div className="cardTemplateArticle__header">
          <div className="cardTemplateArticle__header__top">
            <div className="description">{description}</div>
            <div className="close" onClick={this.close}>
              <img src={closeimg} />
            </div>
          </div>
          <div className="cardTemplateArticle__header__bottom">
            <div className="links">
              <ul>{lvlArticles.map(this.lvlArticles)}</ul>
            </div>
            <div className="relateds">
                <h3>{intl.get('assignment preview.Related')}</h3>
                <ul>
                  {this.relatedArticles()}
                  {this.relatedTP()}
                  {this.relatedAssignments()}
                </ul>
            </div>
          </div>
        </div>
        <div className="cardTemplateArticle__body">
          <div className="cardTemplateArticle__body__top">
            <div className="cardTemplateArticle__body__item">
              <h2>
                <img src={gradeImg} />
                {intl.get('generals.grade')}
              </h2>
              <div className="list">
                <ul>
                    {grades.map(this.renderListNumberGrade)}
                </ul>
              </div>
            </div>
            <div className="cardTemplateArticle__body__item">
              <h2>
                <img src={tagsImg} />
                {intl.get('new assignment.Subject')}
              </h2>
              <div className="list">
                <ul>
                  {subjects.map(this.renderListNumber)}
                </ul>
              </div>
            </div>
            <div className="cardTemplateArticle__body__item">
                <h2>
                    <img src={cogsImg} />
                    {intl.get('new assignment.greep.subjects')}
                </h2>
                <div className="list">
                    <ul>
                        {topics.map(this.renderListString)}
                    </ul>
                </div>
            </div>
          </div>
          <div className="cardTemplateArticle__body__bottom">
            <div className="cardTemplateArticle__body__item">
              <h2>
                <img src={goalsImg} />
                {intl.get('new assignment.greep.goals')}
              </h2>
              <div className="cardTemplateArticle__body__goals">
                <ul>
                  {goals.map(this.renderListGoal)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const ArticleContentComponent = onClickOutside(ArticleContent);
export { ArticleContentComponent as ArticleContent };
