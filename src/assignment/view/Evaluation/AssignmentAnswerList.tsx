import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import { AssignmentEvaluationStore } from '../../EvaluationDraft/AssignmentEvaluationStore';
import { AnswersList } from 'evaluation/EvaluateAnswer/AnswersList';

import './AssignmentAnswerList.scss';

type TParams = { assignmentId: string };

interface AssignmentAnswerListProps {
  assignmentEvaluationStore?: AssignmentEvaluationStore;
}

@inject('assignmentEvaluationStore')
@observer
class AssignmentAnswerList extends Component<AssignmentAnswerListProps & RouteComponentProps<TParams>> {

  public render() {
    const { assignmentEvaluationStore } = this.props;
    return (
      <AnswersList
        store={assignmentEvaluationStore!}
      />
    );
  }
}

const AssignmentAnswers = withRouter(AssignmentAnswerList);
export { AssignmentAnswers as AssignmentAnswerList };
