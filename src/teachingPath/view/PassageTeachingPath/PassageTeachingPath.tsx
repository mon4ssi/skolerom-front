import React, { Component, MouseEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import isNull from 'lodash/isNull';
import isNil from 'lodash/isNil';

import { AppHeader } from 'components/layout/AppHeader/AppHeader';
import { TeachingPathAnswerCover } from './CoverTechingPath/TeachingPathAnswerCover';
import { TeachingPathNodeType } from '../../TeachingPath';
import { ArticleTeachingPath } from './ArticleTheachingPath/ArticleTeachingPath';
import { QuestionaryTeachingPathStore, SubmitNodeType } from '../../questionaryTeachingPath/questionaryTeachingPathStore';
import { AssignmentTeachingPath } from './AssignmentTeachingPath/AssignmentTeachingPath';
import { LocationState } from 'assignment/view/CurrentAssignmentPage/CurrentAssignmentPage';
import { SubmitTeachingPath } from 'assignment/view/SubmitTeachingPath/SubmitTeachingPath';
import { Article, Assignment } from 'assignment/Assignment';
import { BreadcrumbsTeachingPath } from 'components/common/Breadcrumbs/BreadcrumbsComponent';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import actualArrowLeftRounded from 'assets/images/actual-arrow-left-rounded.svg';

import './PassageTeachingPath.scss';
import { Loader } from '../../../components/common/Loader/Loader';

const limitSplit = 4;
const itemSplit = 2;

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
}

type PropsComponent = Props & RouteComponentProps<{}, {}, LocationState>;

@inject('questionaryTeachingPathStore')
@observer
class PassageTeachingPathComponent extends Component<PropsComponent> {

  public async componentDidMount() {
    const { location, questionaryTeachingPathStore, history } = this.props;
    const state = history.location.state;
    const id = Number(location.pathname.split('/', limitSplit)[itemSplit]);
    questionaryTeachingPathStore!.setFetchingDataStatus(true);

    questionaryTeachingPathStore!.setCurrentDisplayedElement(TeachingPathNodeType.Root);

    if (isNil(state) || isNil(state.withoutRefresh) || (state && !state.withoutRefresh)) {
      questionaryTeachingPathStore!.resetCurrentTeachingPath();
      questionaryTeachingPathStore!.resetCurrentNode();
      try {
        await questionaryTeachingPathStore!.getTeachingPathById(id);
      } catch (e) {
        history.push('/teaching-paths');
      }
    }

    if (state && state.node && questionaryTeachingPathStore!.teachingPathId) {
      await questionaryTeachingPathStore!.calculateCurrentNode(questionaryTeachingPathStore!.teachingPathId, state.node);
    } else if (questionaryTeachingPathStore!.selectedTeachingPath && !questionaryTeachingPathStore!.selectedTeachingPath.isFinished) {
      if (questionaryTeachingPathStore!.selectedTeachingPath && !isNil(questionaryTeachingPathStore!.selectedTeachingPath.lastSelectedNodeId)) {
        await questionaryTeachingPathStore!.calculateCurrentNode(id, questionaryTeachingPathStore!.selectedTeachingPath.lastSelectedNodeId);
      }
    }

    questionaryTeachingPathStore!.setFetchingDataStatus(false);
  }

  public exit = () => {
    this.props.history.goBack();
  }

  public onClickStart = async () => {
    const { questionaryTeachingPathStore } = this.props;

    if (questionaryTeachingPathStore!.teachingPathId) {
      await questionaryTeachingPathStore!.calculateCurrentNode(
        questionaryTeachingPathStore!.teachingPathId,
        questionaryTeachingPathStore!.rootNodeId!
      );
    }
  }

  public finishReading = async (graduation: number) => {
    const { questionaryTeachingPathStore } = this.props;
    questionaryTeachingPathStore!.setFetchingDataStatus(true);
    await questionaryTeachingPathStore!.markAsPickedArticle(graduation);
    await questionaryTeachingPathStore!.getCurrentNode(
      questionaryTeachingPathStore!.teachingPathId!,
      questionaryTeachingPathStore!.pickedItemArticle!.idNode
    );
    const ids = questionaryTeachingPathStore!.idsItemsNode;
    if (ids.length > 0) {
      await questionaryTeachingPathStore!.getCurrentArticlesList(ids);
    }
    const type = questionaryTeachingPathStore!.childrenType;
    questionaryTeachingPathStore!.setFetchingDataStatus(false);
    switch (type) {
      case TeachingPathNodeType.Article:
        return questionaryTeachingPathStore!.setCurrentDisplayedElement(TeachingPathNodeType.Article);
      case TeachingPathNodeType.Assignment:
        return questionaryTeachingPathStore!.setCurrentDisplayedElement(TeachingPathNodeType.Assignment);
      default:
        return questionaryTeachingPathStore!.setCurrentDisplayedElement(SubmitNodeType.Submit);
    }
  }

  public finishTeachingPath = () => {
    this.props.questionaryTeachingPathStore!.finishTeachingPath();
    this.props.history.push('/submitted', {
      originPath: '/teaching-paths',
      title: 'teaching path passing.submitted',
      isTeachingPath: true
    });
  }

