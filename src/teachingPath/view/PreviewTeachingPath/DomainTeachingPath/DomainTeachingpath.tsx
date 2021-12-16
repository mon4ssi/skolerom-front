import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import './DomainTeachingPath.scss';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import { TeachingPathNodeType } from '../../../TeachingPath';
import domainImg from 'assets/images/app-open-icon.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';
import { QuestionaryTeachingPathStore } from '../../../questionaryTeachingPath/questionaryTeachingPathStore';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { Domain } from 'assignment/Assignment';

interface Props {
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  content?: Array<EditableTeachingPathNode>;
  finishReading(node: EditableTeachingPathNode | undefined): void;
}

interface State {
  canGoToNextQuestion: boolean;
  myDomain: Array<Domain>;
}

@inject('questionaryTeachingPathStore')
@observer
export class DomainTeachingPath extends Component<Props, State> {
  public ref = createRef<HTMLDivElement>();
  constructor(props: Props) {
    super(props);
    this.state = {
      myDomain: [],
      canGoToNextQuestion: false
    };
  }

  public async componentDidMount() {
    const { questionaryTeachingPathStore, content } = this.props;
    const MyDomainList : Array<Domain> = [];
    content!.forEach((e) => {
      e.items!.forEach((item) => {
        if (item.type === TeachingPathNodeType.Domain) {
          if (item.value as Domain) {
            MyDomainList.push(item.value as Domain);
          }
        }
      });
    });
    this.setState({ myDomain : MyDomainList });
  }

  public chooseCard = (domain: Domain) => () => {
    const { id, url } = domain;
    this.setState({ canGoToNextQuestion: true });
    window.open(`${url}`, '_blank');
  }

  public renderCards = () => {
    const { questionaryTeachingPathStore, content } = this.props;
    return this.state.myDomain.map((item, index) => {
      const passedStyle = item.isRead ? 'passedStyle' : '';
      return (
        <div className={passedStyle} key={item.id} role="region" aria-live="polite" aria-atomic="true">
          <InfoCard
            icon={domainImg}
            title={item.title}
            type="DOMAIN"
            grades={item.grades}
            description={item.description}
            img={(item.featuredImage) ? item.featuredImage : (item.image) ? item.image : listPlaceholderImg}
            urldomain={item.url}
            onClick={this.chooseCard(item)}
          />
        </div>
      );
    }
    );
  }

  public finishReading = async () => {
    const { content } = this.props;
    content!.forEach((e) => {
      e.items!.forEach((item) => {
        if (item.type === TeachingPathNodeType.Domain) {
          this.props.finishReading(e);
        }
      });
    });
  }

  public chooseTitle = () => {
    const { questionaryTeachingPathStore } = this.props;
    const length = questionaryTeachingPathStore!.currentArticlesList.length;
    if (length > 1) {
      return (
        <span className={'chooseOne fs15'}>{intl.get('teaching path passing.choose one')}</span>
      );
    }
  }

  public renderContent = () => {
    const { questionaryTeachingPathStore, content } = this.props;
    return (
      <div className={'articleTeachingPath'}>
        <span className={'title'}>{content![0].selectQuestion}</span>
        <div className="cards">
          {this.renderCards()}
        </div>
        <div className="buttonDomain">
          <button
              className="CreateButton"
              onClick={this.finishReading}
              disabled={!this.state.canGoToNextQuestion}
              title="Next"
          >
              {intl.get('pagination.Next page')}
          </button>
        </div>
      </div>
    );
  }

  public render() {
    return this.renderContent();
  }
}
