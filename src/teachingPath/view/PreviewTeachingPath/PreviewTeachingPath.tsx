import React, { Component, MouseEvent, createRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import isNull from 'lodash/isNull';
import isNil from 'lodash/isNil';

import { AppHeader } from 'components/layout/AppHeader/AppHeader';
import { TeachingPathAnswerCover } from './CoverTechingPath/TeachingPathAnswerCover';
import { TeachingPathNodeType } from '../../TeachingPath';
import { ArticleTeachingPath } from './ArticleTheacingPath/ArticleTeachingPath';
import { QuestionaryTeachingPathStore, SubmitNodeType } from '../../questionaryTeachingPath/questionaryTeachingPathStore';
import { EditTeachingPathStore } from '../EditTeachingPath/EditTeachingPathStore';
import { AssignmentTeachingPath } from './AssignmentTeachingPath/AssignmentTeachingPath';
import { DomainTeachingPath } from './DomainTeachingPath/DomainTeachingpath';
import { LocationState } from 'assignment/view/CurrentAssignmentPage/CurrentAssignmentPage';
import { SubmitTeachingPath } from 'assignment/view/SubmitTeachingPath/SubmitTeachingPath';
import { Article, Assignment } from 'assignment/Assignment';
import { BreadcrumbsTeachingPath } from 'components/common/Breadcrumbs/BreadcrumbsComponent';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';

import { CustomTeachingPath } from './CustomTeachingPath/CustomTeachingPath';
import actualArrowLeftRounded from 'assets/images/actual-arrow-left-rounded.svg';
import arrowLeftRounded from 'assets/images/arrow-left-rounded.svg';

import './PreviewTeachingPath.scss';
import { Loader } from '../../../components/common/Loader/Loader';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { forEach } from 'lodash';

const limitSplit = 4;
const itemSplit = 3;

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  editTeachingPathStore? : EditTeachingPathStore;
  teachingPathsListStore?: TeachingPathsListStore;
}

interface State {
  contenTeaching: DraftTeachingPath | undefined;
  selectedNode: Array<EditableTeachingPathNode>;
}

type PropsComponent = Props & RouteComponentProps<{}, {}, LocationState>;

