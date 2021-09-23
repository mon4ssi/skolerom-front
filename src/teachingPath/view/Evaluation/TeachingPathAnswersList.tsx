import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { TeachingPathEvaluationStore } from 'teachingPath/evaluationDraft/TeachingPathEvaluationStore';

import './TeachingPathAnswersList.scss';
import { AnswersList } from 'evaluation/EvaluateAnswer/AnswersList';

interface Props {
  teachingPathEvaluationStore?: TeachingPathEvaluationStore;
}

@inject('teachingPathEvaluationStore')
@observer
export class TeachingPathAnswersList extends Component<Props> {

  public render() {
    const { teachingPathEvaluationStore } = this.props;

    return (
      <div>
        <AnswersList store={teachingPathEvaluationStore!} />
      </div>
    );
  }
}
