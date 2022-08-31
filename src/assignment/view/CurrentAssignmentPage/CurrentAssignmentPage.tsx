import React, { Component } from 'react';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps } from 'react-router-dom';
import { Location } from 'history';
import classNames from 'classnames';
import isNil from 'lodash/isNil';
import { Animated } from 'react-animated-css';

import arrowLeftRounded from 'assets/images/arrow-left-rounded.svg';
import arrowLeftRoundedGray from 'assets/images/arrow-left-rounded-gray.svg';
import arrowRightRounded from 'assets/images/arrow-right-rounded.svg';
import arrowRightRoundedGray from 'assets/images/arrow-right-rounded-gray.svg';

import { AppHeader } from 'components/layout/AppHeader/AppHeader';
import { AssignmentOverview } from './AssignmentOverview/AssignmentOverview';
import { ArrowControls } from './ArrowControls/ArrowControls';
import { AnswerCurrentQuestion } from './AnswerCurrentQuestion/AnswerCurrentQuestion';
import { CurrentQuestionaryStore } from './CurrentQuestionaryStore';
import { RedirectData } from '../../questionary/Questionary';
import { BreadcrumbsTeachingPath } from 'components/common/Breadcrumbs/BreadcrumbsComponent';
import { QuestionaryTeachingPathStore } from 'teachingPath/questionaryTeachingPath/questionaryTeachingPathStore';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { UIStore } from 'locales/UIStore';
import { Loader } from 'components/common/Loader/Loader';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import './CurrentAssignmentPage.scss';
import { AssignmentListStore } from '../AssignmentsList/AssignmentListStore';
import { TeacherGuidanceAssigModal } from '../TeacherGuidance/TeacherGuidanceAssigModal';
import list from 'assets/images/list-placeholder.svg';

const COVER_INDEX = -2;
const animationInDuration = 500;
const animationOutDuration = 300;

export interface LocationState {
  teachingPath?: number;
  node?: number;
  withoutRefresh?: boolean;
  originPath?: string;
  title?: string;
  isTeachingPath?: boolean;
}

interface RouteParams {
  id?: string;
  answerId?: string;
}

enum ExitEventTarget {
  HEADER_LOGO,
  EXIT_BUTTON,
}

type LocataionProps = Location<{ readOnly: boolean } & LocationState>;

interface CurrentAssignmentPageProps extends RouteComponentProps<RouteParams, {}, LocationState> {
  currentQuestionaryStore: CurrentQuestionaryStore;
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  assignmentListStore?: AssignmentListStore;
  uiStore?: UIStore;
  location: LocataionProps;
  isTeacher?: boolean;
}

interface State {
  showCover: boolean;
}

enum QueryStringKeys {
  PAGE = 'page',
  QUESTION_ID = 'question',
}

export enum ContentType {
  COVER = 'cover',
  ARTICLE_LIST = 'articleList',
  QUESTION = 'question',
  SUBMIT = 'submit',
}

@inject('currentQuestionaryStore', 'questionaryTeachingPathStore', 'uiStore', 'assignmentListStore')
@observer
export class CurrentAssignmentPage extends Component<CurrentAssignmentPageProps, State> {
  public state = {
    showCover: false,
  };

  private goToNextQuestion = () => {
    const { setCurrentQuestion, currentQuestionIndex } = this.props.currentQuestionaryStore;
    setCurrentQuestion(currentQuestionIndex + 1);
    this.updateQueryString();
  }

  private goToPrevQuestion = () => {
    const { setCurrentQuestion, currentQuestionIndex } = this.props.currentQuestionaryStore;
    setCurrentQuestion(currentQuestionIndex - 1);
    this.updateQueryString();
  }