@inject('questionaryTeachingPathStore')
@inject('editTeachingPathStore', 'teachingPathsListStore')
@observer
class PreviewTeachingPathComponent extends Component<PropsComponent, State> {
  public ref = createRef<HTMLDivElement>();
  constructor(props: PropsComponent) {
    super(props);
    this.state = {
      contenTeaching : undefined,
      selectedNode : [],
    };
  }
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
        await questionaryTeachingPathStore!.getTeachingPathByIdTeacher(id);
      } catch (e) {
        history.push('/teaching-paths');
      }
    }

    if (state && state.node && questionaryTeachingPathStore!.teachingPathId) {
      await questionaryTeachingPathStore!.calculateCurrentNodePreviewInside(questionaryTeachingPathStore!.teachingPathId, state.node);
    } else if (questionaryTeachingPathStore!.selectedTeachingPath && !questionaryTeachingPathStore!.selectedTeachingPath.isFinished) {
      if (questionaryTeachingPathStore!.selectedTeachingPath && !isNil(questionaryTeachingPathStore!.selectedTeachingPath.lastSelectedNodeId)) {
        await questionaryTeachingPathStore!.calculateCurrentNodePreviewInside(id, questionaryTeachingPathStore!.selectedTeachingPath.lastSelectedNodeId);
      }
    }

    questionaryTeachingPathStore!.setFetchingDataStatus(false);
  }

  public getDatateachingpath = async (id: number) => {
    const { location, questionaryTeachingPathStore, editTeachingPathStore, history } = this.props;
    try {
      return await editTeachingPathStore!.getDraftForeignTeachingPath(id, true);
    } catch (e) {
      history.push('/teaching-paths');
    }
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
      await questionaryTeachingPathStore!.calculateCurrentNodePreviewInside(
        questionaryTeachingPathStore!.teachingPathId,
        questionaryTeachingPathStore!.rootNodeId!
      );
    }
  }

  public finishReading = async (graduation: number) => {
    const { questionaryTeachingPathStore } = this.props;
    questionaryTeachingPathStore!.setFetchingDataStatus(true);
    await questionaryTeachingPathStore!.calculateCurrentNodePreviewInside(
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
    await questionaryTeachingPathStore!.calculateCurrentNodePreviewInside(
      questionaryTeachingPathStore!.teachingPathId!,
      questionaryTeachingPathStore!.pickedItemDomain!.idNode
    );
    questionaryTeachingPathStore!.resetCurrentDomainList();
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
    this.props.history.push('/teaching-paths');
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

  public searchId(id: number, node:  Array<EditableTeachingPathNode>) {
    let returnNode : Array<EditableTeachingPathNode> = [];
    node!.forEach((e) => {
      if (e!.id === id) {
        returnNode = node;
      } else {
        if (e!.children!.length > 0) {
          returnNode = this.searchId(id, e!.children);
        }
      }
    });
    return returnNode;
  }

  public renderContent = () => {
    if (this.props.questionaryTeachingPathStore!.isFetchingData) {
      return <div className={'loading'}><Loader /></div>;
    }
    switch (this.props.questionaryTeachingPathStore!.displayedElement) {
      case TeachingPathNodeType.Root:
        return <TeachingPathAnswerCover onClickStart={this.onClickStart}/>;
      case TeachingPathNodeType.Article:
        return <CustomTeachingPath finishReading={this.finishReading} finishReadingDomain={this.finishReadingDomain} />;
      case TeachingPathNodeType.Assignment:
        return <CustomTeachingPath finishReading={this.finishReading} finishReadingDomain={this.finishReadingDomain} />;
      case TeachingPathNodeType.Domain:
        return <CustomTeachingPath finishReading={this.finishReading} finishReadingDomain={this.finishReadingDomain} />;
      default:
        return <SubmitTeachingPath onSubmit={this.finishTeachingPath} onDelete={this.deleteTeachingPathAnswers} onimage={this.props.questionaryTeachingPathStore!.currentTeachingPath!.backgroundImage} />;
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

  public anyList(butList: Array<Article | Assignment>, node: EditableTeachingPathNode) {
    let returnArray : Array<Article | Assignment> = butList;
    node!.items!.forEach((e) => {
      if (typeof(e.value) !== 'undefined') {
        returnArray = returnArray!.concat(e.value);
      }
    });
    if (node!.children!.length > 0) {
      node!.children!.forEach((element) => {
        returnArray = this.anyList(returnArray, element);
      });
    }
    returnArray = returnArray!.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    return returnArray;
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
      title: intl.get('teaching path passing.confirm_exit_preview')
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

  public NextButtonRight = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { questionaryTeachingPathStore } = this.props;
    const id = Number(e.currentTarget.getAttribute('data-id'));
    this.onClickItem(id);
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

  public renderRightButton = () => {
    const { questionaryTeachingPathStore } = this.props;
    const node = questionaryTeachingPathStore!.currentNode;
    if (node && node.breadcrumbs) {
      const onlyOnePath = (node.children.length === 1) ? true : false;
      const checkThisType = (node.children) ? (node.children[0]) ? node.children[0].items![0].type : '' : '';
      const idSkill = (node.children[0]) ? node.children[0].id : 0;
      let isDisabled = true;
      if (onlyOnePath) {
        switch (checkThisType) {
          case TeachingPathNodeType.Article:
            if (questionaryTeachingPathStore!.currentArticlesList[0] && questionaryTeachingPathStore!.currentArticlesList[0].isSelected) {
              isDisabled = false;
            }
            break;
          case TeachingPathNodeType.Assignment:
            if (questionaryTeachingPathStore!.currentAssignmentList[0] && questionaryTeachingPathStore!.currentAssignmentList[0].isSelected) {
              isDisabled = false;
            }
            break;
          case TeachingPathNodeType.Domain:
            if (questionaryTeachingPathStore!.currentDomainList[0] && questionaryTeachingPathStore!.currentDomainList[0].isRead) {
              isDisabled = false;
            }
            break;
          default:
            isDisabled = true;
            break;
        }
      }
      return (
        <button className={'navigationNextButton '} data-id={idSkill} onClick={this.NextButtonRight} title={intl.get('teaching path passing.exit')} disabled={isDisabled}>
          <img src={arrowLeftRounded} alt="arrowLeftRounded"/>
        </button>
      );
    }
    return;
  }

  public render() {
    const { location, history } = this.props;
    const id = Number(location.pathname.split('/', limitSplit)[itemSplit]);
    return (
      <div className={'passageTeachingPath'}>
        <AppHeader entityStore={this.props.teachingPathsListStore!} currentEntityId={id} fromTeachingPathPassing studentFormTeachinPath isPreviewTP onLogoClick={this.handleExit}/>
        <div className="passageTeachingPathBreadCrumbs">
          {this.itemsbyBreadcrumbs()}
        </div>
        <div className="teachingPathWrapper">
          <div className="teachingPathNewBreadCrumbs">
            {this.renderLeftButton()}
            <BreadcrumbsTeachingPath onClickStart={this.onClickStartBreadcrumbs}/>
            {this.renderRightButton()}
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

export const PreviewTeachingPath = withRouter(PreviewTeachingPathComponent);
