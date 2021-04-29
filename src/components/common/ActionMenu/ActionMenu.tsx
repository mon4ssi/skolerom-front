import React, { Component, SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { LocationDescriptor } from 'history';
import onClickOutside from 'react-onclickoutside';
import classNames from 'classnames';
import uniqueId from 'lodash/uniqueId';

import './ActionMenu.scss';

export enum ActionMenuItemType {
  LINK,
  BUTTON
}

export enum CaretVerticalPosition {
  TOP,
  BOTTOM
}

export enum CaretHorizontalPosition {
  LEFT,
  RIGHT
}

export interface CaretHorizontalPositionRule {
  maxWidth?: number;
  minWidth?: number;
  side: CaretHorizontalPosition;
  indent: number;
}

export interface ActionMenuItemLink<T = object> {
  type: ActionMenuItemType.LINK;
  text: string;
  link: LocationDescriptor<T>;
  disabled?: boolean;
}

export interface ActionMenuItemButton {
  type: ActionMenuItemType.BUTTON;
  text: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}

interface ActionMenuProps {
  list: Array<ActionMenuItemLink | ActionMenuItemButton>;
  onClose: () => void;
  caretVerticalPosition?: CaretVerticalPosition;
  // don't be scared of it. it just batch of CSS media rules presented in js
  caretHorizontalPositionRules: Array<CaretHorizontalPositionRule>;
}

class ActionMenu extends Component<ActionMenuProps> {
  private readonly _id = uniqueId('ActionMenu');

  private stopRootPropagation(e: SyntheticEvent) {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
  }

  private generateMediaRule() {
    return this.props.caretHorizontalPositionRules.reduce(
      (acc, rule) => {
        let attributeName;

        switch (rule.side) {
          case CaretHorizontalPosition.RIGHT:
            attributeName = 'rigth';
            break;

          case CaretHorizontalPosition.LEFT:
            attributeName = 'left';
            break;

          // impossible variant
          default:
            attributeName = 'none';
        }

        let breakpoint = '';
        if (rule.maxWidth && rule.minWidth) {
          breakpoint = `and (max-width: ${rule.maxWidth}px and min-width: ${rule.minWidth}px)`;
        } else if (rule.maxWidth) {
          breakpoint = `and (max-width: ${rule.maxWidth}px)`;
        } else if (rule.minWidth) {
          breakpoint = `and (min-width: ${rule.minWidth}px)`;
        }

        return `${acc}

        @media screen ${breakpoint} {
          #${this._id} {
            ${attributeName}: ${rule.indent}px;
          }
        }`;
      },
      '');
  }

  private renderItem(item: ActionMenuItemLink | ActionMenuItemButton) {
    switch (item.type) {
      case ActionMenuItemType.LINK:
        if (item.disabled) {
          return (
            <li key={item.text} className="ActionMenu__item ActionMenu__item__disabled">
              {item.text}
            </li>
          );
        }
        return (
          <li key={item.text} className="ActionMenu__item">
            <Link className="ActionMenu__actionTarget" to={item.link}>
              {item.text}
            </Link>
          </li>
        );

      case ActionMenuItemType.BUTTON:
        return (
          <li key={item.text} className={`ActionMenu__item ${item.disabled && 'ActionMenu__item__disabled'}`}>
            <button className={`ActionMenu__actionTarget ${item.disabled && 'ActionMenu__item__disabled'}`} onClick={item.onClick} title={item.text}>
              {item.text}
            </button>
          </li>
        );

      // impossible case but should be covered
      default:
        return null;
    }
  }

  public handleClickOutside = () => this.props.onClose();

  public render() {
    const { caretVerticalPosition = CaretVerticalPosition.TOP } = this.props;
    const caretClasses = classNames('ActionMenu__caret', {
      ActionMenu__caret_bottom: caretVerticalPosition === CaretVerticalPosition.BOTTOM,
    });

    return (
      <div className="ActionMenu" onClick={this.stopRootPropagation}>
        <style>
          {this.generateMediaRule()}
        </style>
        <ul className="ActionMenu__list">
          {this.props.list.map(this.renderItem)}
        </ul>
        <i id={this._id} className={caretClasses} />
      </div>
    );
  }
}

const ActionMenuComponent = onClickOutside(ActionMenu);
export { ActionMenuComponent as ActionMenu };
