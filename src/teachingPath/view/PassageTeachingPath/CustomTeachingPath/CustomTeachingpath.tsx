import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import './DomainTeachingPath.scss';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import domainImg from 'assets/images/app-open-icon.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';
import { QuestionaryTeachingPathStore } from '../../../questionaryTeachingPath/questionaryTeachingPathStore';
import { Domain } from 'assignment/Assignment';

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  finishReading(): void;
}

@inject('questionaryTeachingPathStore')
@observer
export class CustomTeachingPath extends Component<Props> {
  public ref = createRef<HTMLDivElement>();
  public async componentDidMount() {
    const { questionaryTeachingPathStore } = this.props;
    // this.props.questionaryTeachingPathStore!.domainFullInfo();
  }
  public renderContent = () => {
    const { questionaryTeachingPathStore } = this.props;
    return (
        <div className={'articleTeachingPath'}>test</div>
    );
  }
  public render() {
    return this.renderContent();
  }
}
