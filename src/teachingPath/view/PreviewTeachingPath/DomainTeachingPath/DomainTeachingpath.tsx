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

interface State {
  canGoToNextQuestion: boolean;
}

@inject('questionaryTeachingPathStore')
@observer
export class DomainTeachingPath extends Component<Props, State> {
  public ref = createRef<HTMLDivElement>();

  public state = {
    canGoToNextQuestion: false
  };

  public async componentDidMount() {
    const { questionaryTeachingPathStore } = this.props;
    this.props.questionaryTeachingPathStore!.domainFullInfo();
  }

  public chooseCard = (domain: Domain) => () => {
    const { id, url } = domain;
    this.props.questionaryTeachingPathStore!.pickUpItem(id);
    this.setState({ canGoToNextQuestion: true });
    window.open(`${url}`, '_blank');
  }

  public renderCards = () => {
    const { questionaryTeachingPathStore } = this.props;
    const length = questionaryTeachingPathStore!.currentDomainList.length;
    return questionaryTeachingPathStore!.currentDomainList.map((item, index) => {
      if (index === length - 1) {
        const passedStyle = item.isRead ? 'passedStyle' : '';
        return (
          <div className={passedStyle} key={item.id} role="region" aria-live="polite" aria-atomic="true">
            <InfoCard
              icon={domainImg}
              title={item.title}
              type="DOMAIN"
              grades={item.grades}
              description={item.description}
              img={(item.featuredImage) ? item.featuredImage : listPlaceholderImg}
              urldomain={item.url}
              onClick={this.chooseCard(item)}
            />
          </div>
        );
      }
    }
    );
  }

  public finishReading = async () => {
    this.props.finishReading();
  }

  public renderContent = () => {
    const { questionaryTeachingPathStore } = this.props;
    return (
      <div className={'articleTeachingPath'}>
        <span className={'chooseOne fs15'}>{intl.get('teaching path passing.choose one')}</span>
        <span className={'title'}>{questionaryTeachingPathStore!.currentNode!.selectQuestion}</span>
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
