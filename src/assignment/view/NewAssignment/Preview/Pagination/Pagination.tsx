import React, { Component } from 'react';
import './Pagination.scss';
import classnames from 'classnames';
import ReactPaginate from 'react-paginate';

import { observer, inject } from 'mobx-react';
import { CreationElements, NewAssignmentStore } from '../../NewAssignmentStore';
import { UIStore } from 'locales/UIStore';
import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { Locales } from 'utils/enums';

interface Props {
  currentAssignment?: DraftAssignment;
  newAssignmentStore?: NewAssignmentStore;
  uiStore?: UIStore;
}

interface NewSelectedPage {
  selected: number;
}

@inject('uiStore')
@inject('newAssignmentStore')
@observer
export class Pagination extends Component<Props> {
  private onPageChange = (newSelectedPage: NewSelectedPage) => {
    this.props.newAssignmentStore!.setCurrentContentBlock(-1, -1);
    this.props.newAssignmentStore!.setPreviewQuestionByIndex(
      newSelectedPage.selected
    );
    this.props.newAssignmentStore!.setHighlightingItem(CreationElements.Questions, newSelectedPage.selected);
  }

  public render() {
    const {
      currentEntity: currentAssignment,
      currentPreviewQuestion
    } = this.props.newAssignmentStore!;

    const { uiStore } = this.props;
    const activeLinkClassName = classnames(
      'activePage',
      uiStore!.currentLocale === Locales.EN ? Locales.EN : Locales.NB
    );

    const MARGIN = 2;

    return (
      <ReactPaginate
        pageCount={currentAssignment!.questions.length}
        containerClassName="NewAssignmentPreviewPagination flexBox alignCenter"
        pageRangeDisplayed={1}
        marginPagesDisplayed={MARGIN}
        forcePage={currentPreviewQuestion}
        pageClassName="linkPageWrapper"
        breakClassName="linkPageWrapper"
        breakLinkClassName="linkPage flexBox alignCenter"
        pageLinkClassName="linkPage flexBox alignCenter"
        activeClassName="activePage"
        activeLinkClassName={activeLinkClassName}
        disabledClassName="disabled"
        previousClassName="controls"
        nextClassName="controls"
        onPageChange={this.onPageChange}
      />
    );
  }
}
