import React, { Component } from 'react';
import intl from 'react-intl-universal';
import isNull from 'lodash/isNull';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Location } from 'history';
import editIcon from 'assets/images/edit.svg';
import editLightIcon from 'assets/images/edit-tp.svg';
import clock from 'assets/images/rounded-clock.svg';
import './Evaluation.scss';
import { inject, observer } from 'mobx-react';
import { CheckingPanel } from './CheckingPanel';
import moment from 'moment';
import { AssignmentEvaluationStore } from '../../EvaluationDraft/AssignmentEvaluationStore';
import { EditableEvaluation, Evaluation } from '../../../evaluation/Evaluation';
import { Pagination } from '../../../components/common/Pagination/Pagination';
import { EntityType } from '../../../utils/enums';

type TParams = { id: string };

type LocationProps = Location<{ title: string, assignmentId: number }>;

interface EvaluationWrapperProps extends RouteComponentProps<TParams> {
  assignmentEvaluationStore?: AssignmentEvaluationStore;
  location: LocationProps;
}

interface State {
  idVisibleChecking: number | undefined;
}

@inject('assignmentEvaluationStore')
@observer
class EvaluationWrapper extends Component<EvaluationWrapperProps, State> {
  public state = {
    idVisibleChecking: undefined
  };

  public componentDidMount = async () => {
    const { assignmentEvaluationStore } = this.props;

    await assignmentEvaluationStore!.getAnswersList(Number(this.props.match.params.id));
    assignmentEvaluationStore!.getCurrentEntity(Number(this.props.match.params.id));
  }

  public handleResultPanel = (answer: EditableEvaluation) => async () => {
    const { assignmentEvaluationStore } = this.props;
    const { idVisibleChecking } = this.state;

    if (!answer.isAnswered) {
      return;
    }

    if (idVisibleChecking && idVisibleChecking === answer.answerId) {
      return this.setState({ idVisibleChecking: undefined });
    }
    assignmentEvaluationStore!.setCurrentEvaluation(answer.answerId);
    await assignmentEvaluationStore!.getDraftAnswersById();
    await assignmentEvaluationStore!.getAnswersById();
    return this.setState({ idVisibleChecking: answer.answerId });
  }

  public calculateStatus = (result: Evaluation) => {
    const style = result.isAnswered ? '' : 'evaluate';
    const sign = isNull(result.status) ? '' : result.status ? '+' : '-';
    const rate = !isNull(result.mark) ? `| ${result.mark}${sign}` : '';

    const content = (isNull(result.mark) && isNull(result.isPassed)) ?
      <span className={style}>{intl.get('answers.Evaluate')}</span> :
      result.isPassed ?
        <span className={'passed'}>{`${intl.get('answers.Passed')} ${rate}`}</span> :
        <span className={'failed'}>{`${intl.get('answers.Not passed')} ${rate}`}</span>;

    // if (!result.isAnswered && moment(result.endDate).diff(moment(), 'days') < 0) {
    //   content = <span className={'failed'}>{intl.get('answers.Not passed')}</span>;
    // }

    return (
      <div className={'evaluated fw500'}>
        {content}
        {result.isAnswered ? <img className="edit" src={editIcon} alt="Edit"/> : <img className="edit" src={editLightIcon} alt="Edit"/>}
      </div>
    );
  }

  public renderDeadline = (result: Evaluation) => {
    const { assignmentEvaluationStore } = this.props;
    const locale = assignmentEvaluationStore!.currentLocale;

    const dueDate = moment(moment().subtract(1, 'd')).locale(locale).to(moment(result.endDate), true);
    const isPassed = moment(moment(result.endDate)).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD');

    const deadline = isPassed
      ? <span className={'failed'}>{intl.get('answers.past')}</span>
      : <span>{intl.get('answers.Due in')} {dueDate}</span>;

    return (
      <div className={'deadline fw500'}>
        {deadline}
        <img src={clock} alt="clock"/>
      </div>
    );
  }

  public renderAnsweredStatus = (status: boolean) => {
    const style = status ? 'answeredLabel' : 'notAnsweredLabel';

    return (
      <div className={'answeredStatus'}>
        <span className={`${style} label`}>
          {intl.get(`assignments search.${status ? 'Answered' : 'Not answered'}`)}
        </span>
      </div>
    );
  }

  public save = (answer: EditableEvaluation) => async () => {
    const { assignmentEvaluationStore } = this.props;

    await assignmentEvaluationStore!.publishEvaluation();
    await this.handleResultPanel(answer)();
  }

  public renderCheckingPanel = (result: EditableEvaluation) => {
    const { idVisibleChecking } = this.state;
    const { assignmentEvaluationStore } = this.props;

    if (idVisibleChecking === result.answerId) {
      return <CheckingPanel save={this.save(result)} type={EntityType.ASSIGNMENT} store={assignmentEvaluationStore!}/>;
    }
  }

  public renderResult = (result: EditableEvaluation) => (
      <div className={'wrapperResult'} key={result.studentId}>
        <div className="result flexBox spaceBetween alignCenter" onClick={this.handleResultPanel(result)}>
          <div className="fw500 name">{result.studentName}</div>
          <hr className="line"/>
          <div className="flexBox alignCenter">
            {this.renderAnsweredStatus(result.isAnswered)}
            {this.renderDeadline(result)}
            {this.calculateStatus(result)}
          </div>
        </div>
        {this.renderCheckingPanel(result)}
      </div>
    )

  public renderPagination = () => {
    const { assignmentEvaluationStore } = this.props;

    return assignmentEvaluationStore!.paginationTotalPages > 1 && (
      <Pagination
        pageCount={assignmentEvaluationStore!.paginationTotalPages}
        onChangePage={this.onChangePage}
      />
    );
  }

  public onChangePage = (newSelectedPage: { selected: number }) => {
    const { assignmentEvaluationStore  } = this.props;
    assignmentEvaluationStore!.setFiltersPage(newSelectedPage.selected + 1);
  }

  public render() {
    const { assignmentEvaluationStore, location: { state } } = this.props;

    return (
      <div className="Answers">
        <div className="answerWrapper">
          <div className="answersPhrase">{intl.get('answers.Answers')}</div>
          <div className="assignmentTitle">{state.title}</div>
          {assignmentEvaluationStore!.answersList.map(this.renderResult)}
        </div>

        {this.renderPagination()}
      </div>
    );
  }
}

export const EvaluationComponent = withRouter(EvaluationWrapper);
