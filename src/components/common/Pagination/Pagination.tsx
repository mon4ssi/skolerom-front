import React, { Component } from 'react';
import intl from 'react-intl-universal';
import ReactPaginate from 'react-paginate';
import isNil from 'lodash/isNil';

import './Pagination.scss';
import { MOBILE_WIDTH } from '../../../utils/constants';

interface Props {
  pageCount: number;
  page?: number | null;
  onChangePage(newSelectedPage: { selected: number }): void;
}

export class Pagination extends Component<Props> {
  public render() {
    const { pageCount, onChangePage, page } = this.props;
    // tslint:disable-next-line:no-magic-numbers
    const MARGIN = window.screen.width > MOBILE_WIDTH ? 2 : 0;
    // tslint:disable-next-line:no-magic-numbers
    const RANGE = window.screen.width > MOBILE_WIDTH ? 2 : 0;

    const forcePageObj: { forcePage?: number } = {};
    if (!isNil(page)) {
      forcePageObj.forcePage = page - 1;
    }

    const isHidePrevLabel = (!isNil(page) && page === 1) || isNil(page) ? 'hide' : '';
    const isHideNextLabel = (!isNil(page) && page === pageCount) ? 'hide' : '';

    return (
      <ReactPaginate
        pageCount={pageCount}
        containerClassName="MyListPagination flexBox alignCenter"
        pageRangeDisplayed={RANGE}
        marginPagesDisplayed={MARGIN}
        pageClassName="linkPageWrapper"
        breakClassName="linkPageWrapper break"
        breakLinkClassName="linkPage flexBox alignCenter"
        pageLinkClassName="linkPage flexBox alignCenter"
        activeClassName="activePage"
        activeLinkClassName="activePage"
        previousLabel={intl.get('pagination.Previous page')}
        nextLabel={intl.get('pagination.Next page')}
        previousClassName={`controls flexBox alignCenter ${isHidePrevLabel}`}
        nextClassName={`controls control-next flexBox alignCenter ${isHideNextLabel}`}
        onPageChange={onChangePage}
        {...forcePageObj}
      />
    );
  }
}
