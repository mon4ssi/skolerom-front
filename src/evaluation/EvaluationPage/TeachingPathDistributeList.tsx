import debounce from 'lodash/debounce';
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { TeachingPath, TeachingPathsList } from 'teachingPath/TeachingPath';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import { StoreState, QueryStringKeys } from 'utils/enums';
import teachingPathIcon from 'assets/images/teaching-path.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';

import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';

import './TeachingPathDistributeList.scss';

const ITEMS_PER_PAGE = 8;
const DEFAULT_ORDER_FIELD = 'deadline';
const DEFAULT_ORDER = 'desc';
const DEBOUNCE_TIME = 500;

interface ITeachingPathDistributeListProps {
  teachingPathsListStore?: TeachingPathsListStore;
}

@inject('teachingPathsListStore')
@observer
class TeachingPathDistributeList extends Component<ITeachingPathDistributeListProps & RouteComponentProps> {

  public locationUpdateListener: () => void = debounce(
    () => {
      const { history } = this.props;

      if (history.location.pathname.includes('/evaluation')) {
        this.fetchDistributes();
      }
    },
    DEBOUNCE_TIME,
  );

  public unregisterListener: () => void = () => undefined;

  public onClickTeachingPath = (id: number, view?: string) => {
    const { teachingPathsListStore, history } = this.props;
    history.push(`/teaching-paths/answers/${id}`);
  }

  public renderDistribute = (item: TeachingPath, index: number) => {
    const { teachingPathList, teachingPathsState } = this.props.teachingPathsListStore!;

    return teachingPathsState === StoreState.LOADING ? (
      <SkeletonLoader key={index} className="TeachingPathDistributeItemSkeleton" />
    ) : (
      <div className="TeachingPathDistributeItem" key={item.id}>
        <InfoCard
          isTeachingPath
          key={item.id}
          id={item.id}
          title={item.title}
          grades={item.grades}
          description={item.description}
          icon={teachingPathIcon}
          onClick={this.onClickTeachingPath}
          img={item.featuredImage ? item.featuredImage : listPlaceholderImg}
          view={item.view}
          levels={item.levels}
          isPublished={item.isPublished}
        />
      </div>
    );
  }

  public async componentDidMount() {
    const { filter } = this.props.teachingPathsListStore!;
    this.fetchDistributes();
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
  }

  public fetchDistributes() {
    const { filter } = this.props.teachingPathsListStore!;

    filter.per_page = ITEMS_PER_PAGE;
    filter.page = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.PAGE);
    filter.grade = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE);
    filter.subject = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT);
    filter.order = QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER, DEFAULT_ORDER);
    filter.orderField = DEFAULT_ORDER_FIELD;
    filter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH);
    filter.isActive = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.ACTIVITY);

    this.props.teachingPathsListStore!.getTeachingPathDistributeList(filter);
  }

  public componentWillUnmount(): void {
    this.unregisterListener();
  }

  public render() {
    return (
      <div className="TeachingPathDistributeList" id="List" aria-live="polite">
        {this.props.teachingPathsListStore!.teachingPathList.map(this.renderDistribute)}
      </div>
    );
  }
}

const pageWithRouter = withRouter(TeachingPathDistributeList);
export { pageWithRouter as TeachingPathDistributeList };
