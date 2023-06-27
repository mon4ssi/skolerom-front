import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import { Link } from 'react-router-dom';
import { LocationDescriptor } from 'history';
import onClickOutside from 'react-onclickoutside';

interface ActionMenuProps {
  id: number;
  onClose: () => void;
  editTeachingPath: (id: number) => void;
  viewTeachingPath: (id: number) => void;
  copyTeachingPath: (id: number) => void;
  deleteTeachingPath: (id: number) => void;
}

class ActionMenu extends Component<ActionMenuProps> {
  public render() {
    return (
      <div className="cardInfoItem__tooltip">
        <ul className="flexBox dirColumn">
        <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={() => { this.props.editTeachingPath(this.props.id); }}>{intl.get('teaching_paths_list.edit')}</a></li>
        <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={() => { this.props.viewTeachingPath(this.props.id); }}>{intl.get('teaching_paths_list.view')}</a></li>
        <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={() => { this.props.copyTeachingPath(this.props.id); }}>{intl.get('teaching_paths_list.copy')}</a></li>
        <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={() => { this.props.deleteTeachingPath(this.props.id); }}>{intl.get('teaching_paths_list.delete')}</a></li>
        </ul>
      </div>
    );
  }
}
const ActionMenuComponent = onClickOutside(ActionMenu);
