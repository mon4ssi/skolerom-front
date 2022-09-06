import React, { Component, MouseEvent, createRef } from 'react';
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
import { DomainTeachingPath } from './DomainTeachingPath/DomainTeachingpath';
import { LocationState } from 'assignment/view/CurrentAssignmentPage/CurrentAssignmentPage';
import { SubmitTeachingPath } from 'assignment/view/SubmitTeachingPath/SubmitTeachingPath';
import { Article, Assignment } from 'assignment/Assignment';
import { BreadcrumbsTeachingPath } from 'components/common/Breadcrumbs/BreadcrumbsComponent';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import actualArrowLeftRounded from 'assets/images/actual-arrow-left-rounded.svg';
import arrowLeftRounded from 'assets/images/arrow-left-rounded.svg';

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
  public ref = createRef<HTMLDivElement>();
  public async componentDidMount() {
    const { location, questionaryTeachingPathStore, history } = this.props;
    const state = history.location.state;
    const id = Number(location.pathname.split('/', limitSplit)[itemSplit]);
    document.addEventListener('keyup', this.handleKeyboardControl);
    this.ref.current!.focus();

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

  public componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public handleKeyboardControl = async (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const store = this.props.questionaryTeachingPathStore;
      if (store!.teachingPathId) {
        const exitTeachingPath = await Notification.create({
          type: NotificationTypes.CONFIRM,
          title: intl.get('teaching path passing.confirm_exit')
        });
        if (exitTeachingPath) {
          this.props.questionaryTeachingPathStore!.resetAllInfoAboutTeachingPath();
          this.props.history.push('/teaching-paths');
        }
      }
    }
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
      case TeachingPathNodeType.Domain:
        return questionaryTeachingPathStore!.setCurrentDisplayedElement(TeachingPathNodeType.Domain);
      default:
        return questionaryTeachingPathStore!.setCurrentDisplayedElement(SubmitNodeType.Submit);
    }
  }

  public finishReadingDomain = async () => {
    const { questionaryTeachingPathStore } = this.props;
    questionaryTeachingPathStore!.setFetchingDataStatus(true);
    await questionaryTeachingPathStore!.getCurrentNode(
      questionaryTeachingPathStore!.teachingPathId!,
      questionaryTeachingPathStore!.pickedItemDomain!.idNode
    );
    const type = questionaryTeachingPathStore!.childrenType;
    questionaryTeachingPathStore!.setFetchingDataStatus(false);
    switch (type) {
      case TeachingPathNodeType.Article:
        return questionaryTeachingPathStore!.setCurrentDisplayedElement(TeachingPathNodeType.Article);
      case TeachingPathNodeType.Assignment:
        return questionaryTeachingPathStore!.setCurrentDisplayedElement(TeachingPathNodeType.Assignment);
      case TeachingPathNodeType.Domain:
        return questionaryTeachingPathStore!.setCurrentDisplayedElement(TeachingPathNodeType.Domain);
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
      case TeachingPathNodeType.Domain:
        return <DomainTeachingPath finishReading={this.finishReadingDomain} />;
      default:
        return <SubmitTeachingPath onSubmit={this.finishTeachingPath} onDelete={this.deleteTeachingPathAnswers} onimage={this.props.questionaryTeachingPathStore!.currentTeachingPath!.featuredImage} />;
    }
  }

  public renderQuestion = (item: Article | Assignment, index: number) => {
    const { questionaryTeachingPathStore } = this.props;
    const selectedItem = questionaryTeachingPathStore!.pickedItemArticle && item.id === questionaryTeachingPathStore!.pickedItemArticle.item.wpId
      ? 'selectedItem'
      : '';
    return (
      <div key={item.id} className={'questionWrapper'}>
        <span className={`questionNumber ${selectedItem}-circle`} />
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

    return (
      <>
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

  public itemsbyBreadcrumbs = () => {
    const { questionaryTeachingPathStore } = this.props;
    const node = questionaryTeachingPathStore!.currentNode;
    if (node && node.breadcrumbs) {
      const lengthShort = node && node.breadcrumbs[0]!.shortest!;
      const shortpad = node.breadcrumbs[0]!.shortpathid;
      const arrayActualyBreadCrumbs : Array<number> = [];
      node.breadcrumbs.forEach((bread) => {
        arrayActualyBreadCrumbs.push(bread.id);
      });
      const lastDrow = (arrayActualyBreadCrumbs[arrayActualyBreadCrumbs.length - 1]);
      const newArrayCore = arrayActualyBreadCrumbs.concat(shortpad!);
      const listcrude = newArrayCore!.map((shortitem) => {
        const usedClass = (arrayActualyBreadCrumbs.includes(shortitem)) ? (shortitem === lastDrow) ? 'used rounded' : 'used' : '';
        return (shortitem !== undefined) ? (<li key={shortitem} className={usedClass}/>) : '';
      });
      if (lengthShort === 1 || lengthShort === 0) {
        return (
          <ul>
            <li className="used rounded" />
            <li />
          </ul>
        );
      }
      return (
        <ul>
          {listcrude}
        </ul>
      );
    }
    return (
      <ul>
        <li className="used " />
      </ul>
    );
  }

  public onClickItem = (idNode: number) => {
    const { questionaryTeachingPathStore } = this.props;
    if (idNode > 0) {
      questionaryTeachingPathStore!.handleIframe(false);
      return questionaryTeachingPathStore!.calculateCurrentNode(questionaryTeachingPathStore!.teachingPathId!, idNode);
    }
  }

  public onClickBackButton = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { questionaryTeachingPathStore } = this.props;
    const check = Number(e.currentTarget.getAttribute('data-check'));
    const id = Number(e.currentTarget.getAttribute('data-id'));
    if (check === 0) {
      const exitTeachingPath = await Notification.create({
        type: NotificationTypes.CONFIRM,
        title: intl.get('teaching path passing.confirm_exit')
      });
      if (exitTeachingPath) {
        this.props.questionaryTeachingPathStore!.resetAllInfoAboutTeachingPath();
        this.props.history.push('/teaching-paths');
      }
    } else {
      this.onClickItem(id);
    }
  }

  public renderLeftButton = () => {
    const { questionaryTeachingPathStore } = this.props;
    const node = questionaryTeachingPathStore!.currentNode;
    if (node && node.breadcrumbs) {
      const idNode = node && node.id;
      const indexCore = node.breadcrumbs.findIndex(element => element!.id === idNode);
      const idSkill = (node.breadcrumbs[Number(indexCore - 1)] === undefined) ? 0 : node.breadcrumbs[Number(indexCore - 1)].id;
      return (
        <button className={'navigationExitButton'} data-check={indexCore} data-id={idSkill} onClick={this.onClickBackButton} title={intl.get('teaching path passing.exit')} >
          <img src={arrowLeftRounded} alt="arrowLeftRounded"/>
        </button>
      );
    }
    return;
  }

  public render() {
    return (
      <div className={'passageTeachingPath'}>
        <AppHeader fromTeachingPathPassing studentFormTeachinPath onLogoClick={this.handleExit}/>
        <div className="passageTeachingPathBreadCrumbs">
          {this.itemsbyBreadcrumbs()}
        </div>
        <div className="teachingPathWrapper">
          <div className="teachingPathNewBreadCrumbs">
            {this.renderLeftButton()}
            <BreadcrumbsTeachingPath onClickStart={this.onClickStartBreadcrumbs}/>
          </div>

          <div className="flexBox dirColumn wrapperTeachingPath">
            <div className="contentTeachingPath" ref={this.ref}>
              {this.renderContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const PassageTeachingPath = withRouter(PassageTeachingPathComponent);
