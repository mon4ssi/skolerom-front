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

import check from 'assets/images/check-white.svg';

import './Submit.scss';
const showDelay = 500;
type LocataionProps = Location<{ readOnly: boolean } & LocationState>;

interface Props extends RouteComponentProps<{}, {}, LocationState> {
  numberOfQuestions: number;
  numberOfAnsweredQuestions: number;
  publishQuestionary: () => Promise<void>;
  redirectData?: RedirectData;
  readOnly: boolean;
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  currentQuestionaryStore?: CurrentQuestionaryStore;
  location: LocataionProps;
  deleteQuestionary: () => void;
  revertQuestionary: () => void;
}

@inject('currentQuestionaryStore', 'questionaryTeachingPathStore')
@observer
export class SubmitComponent extends Component<Props> {

  public refbutton = createRef<HTMLButtonElement>();
  public state = {
    sumArticlesRead : 0,
    sumArticlesTotal : 0,
    disablebutton : true
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

    return (childNode && childNode.children.length > 0 && redirectData)
      ? this.props.history.push(`/teaching-path/${questionaryTeachingPathStore!.currentTeachingPath!.id}`, {
        node: history.location.state && history.location.state.node
      })
      : this.props.history.push('/submitted', {
        originPath: '/assignments',
        title: 'current_assignment_page.submited_title'
      });
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
    const { numberOfQuestions, numberOfAnsweredQuestions, currentQuestionaryStore } = this.props;
    currentQuestionaryStore!.relatedAllArticles.map(this.validArticles);
    this.sendValidArticlesRead();
    if (numberOfAnsweredQuestions === numberOfQuestions && currentQuestionaryStore!.allArticlesread) {
      this.setState({ disablebutton : false });
      setTimeout(
        () => {
          if (this.refbutton.current) {
            this.refbutton.current!.focus();
          }
        },
        showDelay
      );
    } else {
      this.setState({ disablebutton : true });
    }
  }

  public msjeArticles() {
    const { sumArticlesRead, sumArticlesTotal } = this.state;
    return (
      <p className="sumMsj">{intl.get('current_assignment_page.readNotArticles')}</p>
    );
  }

  public render() {
    const { numberOfQuestions, numberOfAnsweredQuestions, readOnly, currentQuestionaryStore } = this.props;
    const { sumArticlesRead, sumArticlesTotal } = this.state;
    const submitDescriptionText = intl.get('current_assignment_page.submit_description', { numberOfAnsweredQuestions, numberOfQuestions });
    return (
      <div>
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
        {this.state.disablebutton && this.msjeArticles()}
      </div>
    );
  }
}

export const Submit = withRouter(SubmitComponent);
