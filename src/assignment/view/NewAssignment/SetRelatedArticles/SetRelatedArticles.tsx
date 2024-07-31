import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { TagInputComponent, TagProp } from 'components/common/TagInput/TagInput';
import { CreationElements, NewAssignmentStore } from '../NewAssignmentStore';
import { Article } from '../../../Assignment';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';
import checkInactive from 'assets/images/ckeck-inactive.svg';
import checkActive from 'assets/images/check-active.svg';

import './SetRelatedArticles.scss';

import icon from 'assets/images/reading-icon.svg';
import { toJS } from 'mobx';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
}
interface State {
  hiddenArticles: boolean;
}

@inject('newAssignmentStore')
@observer
export class SetRelatedArticles extends Component<Props, State> {
  public static contextType = AttachmentContentTypeContext;
  public state = {
    hiddenArticles: false
  };
  public refButton = createRef<HTMLButtonElement>();

  private renderButtonTitle() {
    const { newAssignmentStore } = this.props;
    const articles = newAssignmentStore!.currentEntity!.relatedArticles;
    if (articles.length === 0) {
      return intl.get('new assignment.Set related article(s)');
    }
    if (articles.length === 1) {
      return intl.get('new assignment.Change related article.single');
    }
    return intl.get('new assignment.Change related article.plural');
  }

  private articleToTagProp = (article: Article): TagProp => ({
    id: article.id,
    title: article.title,
  })

  private removeArticle = (id: number) => {
    const { newAssignmentStore } = this.props;
    const article = newAssignmentStore!.currentEntity!.relatedArticles.find(article => article.id === id);
    if (article) {
      newAssignmentStore!.currentEntity!.removeArticle(article);
      // newAssignmentStore!.currentEntity!.setFeaturedImage();
    }
  }

  private renderArticleInput(selectedArticles: Array<Article>) {
    const { newAssignmentStore } = this.props;
    const articles = newAssignmentStore!.getAllArticles().map(this.articleToTagProp);
    const myArticles = newAssignmentStore!.currentEntity!.relatedArticles;

    if (myArticles.length > 0) {
      return (
        <div className="relatedArticleContent">
          <TagInputComponent
            className="filterBy articlesList hideInput"
            tags={articles}
            currentTags={selectedArticles}
            orderbyid={false}
            removeTag={this.removeArticle}
            listView
            noOpenOnFocus
            temporaryTagsArray
          />
        </div>
      );
    }
  }

  public async componentDidMount() {
    let valueHidden = false;
    const selectedArticles = this.props.newAssignmentStore!.currentEntity!.getListOfArticles();
    selectedArticles.forEach((article) => {
      valueHidden = (article.isHidden) ? true : false;
    });
    if (!valueHidden) {
      this.setState({
        hiddenArticles: false
      });
      this.props.newAssignmentStore!.hiddenArticles = false;
    } else {
      this.setState({
        hiddenArticles: true
      });
      this.props.newAssignmentStore!.hiddenArticles = true;
    }
    this.props.newAssignmentStore!.relatedArticlesIsHidden();
  }

  public componentWillUnmount(): void {
    this.props.newAssignmentStore!.resetCurrentArticlesPage();
  }

  public handleRelatedArticles = () => {
    this.context.changeContentType(AttachmentContentType.articles);
  }

  public setHighlightedItem = () => {
    this.props.newAssignmentStore!.setPreviewQuestionByIndex(0);
    this.props.newAssignmentStore!.setHighlightingItem(CreationElements.Articles);
  }

  public toggleHiddenArticles = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (this.state.hiddenArticles) {
      this.setState({
        hiddenArticles: false
      });
      this.props.newAssignmentStore!.hiddenArticles = false;
    } else {
      this.setState({
        hiddenArticles: true
      });
      this.props.newAssignmentStore!.hiddenArticles = true;
    }
    this.props.newAssignmentStore!.relatedArticlesIsHidden();
  }

  public render() {
    const { newAssignmentStore } = this.props;
    const selectedArticles = newAssignmentStore!.currentEntity!.getListOfArticles().map(this.articleToTagProp);
    const lightItem = newAssignmentStore!.isHighlightedItem(CreationElements.Articles) ? 'lightItem' : '';

    return (
      <div className={`content ${lightItem}`} onClick={this.setHighlightedItem}>
        <div className="settingsWrapper">
          <div className={'settingsImage'}>
            <img src={icon} alt="articles"/>
            <span>{intl.get('new assignment.Related article')}</span>
          </div>
          <span className={'specify'}>{intl.get('new assignment.specify')}</span>
        </div>

        <div className="articlesWrapper">
          <div className="checkRelated">
            <button className="CreateButton newAnswerButton" id="newAnswerRelatedButton" title={this.renderButtonTitle()} onClick={this.handleRelatedArticles}>
              {this.renderButtonTitle()}
            </button>
            <a href="#" className="hiddenRelatedCheck" onClick={this.toggleHiddenArticles}>
              <img src={this.state.hiddenArticles ? checkActive : checkInactive} alt="checkbox" className="AssignmentArticlesToReading__checkbox"/>
              <div>
                {intl.get('assignments search.hidden_related')}
              </div>
            </a>
          </div>
          {this.renderArticleInput(selectedArticles)}
        </div>
      </div>
    );
  }
}
