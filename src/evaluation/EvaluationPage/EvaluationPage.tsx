import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { TabNavigation } from 'components/common/TabNavigation/TabNavigation';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { Pagination } from 'components/common/Pagination/Pagination';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { SortingFilter, StoreState, QueryStringKeys } from 'utils/enums';

import './EvaluationPage.scss';

const tabNavigationData = {
  tabNavigationLinks: [
    {
      name: 'Assignments',
      url: '/evaluation/assignments',
    },
    {
      name: 'Teaching paths',
      url: '/evaluation/teaching-paths',
    }
  ],
  sourceTranslation: 'evaluation_page',
};

interface IEvaluationPageProps {
  assignmentListStore?: AssignmentListStore;
  teachingPathsListStore?: TeachingPathsListStore;
}

@inject('assignmentListStore')
@inject('teachingPathsListStore')
@observer
class EvaluationPage extends Component<IEvaluationPageProps & RouteComponentProps> {

  private changeGrade = (e: ChangeEvent<HTMLSelectElement>) => {
    if (Number(e.currentTarget.value) > 0) {
      QueryStringHelper.set(this.props.history, QueryStringKeys.GRADE, e.currentTarget.value);
    } else {
      QueryStringHelper.remove(this.props.history, QueryStringKeys.GRADE);
    }
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private changeSubject = (e: ChangeEvent<HTMLSelectElement>) => {
    if (Number(e.currentTarget.value) > 0) {
      QueryStringHelper.set(this.props.history, QueryStringKeys.SUBJECT, e.currentTarget.value);
    } else {
      QueryStringHelper.remove(this.props.history, QueryStringKeys.SUBJECT);
    }
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private changeActivity = (e: ChangeEvent<HTMLSelectElement>) => {
    if (e.currentTarget.value === '2') {
      QueryStringHelper.remove(this.props.history, QueryStringKeys.ACTIVITY);
    } else {
      QueryStringHelper.set(this.props.history, QueryStringKeys.ACTIVITY, e.currentTarget.value);
    }
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private changeSorting = (e: ChangeEvent<HTMLSelectElement>) => {
    const order = e.currentTarget.value.split(' ')[1];
    QueryStringHelper.set(this.props.history, QueryStringKeys.ORDER, order);
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private changeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    QueryStringHelper.set(this.props.history, QueryStringKeys.SEARCH, e.currentTarget.value);
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private onChangePage = ({ selected }: { selected: number }) => {
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, selected + 1);
  }

  private renderPaginationIfNeeded() {
    const { history, assignmentListStore, teachingPathsListStore } = this.props;
    const ifAssigments = history.location.pathname.includes('/assignments');
    const totalPages = (ifAssigments) ? assignmentListStore!.assignmentDistributeList.pages : teachingPathsListStore!.paginationTotalPages;
    const mystate = (ifAssigments) ? assignmentListStore!.assignmentDistributeList.state :  teachingPathsListStore!.teachingPathsState;
    if (totalPages > 1 && mystate === StoreState.PENDING) {
      return (
        <Pagination
          pageCount={totalPages}
          page={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.PAGE, 1)}
          onChangePage={this.onChangePage}
        />
      );
    }
  }

  public async componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboardControl);
  }

  public componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const filterButton = Array.from(document.getElementsByClassName('SearchFilter__select') as HTMLCollectionOf<HTMLElement>);
    if ((event.shiftKey && event.key === 'H') || (event.shiftKey && event.key === 'h')) {
      filterButton[0]!.focus();
    }
  }

  public render() {
    return (
      <div className="EvaluationPage">
        <h1 className="generalTitle">
        {intl.get('evaluation_page.title')}
        </h1>
        <TabNavigation {...tabNavigationData}/>
        <SearchFilter
          subject
          grade
          popularity
          activity
          placeholder={intl.get('evaluation_page.Search for assignments')}
          // VALUES
          gradeFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE)}
          activityFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.ACTIVITY)}
          subjectFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT)}
          orderFieldFilterValue={SortingFilter.DEADLINE}
          orderFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER)}
          searchQueryFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH)}
          // METHODS
          handleChangeGrade={this.changeGrade}
          handleChangeSubject={this.changeSubject}
          handleChangeActivity={this.changeActivity}
          handleChangeSorting={this.changeSorting}
          handleInputSearchQuery={this.changeSearch}
        />
        {this.props.children}
        {this.renderPaginationIfNeeded()}
      </div>
    );
  }
}

const pageWithRouter = withRouter(EvaluationPage);
export { pageWithRouter as EvaluationPage };
