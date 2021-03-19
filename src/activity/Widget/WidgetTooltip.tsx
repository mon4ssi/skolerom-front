import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import intl from 'react-intl-universal';

interface Props {
  isVisibleContent: boolean;
  handleClickCollapse(): void;
  closeTooltip(): void;
}

class WidgetTooltipComponent extends Component<Props> {

  public handleClickOutside = () => {
    this.props.closeTooltip();
  }

  public render() {
    const { isVisibleContent, handleClickCollapse } = this.props;
    return (
      <div className="WidgetHeader__tooltip">
        <ul className="flexBox dirColumn">
          <li className="flexBox" onClick={handleClickCollapse}>
            <span>{isVisibleContent ? intl.get('activity_page.collapse') : intl.get('activity_page.expand')}</span>
          </li>
        </ul>
        <i/>
      </div>
    );
  }
}

export const WidgetTooltip = onClickOutside(WidgetTooltipComponent);
