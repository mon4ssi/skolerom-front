import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { Assignment } from 'assignment/Assignment';
import { EditTeachingPathStore } from '../../EditTeachingPathStore';
import { ItemContentTypeContext } from '../../ItemContentTypeContext';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { StoreState } from 'utils/enums';
import { lettersNoEn } from 'utils/lettersNoEn';

import closeImg from 'assets/images/close-rounded-black.svg';
import imagePlaceholderImg from 'assets/images/list-placeholder.svg';
import notLikedIcon from 'assets/images/not-liked.svg';
import checkImg from 'assets/images/check-rounded-white-bg.svg';
import checkFilledImg from 'assets/images/check-active.svg';

import './AssignmentsList.scss';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
const PATHLENGTH = 4;
interface AssignmentProps {
  editTeachingPathStore?: EditTeachingPathStore;
  assignment: Assignment;
  addItem: (item: Assignment) => void;
  removeItem: (item: Assignment) => void;
  allItems: Array<Assignment>;
}

@inject('editTeachingPathStore')
@observer
class AssignmentItem extends Component<AssignmentProps> {

  public isAssignmentSelected = () => {
    const { assignment, allItems } = this.props;

    return !!allItems.find(
      item => item.id === assignment.id
    );
  }

  public handleSelectAssignment = () => {
    const { assignment, addItem, removeItem } = this.props;
    this.isAssignmentSelected() ?
      removeItem(assignment) :
      addItem(assignment);
  }

  public render() {
    const { assignment } = this.props;
    const itemImage = assignment.featuredImage ? assignment.featuredImage : imagePlaceholderImg;

    const itemSubject = assignment.subjects.length ?
      assignment.subjects[0].title :
      null;

    return (
      <a
        href="javascript:void(0)"
        key={assignment.id}
        className="assignmentItem flexBox spaceBetween"
        onClick={this.handleSelectAssignment}
      >
        <div className="flexBox alignCenter w50" style={{ flex: 1 }}>
          <img
            src={itemImage}
            alt="item-img"
            className="itemImg"
          />
          <div className="itemTitle">
            {assignment.title}
          </div>
        </div>

        <div className="flexBox alignCenter">
          <div className="itemSubject">
            {itemSubject}
          </div>
          <div className="itemNumberOfQuestions">
            {assignment.numberOfQuestions}{' '}
            {assignment.numberOfQuestions === 1 ? intl.get('assignment list.question') : intl.get('assignment list.questions')}
          </div>
          <div className="itemIsSelected">
            <img
              src={this.isAssignmentSelected() ? checkFilledImg : checkImg}
              alt={this.isAssignmentSelected() ? intl.get('generals.unselected_assignment') : intl.get('generals.selected_assignment')}
              title={this.isAssignmentSelected() ? intl.get('generals.unselected_assignment') : intl.get('generals.selected_assignment')}
            />
          </div>
        </div>
      </a>
    );
  }
}

interface Props {
  assignmentListStore?: AssignmentListStore;
  editTeachingPathStore?: EditTeachingPathStore;
}

interface State {
  currentTab: string;
  itemsForNewChildren: Array<Assignment>;
  removingItems: Array<Assignment>;
}

@inject('assignmentListStore', 'editTeachingPathStore')
@observer
export class AssignmentsList extends Component<Props, State> {

  public static contextType = ItemContentTypeContext;
  public ref = React.createRef<HTMLDivElement>();
  public refButton = React.createRef<HTMLButtonElement>();

  public state = {
    currentTab: 'all',
    itemsForNewChildren: [],
    removingItems: [],
  };

  private getAllChildrenItems = () => {
    const { currentNode } = this.props.editTeachingPathStore!;
    return currentNode!.children
      .map(child => child.items!.map(item => item.value))
      .flat() as Array<Assignment>;
  }

  public async componentDidMount() {
    this.props.assignmentListStore!.clearMyAssignmentsList();
    this.props.assignmentListStore!.setTypeOfAssignmentsList('all');
    this.setState({ itemsForNewChildren: this.getAllChildrenItems() });
    this.props.assignmentListStore!.setFromTeachingPath(true);
    this.props.assignmentListStore!.setFiltersForTeachingPath();
    document.addEventListener('keyup', this.handleKeyboardControl);
    this.refButton.current!.focus();
  }

