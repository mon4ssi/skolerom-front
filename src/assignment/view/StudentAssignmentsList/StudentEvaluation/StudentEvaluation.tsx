import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Location } from 'history';

import { AssignmentListStore } from '../../AssignmentsList/AssignmentListStore';
import { AssignmentEvaluationStore } from '../../../EvaluationDraft/AssignmentEvaluationStore';
import { QuestionPreview } from 'components/common/QuestionPreview/QuestionPreview';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { EvaluationLabel } from 'components/common/EvaluationLabel/EvaluationLabel';

import exit from 'assets/images/exit.svg';
import './StudentEvaluation.scss';

type LocationProps = Location<{ title: string }>;

interface Props {
  assignmentListStore?: AssignmentListStore;
  assignmentEvaluationStore?: AssignmentEvaluationStore;
  location: LocationProps;
}

interface Params {
  id: number;
  answerId: number;
}

@inject('assignmentListStore', 'assignmentEvaluationStore')
@observer
class StudentEvaluation extends Component<Props & RouteComponentProps> {

  public async componentDidMount() {
    const { id, answerId } = this.props.match.params as Params;
    await this.props.assignmentEvaluationStore!.getAnswersByIdForStudent(id, answerId);
  }

  public renderQuestions = () => {
    const { assignmentEvaluationStore } = this.props;
    if (assignmentEvaluationStore!.evaluationAnswers && assignmentEvaluationStore!.evaluationAnswers.revisionContent) {
      return assignmentEvaluationStore!.evaluationAnswers!.revisionContent.questions.map((question) => {
        const answer = assignmentEvaluationStore!.evaluationAnswers!.answers.find(answer => answer.answerBlock.key.id === question.id);

        return (
          <QuestionPreview
            readOnly
            isEvaluationStyle
            isStudentView
            key={question.id}
            question={question}
            answer={answer && answer.answerBlock}
            comment={answer && answer.comment}
          />
        );
      });
    }
  }

  public renderEvaluationLabel = () => {
    const { assignmentEvaluationStore } = this.props;
    if (assignmentEvaluationStore!.currentEvaluation) {
      const { isPassed, mark, status } = assignmentEvaluationStore!.currentEvaluation!;
      return (
        <EvaluationLabel status={status} mark={mark} isPassed={isPassed}/>
      );
    }
  }

  public renderAssignmentComment = () => {
    const { assignmentEvaluationStore } = this.props;
    if (assignmentEvaluationStore!.currentEvaluation) {
      if (assignmentEvaluationStore!.currentEvaluation!.content.commentToEntity) {
        return (
          assignmentEvaluationStore!.currentEvaluation!.content.commentToEntity
        );
      }
      return `${assignmentEvaluationStore!.currentEvaluation!.author} ${intl.get('answers.not comment')}`;
    }
  }

  public back = () => {
    this.props.history.push('/assignments');
  }

  public render() {
    const { location  } = this.props;

    return (
      <div className={'flexBox'}>
        <div className={'flexBox dirColumn leftside'}>
          <CreateButton className={'backButton'} onClick={this.back}>
            <div>
              <img src={exit} alt="exit"/>
              <span>{intl.get('answers.back')}</span>
            </div>
          </CreateButton>
          <span className={'titleEvaluation'}>{intl.get('answers.Evaluation')}</span>
          <span className={'titleAssignment'}>{location.state && location.state.title}</span>
          <div className="contentQuestions">
            {this.renderQuestions()}
          </div>
        </div>

        <div className="rightside flexBox dirColumn">
          <div className="comments">
            <div className="comment">
              <span className={'headline withPadding'}>{intl.get('answers.Comment to student')}</span>
              <span className={'fw300'}>
                {this.renderAssignmentComment()}
              </span>
            </div>
            <div className="evaluation">
              <span className={'headline'}>{intl.get('answers.Evaluation')}</span>
              {this.renderEvaluationLabel()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const StudentEvaluationWithRouter = withRouter(StudentEvaluation);
export { StudentEvaluationWithRouter as StudentEvaluation };
