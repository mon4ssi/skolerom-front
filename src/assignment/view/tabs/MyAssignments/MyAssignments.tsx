import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { NewAssignmentStore } from '../../NewAssignment/NewAssignmentStore';
import { AssignmentListStore } from '../../AssignmentsList/AssignmentListStore';
import { AssignmentsList } from '../../AssignmentsList/AssignmentsList';

import { DEBOUNCE_TIME } from 'utils/constants';
import * as QueryStringHelper from 'utils/QueryStringHelper';

import { QueryStringKeys, SortingFilter, StoreState } from 'utils/enums';

import '../../AssignmentsPage.scss';

interface Props extends RouteComponentProps {
  newAssignmentStore?: NewAssignmentStore;
  assignmentListStore?: AssignmentListStore;
  typeOfAssignmentsList: string;
  testFunction?: Function;
}

@inject('newAssignmentStore', 'assignmentListStore')
@observer
class MyAssignments extends Component<Props> {

  private locationUpdateListener: () => void = debounce(
    () => {
      const { history } = this.props;

      if (history.location.pathname.includes('/assignments/')) {
        this.fetchAssignments();
      }
    },
    DEBOUNCE_TIME,
  );

  private unregisterListener: () => void = () => undefined;

  private async fetchAssignments() {
    /*if (this.props.testFunction !== undefined && typeof this.props.testFunction === 'function') {
      this.props.testFunction(this.props.typeOfAssignmentsList);
    }*/

    const { filter } = this.props.assignmentListStore!;
    const myFilterSchool = (this.props.typeOfAssignmentsList === 'myschool') ? 1 : 0;
    filter.page = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.PAGE, 1);
    filter.locale = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.LOCALE);
    filter.grade = QueryStringHelper.getString(this.props.history, QueryStringKeys.GRADE);
    filter.subject = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT);
    filter.grepCoreElementsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPCOREELEMENTSIDS);
    filter.grepMainTopicsIds = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS);
    filter.grepGoalsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREEPGOALSIDS);
    filter.grepReadingInSubject = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT);
    filter.source = QueryStringHelper.getString(this.props.history, QueryStringKeys.SOURCE);
    filter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH);
    filter.order = QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER, SortingFilter.DESC);
    filter.articles = QueryStringHelper.getString(this.props.history, QueryStringKeys.ARTICLES);
    filter.orderField = SortingFilter.CREATION_DATE;
    filter.showMySchoolTeachingpath = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.MYSCHOOL, myFilterSchool);

    if (filter.locale || filter.subject || filter.grade || filter.grepCoreElementsIds || filter.grepMainTopicsIds || filter.grepGoalsIds || filter.grepReadingInSubject || filter.source) {
      this.setState({ filtersisUsed: true });
    } else {
      this.setState({ filtersisUsed: false });
    }

    await this.props.assignmentListStore!.getAssignmentsList();
  }

  public componentDidMount = async () => {

    const { assignmentListStore, typeOfAssignmentsList } = this.props;

    assignmentListStore!.setTypeOfAssignmentsList(typeOfAssignmentsList);

    await this.fetchAssignments();
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
  }

  public componentDidUpdate = async (prevProps: Props) => {
    const { assignmentListStore, typeOfAssignmentsList, testFunction } = this.props;

    if (prevProps.typeOfAssignmentsList !== typeOfAssignmentsList) {
      assignmentListStore!.setTypeOfAssignmentsList(typeOfAssignmentsList);
    }
  }

  public componentWillUnmount() {
    this.unregisterListener();
    this.props.assignmentListStore!.resetFilters();
  }

  public render() {
    const { assignmentListStore } = this.props;

    const assignments = assignmentListStore!.assignmentsState === StoreState.LOADING ?
      assignmentListStore!.assignmentsForSkeleton :
      assignmentListStore!.getAllMyAssignments();

    return (
      <div className={'assignmentList flexBox dirColumn spaceBetween'}>
        <AssignmentsList
          assignments={assignments}
        />
      </div>
    );
  }
}

const pageWithRouter = withRouter(MyAssignments);
export { pageWithRouter as MyAssignments };
