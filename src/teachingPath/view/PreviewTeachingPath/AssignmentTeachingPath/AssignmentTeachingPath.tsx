import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { QuestionaryTeachingPathStore } from '../../../questionaryTeachingPath/questionaryTeachingPathStore';
import { inject, observer } from 'mobx-react';

import './AssignmentTeachingPath.scss';
import { InfoCard } from '../../../../components/common/InfoCard/InfoCard';
import { TeachingPathNodeType } from '../../../TeachingPath';
import assignment from 'assets/images/assignment.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';
import { Article, Assignment } from 'assignment/Assignment';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  content?: Array<EditableTeachingPathNode>;
  idTeachingPath?: number;
}

interface State {
  myAssignments: Array<Assignment>;
}

type ComponentProps = Props & RouteComponentProps;

@inject('questionaryTeachingPathStore')
@observer
class AssignmentTeachingPathComponent extends Component<ComponentProps, State> {
  constructor(props: ComponentProps) {
    super(props);
    this.state = {
      myAssignments: []
    };
  }
  public componentDidMount() {
    const { content } = this.props;
    const MyAssingmentsList : Array<Assignment> = [];
    content!.forEach((e) => {
      e.items!.forEach((item) => {
        if (item.type === TeachingPathNodeType.Assignment) {
          if (item.value as Assignment) {
            MyAssingmentsList.push(item.value as Assignment);
          }
        }
      });
    });
    this.setState({ myAssignments : MyAssingmentsList });
  }

  public goToAssignment = (id: number) => () => {
    const { questionaryTeachingPathStore } = this.props;
    /* console.log(this.props.idTeachingPath); */

    this.props.history.push(`/assignments/preview/${id}`, {
      teachingPath: this.props.idTeachingPath,
      node: id
    });
  }

  public renderCards = () => {
    const { questionaryTeachingPathStore } = this.props;
    return this.state.myAssignments.map((item) => {
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
    const { questionaryTeachingPathStore, content } = this.props;
    return (
      <div className={'articleTeachingPath'}>
        <span className={'chooseOne'}>{intl.get('teaching path passing.choose one')}</span>
        <h1 className={'title'}>{content![0].selectQuestion}</h1>
        <div className="cards">
          {this.renderCards()}
        </div>
      </div>
    );
  }
}

export const AssignmentTeachingPath = withRouter(AssignmentTeachingPathComponent);