  public componentWillUnmount() {
    this.props.editTeachingPathStore!.setCurrentNode(null);
    this.props.assignmentListStore!.setFilterShowMyAssignments(null);
    this.props.assignmentListStore!.setFiltersIsPublished(0, true);
    this.props.assignmentListStore!.setFromTeachingPath(false);
    this.props.assignmentListStore!.clearMyAssignmentsList();
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public addItemToNewChild = (item: Assignment) => {
    const { currentNode } = this.props.editTeachingPathStore!;

    const ifAddingItemIsSaved = !!currentNode!.children.filter(
      child => child.items!.find(el => el.value.id === item.id)
    ).length;

    if (ifAddingItemIsSaved) {
      this.setState({ removingItems: this.state.removingItems.filter((el: Assignment) => el.id !== item.id) });
    }

    this.setState({ itemsForNewChildren: [...this.state.itemsForNewChildren, item] });
  }

  public removeItemFromNewChild = async (item: Assignment) => {
    const { currentNode } = this.props.editTeachingPathStore!;

    const ifRemovableItemIsSaved = !!currentNode!.children.filter(
      child => child.items!.find(el => el.value.id === item.id)
    ).length;

    if (ifRemovableItemIsSaved) {
      this.setState({ removingItems: [...this.state.removingItems, item] });
    }

    this.setState((state) => {
      const itemsForNewChildren = state.itemsForNewChildren.filter(
        (currentItem: Assignment) => currentItem.id !== item.id
      );
      return { itemsForNewChildren };
    });
  }

  public selectAllAssignmentsTab = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.setState({ currentTab: 'all' });
    this.props.assignmentListStore!.isFetchedAssignmentsListFinished = false;
    this.props.assignmentListStore!.resetFilters();
    this.props.assignmentListStore!.setTypeOfAssignmentsList('all');
    this.props.assignmentListStore!.setFilterShowMyAssignments(null);
    this.props.assignmentListStore!.myAssignments = [];
    this.props.assignmentListStore!.getAssignmentsList();
  }