  public async componentDidMount() {
    const { currentQuestionaryStore, match, isTeacher, history } = this.props;
    currentQuestionaryStore.handleShowArrowsTooltip(true);
    document.addEventListener('keyup', this.handleKeyboardControl);
    const headerArray = Array.from(document.getElementsByClassName('AppHeader') as HTMLCollectionOf<HTMLElement>);
    headerArray[0].style.display = 'none';
    const search = (history.location.search === '?preview' || history.location.search === '?preview&open=tg') ? true : false;
    /* currentQuestionaryStore!.setCurrentQuestion(-2); */
    if (isTeacher) {
      await currentQuestionaryStore.getQuestionaryById(Number(match.params.id));
      if (currentQuestionaryStore!.assignment && currentQuestionaryStore!.assignment!.relatedArticles && currentQuestionaryStore!.assignment!.relatedArticles.length > 0 && currentQuestionaryStore!.assignment!.relatedArticles[0].isHidden) {
        currentQuestionaryStore!.setCurrentQuestion(0);
        this.updateQueryString();
        return;
      }
      if (currentQuestionaryStore!.assignment!.relatedArticles! && currentQuestionaryStore!.assignment!.relatedArticles!.length === 0) {
        currentQuestionaryStore!.setCurrentQuestion(0);
        this.updateQueryString();
        return;
      }
      await currentQuestionaryStore.getRelatedArticles();
      currentQuestionaryStore!.setCurrentQuestion(-1);
      this.updateQueryString();

      if (currentQuestionaryStore.assignment && currentQuestionaryStore.assignment.isOwnedByMe() && !search) {
        /* this.props.history.replace(`/assignments/edit/${Number(match.params.id)}`); */
        return;
      }
    } else {
      const { teachingPath, node } = (history.location.state || {}) as RedirectData;
      const redirectData = teachingPath && node ? { teachingPath, node } : undefined;
      await currentQuestionaryStore.createQuestionaryByAssignmentId(Number(match.params.id), redirectData);
    }
    if (!this.isReadOnly && !search) {
      this.setState({ showCover: true });
      this.props.currentQuestionaryStore!.setCurrentQuestion(COVER_INDEX);
      return this.updateQueryString();
    }
    if (currentQuestionaryStore.assignment!.relatedArticles.length > 0 && !search) {
      /* console.log('jaaaaaaaaaaaaaaaaaaaa');
      this.props.currentQuestionaryStore.setCurrentQuestion(-1);
      return this.updateQueryString(); */
    }
    /* this.props.currentQuestionaryStore.setCurrentQuestion(0); */
    return this.updateQueryString();
  }

  public async componentDidUpdate(prevProps: CurrentAssignmentPageProps) {
    const { currentQuestionaryStore, match, history } = this.props;
    const headerArray = Array.from(document.getElementsByClassName('AppHeader') as HTMLCollectionOf<HTMLElement>);
    headerArray[0].style.display = 'flex';

    if (match.params.id !== prevProps.match.params.id) {
      const { teachingPath, node } = (history.location.state || {}) as RedirectData;
      const redirectData = teachingPath && node ? { teachingPath, node } : undefined;
      await currentQuestionaryStore.createQuestionaryByAssignmentId(Number(match.params.id), redirectData);
    }
  }

