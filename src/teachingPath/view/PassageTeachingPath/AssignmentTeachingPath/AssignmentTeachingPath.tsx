import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { QuestionaryTeachingPathStore } from '../../../questionaryTeachingPath/questionaryTeachingPathStore';
import { inject, observer } from 'mobx-react';

import './AssignmentTeachingPath.scss';
import { InfoCard } from '../../../../components/common/InfoCard/InfoCard';
import assignment from 'assets/images/assignment.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
}

type ComponentProps = Props & RouteComponentProps;

@inject('questionaryTeachingPathStore')
@observer
class AssignmentTeachingPathComponent extends Component<ComponentProps> {

  public componentDidMount() {
    this.props.questionaryTeachingPathStore!.assignmentFullInfo();
  }

  public componentWillUnmount(): void {
    this.props.questionaryTeachingPathStore!.clearAssignmentFullInfo();
  }

  public goToAssignment = (id: number) => () => {
    const { questionaryTeachingPathStore } = this.props;
    questionaryTeachingPathStore!.handleAssignment(true);
    questionaryTeachingPathStore!.pickUpItem(id);

    this.props.history.push(`/assignment/${id}`, {
      teachingPath: questionaryTeachingPathStore!.teachingPathId,
      node: questionaryTeachingPathStore!.pickedItemAssignment!.idNode
    });
  }

  public renderCards = () => {
    const { questionaryTeachingPathStore } = this.props;
    return questionaryTeachingPathStore!.currentListAssignment.map((item) => {
      const passedStyle = item.isSelected ? 'passedStyle' : '';
      return (
         <div className={passedStyle} key={item.id}>
           <InfoCard
             icon={assignment}
             title={item.title}
             grades={item.grades}
             description={item.description}
             img={item.featuredImage ? item.featuredImage : listPlaceholderImg}
             numberOfQuestions={item.numberOfQuestions}
             onClick={this.goToAssignment(item.id)}
           />
         </div>
      );
    }
    );
  }

  public render() {
    const { questionaryTeachingPathStore } = this.props;
    return (
      <div className={'articleTeachingPath'}>
        <span className={'chooseOne'}>{intl.get('teaching path passing.choose one')}</span>
        <span className={'title'}>{questionaryTeachingPathStore!.currentNode!.selectQuestion}</span>
        <div className="cards">
          {this.renderCards()}
        </div>
      </div>
    );
  }
}

export const AssignmentTeachingPath = withRouter(AssignmentTeachingPathComponent);
