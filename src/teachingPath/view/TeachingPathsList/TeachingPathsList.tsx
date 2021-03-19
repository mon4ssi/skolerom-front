import React, { Component, SyntheticEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import debounce from 'lodash/debounce';

import { TeachingPathsListStore } from './TeachingPathsListStore';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import { TabNavigation } from 'components/common/TabNavigation/TabNavigation';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { Pagination } from 'components/common/Pagination/Pagination';
import { EditTeachingPathStore } from '../EditTeachingPath/EditTeachingPathStore';
import { UserType } from 'user/User';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { SideOutPanel } from 'components/common/SideOutPanel/SideOutPanel';

import { DEBOUNCE_TIME } from 'utils/constants';
import { lettersNoEn } from 'utils/lettersNoEn';
import { SortingFilter, StoreState, QueryStringKeys } from 'utils/enums';
import * as QueryStringHelper from 'utils/QueryStringHelper';

import teachingPath from 'assets/images/teaching-path.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';

import './TeachingPathsList.scss';

const limitSplicePathname = 4;
const limitIndex = 2;

interface Props extends RouteComponentProps {
  readOnly?: boolean;
  typeOfTeachingPathsList?: string;
  teachingPathsListStore?: TeachingPathsListStore;
  editTeachingPathStore?: EditTeachingPathStore;
  isContentManager?: boolean;
}

interface State {
  idActiveCard: number | null;
  isTeachingPathPreviewVisible: boolean;
}

@inject('teachingPathsListStore', 'editTeachingPathStore')
@observer
class TeachingPathsListComponent extends Component<Props, State> {

  private locationUpdateListener: () => void = debounce(
    () => {
      const { history } = this.props;
      if (
        history.location.pathname.includes('/teaching-paths') &&
        !history.location.pathname.includes('/edit') &&
        !history.location.pathname.includes('/view')
      ) {
        this.fetchTeachingPaths();
      }
    },
    DEBOUNCE_TIME,
  );

  public state = {
    idActiveCard: null,
    isTeachingPathPreviewVisible: false,
  };

  public tabNavigationLinks = [
    {
      name: 'All teaching paths',
      url: '/teaching-paths/all'
    },
    {
      name: 'My teaching paths',
      url: '/teaching-paths/my'
    },
    // {
    //   name: 'My school',
    //   url: '/teacher/teaching-paths/school'
    // },
    // {
    //   name: 'My favorites',
    //   url: '/teacher/teaching-paths/favorites'
    // }
  ];

  private unregisterListener: () => void = () => undefined;

  private fetchTeachingPaths() {
    const { filter } = this.props.teachingPathsListStore!;

    filter.page = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.PAGE, 1);
    filter.grade = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE);
    filter.subject = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT);
    filter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH);
    filter.order = QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER, SortingFilter.DESC);
    filter.orderField = SortingFilter.CREATION_DATE;

    this.props.teachingPathsListStore!.getTeachingPathsList();
  }

  public async componentDidMount() {
    this.setCurrentTab();
    this.fetchTeachingPaths();
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
  }

  public componentDidUpdate = async (prevProps: Props) => {
    const { typeOfTeachingPathsList } = this.props;

    if (prevProps.typeOfTeachingPathsList !== typeOfTeachingPathsList) {
      this.setCurrentTab();
    }
  }

  public componentWillUnmount() {
    this.unregisterListener();
    this.props.teachingPathsListStore!.resetTeachingPathsList();
  }

  public setCurrentTab = async () => {
    const { teachingPathsListStore, location } = this.props;

    const type = location.pathname.split('/', limitSplicePathname)[limitIndex];
    teachingPathsListStore!.setTypeOfTeachingPathsList(type);
  }

  public openAssignmentPreview = (id: number) => {
    this.unregisterListener();
    this.props.teachingPathsListStore!.setCurrentTeachingPath(id);
    this.setState({ isTeachingPathPreviewVisible: true });
  }

  public onClickTeachingPath = (id: number, view?: string) => {
    const { teachingPathsListStore, history } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;

    switch (currentUserType) {
      case UserType.Teacher:
      case UserType.ContentManager:
        if (view === 'show') {
          history.push(`/teaching-paths/view/${id}`);
          break;
        }
        history.push(`/teaching-paths/edit/${id}`);
        break;
      case UserType.Student:
        this.openAssignmentPreview(id);
        break;
      default:
        break;
    }
  }

  public createTeachingPath = async () => {
    const { editTeachingPathStore, history } = this.props;
    const id = await editTeachingPathStore!
      .createTeachingPath()
      .then(response => response.id);
    history.push(`/teaching-paths/edit/${id}`);
  }

  public handleChangeSubject = (e: React.ChangeEvent<HTMLSelectElement>) => {
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.SUBJECT,
      Number(e.currentTarget.value) ? e.currentTarget.value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleChangeGrade = (e: React.ChangeEvent<HTMLSelectElement>) => {
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GRADE,
      Number(e.currentTarget.value) ? e.currentTarget.value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleChangeSorting = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [orderField, order] = e.currentTarget.value.split(' ');
    QueryStringHelper.set(this.props.history, QueryStringKeys.ORDER_FIELD, orderField);
    QueryStringHelper.set(this.props.history, QueryStringKeys.ORDER, order);
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleInputSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.target.value)) {
      QueryStringHelper.set(this.props.history, QueryStringKeys.SEARCH, e.currentTarget.value);
      QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
    }
  }

  public renderTabNavigate = () => {
    const { readOnly } = this.props;

    if (!readOnly) {
      return (
        <TabNavigation
          textMainButton={intl.get('teaching_path_tabs.new teaching path')}
          onClickMainButton={this.createTeachingPath}
          tabNavigationLinks={this.tabNavigationLinks}
          sourceTranslation={'teaching_path_tabs'}
        />
      );
    }
    return null;
  }

  public onChangePage = ({ selected }: { selected: number }) => {
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, selected + 1);
  }

  public setActiveTooltip = (id: number) => () => {
    if (id === this.state.idActiveCard) {
      return this.setState({ idActiveCard: null });
    }
    return this.setState({ idActiveCard: id });
  }

  public deleteTeachingPath = (id: number) => async () => {
    const { teachingPathsListStore, editTeachingPathStore } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;

    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
      this.setState({ idActiveCard: null });
      await editTeachingPathStore!.deleteTeachingPathById(id);
      if (teachingPathsListStore!.teachingPathsList.length) {
        await teachingPathsListStore!.getTeachingPathsList();
      } else {
        teachingPathsListStore!.setFiltersPage(
          teachingPathsListStore!.currentPage! - 1
        );
      }
    }
  }

  public copyTeachingPath = async (id: number) => {
    const { teachingPathsListStore, history } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;

    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
      const copyId = await teachingPathsListStore!.copyEntity(id);
      history.push(`/teaching-paths/edit/${copyId}`);
    }
  }

  public renderTeachingPathCards = () => {
    const { teachingPathsListStore } = this.props;
    const { idActiveCard } = this.state;

    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;

    const teachingPaths = teachingPathsListStore!.teachingPathsState === StoreState.LOADING ?
      teachingPathsListStore!.teachingPathsForSkeleton :
      teachingPathsListStore!.teachingPathsList;

    return teachingPaths.map((item, index) => (
      teachingPathsListStore!.teachingPathsState === StoreState.LOADING ? (
        <SkeletonLoader key={index} className="InfoCard" />
      ) : (
        <InfoCard
          isTeachingPath
          isContentManager={currentUserType === UserType.ContentManager}
          withTooltip={currentUserType !== UserType.Student}
          key={item.id}
          id={item.id}
          title={item.title}
          grades={item.grades}
          description={item.description}
          icon={teachingPath}
          onClick={this.onClickTeachingPath}
          img={item.featuredImage ? item.featuredImage : listPlaceholderImg}
          view={item.view}
          levels={item.levels}
          setActiveTooltip={this.setActiveTooltip(item.id)}
          deleteTeachingPath={this.deleteTeachingPath(item.id)}
          idActiveCard={idActiveCard}
          copyTeachingPath={this.copyTeachingPath}
          isPublished={item.isPublished}
          isDistributed={item.isDistributed}
        />
      )
    )
    );
  }

  public renderPagination = () => {
    const { teachingPathsListStore } = this.props;
    const pages = teachingPathsListStore!.paginationTotalPages;

    if (pages > 1) {
      return (
        <Pagination
          pageCount={pages}
          onChangePage={this.onChangePage}
          page={teachingPathsListStore!.currentPage}
        />
      );
    }
  }

  public closeSlideOutPanel = (e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
    this.setState({ isTeachingPathPreviewVisible: false });
  }

  public renderSlideOutPanel = () => {
    const { teachingPathsListStore } = this.props;

    return (
      <div className="dark" onClick={this.closeSlideOutPanel}>
        <SideOutPanel
          store={teachingPathsListStore}
          onClose={this.closeSlideOutPanel}
        />
      </div>
    );
  }

  public render() {
    const { isTeachingPathPreviewVisible } = this.state;

    return (
      <div className="teachingPathsList">
        {this.renderTabNavigate()}

        <SearchFilter
          subject
          grade
          popularity
          placeholder={intl.get('teaching path search.Search for teaching paths')}
          // METHODS
          handleChangeSubject={this.handleChangeSubject}
          handleChangeGrade={this.handleChangeGrade}
          handleChangeSorting={this.handleChangeSorting}
          handleInputSearchQuery={this.handleInputSearchQuery}
          // VALUES
          gradeFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE)}
          subjectFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT)}
          isAnsweredFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_ANSWERED)}
          isEvaluatedFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_EVALUATED)}
          orderFieldFilterValue={SortingFilter.CREATION_DATE}
          orderFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER)}
          searchQueryFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH)}
        />

        <div className="cardList">
          {this.renderTeachingPathCards()}
        </div>

        {this.renderPagination()}
        {isTeachingPathPreviewVisible && this.renderSlideOutPanel()}
      </div>
    );
  }
}

export const TeachingPathsList = withRouter(TeachingPathsListComponent);
