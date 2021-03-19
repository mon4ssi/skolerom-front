import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { TeachingPathEvaluationStore } from 'teachingPath/evaluationDraft/TeachingPathEvaluationStore';
import { StudentEvaluationCheckingPanel } from './StudentEvaluationCheckingPanel/StudentEvaluationCheckingPanel';

interface Props extends RouteComponentProps {
  teachingPathsListStore?: TeachingPathsListStore;
  teachingPathEvaluationStore?: TeachingPathEvaluationStore;
}

interface Params {
  id: number;
  answerId: number;
}

@inject('teachingPathsListStore', 'teachingPathEvaluationStore')
@observer
class StudentEvaluation extends Component<Props> {

  public async componentDidMount() {
    const { id, answerId } = this.props.match.params as Params;
    await this.props.teachingPathEvaluationStore!.getEvaluationForStudent(id, answerId);
  }

  public componentWillUnmount() {
    const { teachingPathEvaluationStore } = this.props;
    teachingPathEvaluationStore!.clearStudentEvaluation();
  }

  public render() {
    return (
      <StudentEvaluationCheckingPanel />
    );
  }
}

const StudentEvaluationWithRouter = withRouter(StudentEvaluation);
export { StudentEvaluationWithRouter as StudentEvaluation };
