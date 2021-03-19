import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import isNull from 'lodash/isNull';

import { TeachingPathNodeType } from '../../../teachingPath/TeachingPath';
import { Article, Assignment } from '../../../assignment/Assignment';
import { QuestionaryTeachingPathStore } from '../../../teachingPath/questionaryTeachingPath/questionaryTeachingPathStore';
import { Breadcrumbs } from '../../../teachingPath/teachingPathDraft/TeachingPathDraft';

import './BreadcrumbsComponent.scss';
import { RouteComponentProps, withRouter } from 'react-router-dom';

const allowedAmountCrumbs = 2;

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  getCurrentNodeFromAssignment?(idTeachingPath: number, idNode: number): void;
  onClickStart?(): void;
}

@inject('questionaryTeachingPathStore')
@observer
class BreadcrumbsComponent extends Component<Props & RouteComponentProps> {

  public handleClickArticle = (node: number) => async () => {
    const { questionaryTeachingPathStore, history } = this.props;
    let currentNode = undefined;

    if (questionaryTeachingPathStore!.isOpenedAssignment) {
      currentNode = node;
    }
    await questionaryTeachingPathStore!.onClickArticleOrAssignmentItem(node);

    history.push(`/teaching-path/${questionaryTeachingPathStore!.teachingPathId}`, {
      node: currentNode ? currentNode : questionaryTeachingPathStore!.pickedItemArticle!.idNode,
      withoutRefresh: true
    });
  }

  public handleClickAssignment = (node: number) => async () => {
    const { questionaryTeachingPathStore } = this.props;
    await questionaryTeachingPathStore!.onClickArticleOrAssignmentItem(node);

    this.props.history.push({
      pathname: `/assignment/${questionaryTeachingPathStore!.pickedItemAssignment!.item.id}`,
      state: {
        node: questionaryTeachingPathStore!.pickedItemAssignment!.idNode,
        teachingPath: questionaryTeachingPathStore!.teachingPathId,
        withoutRefresh: true
      }
    });
  }

  public onClickItem = (idNode: number) => () => {
    const { questionaryTeachingPathStore, getCurrentNodeFromAssignment } = this.props;

    if (idNode > 0) {
      questionaryTeachingPathStore!.handleIframe(false);
      questionaryTeachingPathStore!.handleAssignment(false);

      if (getCurrentNodeFromAssignment) {
        return getCurrentNodeFromAssignment(questionaryTeachingPathStore!.teachingPathId!, idNode);
      }
      return questionaryTeachingPathStore!.calculateCurrentNode(questionaryTeachingPathStore!.teachingPathId!, idNode);
    }
  }

  public calcLastCrumb = (shortBreadcrumbs: Array<Breadcrumbs>, crumb: Breadcrumbs, index: number) => {
    const { questionaryTeachingPathStore } = this.props;
    const node = questionaryTeachingPathStore!.currentNode;
    const activeStyle = shortBreadcrumbs && (index === shortBreadcrumbs.length - 1) ? 'activeStyle' : '';

    // Show breadcrumbs under article (iframe)
    if (questionaryTeachingPathStore!.isOpenedIframe && (index + 1) === shortBreadcrumbs.length
      && questionaryTeachingPathStore!.pickedItemArticle) {
      return (
        <>
          <li onClick={this.onClickItem(crumb.id!)}>{crumb.selectQuestion}</li>
          <li className={activeStyle} >{questionaryTeachingPathStore!.pickedItemArticle.item.title}</li>
        </>
      );
    }

    // Show breadcrumbs under assignment
    if (questionaryTeachingPathStore!.isOpenedAssignment && (index + 1) === shortBreadcrumbs.length) {
      return (
        <>
          <li onClick={this.onClickItem(crumb.id)}>{crumb.selectQuestion}</li>
          <li className={activeStyle}>{questionaryTeachingPathStore!.pickedItemAssignment!.item.title}</li>
        </>
      );
    }

    // Show last specific crumb
    if (node && node.children.length === 0) {
      if (index === shortBreadcrumbs.length - 1) {
        return <li className={activeStyle}>{intl.get('teaching path passing.breadcrumbs.finish')}</li>;
      }
    }

    // Show node's title
    return <li onClick={this.onClickItem(crumb.id)} className={activeStyle}>{crumb.selectQuestion}</li>;
  }

  public renderBreadcrumbs = () => {
    const { questionaryTeachingPathStore } = this.props;
    const node = questionaryTeachingPathStore!.currentNode;

    if (node && node.breadcrumbs) {
      const shortBreadcrumbs: Array<Breadcrumbs> = [];
      shortBreadcrumbs.push(node.breadcrumbs[0]);

      if ((node.breadcrumbs.length === allowedAmountCrumbs) && node.breadcrumbs[1] && node.breadcrumbs[1].items) {
        shortBreadcrumbs.push(node.breadcrumbs[node.breadcrumbs.length - 1]);
      } else if (node.breadcrumbs.length > 1) {
        shortBreadcrumbs.push(new Breadcrumbs({ id: -1, selectQuestion: '...', items: undefined, parentNodeId: null }));
        shortBreadcrumbs.push(node.breadcrumbs[node.breadcrumbs.length - 1]);
      }

      return shortBreadcrumbs.map((crumb, index) => {
        let titleBreadcrumb;

        // Show current node's crumb
        if (crumb.items && crumb.items.length > 0) {
          crumb.items.forEach((item) => {
            if (item.type === TeachingPathNodeType.Article) {
              const article = item.value as Article;
              if (article.isSelected && !isNull(crumb.parentNodeId)) {
                return titleBreadcrumb = <li onClick={this.handleClickArticle(crumb.parentNodeId)} key={article.wpId}>{article.title}</li>;
              }
            }
            if (item.type === TeachingPathNodeType.Assignment) {
              const assignment = item.value as Assignment;
              if (assignment.isSelected && !isNull(crumb.parentNodeId)) {
                return titleBreadcrumb = <li onClick={this.handleClickAssignment(crumb.parentNodeId)} key={assignment.id}>{assignment.title}</li>;
              }
            }
          });
        }
        return (
          <Fragment key={crumb.id}>
            {titleBreadcrumb}
            {this.calcLastCrumb(shortBreadcrumbs, crumb, index)}
          </Fragment>
        );
      });
    }
  }

  public redirectToStart = () => {
    const { questionaryTeachingPathStore, onClickStart, history } = this.props;

    questionaryTeachingPathStore!.handleIframe(false);

    if (questionaryTeachingPathStore!.isOpenedAssignment) {
      questionaryTeachingPathStore!.handleAssignment(false);
      const id = questionaryTeachingPathStore!.currentTeachingPath!.id;
      history.push(`/teaching-path/${id}`);
    }

    if (onClickStart) {
      onClickStart();
    }
  }

  public render() {
    return (
      <div className="breadcrumb">
        <ul className="breadcrumbs">
          <li onClick={this.redirectToStart}>{intl.get('teaching path passing.breadcrumbs.start')}</li>
          {this.renderBreadcrumbs()}
        </ul>
      </div>
    );
  }
}

export const BreadcrumbsTeachingPath = withRouter(BreadcrumbsComponent);
