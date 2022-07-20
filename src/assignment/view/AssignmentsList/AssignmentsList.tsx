import React, { Component, SyntheticEvent } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import intl from 'react-intl-universal';

import { Assignment } from 'assignment/Assignment';
import { AssignmentListStore } from './AssignmentListStore';
import { AssignmentListItem } from './AssignmentListItem';
import { UserType } from 'user/User';
import { LoginStore } from 'user/view/LoginStore';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { injector } from 'Injector';

import './AssignmentsList.scss';
import { StoreState } from 'utils/enums';
import { SideOutPanelPreviewAssignment } from 'components/common/SideOutPanelPreviewAssignment/SideOutPanelPreviewAssignment';
import { AssignmentService, ASSIGNMENT_SERVICE } from 'assignment/service';
import { debounce } from 'lodash';
import { DEBOUNCE_TIME } from 'utils/constants';

interface Props extends RouteComponentProps {
  assignments: Array<Assignment>;
  assignmentListStore?: AssignmentListStore;
  loginStore?: LoginStore;
}

interface State {
  isAssignmentPreviewTeacherCMVisible: boolean;
  isPublishedCurrentAssignment?: boolean;
  view?: string;
}

@inject('assignmentListStore', 'loginStore')
@observer
class AssignmentsList extends Component<Props, State> {
  private assignmentService: AssignmentService = injector.get(ASSIGNMENT_SERVICE);
  private isContentManager = !!this.props.loginStore!.currentUser && this.props.loginStore!.currentUser.type === UserType.ContentManager;

  private locationUpdateListener: () => void = debounce(
    () => {
      const { history } = this.props;
      if (
        history.location.pathname.includes('/assignments') &&
        !history.location.pathname.includes('/edit') &&
        !history.location.pathname.includes('/view')
      ) {
        /* console.log('ok'); */
      }
    },
    DEBOUNCE_TIME,
  );

  public constructor(props: Props) {
    super(props);
    this.state = {
      isAssignmentPreviewTeacherCMVisible: false,
      isPublishedCurrentAssignment: false,
      view: '',
    };
  }

  public componentDidMount() {
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
  }

  public copyAssignment = async (id: number) => {
    const { assignmentListStore, history } = this.props;

    const copyId = await assignmentListStore!.copyEntity(id);
    history.push(`/assignments/edit/${copyId}`);
  }

  public closeSlideOutPanel = (e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
    /* this.setState({ isAssignmentPreviewVisible: false }); */
    this.setState({ isAssignmentPreviewTeacherCMVisible: false });
  }

  public renderSlideOutPanelAssignmentTeacherCM = () => {
    const { assignmentListStore } = this.props;
    const { isPublishedCurrentAssignment, view } = this.state;
    const tempIsPublishedCurrentAssignment = isPublishedCurrentAssignment!;
    return (
      <div className="dark" onClick={this.closeSlideOutPanel}>
        <SideOutPanelPreviewAssignment
          view={view!}
          isPublishedCurrentAssignment={tempIsPublishedCurrentAssignment}
          store={assignmentListStore}
          onClose={this.closeSlideOutPanel}
        />
      </div>
    );
  }

  public unregisterListener: () => void = () => undefined;

  public manageAssignmentAction = async (id: number, userType?: UserType, viewAssignment?: string) => {
    const { assignmentListStore, history } = this.props;
    this.unregisterListener();
    this.props.assignmentListStore!.setCurrentAssignment(id);
    this.setState({ view: viewAssignment });
    const { currentAssignment } = assignmentListStore!;
    /* console.log(currentAssignment!); */
    switch (userType) {
      case UserType.ContentManager:
      case UserType.Teacher:
        if (!currentAssignment!.isPublished) {
          history.push(`/assignments/edit/${id}`);
        } else {
          this.setState({ isPublishedCurrentAssignment: true });
          const response: Assignment = await this.assignmentService.getAssignmentById(currentAssignment!.id);
          this.props.assignmentListStore!.setCurrentAssignmentEntity(response);

          /* this.props.assignmentListStore!.setCurrentAssignment(id); */
          this.setState({ isAssignmentPreviewTeacherCMVisible: true });
        }
        break;
      case UserType.Student:
        this.unregisterListener();
        this.props.assignmentListStore!.setCurrentAssignment(id);
      /* this.setState({ isAssignmentPreviewTeacherCMVisible: true }); */
      default:
        break;
    }

  }

  public onClickAssignment = (id: number, view?: string) => {
    const { assignmentListStore, history } = this.props;
    const currentUserType = assignmentListStore!.getCurrentUser()!.type;
    switch (currentUserType) {
      case UserType.Teacher:
      case UserType.ContentManager:
        /*   if (view === 'show') {
            history.push(`/teaching-paths/view/${id}`);
            break;
          }
          history.push(`/teaching-paths/edit/${id}`);
        */
        this.manageAssignmentAction(id, currentUserType, view);
        break;
      case UserType.Student:
        this.manageAssignmentAction(id, currentUserType, view);
        break;
      default:
        break;
    }
  }

  public renderListItem = (assignment: Assignment, idx: number, list: Array<Assignment>) => {
    const { assignmentListStore } = this.props;
    const { isAssignmentPreviewTeacherCMVisible } = this.state;
    return assignmentListStore!.assignmentsState === StoreState.LOADING ? (
      <SkeletonLoader key={idx} className="AssignmentListItem" />
    ) : (
      <AssignmentListItem
        id={assignment.id}
        view={assignment.view}
        onClick={this.onClickAssignment}
        assignment={assignment}
        key={assignment.id}
        currentUserRole={assignmentListStore!.getCurrentUser()!.type}
        /* tslint:disable-next-line:no-magic-numbers */
        itemsToLastAssignment={list.length > 4 ? list.length - (idx + 1) : 4}
        isContentManager={this.isContentManager}
        removeAssignment={assignmentListStore!.removeAssignment}
        copyAssignment={this.copyAssignment}
      />
    );
  }

  public render() {
    const { assignments } = this.props;
    const { isAssignmentPreviewTeacherCMVisible } = this.state;
    if (assignments.length === 0) {
      return (
        <div className="noResults emptyTeachingPaths">
          {intl.get('assignments_page.no_results')}
        </div>
      );
    }
    return (
      <div>

        <ul className="MyList" id="List" aria-live="polite">{assignments.map(this.renderListItem)}</ul>
        {isAssignmentPreviewTeacherCMVisible && this.renderSlideOutPanelAssignmentTeacherCM()}
      </div>
    );
  }
}

const AssignmentsListWithRouter = withRouter(AssignmentsList);
export { AssignmentsListWithRouter as AssignmentsList };
