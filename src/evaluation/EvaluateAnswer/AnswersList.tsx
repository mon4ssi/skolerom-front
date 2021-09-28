import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';

import * as QueryStringHelper from 'utils/QueryStringHelper';
import { CheckingPanel } from 'assignment/view/Evaluation/CheckingPanel';
import { AssignmentEvaluationStore } from 'assignment/EvaluationDraft/AssignmentEvaluationStore';
import { TeachingPathEvaluationStore } from 'teachingPath/evaluationDraft/TeachingPathEvaluationStore';
import { EditableEvaluation } from 'evaluation/Evaluation';
import { Pagination } from 'components/common/Pagination/Pagination';
import { AssignmentAnswer } from 'assignment/view/Evaluation/AssignmentAnswer';

import './AnswersList.scss';
import { EntityType, StoreState, QueryStringKeys } from 'utils/enums';
import { Loader } from '../../components/common/Loader/Loader';

type TParams = { entityId: string };

interface AssignmentAnswerListProps {
  store?: AssignmentEvaluationStore | TeachingPathEvaluationStore;
}

const ANSWER = 'answer';

@observer
class AnswersList extends Component<AssignmentAnswerListProps & RouteComponentProps<TParams>> {

  public componentWillUnmount() {
    this.props.store!.setCurrentEvaluation();
  }

  public componentDidMount = async () => {
    const { store } = this.props;

    const page = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.PAGE, 1);
    store!.getAnswersByPage(page!, Number(this.props.match.params.entityId));
    await store!.getCurrentEntity(Number(this.props.match.params.entityId));
    const answerId = QueryStringHelper.getNumber(this.props.history, ANSWER);

    if (answerId) {
      store!.setCurrentEvaluation(answerId);
      await store!.getDraftAnswersById();
      await store!.getAnswersById();
      return;
    }

    QueryStringHelper.remove(this.props.history, ANSWER);
  }

  public handleResultPanel = (answer: EditableEvaluation) => async () => {
    const { store } = this.props;

    if (!answer.isAnswered) {
      return;
    }

    if (store!.currentEvaluation && store!.currentEvaluation.answerId === answer.answerId) {
      QueryStringHelper.remove(this.props.history, ANSWER);
      store!.setCurrentEvaluation();
      return;
    }
    store!.setCurrentEvaluation(answer.answerId);
    QueryStringHelper.set(this.props.history, ANSWER, answer.answerId);

    await store!.getDraftAnswersById();
    await store!.getAnswersById();
    if (store instanceof AssignmentEvaluationStore) {
      await store!.getRelatedArticles();
    }
    return;
  }

  public save = (answer: EditableEvaluation) => async () => {
    const { store } = this.props;

    await store!.publishEvaluation();
    await this.handleResultPanel(answer)();
  }

  public renderCheckingPanel = (type: EntityType, result: EditableEvaluation) => {
    const { store } = this.props;

    if (store!.currentEvaluation && store!.currentEvaluation.answerId === result.answerId) {
      return (
        <CheckingPanel save={this.save(result)} type={type} store={store}/>
      );
    }
  }

  public renderResult = (result: EditableEvaluation) => {
    const { store } = this.props;

    const locale = store!.currentLocale;

    if (store instanceof AssignmentEvaluationStore) {
      return (
        <div className="AnswerList__item" key={result.studentId}>
          <AssignmentAnswer
            result={result}
            onClick={this.handleResultPanel(result)}
            locale={locale}
          />
          {this.renderCheckingPanel(EntityType.ASSIGNMENT, result)}
        </div>
      );
    }

    if (store instanceof TeachingPathEvaluationStore) {
      return (
        <div className="AssignmentAnswerList__item" key={result.studentId}>
          <AssignmentAnswer
            result={result}
            onClick={this.handleResultPanel(result)}
            locale={locale}
          />
          {this.renderCheckingPanel(EntityType.TEACHING_PATH, result)}
        </div>
      );
    }
  }

  public renderPaginationIfNeeded = () => {
    const { store, history } = this.props;

    return store!.paginationTotalPages > 1 && (
      <Pagination
        page={QueryStringHelper.getNumber(history, QueryStringKeys.PAGE, 1)}
        pageCount={store!.paginationTotalPages}
        onChangePage={this.onChangePage}
      />
    );
  }

  public onChangePage = ({ selected }: { selected: number }) => {
    const { store, match, history } = this.props;

    QueryStringHelper.set(history, QueryStringKeys.PAGE, selected + 1);
    store!.getAnswersByPage(selected + 1, Number(match.params.entityId));
  }

  public renderBreadcrumbs = () => {
    const { store } = this.props;
    const isAssingment = this.props.history.location.pathname.includes('/assignments');
    const isStudentRedirect = this.props.history.location.search.includes('isstudent');
    const title = (isStudentRedirect) ? intl.get('evaluation_page.students') : intl.get('evaluation_page.title');

    if (isStudentRedirect) {
      return (
        <div className="AnswerList__breadcrumbs">
          <ul>
            <li>
              <Link to="/students/my">
                {title}
              </Link>
            </li>
            <li className="separator">/</li>
            <li className="item">
              <p>{intl.get('evaluation_page.Assignments')}</p>
            </li>
          </ul>
        </div>
      );
    }
    if (isAssingment) {
      return (
        <div className="AnswerList__breadcrumbs">
          <ul>
            <li>
              <Link to="/evaluation/assignments">
                {title}
              </Link>
            </li>
            <li className="separator">/</li>
            <li className="item">
              <p>{intl.get('evaluation_page.Assignments')}</p>
            </li>
          </ul>
        </div>
      );
    }
    return (
      <div className="AnswerList__breadcrumbs">
        <ul>
          <li>
            <Link to="/evaluation/teaching-paths">
            {title}
            </Link>
          </li>
          <li className="separator">/</li>
          <li className="item">
            <p>{intl.get('evaluation_page.Teaching paths')}</p>
          </li>
        </ul>
      </div>
    );
  }

  public render() {
    const { store } = this.props;
    if (store!.answersListState === StoreState.LOADING || store!.currentEntityState === StoreState.LOADING) {
      return <div className={'loading'}><Loader /></div>;
    }

    return (
      <div className="AnswerList">
        <div className="AnswerList__content">
          {this.renderBreadcrumbs()}
          <div className="AnswerList__entityTitle">
            {store!.currentEntity && store!.currentEntity.title}
          </div>
          {store!.answersList.map(this.renderResult)}
        </div>

        <div className="AnswerList__pagination">
          {this.renderPaginationIfNeeded()}
        </div>
      </div>
    );
  }
}

const Answers = withRouter(AnswersList);
export { Answers as AnswersList };
