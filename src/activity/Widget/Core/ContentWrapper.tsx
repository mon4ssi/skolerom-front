import React, { Component, ReactNode } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import intl from 'react-intl-universal';
import { Loader } from 'components/common/Loader/Loader';
import { StoreState } from 'utils/enums';

import './ContentWrapper.scss';

interface IWidgetContent {
  className?: string;
  state: StoreState;
  children?: ReactNode;
  onCollapseWidget?(): void;
}

const ANIMATION_TIMEOUT = 500;

export class ContentWrapper extends Component<IWidgetContent> {
  private renderLoader(): ReactNode {
    return (
      <div className={this.props.className}>
        <Loader/>
      </div>
    );
  }

  private renderChildren(): ReactNode {
    return this.props.children
      ? this.props.children
      : (
        <div className={this.props.className}>
          <span>{intl.get('activity_page.No available content')}</span>
          <span className={'fw300 collapseTitle'} onClick={this.props.onCollapseWidget}>{intl.get('activity_page.collapse')}</span>
        </div>
      );
  }

  private renderError(): ReactNode {
    return (
      <div className={this.props.className}>
        {intl.get('activity_page.Widget failed to load')}
      </div>
    );
  }

  private renderContent(): ReactNode {
    switch (this.props.state) {
      case StoreState.PENDING:
        return this.renderChildren();
      case StoreState.LOADING:
        return this.renderLoader();
      case StoreState.ERROR:
      default:
        return this.renderError();
    }
  }

  public render() {
    return (
      <TransitionGroup>
        <CSSTransition
          key={this.props.state.toString()}
          classNames="ContentWrapper_animated"
          timeout={ANIMATION_TIMEOUT}
        >
          {this.renderContent()}
        </CSSTransition>
      </TransitionGroup>
    );
  }
}
