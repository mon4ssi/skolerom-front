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

import actualArrowLeftRounded from 'assets/images/actual-arrow-left-rounded.svg';

import './PreviewTeachingPath.scss';
import { Loader } from '../../../components/common/Loader/Loader';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';

const limitSplit = 4;
const itemSplit = 3;

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  editTeachingPathStore? : EditTeachingPathStore;
}

interface State {
  contenTeaching: DraftTeachingPath | undefined;
  selectedNode: Array<EditableTeachingPathNode>;
}

type PropsComponent = Props & RouteComponentProps<{}, {}, LocationState>;

@inject('questionaryTeachingPathStore')
@inject('editTeachingPathStore')
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
    const { location, questionaryTeachingPathStore, editTeachingPathStore, history } = this.props;
    const state = history.location.state;
    const id = Number(location.pathname.split('/', limitSplit)[itemSplit]);
    document.addEventListener('keyup', this.handleKeyboardControl);
    this.ref.current!.focus();
    questionaryTeachingPathStore!.setFetchingDataStatus(true);
    const dataTeachingpath = await this.getDatateachingpath(id);
    this.setState(
      {
        contenTeaching : dataTeachingpath
      }
    );
    questionaryTeachingPathStore!.setCurrentDisplayedElement(TeachingPathNodeType.Root);
    /*questionaryTeachingPathStore!.setFetchingDataStatus(true);

    questionaryTeachingPathStore!.setCurrentDisplayedElement(TeachingPathNodeType.Root);*/

    /*if (isNil(state) || isNil(state.withoutRefresh) || (state && !state.withoutRefresh)) {
      /*questionaryTeachingPathStore!.resetCurrentTeachingPath();
      questionaryTeachingPathStore!.resetCurrentNode();
      try {
        dataTeachingpath = await editTeachingPathStore!.getTeachingPathForEditing(id);
      } catch (e) {
        history.push('/teaching-paths');
      }
    }*/

    /*if (state && state.node && questionaryTeachingPathStore!.teachingPathId) {
      await questionaryTeachingPathStore!.calculateCurrentNode(questionaryTeachingPathStore!.teachingPathId, state.node);
    } else if (questionaryTeachingPathStore!.selectedTeachingPath && !questionaryTeachingPathStore!.selectedTeachingPath.isFinished) {
      if (questionaryTeachingPathStore!.selectedTeachingPath && !isNil(questionaryTeachingPathStore!.selectedTeachingPath.lastSelectedNodeId)) {
        await questionaryTeachingPathStore!.calculateCurrentNode(id, questionaryTeachingPathStore!.selectedTeachingPath.lastSelectedNodeId);
      }
    }
    */
    questionaryTeachingPathStore!.setFetchingDataStatus(false);
  }

  public getDatateachingpath = async (id: number) => {
    const { location, questionaryTeachingPathStore, editTeachingPathStore, history } = this.props;
    try {
      return await editTeachingPathStore!.getDraftForeignTeachingPath(id);
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
          // this.props.questionaryTeachingPathStore!.resetAllInfoAboutTeachingPath();
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
    const contenTeaching = (typeof(this.state.contenTeaching) !== 'undefined') ? this.state.contenTeaching : undefined;
    const type = contenTeaching!.content.children[0]!.items![0].type;
    questionaryTeachingPathStore!.calculateCurrentNodePreview(type);
    this.setState(
      { selectedNode: contenTeaching!.content.children }
    );
  }

  public finishReading = (node: EditableTeachingPathNode | undefined) => {
    const { questionaryTeachingPathStore } = this.props;
    questionaryTeachingPathStore!.setFetchingDataStatus(true);
    const type = (node!.children.length > 0) ? node!.children[0].type : '';
    this.setState(
      {
        selectedNode: node!.children
      },
      () => {
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
    );
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
    /*this.props.history.push('/submitted', {
      originPath: '/teaching-paths',
      title: 'teaching path passing.submitted',
      isTeachingPath: true
    });*/
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

  public renderContent = () => {
    const isDraftSaving = (typeof(this.state.contenTeaching) !== 'undefined') ? this.state.contenTeaching!.isDraftSaving : true;
    const contenTeaching = (typeof(this.state.contenTeaching) !== 'undefined') ? this.state.contenTeaching : undefined;
    const idTeachingPath = Number(this.props.location.pathname.split('/', limitSplit)[itemSplit]);
    if (this.props.questionaryTeachingPathStore!.fetchingData) {
      return <div className={'loading'}><Loader /></div>;
    }
    switch (this.props.questionaryTeachingPathStore!.displayedElement) {
      case TeachingPathNodeType.Root:
        return <TeachingPathAnswerCover content={contenTeaching} onClickStart={this.onClickStart}/>;
      case TeachingPathNodeType.Article:
        return <ArticleTeachingPath content={this.state.selectedNode} finishReading={this.finishReading} />;
      case TeachingPathNodeType.Assignment:
        return <AssignmentTeachingPath content={this.state.selectedNode} idTeachingPath={idTeachingPath}/>;
      case TeachingPathNodeType.Domain:
        return <DomainTeachingPath finishReading={this.finishReadingDomain} />;
      default:
        return <SubmitTeachingPath onSubmit={this.finishTeachingPath} onDelete={this.deleteTeachingPathAnswers} isPreview/>;
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
    const { contenTeaching } = this.state;
    const title = (typeof(contenTeaching) !== 'undefined') ? this.state.contenTeaching!.title : '';
    const isDraftSaving = (typeof(contenTeaching) !== 'undefined') ? this.state.contenTeaching!.isDraftSaving : true;

    if (isDraftSaving) {
      return <span className={'flexBox justifyCenter'}>{intl.get('loading')}</span>;
    }

    let currentList: Array<Article | Assignment> = [];
    if (typeof(contenTeaching) !== 'undefined') {
      this.state.contenTeaching!.content.children.forEach((e) => {
        currentList = this.anyList(currentList, e);
      });
    }
    return (
      <>
        <span className={'overview'}>{intl.get('edit_teaching_path.Step overview')}</span>
        <h1 className={'titleTeachingPath'}>{title}</h1>
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
      <div className={'passageTeachingPath PreviewTeachingPath'}>
        <AppHeader fromTeachingPathPassing onLogoClick={this.handleExit}/>

        <div className="teachingPathWrapper">

          <div className="teachingPathNavigate">
            <div className="stepOverview">
              {this.renderOverview()}
            </div>

            <div className="arrowControlsTeachingPath">
              <button className={'navigationExitButton'} onClick={this.handleExit} title={intl.get('teaching path passing.exit')} >
                <img src={actualArrowLeftRounded} alt="actualArrowLeftRounded"/>
                <span>{intl.get('teaching path passing.exit')}</span>
              </button>
            </div>
          </div>

          <div className="flexBox dirColumn wrapperTeachingPath">
            <div className="contentTeachingPath" ref={this.ref}>
              {this.renderContent()}
            </div>

            <BreadcrumbsTeachingPath onClickStart={this.onClickStartBreadcrumbs}/>
          </div>
        </div>
      </div>
    );
  }
}

export const PreviewTeachingPath = withRouter(PreviewTeachingPathComponent);
