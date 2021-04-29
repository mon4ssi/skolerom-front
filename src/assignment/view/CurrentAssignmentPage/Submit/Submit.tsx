import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { Location } from 'history';

import { RedirectData } from 'assignment/questionary/Questionary';
import { QuestionaryTeachingPathStore } from 'teachingPath/questionaryTeachingPath/questionaryTeachingPathStore';
import { LocationState } from '../CurrentAssignmentPage';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { CurrentQuestionaryStore } from '../CurrentQuestionaryStore';

import check from 'assets/images/check-white.svg';

import './Submit.scss';

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

  private clickRevert = () => {
    const { readOnly, revertQuestionary } = this.props;

    if (!readOnly) {
      revertQuestionary();
    }
  }

  private renderRevertButton = () => (
    <div className={`Submitted__revert ${this.props.readOnly && 'Submit__defaultCursor'}`} onClick={this.clickRevert}>
      {intl.get('current_assignment_page.revert_button')}
    </div>
  )

  private deleteAnswers = () => {
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

  public render() {
    const { numberOfQuestions, numberOfAnsweredQuestions, readOnly } = this.props;
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

        <CreateButton
          disabled={numberOfAnsweredQuestions !== numberOfQuestions}
          className="Submit__button"
          onClick={this.publishQuestionary}
          title={intl.get('current_assignment_page.complete_and_submit_button')}
        >
          <>
            <img className="Submit__image" src={check} alt={intl.get('current_assignment_page.submit')} />
          {intl.get('current_assignment_page.complete_and_submit_button')}
          </>
        </CreateButton>
      </div>
    );
  }
}

export const Submit = withRouter(SubmitComponent);