  public componentWillUnmount(): void {
    this.props.currentQuestionaryStore!.setStartedAssignment(false);
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public get canGoToPrevQuestion() {
    const {
      currentQuestionaryStore: {
        currentQuestionIndex,
        isStartedAssignment,
        relatedArticles
      },
      isTeacher
    } = this.props;
    return ((isStartedAssignment || isTeacher) && currentQuestionIndex === 0 && relatedArticles.length > 0)
      || currentQuestionIndex > 0;
  }

  public get canGoToNextQuestion() {
    const {
      currentQuestionaryStore: {
        currentQuestionIndex,
        isStartedAssignment,
        questionTitlesListWithSubmit
      },
      isTeacher
    } = this.props;
    return currentQuestionIndex !== questionTitlesListWithSubmit.length - 1 && (isStartedAssignment || isTeacher);
  }

  public get isReadOnly(): boolean {
    const { location, isTeacher } = this.props;
    return !!((location && location.state && location.state.readOnly) || isTeacher);
  }

  public handleExit = (exitEventTarget: ExitEventTarget) => async () => {
    const {
      questionaryTeachingPathStore,
      history,
      location: { state }
    } = this.props;

    const exitQuestionary = this.isReadOnly
      ? true
      : await Notification.create({
        type: NotificationTypes.CONFIRM,
        title: intl.get('current_assignment_page.exit_confirm')
      });

    if (exitQuestionary) {
      this.props.uiStore!.hideSidebar();

      if (state && state.node && state.teachingPath && questionaryTeachingPathStore!.currentNode) {
        questionaryTeachingPathStore!.handleAssignment(false);
        history.push(`/teaching-path/${state.teachingPath}`, {
          node: questionaryTeachingPathStore!.currentNode.id
        });
      } else {
        history.push(exitEventTarget === ExitEventTarget.EXIT_BUTTON ? '/assignments' : '/activity');
      }
    } else {
      // history.push('/assignments');
    }
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    if (event.shiftKey && event.key === 'ArrowRight' && this.canGoToNextQuestion) {
      this.goToNextQuestion();
    } else if (event.shiftKey && event.key === 'ArrowLeft' && this.canGoToPrevQuestion) {
      this.goToPrevQuestion();
    }
  }

  public switchCover = () => {
    const { currentQuestionaryStore } = this.props;

    this.setState({ showCover: false }, () => {
      currentQuestionaryStore!.setStartedAssignment(true);

      if (currentQuestionaryStore!.currentQuestionary && currentQuestionaryStore!.currentQuestionary.redirectData) {
        currentQuestionaryStore!.setCurrentQuestion(0);
        return this.updateQueryString();
      }

      if (currentQuestionaryStore!.assignment!.relatedArticles.length > 0 && !currentQuestionaryStore!.assignment!.relatedArticles[0].isHidden) {
        currentQuestionaryStore!.setCurrentQuestion(-1);
        return this.updateQueryString();
      }
      currentQuestionaryStore!.setCurrentQuestion(0);
      return this.updateQueryString();
    });
  }

  public updateQueryString() {
    const { currentQuestionaryStore, history, isTeacher } = this.props;
    const redirectData = (currentQuestionaryStore!.currentQuestionary && currentQuestionaryStore!.currentQuestionary.redirectData)
      ? currentQuestionaryStore!.currentQuestionary.redirectData
      : undefined;
    let currentPage;
    let questionId;
    if (this.state.showCover) {
      currentPage = ContentType.COVER;
      questionId = null;
    } else if (currentQuestionaryStore!.assignment && currentQuestionaryStore!.assignment!.relatedArticles.length >= 0
      && currentQuestionaryStore!.currentQuestionIndex < 0 && redirectData === undefined && !currentQuestionaryStore!.assignment!.relatedArticles[0].isHidden) {
      currentPage = ContentType.ARTICLE_LIST;
      questionId = null;
    } else {
      const isValidateCurrent = (isTeacher!) ? true : currentQuestionaryStore!.currentAnswer!;
      if (isValidateCurrent!) {
        currentPage = ContentType.QUESTION;
        questionId = currentQuestionaryStore!.currentQuestionIndex!;
      } else {
        currentPage = ContentType.SUBMIT;
        questionId = null;
      }
    }
    QueryStringHelper.set(history, QueryStringKeys.PAGE, currentPage);
    if (!isNil(questionId)) {
      QueryStringHelper.set(history, QueryStringKeys.QUESTION_ID, questionId);
    } else {
      QueryStringHelper.remove(history, QueryStringKeys.QUESTION_ID);
    }
  }

  public setCurrentQuestion = (index: number) => {
    this.props.currentQuestionaryStore!.setCurrentQuestion(index);
    this.updateQueryString();
  }

  public handlePublish = async () => {
    const { state } = this.props.location;
    let data = undefined;

    if (state && state.teachingPath && state.node) {
      data = {
        teachingPath: state.teachingPath,
        node: state.node
      };
    }
    this.props.questionaryTeachingPathStore!.handleAssignment(false);
    await this.props.currentQuestionaryStore!.publishQuestionary(data);
  }

  public redirectToCurrentNode = (idTeachingPath: number, node: number) => {
    this.props.history.push({
      pathname: `/teaching-path/${idTeachingPath}`,
      state: { node, withoutRefresh: true }
    });
  }

  public renderNextButton = () => {
    const classes = classNames('CurrentAssignmentPage__button CurrentAssignmentPage__button_right', {
      CurrentAssignmentPage__button_disabled: !this.canGoToNextQuestion,
    });

    return (
      <button
        className={classes}
        onClick={this.goToNextQuestion}
        disabled={!this.canGoToNextQuestion}
        title="Next"
      >
        <img
          className="CurrentAssignmentPage__buttonImage"
          src={this.canGoToNextQuestion ? arrowRightRounded : arrowRightRoundedGray}
          alt="arrow right"
          title="arrow right"
        />
      </button>
    );
  }

  public renderBackButton = () => {
    const classes = classNames('CurrentAssignmentPage__button', {
      CurrentAssignmentPage__button_disabled: !this.canGoToPrevQuestion,
    });

    return (
      <button
        className={classes}
        onClick={this.goToPrevQuestion}
        disabled={!this.canGoToPrevQuestion}
        title="Back"
      >
        <img
          className="CurrentAssignmentPage__buttonImage"
          src={this.canGoToPrevQuestion ? arrowLeftRounded : arrowLeftRoundedGray}
          alt="arrow left"
          title="arrow left"
        />
      </button>
    );
  }

  public renderNavigationIfNeeded = () => this.props.currentQuestionaryStore.isStartedAssignment && (
    <div className="CurrentAssignmentPage__navigation">
      {this.renderBackButton()}
      {this.renderNextButton()}
    </div>
  )

  public renderBreadcrumbsIfNeeded = () => this.props.location.state && this.props.location.state.node && (
    <div className="CurrentAssignmentPage__mybreadcrumbs">
      {this.renderBackButton()}
      <BreadcrumbsTeachingPath getCurrentNodeFromAssignment={this.redirectToCurrentNode} />
      {this.renderNextButton()}
    </div>
  )

  public renderSaveNotification = () => {
    const { currentQuestionary } = this.props.currentQuestionaryStore!;

    return currentQuestionary && currentQuestionary.isQuestionaryChanged && (
      <Animated
        animationIn="fadeIn"
        animationOut="fadeOut"
        isVisible={currentQuestionary && currentQuestionary.isQuestionarySaving}
        animationInDuration={animationInDuration}
        animationOutDuration={animationOutDuration}
        className="CurrentAssignmentPage__notification"
      >
        <div>
          {intl.get('current_assignment_page.saved_successfuly')}
        </div>
      </Animated>
    );
  }

  public renderIfneedNextButton() {
    return (
      <div className="ButtonNextNew">
        <button
          className="ButtonNextNew--btn"
          onClick={this.goToNextQuestion}
          disabled={!this.canGoToNextQuestion}
          title={intl.get('pagination.Next question')}
        >
          {intl.get('pagination.Next question')}
        </button>
      </div>
    );
  }

  public render() {
    const {
      currentQuestionaryStore: {
        answers,
        currentQuestionIndex,
        currentAnswer,
        questionTitlesListWithSubmit,
        numberOfQuestions,
        assignment,
        numberOfAnsweredQuestions,
        isLoading,
        handleShowArrowsTooltip,
        getIsReadArticles,
        isStartedAssignment,
        isMultipleQuestion
      },
      location: { state },
      uiStore,
      isTeacher,
      assignmentListStore,
      questionaryTeachingPathStore,
      match
    } = this.props;

    const isShowAssignmentArticles = !!(assignment && assignment!.relatedArticles.length > 0 && !assignment!.relatedArticles[0].isHidden);
    const isReadArticles = getIsReadArticles();
    toJS(this.props.currentQuestionaryStore); // VALUES OF ANSWERS WILL NOT WORK WITHOUT THIS STRING
    const navBarClasses = classNames('CurrentAssignmentPage__navBar', {
      CurrentAssignmentPage__navBar_visible: this.props.uiStore!.sidebarShown,
    });
    let isVisibleButtonRender = false;

    if (isLoading) {
      return <div className={'loading'}><Loader /></div>;
    }
    if (currentAnswer) {
      isVisibleButtonRender = true;
    }
    const url: URL = new URL(window.location.href);
    const isOnlyAssig = (state && state.node && state.teachingPath && questionaryTeachingPathStore!.currentNode) ? true : false;
    const openTeacherGuidance: boolean = (url.searchParams.get('open') === 'tg' /* || localParamIsOpenTG!  */? true : false);
    return !isLoading && (
      <div tabIndex={0} className="CurrentAssignmentPage">
        <AppHeader
          fromAssignmentPassing
          studentFormTeachinPath
          studentFormAssignment={isOnlyAssig}
          onLogoClick={this.handleExit(ExitEventTarget.HEADER_LOGO)}
          entityStore={assignmentListStore!}
          currentEntityId={Number(match.params.id)}
        />

        <TeacherGuidanceAssigModal
          currentQuestionaryStore={this.props.currentQuestionaryStore}
          openGuidance={openTeacherGuidance}
          readOnly={true}
        />

        {this.props.uiStore!.sidebarShown && <div className="CurrentAssignmentPage__overlay" onClick={uiStore!.hideSidebar} />}

        <div className="CurrentAssignmentPage__content">
          <div className="CurrentAssignmentPage__container">
            <div className="CurrentAssignmentPage__main questionBody">
              <div className="CurrentAssignmentPage__main__center">
                <div className={navBarClasses}>
                  <AssignmentOverview
                    answers={answers}
                    isTeacher={isTeacher}
                    questionsList={questionTitlesListWithSubmit}
                    setCurrentQuestion={this.setCurrentQuestion}
                    currentQuestion={currentQuestionIndex}
                    numberOfAnsweredQuestions={numberOfAnsweredQuestions}
                    handleShowArrowsTooltip={handleShowArrowsTooltip}
                    readOnly={this.isReadOnly}
                    isShowAssignmentArticles={isShowAssignmentArticles}
                    isStartedAssignment={isStartedAssignment}
                    isReadArticles={isReadArticles}
                    redirectData={state && state.node}
                  />
                </div>
                {this.renderNavigationIfNeeded()}
                <AnswerCurrentQuestion
                  answer={currentAnswer}
                  numberOfQuestions={numberOfQuestions}
                  numberOfAnsweredQuestions={numberOfAnsweredQuestions}
                  publishQuestionary={this.handlePublish}
                  readOnly={this.isReadOnly}
                  switchCover={this.switchCover}
                  showCover={this.state.showCover}
                  isTeachingPath={state && !!state.teachingPath}
                />
                {isVisibleButtonRender && this.renderIfneedNextButton()}
              </div>
            </div>
            {this.renderBreadcrumbsIfNeeded()}
          </div>
          {this.renderSaveNotification()}
        </div>
      </div>
    );
  }
}
