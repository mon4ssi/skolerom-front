import debounce from 'lodash/debounce';
import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  Grade
} from '../../assignment/Assignment';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { TeachingPath, TeachingPathsList } from 'teachingPath/TeachingPath';
import moment from 'moment';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import { StoreState, QueryStringKeys } from 'utils/enums';
import { postperpage } from 'utils/constants';
import teachingPathIcon from 'assets/images/teaching-path.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';

import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';

import './TeachingPathDistributeList.scss';

const ITEMS_PER_PAGE = 8;
const MAGIC_VEINTE = postperpage;
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

  public onClickTeachingPath = (id: number) => {
    const { teachingPathsListStore, history } = this.props;
    history.push(`/teaching-paths/answers/${id}`);
  }

  public getGrades = (grade: Grade) => {
    if (grade.title) {
      const title = grade.title.split('.', 1);
      return (
        <div key={grade.id}>
          {title}{intl.get('new assignment.indicadorgrade')}
        </div>
      );
    }
  }

  public renderDistribute = (item: TeachingPath, index: number) => {
    const { teachingPathList, teachingPathsState } = this.props.teachingPathsListStore!;
    const studentsLabel = item.totalDistributes === 1
      ? intl.get('evaluation_page.student')
      : intl.get('evaluation_page.students');
    return teachingPathsState === StoreState.LOADING ? (
      <SkeletonLoader key={index} className="TeachingPathDistributeItemSkeleton" />
    ) : (
      <div className="TeachingPathItemDistribute" key={item.id}>
        <a href="javascript:void(0)" onClick={() => this.onClickTeachingPath(item.id)} >
          <div className="AssignmentDistribute">
            <div className="AssignmentDistribute__block AssignmentDistribute__blockTop">
              <div className="AssignmentDistribute__imageContainer">
                <img src={item.featuredImage ? item.featuredImage : listPlaceholderImg} alt="distribute-img" className="AssignmentDistribute__image" />
              </div>
              <div className="AssignmentDistribute__textBlock AssignmentDistribute__title">{item.title}</div>
              <div className="AssignmentDistribute__textBlock AssignmentDistribute__questions AssignmentDistribute__questions_mobile">
                {item.grades.map(this.getGrades)}
              </div>
            </div>
            <div className="AssignmentDistribute__block AssignmentDistribute__blockBottom">
              <div className="AssignmentDistribute__textBlock AssignmentDistribute__students">
                {item.answeredDistributes} {intl.get('evaluation_page.of')} {item.totalDistributes} {studentsLabel}
              </div>
            </div>
          </div>
        </a>
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

    filter.per_page = MAGIC_VEINTE;
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
      <div className="TeachingPathDistributeListNotFlex" id="List" aria-live="polite">
        {this.props.teachingPathsListStore!.teachingPathList.map(this.renderDistribute)}
      </div>
    );
  }
}

const pageWithRouter = withRouter(TeachingPathDistributeList);
export { pageWithRouter as TeachingPathDistributeList };
