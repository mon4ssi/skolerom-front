import debounce from 'lodash/debounce';
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
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

interface ITeachingPathDistributeListProps {
  teachingPathsListStore?: TeachingPathsListStore;
}

@inject('teachingPathsListStore')
@observer
class TeachingPathDistributeList extends Component<ITeachingPathDistributeListProps & RouteComponentProps> {
}

const pageWithRouter = withRouter(TeachingPathDistributeList);
export { pageWithRouter as TeachingPathDistributeList };