  public deleteTeachingPathAnswers = async () => {
    const canDeleteQuestionary = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('notifications.are_you_sure'),
      submitButtonTitle: intl.get('notifications.delete')
    });

    if (canDeleteQuestionary) {
      await this.props.questionaryTeachingPathStore!.deleteTeachingPathAnswers();
      this.props.history.push('/teaching-paths');
    }
  }

  public renderContent = () => {
    if (this.props.questionaryTeachingPathStore!.isFetchingData) {
      return <div className={'loading'}><Loader /></div>;
    }
    switch (this.props.questionaryTeachingPathStore!.displayedElement) {
      case TeachingPathNodeType.Root:
        return <TeachingPathAnswerCover onClickStart={this.onClickStart}/>;
      case TeachingPathNodeType.Article:
        return <ArticleTeachingPath finishReading={this.finishReading} />;
      case TeachingPathNodeType.Assignment:
        return <AssignmentTeachingPath />;
      default:
        return <SubmitTeachingPath onSubmit={this.finishTeachingPath} onDelete={this.deleteTeachingPathAnswers}/>;
    }
  }

  public renderQuestion = (item: Article | Assignment, index: number) => {
    const { questionaryTeachingPathStore } = this.props;
    const selectedItem = questionaryTeachingPathStore!.pickedItemArticle && item.id === questionaryTeachingPathStore!.pickedItemArticle.item.wpId
      ? 'selectedItem'
      : '';

    return (
      <div key={item.id} className={'questionWrapper'}>
        <span className={`questionNumber ${selectedItem}-circle`}>{index + 1}</span>
        <span className={`questionName ${selectedItem}`}>{item.title}</span>
      </div>
    )
      ;
  }

  public renderOverview = () => {
    const { questionaryTeachingPathStore } = this.props;
    const currentTeachingPath = questionaryTeachingPathStore!.currentTeachingPath;
    const currentNode = questionaryTeachingPathStore!.currentNode;

    if (questionaryTeachingPathStore!.isFetchingData) {
      return <span className={'flexBox justifyCenter'}>{intl.get('loading')}</span>;
    }

    let currentList: Array<Article | Assignment> = [];
    if (currentNode && !isNull(currentNode.children) && currentNode.children.length > 0 && !isNil(currentNode.children[0].type)) {
      if (currentNode.children[0].type === TeachingPathNodeType.Article) {
        currentList = questionaryTeachingPathStore!.currentArticlesList;
      }
      if (currentNode.children[0].type === TeachingPathNodeType.Assignment) {
        currentList = questionaryTeachingPathStore!.currentAssignmentList;
      }
    }

    if (questionaryTeachingPathStore!.displayedElement === TeachingPathNodeType.Root) {
      return (
        <>
          <span className={'overview'}>{intl.get('teaching path preview.Start teaching path')}</span>
          <span className={'titleTeachingPath'}>{currentTeachingPath && currentTeachingPath.title}</span>
        </>
      );
    }
    if (currentNode && currentNode.children.length === 0) {
      return (
        <>
          <span className={'overview'}>{intl.get('edit_teaching_path.Submit')}</span>
          <span>{currentNode.selectQuestion}</span>
        </>
      );
    }
    return (
      <>
        <span className={'overview'}>{intl.get('edit_teaching_path.Step overview')}</span>
        <span>{currentNode && currentNode.selectQuestion}</span>
        {currentList.map(this.renderQuestion)}
      </>
    );
  }

  public handleExit = async (event: MouseEvent) => {
    const isExitButton = event.currentTarget.classList.contains('navigationExitButton');

    const exitTeachingPath = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('teaching path passing.confirm_exit')
    });

    if (exitTeachingPath) {
      this.props.questionaryTeachingPathStore!.resetAllInfoAboutTeachingPath();
      this.props.history.push(isExitButton ? '/teaching-paths' : '/activity');
    }
  }

  public onClickStartBreadcrumbs = () => {
    this.props.questionaryTeachingPathStore!.resetCurrentNode();
    this.props.questionaryTeachingPathStore!.setCurrentDisplayedElement(TeachingPathNodeType.Root);
  }

  public render() {
    return (
      <div className={'passageTeachingPath'}>
        <AppHeader fromTeachingPathPassing onLogoClick={this.handleExit}/>

        <div className="teachingPathWrapper">

          <div className="teachingPathNavigate">
            <div className="stepOverview">
              {this.renderOverview()}
            </div>

            <div className="arrowControlsTeachingPath">
              <div className={'navigationExitButton'} onClick={this.handleExit}>
                <img src={actualArrowLeftRounded} alt="actualArrowLeftRounded"/>
                <span>{intl.get('teaching path passing.exit')}</span>
              </div>
            </div>
          </div>

          <div className="flexBox dirColumn wrapperTeachingPath">
            <div className="contentTeachingPath">
              {this.renderContent()}
            </div>

            <BreadcrumbsTeachingPath onClickStart={this.onClickStartBreadcrumbs}/>
          </div>
        </div>
      </div>
    );
  }
}

export const PassageTeachingPath = withRouter(PassageTeachingPathComponent);
