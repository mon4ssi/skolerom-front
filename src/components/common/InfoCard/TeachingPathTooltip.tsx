import React, { Component, SyntheticEvent } from 'react';
import './InfoCard.scss';
import intl from 'react-intl-universal';
import onClickOutside from 'react-onclickoutside';

interface ActionMenuItem {
  text: string;
  type: string;
  disabled?: boolean;
  onClick(e: SyntheticEvent): void;
}

interface TooltipProps {
  view?: string;
  isContentManager?: boolean;
  isTestAccount?: boolean;
  ownedByMe?: boolean;
  isPublished?: boolean;
  isDistributed?: boolean;
  canEditOrDelete?: boolean;
  preventViewCard(e: SyntheticEvent): void;
  deleteTeachingPath(e: SyntheticEvent): void;
  viewTeachingPath(e: SyntheticEvent): void;
  viewAnswers(e: SyntheticEvent): void;
  handleTooltipVisible(e: SyntheticEvent): void;
  editTeachingPath(e: SyntheticEvent): void;
  copyTeachingPath(e: SyntheticEvent): void;
}

class TeachingPathTooltipComponent extends Component<TooltipProps> {

  // public renderTooltipItems = () => {
  //   const { view, deleteTeachingPath, editTeachingPath, viewTeachingPath, isContentManager } = this.props;
  //
  //   if (isContentManager) {
  //     return (
  //       <>
  //         {view === 'edit' && <li className="fw500 flexBox" onClick={editTeachingPath}>{intl.get('teaching_paths_list.edit')}</li>}
  //         {view === 'show' && <li className="fw500 flexBox" onClick={viewTeachingPath}>{intl.get('teaching_paths_list.view')}</li>}
  //         <li className="fw500 flexBox" onClick={deleteTeachingPath}>{intl.get('teaching_paths_list.delete')}</li>
  //       </>
  //     );
  //   }
  //   return (
  //     <>
  //       {view === 'edit' && <li className="fw500 flexBox" onClick={editTeachingPath}>{intl.get('teaching_paths_list.edit')}</li>}
  //       {view === 'edit' && <li className="fw500 flexBox" onClick={deleteTeachingPath}>{intl.get('teaching_paths_list.delete')}</li>}
  //       {view === 'show' && <li className="fw500 flexBox" onClick={viewTeachingPath}>{intl.get('teaching_paths_list.view')}</li>}
  //     </>
  //   );
  // }

  private getActionList = () => {
    const {
      view,
      deleteTeachingPath,
      editTeachingPath,
      viewTeachingPath,
      isContentManager,
      copyTeachingPath,
      viewAnswers
    } = this.props;

    const myTeachingPathsActions: Array<ActionMenuItem> = [
      {
        text: intl.get('teaching_paths_list.edit'),
        type: 'edit',
        onClick: editTeachingPath
      },
      {
        text: intl.get('teaching_paths_list.view answers'),
        type: 'answers',
        // tslint:disable-next-line:no-empty
        onClick: (this.props.isPublished && this.props.isDistributed) ? viewAnswers : () => { },
        disabled: !(this.props.isPublished && this.props.isDistributed)
      },
      {
        text: intl.get('teaching_paths_list.copy'),
        type: 'copy',
        // tslint:disable-next-line:no-empty
        onClick: this.props.isPublished ? copyTeachingPath : () => { },
        disabled: !this.props.isPublished
      },
      {
        text: intl.get('teaching_paths_list.delete'),
        type: 'delete',
        onClick: deleteTeachingPath,
        disabled: this.props!.ownedByMe!
      }
    ];

    const foreignAllTeachingPathsActions: Array<ActionMenuItem> = [
      {
        text: intl.get('teaching_paths_list.view'),
        type: 'view',
        onClick: viewTeachingPath
      },
      {
        text: intl.get('teaching_paths_list.copy'),
        type: 'copy',
        // tslint:disable-next-line:no-empty
        onClick: this.props.isPublished ? copyTeachingPath : () => { },
        disabled: !this.props.isPublished
      }
    ];

    const contentManagerTeachingPathsActions: Array<ActionMenuItem> = [
      {
        text: view === 'edit' ? intl.get('teaching_paths_list.edit') : intl.get('teaching_paths_list.view'),
        type: 'edit',
        onClick: view === 'edit' ? editTeachingPath : viewTeachingPath
      },
      {
        text: intl.get('teaching_paths_list.copy'),
        type: 'copy',
        // tslint:disable-next-line:no-empty
        onClick: this.props.isPublished ? copyTeachingPath : () => { },
        disabled: !this.props.isPublished
      },
      {
        text: intl.get('teaching_paths_list.delete'),
        type: 'delete',
        onClick: deleteTeachingPath,
        disabled: this.props!.ownedByMe!
      }
    ];

    const ownedByMe = this.props.view! === 'edit';

    /* if (this.props.isTestAccount! && ownedByMe) {
      contentManagerTeachingPathsActions.push({
        text: intl.get('teaching_paths_list.delete'),
        onClick: deleteTeachingPath
      });
    } */

    /*if (isContentManager) {
      if (!this.props.isTestAccount) {
        contentManagerTeachingPathsActions.push({
          text: intl.get('teaching_paths_list.delete'),
          type: 'delete',
          onClick: deleteTeachingPath
        });
      } else {
        if (ownedByMe) {
          contentManagerTeachingPathsActions.push({
            text: intl.get('teaching_paths_list.delete'),
            type: 'delete',
            onClick: deleteTeachingPath
          });
        }
      }
    }*/

    switch (window.location.pathname) {
      case '/teaching-paths/all':
        const originList = view === 'edit' ? myTeachingPathsActions : foreignAllTeachingPathsActions;
        return isContentManager ? contentManagerTeachingPathsActions : originList;

      case '/teaching-paths/myschool':
        const originListmyschool = view === 'edit' ? myTeachingPathsActions : foreignAllTeachingPathsActions;
        return isContentManager ? contentManagerTeachingPathsActions : originListmyschool;

      case '/teaching-paths/my':
        return isContentManager ? contentManagerTeachingPathsActions : myTeachingPathsActions;

      default:
        return [];
    }
  }

