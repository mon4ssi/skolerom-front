import debounce from 'lodash/debounce';
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { AssignmentDistribute as AssignmentDistributeClass } from 'assignment/Assignment';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { StoreState, QueryStringKeys } from 'utils/enums';
import { AssignmentDistribute } from './AssignmentDistribute';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';

import './AssignmentDistributeList.scss';

const ITEMS_PER_PAGE = 8;
const DEFAULT_ORDER_FIELD = 'deadline';
const DEFAULT_ORDER = 'asc';
const DEBOUNCE_TIME = 500;

interface IAssignmentDistributeListProps {
  assignmentListStore?: AssignmentListStore;
}

@inject('assignmentListStore')
@observer
class AssignmentDistributeList extends Component<IAssignmentDistributeListProps & RouteComponentProps> {
  private locationUpdateListener: () => void = debounce(
    () => {
      const { history } = this.props;

      if (history.location.pathname.includes('/evaluation')) {
        this.fetchDistributes();
      }
    },
    DEBOUNCE_TIME,
  );

  private unregisterListener: () => void = () => undefined;

  private renderDistribute = (distribute: AssignmentDistributeClass, index: number) => {
    const { assignmentDistributeList } = this.props.assignmentListStore!;

    return assignmentDistributeList.state === StoreState.LOADING ? (
      <SkeletonLoader key={index} className="AssignmentDistribute" />
    ) : (
      <div className="AssignmentDistributeItem" key={distribute.id}>
        <AssignmentDistribute distribute={distribute}/>
      </div>
    );
  }

  private fetchDistributes() {
    const { filter } = this.props.assignmentListStore!;

    filter.per_page = ITEMS_PER_PAGE;
    filter.page = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.PAGE);
    filter.grade = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE);
    filter.subject = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT);
    filter.order = QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER, DEFAULT_ORDER);
    filter.orderField = DEFAULT_ORDER_FIELD;
    filter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH);
    filter.isActive = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.ACTIVITY);

    this.props.assignmentListStore!.assignmentDistributeList.getAssignmentDistributes(filter);
  }

  public componentDidMount(): void {
    this.fetchDistributes();
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
  }

  public componentWillUnmount(): void {
    this.unregisterListener();
  }

  public render() {
    return (
      <div className="AssignmentDistributeList" id="List" aria-live="polite">
        {this.props.assignmentListStore!.assignmentDistributeList.distributes.map(this.renderDistribute)}
      </div>
    );
  }
}

const pageWithRouter = withRouter(AssignmentDistributeList);
export { pageWithRouter as AssignmentDistributeList };
