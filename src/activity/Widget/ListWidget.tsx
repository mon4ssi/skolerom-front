import React, { Component } from 'react';
import { WidgetHeader } from './Core/WidgetHeader';
import { StoreState } from 'utils/enums';
import { ContentWrapper } from './Core/ContentWrapper';

import './ListWidget.scss';

export interface IListWidgetItem {
  id: number;
  text: string;
  imageSrc: string;
  onClick(): void;
}

interface IListWidgetProps {
  state: StoreState;
  title: string;
  items: Array<IListWidgetItem>;
}

interface State {
  isVisibleContent: boolean;
}

export class ListWidget extends Component<IListWidgetProps, State> {

  public state = {
    isVisibleContent: true
  };

  private renderItem(item: IListWidgetItem) {
    return (
      <li className="ListWidget__item" key={item.id} onClick={item.onClick}>
        <div className="ListWidget__text">
          {item.text}
        </div>
        <img src={item.imageSrc} alt="widget_image" className="ListWidget__image"/>
      </li>
    );
  }

  private renderChildrenContent = () => {
    const { items } = this.props;

    if (!items.length) {
      return undefined;
    }

    return (
      <ul className="ListWidget__list">
        {items.map(this.renderItem)}
      </ul>
    );
  }

  private onCollapseWidget = () => {
    const { isVisibleContent } = this.state;

    this.setState({ isVisibleContent: !isVisibleContent });
  }

  private renderContent = () => {
    const { isVisibleContent } = this.state;

    if (isVisibleContent) {
      return (
        <div className="ListWidget__content">
          <ContentWrapper
            state={this.props.state}
            className="ListWidget__loader"
            children={this.renderChildrenContent()}
            onCollapseWidget={this.onCollapseWidget}
          />
        </div>
      );
    }
  }

  public render() {
    const { title } = this.props;
    return (
      <div className="ListWidget">
        <WidgetHeader title={title} onCollapseWidget={this.onCollapseWidget} isVisibleContent={this.state.isVisibleContent}/>
        {this.renderContent()}
      </div>
    );
  }
}