  private renderTooltipItems = (list: Array<ActionMenuItem>) =>
    list.map((item, index) => {
      let isPosibleDeleteOrEdit = false;
      switch (item.type) {
        case 'edit':
          if (this.props.canEditOrDelete) {
            isPosibleDeleteOrEdit = true;
          }
          break;
        case 'delete':
          if (this.props.canEditOrDelete) {
            isPosibleDeleteOrEdit = true;
          }
          break;
        default:
          isPosibleDeleteOrEdit = false;
      }
      if (isPosibleDeleteOrEdit) {
        return (
          <li key={index} className={`fw500 flexBox fs15 editOrDeleteValue ${item.disabled && 'disabled'}`}><a href="javascript:void(0)" onClick={item.onClick}>{item.text}</a></li>
        );
      }
      return (
        <li key={index} className={`fw500 flexBox fs15 ${item.disabled && 'disabled'}`}><a href="javascript:void(0)" onClick={item.onClick}>{item.text}</a></li>
      );
    }
  )

  private renderTooltipItemsHandle() {
    const { canEditOrDelete,
      deleteTeachingPath,
      editTeachingPath,
      viewTeachingPath,
      isContentManager,
      copyTeachingPath,
      viewAnswers } = this.props;
    if (canEditOrDelete || window.location.pathname === '/teaching-paths/my') {
      return (
        <ul className="flexBox dirColumn">
          <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={editTeachingPath}>{intl.get('teaching_paths_list.edit')}</a></li>
          <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={viewTeachingPath}>{intl.get('teaching_paths_list.view')}</a></li>
          <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={copyTeachingPath}>{intl.get('teaching_paths_list.copy')}</a></li>
          <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={deleteTeachingPath}>{intl.get('teaching_paths_list.delete')}</a></li>
        </ul>
      );
    }
    return (
      <ul className="flexBox dirColumn">
        <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={viewTeachingPath}>{intl.get('teaching_paths_list.view')}</a></li>
        <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={copyTeachingPath}>{intl.get('teaching_paths_list.copy')}</a></li>
      </ul>
    );
  }

  private decideHanderRender() {
    const { isContentManager } = this.props;
    if (isContentManager) {
      return this.renderTooltipItemsHandle();
    }
    return this.renderTooltipItems(this.getActionList());
  }

  public handleClickOutside = (e: SyntheticEvent) => this.props.handleTooltipVisible(e);

  public render() {
    const { preventViewCard } = this.props;
    return (
      <div className="tooltip" onClick={preventViewCard}>
        <div className="left">
          {this.decideHanderRender()}
          <i />
        </div>
      </div>
    );
  }
}

export const TeachingPathTooltip = onClickOutside(TeachingPathTooltipComponent);
