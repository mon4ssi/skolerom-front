import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import { Link } from 'react-router-dom';
import { LocationDescriptor } from 'history';
import onClickOutside from 'react-onclickoutside';

interface ActionMenuProps {
  id: number;
  assignment?: boolean;
  onClose: () => void;
  editTeachingPath: () => void;
  viewTeachingPath?: () => void;
  copyTeachingPath: () => void;
  deleteTeachingPath: () => void;
}

class ActionMenu extends Component<ActionMenuProps> {
  public handleClickOutside = () => this.props.onClose();
  public render() {
    if (this.props.assignment) {
      return (
        <div className="cardInfoItem__tooltip">
          <ul className="flexBox dirColumn">
            <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="#" onClick={() => { this.props.copyTeachingPath(); }}>{intl.get('assignment list.Copy assignment')}</a></li>
          </ul>
        </div>
      );
    }
    return (
      <div className="cardInfoItem__tooltip">
        <ul className="flexBox dirColumn">
          <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="#" onClick={() => { this.props.viewTeachingPath!(); }}>{intl.get('teaching_paths_list.view')}</a></li>
          <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="#" onClick={() => { this.props.copyTeachingPath(); }}>{intl.get('teaching_paths_list.copy')}</a></li>
        </ul>
      </div>
    );
  }
}
const ActionMenuComponent = onClickOutside(ActionMenu);
export { ActionMenuComponent as ActionMenu };
