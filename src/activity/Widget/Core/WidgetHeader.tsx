import React, { Component, SyntheticEvent } from 'react';
import './WidgetHeader.scss';
import optionsImage from 'assets/images/more-with-bg.svg';
import { WidgetTooltip } from '../WidgetTooltip';

interface IWidgetHeaderProps {
  title: string;
  isVisibleContent: boolean;
  onCollapseWidget(): void;
  onOpenSettings?(): void;   // TODO make it required-
}

interface State {
  isVisibleTooltip: boolean;
}

export class WidgetHeader extends Component<IWidgetHeaderProps, State> { // TODO add here menu

  public state = {
    isVisibleTooltip: false
  };

  private handleClickTooltip = (e: SyntheticEvent) => {
    const { isVisibleTooltip } = this.state;
    e.stopPropagation();
    this.setState({ isVisibleTooltip: !isVisibleTooltip });
  }

  private handleClickCollapse = () => {
    this.props.onCollapseWidget();
    this.setState({ isVisibleTooltip: false });
  }

  private closeTooltip = () => {
    this.setState({ isVisibleTooltip: false });
  }

  private renderTooltip = () => {
    const { isVisibleTooltip } = this.state;
    const { isVisibleContent } = this.props;

    if (isVisibleTooltip) {
      return (
        <WidgetTooltip
          isVisibleContent={isVisibleContent}
          handleClickCollapse={this.handleClickCollapse}
          closeTooltip={this.closeTooltip}
        />
      );
    }

  }

  public render() {
    const { title } = this.props;

    return (
      <div className="WidgetHeader" onClick={this.handleClickCollapse}>
        <div className="WidgetHeader__title">{title}</div>
        <img src={optionsImage} alt="Options" className="WidgetHeader__image" onClick={this.handleClickTooltip}/>
        {this.renderTooltip()}
      </div>
    );
  }
}
