import React, { Component, createRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { Location } from 'history';

import { RedirectData } from 'assignment/questionary/Questionary';
import { Article } from 'assignment/Assignment';
import { QuestionaryTeachingPathStore } from 'teachingPath/questionaryTeachingPath/questionaryTeachingPathStore';
import { LocationState } from '../CurrentAssignmentPage';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { CurrentQuestionaryStore } from '../CurrentQuestionaryStore';
import list from 'assets/images/list-placeholder.svg';

import check from 'assets/images/check-white.svg';

import './Submit.scss';
import { UserType } from 'user/User';
const showDelay = 500;
type LocataionProps = Location<{ readOnly: boolean } & LocationState>;

interface Props extends RouteComponentProps<{}, {}, LocationState> {
  numberOfQuestions: number;
  numberOfAnsweredQuestions: number;
  isPreview?: boolean;
  publishQuestionary: () => Promise<void>;
  redirectData?: RedirectData;
  readOnly: boolean;
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  currentQuestionaryStore?: CurrentQuestionaryStore;
  location: LocataionProps;
  isIdTeachingPath?: number;
  deleteQuestionary: () => void;
  revertQuestionary: () => void;
  finishPreviewSubmit?: () => void;
}

@inject('currentQuestionaryStore', 'questionaryTeachingPathStore')
@observer
export class SubmitComponent extends Component<Props> {

  public refbutton = createRef<HTMLButtonElement>();
  public state = {
    sumArticlesRead: 0,
    sumArticlesTotal: 0,
    disablebutton: true
  };

  public clickRevert = () => {
    const { readOnly, revertQuestionary } = this.props;

    if (!readOnly) {
      revertQuestionary();
    }
  }

  public renderRevertButton = () => (
    <div className={`Submitted__revert ${this.props.readOnly && 'Submit__defaultCursor'}`} onClick={this.clickRevert}>
      {intl.get('current_assignment_page.revert_button')}
    </div>
  )

  public deleteAnswers = () => {
    const { readOnly, deleteQuestionary } = this.props;

    if (!readOnly) {
      deleteQuestionary();
    }
  }

  public publishQuestionary = async () => {
    const { redirectData, questionaryTeachingPathStore, history } = this.props;
    const childNode = questionaryTeachingPathStore!.currentNode;
    await this.props.publishQuestionary();
    const isStudent = this.props.currentQuestionaryStore!.getCurrentUser()!.type === UserType.Student;
    const isTestAccount = this.props.currentQuestionaryStore!.getCurrentUser()!.isTestAccount!;
    return (childNode && childNode.children.length > 0 && redirectData)
      ? this.props.history.push(`/teaching-path/${questionaryTeachingPathStore!.currentTeachingPath!.id}`, {
        node: history.location.state && history.location.state.node
      })
      : isStudent ? this.props.history.push('/submitted', {
        originPath: '/assignments',
        title: 'current_assignment_page.submited_title'
      }) : this.props.history.push('/assignments/all');
  }

  public reloadToPreview = async () => {
    const { redirectData, isPreview, questionaryTeachingPathStore, finishPreviewSubmit, history } = this.props;
    const childNode = questionaryTeachingPathStore!.currentNode;
    if (childNode && childNode.children.length > 0) {
      this.props.history.push(`/teaching-path/preview/${questionaryTeachingPathStore!.currentTeachingPath!.id}`, {
        node: history.location.state && history.location.state.node
      });
    } else {
      this.props.history.push('/assignments/all');
    }
  }

  public validArticles = (article: Article) => {
    this.state.sumArticlesTotal += 1;
    if (article.isRead) {
      this.state.sumArticlesRead += 1;
    }
  }

  public sendValidArticlesRead() {
    const { currentQuestionaryStore } = this.props;
    if (this.state.sumArticlesRead > 0) {
      if (this.state.sumArticlesTotal === this.state.sumArticlesRead) {
        currentQuestionaryStore!.allArticlesread = true;
      }
    }
  }

  public componentDidMount() {
    const { numberOfQuestions, numberOfAnsweredQuestions, currentQuestionaryStore, readOnly } = this.props;
    currentQuestionaryStore!.relatedAllArticles.map(this.validArticles);
    const redirectData = (currentQuestionaryStore!.currentQuestionary && currentQuestionaryStore!.currentQuestionary.redirectData)
      ? currentQuestionaryStore!.currentQuestionary.redirectData
      : undefined;
    if (readOnly) {
      this.setState({ disablebutton: false });
      setTimeout(
        () => {
          if (this.refbutton.current) {
            this.refbutton.current!.focus();
          }
        },
        showDelay
      );
    }
    this.sendValidArticlesRead();
    if (currentQuestionaryStore!.assignment && currentQuestionaryStore!.assignment!.relatedArticles.length > 0 && currentQuestionaryStore!.assignment!.relatedArticles[0].isHidden) {
      this.setState({ disablebutton: false });
      setTimeout(
        () => {
          if (this.refbutton.current) {
            this.refbutton.current!.focus();
          }
        },
        showDelay
      );
    } else {
      if (redirectData === undefined) {
        if (currentQuestionaryStore!.relatedAllArticles.length) {
          if (numberOfAnsweredQuestions === numberOfQuestions && currentQuestionaryStore!.allArticlesread) {
            this.setState({ disablebutton: false });
            setTimeout(
              () => {
                if (this.refbutton.current) {
                  this.refbutton.current!.focus();
                }
              },
              showDelay
            );
          } else {
            if (!readOnly) {
              this.setState({ disablebutton: true });
            }
          }
        } else {
          if (numberOfAnsweredQuestions === numberOfQuestions) {
            this.setState({ disablebutton: false });
            setTimeout(
              () => {
                if (this.refbutton.current) {
                  this.refbutton.current!.focus();
                }
              },
              showDelay
            );
          }
        }
      } else {
        if (numberOfAnsweredQuestions === numberOfQuestions) {
          this.setState({ disablebutton: false });
          setTimeout(
            () => {
              if (this.refbutton.current) {
                this.refbutton.current!.focus();
              }
            },
            showDelay
          );
        }
      }
    }
  }

  public msjeArticles() {
    const { readOnly } = this.props;
    return (
      <p className="sumMsj">{intl.get('current_assignment_page.readNotArticles')}</p>
    );
  }

  public generateButton = () => {
    const { isPreview } = this.props;
    if (isPreview) {
      return (
        <button
          className="CreateButton Submit__button reloadToPreview"
          onClick={this.reloadToPreview}
          title={intl.get('current_assignment_page.complete_and_submit_button')}
          ref={this.refbutton}
        >
          <>
            <img className="Submit__image" src={check} alt={intl.get('current_assignment_page.submit')} />
            {intl.get('current_assignment_page.complete_and_submit_button')}
          </>
        </button>
      );
    }
    return (
      <button
        disabled={this.state.disablebutton}
        className="CreateButton Submit__button"
        onClick={this.publishQuestionary}
        title={intl.get('current_assignment_page.complete_and_submit_button')}
        ref={this.refbutton}
      >
        <>
          <img className="Submit__image" src={check} alt={intl.get('current_assignment_page.submit')} />
          {intl.get('current_assignment_page.complete_and_submit_button')}
        </>
      </button>
    );
  }

  public render() {
    const { numberOfQuestions, numberOfAnsweredQuestions, readOnly, currentQuestionaryStore } = this.props;
    const { sumArticlesRead, sumArticlesTotal } = this.state;
    const submitDescriptionText = intl.get('current_assignment_page.submit_description', { numberOfAnsweredQuestions, numberOfQuestions });
    const background = (currentQuestionaryStore && currentQuestionaryStore!.backgroundImage) ? currentQuestionaryStore!.backgroundImage : list;
    return (
      <div>
        <div className="QuestionPreview__background" style={{ backgroundImage: `url(${background})` }} />
        <div className="Submit__title">
          {intl.get('current_assignment_page.submit_all_questions_answered')}
        </div>

        <div className="Submit__description">
          {submitDescriptionText}
        </div>

        {/*{this.renderRevertButton()}*/}

        {/*<div className={`Submit__delete ${readOnly && 'Submit__defaultCursor'}`} onClick={this.deleteAnswers}>*/}
        {/*  {intl.get('current_assignment_page.delete_all_answers')}*/}
        {/*</div>*/}
        {this.generateButton()}
        {!this.props.isPreview && !this.props.readOnly && this.state.disablebutton && this.msjeArticles()}
      </div>
    );
  }
}

export const Submit = withRouter(SubmitComponent);