  public selectMyAssignmentsTab = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.setState({ currentTab: 'my' });
    this.props.assignmentListStore!.isFetchedAssignmentsListFinished = false;
    this.props.assignmentListStore!.resetFilters();
    this.props.assignmentListStore!.setFilterShowMyAssignments(1);
    this.props.assignmentListStore!.myAssignments = [];
    this.props.assignmentListStore!.getAssignmentsList();

  }

  public closeModal = () => {
    const { editTeachingPathStore, } = this.props;
    const { itemsForNewChildren } = this.state;
    if (itemsForNewChildren.length) {
      const newChildren = itemsForNewChildren.map(
        item => editTeachingPathStore!.createNewNode(
          item,
          TeachingPathNodeType.Assignment
        )
      );
      newChildren.forEach(child => editTeachingPathStore!.addChildToCurrentNode(child));
      editTeachingPathStore!.currentNode!.children.forEach(
        (child) => {
          this.state.removingItems.forEach(
            (item: Assignment) => {
              if (child.items!.filter(el => el.value.id === item.id)) {
                child.removeItem(item.id);
              }
            }
          );
          if (!child.items!.length) {
            editTeachingPathStore!.currentNode!.removeChild(child);
          }
        }
      );
    } else {
      editTeachingPathStore!.currentNode!.setChildren([]);
    }

    editTeachingPathStore!.currentEntity!.save();

    this.context.changeContentType(null);
    editTeachingPathStore!.setCurrentNode(null);
  }

  public onChangePage = (newSelectedPage: { selected: number }) => {
    const { assignmentListStore } = this.props;
    assignmentListStore!.setFiltersPage(
      newSelectedPage.selected + 1
    );
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const path = event.composedPath().length;
    if (event.key === 'Escape') {
      this.closeModal();
    }
    if (path <= PATHLENGTH) {
      if (this.state.itemsForNewChildren.length > 0) {
        if (event.shiftKey && event.key === 'A' || event.shiftKey && event.key === 'a') {
          this.closeModal();
        }
      }
    }
  }

  public renderHeader = () => {
    const { currentTab } = this.state;

    return (
      <div className="assignmentsListHeader flexBox spaceBetween">
        <div className="assignmentsListType flexBox">
          <button
            className={`fs15 ${currentTab === 'all' ? 'selectedTab' : null}`}
            onClick={this.selectAllAssignmentsTab}
            title={intl.get('edit_teaching_path.modals.all_assignments')}
          >
            {intl.get('edit_teaching_path.modals.all_assignments')}
          </button>
          <button
            className={`fs15 ${currentTab === 'my' ? 'selectedTab' : null}`}
            onClick={this.selectMyAssignmentsTab}
            title={intl.get('edit_teaching_path.modals.my_assignments')}
          >
            {intl.get('edit_teaching_path.modals.my_assignments')}
          </button>
        </div>
        <button ref={this.refButton} onClick={this.closeModal} title={intl.get('generals.close_assignment')}>
          <img
            src={closeImg}
            alt={intl.get('generals.close_assignment')}
            title={intl.get('generals.close_assignment')}
          />
          </button>
      </div>
    );
  }

  public renderAssignment = (assignment: Assignment, index: number) => {
    const { assignmentsState } = this.props.assignmentListStore!;

    return (
      assignmentsState === StoreState.LOADING ? (
        <SkeletonLoader key={index} className="skeletonAssignmentItem" />
      ) : (
        <AssignmentItem
          key={assignment.id}
          assignment={assignment}
          allItems={this.state.itemsForNewChildren}
          addItem={this.addItemToNewChild}
          removeItem={this.removeItemFromNewChild}
        />
      )
    );
  }

  public renderAssignmentsList = () => {
    const { assignmentListStore } = this.props;
    const assignmentsList = assignmentListStore!.getAllMyAssignments();

    if (assignmentListStore!.assignmentsState === StoreState.PENDING && !assignmentsList.length) {
      return (
        <div className="noResults" id="List" aria-live="polite" aria-atomic="true">
          {intl.get('assignment list.Nothing')}
        </div>
      );
    }

    const sortedAssignments = assignmentsList.sort(
      (assignment) => {
        const isSelected = !!this.state.itemsForNewChildren.filter(
          (item: Assignment) => item.id === assignment.id
        ).length;
        if (isSelected) {
          return -1;
        }
        return 0;
      }
    );

    const assignments = assignmentListStore!.assignmentsState === StoreState.LOADING && !assignmentsList.length ?
      assignmentListStore!.assignmentsForSkeleton :
      sortedAssignments;

    return (
      <div
        className="assignmentsListContainer flexBox dirColumn spaceBetween"
        ref={this.ref}
        onScroll={this.onScroll}
        id="List"
        aria-live="polite"
        aria-atomic="true"
      >
        {assignments.map(this.renderAssignment)}
      </div>
    );
  }

  public renderSubmitFooter = () => (
    <div className="assignmentsListFooter flexBox alignCenter">
      <div className="assignmentCounter flexBox alignCenter justifyCenter">
        {intl.get('edit_teaching_path.modals.assignments_selected', { number: this.state.itemsForNewChildren.length })}
      </div>
      <div onClick={this.closeModal}>
        <CreateButton
          disabled={!this.state.itemsForNewChildren.length}
          title={intl.get('new assignment.Add assignments')}
        >
          {intl.get('new assignment.Add assignments')}
        </CreateButton>
      </div>
    </div>
  )

  public handleChangeSubject = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { assignmentListStore } = this.props;

    if (e.target.value === intl.get('assignments search.Choose subject')) {
      assignmentListStore!.setFiltersSubjectID(null);
    } else {
      const currentSubject = assignmentListStore!
        .getAllSubjects()
        .find(subject => subject.id === Number(e.target.value));
      assignmentListStore!.setFiltersSubjectID(currentSubject ? currentSubject.id : null);
    }
  }

  public handleChangeGrade = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { assignmentListStore } = this.props;

    if (e.target.value === intl.get('assignments search.Choose grade')) {
      assignmentListStore!.setFiltersGradeID(null);
    } else {
      const currentGrade = assignmentListStore!
        .getAllGrades()
        .find(grade => grade.id === Number(e.target.value));
      assignmentListStore!.setFiltersGradeID(currentGrade ? currentGrade.id : null);
    }
  }

  public handleInputSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { assignmentListStore } = this.props;
    if (lettersNoEn(e.target.value)) {
      assignmentListStore!.setFiltersSearchQuery(e.target.value);
    }
  }

  public onScroll = () => {
    const { assignmentListStore } = this.props;
    if (
      this.ref.current!.scrollTop + this.ref.current!.clientHeight >= this.ref.current!.scrollHeight &&
      !assignmentListStore!.isFetchedAssignmentsListFinished
    ) {
      assignmentListStore!.setFiltersPage((assignmentListStore!.currentPage || 1) + 1);
    }
  }

  public render() {
    const { assignmentListStore } = this.props;

    return (
      <div className="AssignmentsList flexBox dirColumn">

        {this.renderHeader()}
        <SearchFilter
          subject
          grade
          placeholder={intl.get('assignments search.Search')}
          // METHODS
          handleChangeSubject={this.handleChangeSubject}
          handleChangeGrade={this.handleChangeGrade}
          handleInputSearchQuery={this.handleInputSearchQuery}
          // VALUES
          subjectFilterValue={assignmentListStore!.subjectFilterValue}
          gradeFilterValue={assignmentListStore!.gradeFilterValue}
          searchQueryFilterValue={assignmentListStore!.searchQueryFilterValue}
        />
        {this.renderAssignmentsList()}
        {this.renderSubmitFooter()}

      </div>
    );
  }
}
