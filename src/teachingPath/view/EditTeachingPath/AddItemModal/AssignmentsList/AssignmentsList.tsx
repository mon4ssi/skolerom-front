import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { Assignment, GreepSelectValue, FilterGrep, Greep, GrepFilters, GoalsData } from 'assignment/Assignment';
import { EditTeachingPathStore } from '../../EditTeachingPathStore';
import { ItemContentTypeContext } from '../../ItemContentTypeContext';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { StoreState } from 'utils/enums';
import { lettersNoEn } from 'utils/lettersNoEn';

import closeImg from 'assets/images/close-rounded-black.svg';
import imagePlaceholderImg from 'assets/images/list-placeholder.svg';
import checkImg from 'assets/images/check-rounded-white-bg.svg';
import checkFilledImg from 'assets/images/check-active.svg';
import gradeImg from 'assets/images/grade.svg';
import tagsImg from 'assets/images/tags.svg';
import cogsImg from 'assets/images/cogs.svg';
import coreImg from 'assets/images/core.svg';
import goalsImg from 'assets/images/goals.svg';
import backIcon from 'assets/images/back-arrow.svg';

import './AssignmentsList.scss';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
const MAGICNUMBER100 = -1;
const MAGICNUMBER1 = 1;
const showDelay = 500;
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

interface MyGrades {
  id: number;
  title: string;
}

interface State {
  currentTab: string;
  itemsForNewChildren: Array<Assignment>;
  removingItems: Array<Assignment>;
  isRedirect: boolean;
  greeddata: boolean;
  selectedAssignment: Assignment | null;
  selectedAssignmentTitle: string;
  selectedAssignmentDescription: string;
  expand: boolean;
  expandCore: boolean;
  expandGoals: boolean;
  expandSubjects: boolean;
  myValueSubject: number | null;
  myValueGrade: number | null;
  myValueMulti: number | null;
  myValueReading: number | null;
  optionsCore: Array<GreepSelectValue>;
  optionsMulti: Array<Greep>;
  optionsReading: Array<Greep>;
  optionsSubjects: Array<GrepFilters>;
  optionsGrades: Array<GrepFilters>;
  optionsGoals: Array<GreepSelectValue>;
  valueCoreOptions: Array<number>;
  valueMultiOptions: Array<number>;
  valuereadingOptions: number;
  valueGradesOptions: Array<number>;
  valueSubjectsOptions: Array<number>;
  valueGoalsOptions: Array<number>;
  grepFiltersData: FilterGrep;
  coreValueFilter: Array<any>;
  goalValueFilter: Array<any>;
  valueStringGoalsOptions: Array<string>;
  filtersisUsed: boolean;
}

@inject('assignmentListStore', 'editTeachingPathStore')
@observer
export class AssignmentsList extends Component<Props, State> {

  public static contextType = ItemContentTypeContext;
  public ref = React.createRef<HTMLDivElement>();
  public refButton = React.createRef<HTMLButtonElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 'all',
      itemsForNewChildren: [],
      removingItems: [],
      isRedirect: false,
      greeddata: false,
      expand: true,
      selectedAssignmentTitle: '',
      selectedAssignmentDescription: '',
      selectedAssignment: null,
      expandCore: false,
      expandGoals: false,
      expandSubjects: false,
      myValueSubject: null,
      myValueGrade: null,
      myValueMulti: null,
      myValueReading: null,
      optionsCore: [],
      optionsMulti: [],
      optionsReading: [],
      optionsSubjects: [],
      optionsGrades: [],
      optionsGoals: [],
      valueCoreOptions: [],
      valueMultiOptions: [],
      valuereadingOptions: 0,
      valueGradesOptions: [],
      valueSubjectsOptions: [],
      valueGoalsOptions: [],
      grepFiltersData: {},
      coreValueFilter: [],
      goalValueFilter: [],
      valueStringGoalsOptions: [],
      filtersisUsed: false,
    };
  }

  private getAllChildrenItems = () => {
    const { currentNode } = this.props.editTeachingPathStore!;
    return currentNode!.children
      .map(child => child.items!.map(item => item.value))
      .flat() as Array<Assignment>;
  }

  public renderValueOptions = (data: FilterGrep, type: string) => {
    const returnArray : Array<GreepSelectValue> = [];
    if (type === 'core') {
      data!.coreElementsFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.description
        });
      });
    }
    if (type === 'multi') {
      data!.mainTopicFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.description
        });
      });
    }
    if (type === 'reading') {
      data!.readingInSubjects!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.name
        });
      });
    }
    return returnArray;
  }

  public renderValueOptionsNumbers = (data: FilterGrep, type: string) => {
    const returnArray : Array<Greep> = [];
    if (type === 'multi') {
      data!.mainTopicFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          id: Number(element.id),
          title: element.description
        });
      });
    }
    if (type === 'reading') {
      data!.readingInSubjects!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          id: Number(element.id),
          title: element.name
        });
      });
    }
    return returnArray;
  }

  public renderValueOptionsBasics = (data: FilterGrep, type: string) => {
    const returnArray : Array<GrepFilters> = [];
    if (type === 'subject') {
      data!.subjectFilters!.forEach((element) => {
        returnArray.push({
          id: Number(element.id),
          name: element.name,
          // tslint:disable-next-line: variable-name
          wp_id: element.wp_id
        });
      });
    }
    if (type === 'grade') {
      data!.gradeFilters!.forEach((element) => {
        returnArray.push({
          id: Number(element.id),
          name: element.name,
          // tslint:disable-next-line: variable-name
          wp_id: element.wp_id
        });
      });
    }
    return returnArray;
  }

  public renderValueOptionsGoals = (data: Array<GoalsData>) => {
    const returnArray : Array<GreepSelectValue> = [];
    data!.forEach((element) => {
      returnArray.push({
        // tslint:disable-next-line: variable-name
        value: Number(element.id),
        label: element.description!
      });
    });
    return returnArray;
  }

  public async componentDidMount() {
    const { editTeachingPathStore } = this.props;
    const { valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions } = this.state;
    this.props.assignmentListStore!.clearMyAssignmentsList();
    this.props.assignmentListStore!.setTypeOfAssignmentsList('all');
    this.setState({ itemsForNewChildren: this.getAllChildrenItems() });
    this.props.assignmentListStore!.setFromTeachingPath(true);
    this.props.assignmentListStore!.setFiltersForTeachingPath();
    document.addEventListener('keyup', this.handleKeyboardControl);
    this.refButton.current!.focus();
    const grepFiltersDataAwait = await editTeachingPathStore!.getGrepFilters();
    this.setState({
      grepFiltersData : grepFiltersDataAwait
    });
    this.setState({
      optionsCore : this.renderValueOptions(grepFiltersDataAwait, 'core')
    });
    this.setState({
      optionsMulti : this.renderValueOptionsNumbers(grepFiltersDataAwait, 'multi')
    });
    this.setState({
      optionsReading : this.renderValueOptionsNumbers(grepFiltersDataAwait, 'reading')
    });
    this.setState({
      optionsSubjects : this.renderValueOptionsBasics(grepFiltersDataAwait, 'subject')
    });
    this.setState({
      optionsGrades : this.renderValueOptionsBasics(grepFiltersDataAwait, 'grade')
    });
    const listGoals = [''];
    this.setState({
      valueStringGoalsOptions: listGoals
    });
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions, listGoals, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
  }

  public componentWillUnmount() {
    if (!this.state.isRedirect) {
      this.props.editTeachingPathStore!.setCurrentNode(null);
    }
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
    this.setState({ greeddata: true });
    this.setState({ selectedAssignmentTitle: item.title });
    this.setState({ selectedAssignmentDescription: item.description });
    this.setState({ selectedAssignment: item });
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
    const classDivPath = (event.composedPath()[0] as Element).className;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    const qlEditorText = 'ql-editor';
    if (event.key === 'Escape') {
      this.closeModal();
    }
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText && classDivPath !== qlEditorText) {
      if (this.state.itemsForNewChildren.length > 0) {
        if (event.shiftKey && event.key === 'A' || event.shiftKey && event.key === 'a') {
          this.closeModal();
        }
      }
    }
  }

  public redirectAssigment = () => {
    const { currentNode } = this.props.editTeachingPathStore!;
    const { editTeachingPathStore } = this.props;
    editTeachingPathStore!.setCurrentNode(currentNode);
    this.setState({ isRedirect: true });
    setTimeout(
      () => {
        this.context.changeContentType(0);
      },
      showDelay
    );
  }

  public renderHeader = () => {
    const { currentTab } = this.state;
    return (
      <div className="assignmentsListHeader flexBox spaceBetween" tabIndex={0}>
        <div className="assignmentsListHeader__left">
          <button
            className={`buttonDev ${currentTab === 'all' ? 'selectedTab' : null}`}
            onClick={this.selectAllAssignmentsTab}
            title={intl.get('edit_teaching_path.modals.all_assignments')}
          >
            {intl.get('edit_teaching_path.modals.all_assignments')}
          </button>
          <button
            className={`buttonDev ${currentTab === 'my' ? 'selectedTab' : null}`}
            onClick={this.selectMyAssignmentsTab}
            title={intl.get('edit_teaching_path.modals.my_assignments')}
          >
            {intl.get('edit_teaching_path.modals.my_assignments')}
          </button>
          <a href="javascript:void(0)" onClick={this.redirectAssigment}>{intl.get('edit_teaching_path.modals.articles')}</a>
        </div>
        <div className="assignmentsListHeader__right">
          <button ref={this.refButton} onClick={this.closeModal} title={intl.get('generals.close_assignment')}>
            <img
              src={closeImg}
              alt={intl.get('generals.close_assignment')}
              title={intl.get('generals.close_assignment')}
            />
          </button>
        </div>
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

  public handleClickSubject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const { assignmentListStore, editTeachingPathStore } = this.props;
    const { optionsSubjects, valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    let valueToArray = 0;
    optionsSubjects!.forEach((element) => {
      if (Number(element.wp_id) === Number(e.currentTarget.value)) {
        this.setState({ valueSubjectsOptions: [element.id] });
        valueToArray = element.id;
      }
    });
    if (this.state.myValueSubject !== Number(value)) {
      const currentGrade = assignmentListStore!
        .getAllSubjects()
        .find(subject => subject.id === Number(value));
      assignmentListStore!.setFiltersSubjectID(currentGrade ? currentGrade.id : null);
      this.setState({
        myValueSubject : Number(value)
      });
      this.setState({ filtersisUsed: true });
    } else {
      assignmentListStore!.setFiltersSubjectID(null);
      this.setState({
        myValueSubject : null
      });
      this.setState({ filtersisUsed: false });
    }
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, valueGradesOptions, [valueToArray], this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
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

  public handleClickGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const { assignmentListStore, editTeachingPathStore } = this.props;
    const { optionsGrades, valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    let valueToArray = 0;
    optionsGrades!.forEach((element) => {
      if (Number(element.wp_id) === Number(e.currentTarget.value)) {
        this.setState({ valueGradesOptions: [element.id] });
        valueToArray = element.id;
      }
    });
    if (this.state.myValueGrade !== Number(value)) {
      const currentGrade = assignmentListStore!
        .getAllGrades()
        .find(grade => grade.id === Number(value));
      assignmentListStore!.setFiltersGradeID(currentGrade ? currentGrade.id : null);
      this.setState({
        myValueGrade : Number(value)
      });
      this.setState({ filtersisUsed: true });
    } else {
      assignmentListStore!.setFiltersGradeID(null);
      this.setState({
        myValueGrade : null
      });
      this.setState({ filtersisUsed: false });
    }
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, [valueToArray], valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
  }

  public handleClickMulti = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const { assignmentListStore, editTeachingPathStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    if (Number(value) !== this.state.myValueMulti) {
      assignmentListStore!.setFiltersMultiID(Number(value));
      this.setState({
        myValueMulti : Number(value)
      });
      this.setState({ filtersisUsed: true });
    } else {
      assignmentListStore!.setFiltersMultiID(null);
      this.setState({
        myValueMulti : null
      });
      this.setState({ filtersisUsed: false });
    }
    this.setState({ valueMultiOptions: [Number(e.currentTarget.value)] });
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(valueCoreOptions, [Number(e.currentTarget.value)], valueGradesOptions, valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
  }

  public handleClickReading = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const { assignmentListStore } = this.props;
    if (Number(value) !== this.state.myValueReading) {
      assignmentListStore!.setFiltersReadingID(Number(value));
      this.setState({
        myValueReading : Number(value)
      });
      this.setState({ filtersisUsed: true });
    } else {
      assignmentListStore!.setFiltersReadingID(null);
      this.setState({
        myValueReading : null
      });
      this.setState({ filtersisUsed: false });
    }
  }

  public handleClickReset = async () => {
    const { assignmentListStore } = this.props;
    assignmentListStore!.setFiltersMultiID(null);
    assignmentListStore!.setFiltersReadingID(null);
    assignmentListStore!.setFiltersGradeID(null);
    assignmentListStore!.setFiltersSubjectID(null);
    assignmentListStore!.setFiltersCoreID(null);
    assignmentListStore!.setFiltersGoalID(null);
    this.setState({
      myValueMulti : null,
      myValueReading : null,
      myValueGrade : null,
      myValueSubject : null,
      coreValueFilter : [],
      goalValueFilter : [],
      filtersisUsed: false,
    });
  }

  public handleChangeSelectCore = async (newValue: Array<any>) => {
    const ArrayValue: Array<number> = [];
    const { assignmentListStore, editTeachingPathStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    newValue.forEach((e) => {
      ArrayValue.push(e.value);
    });
    if (newValue.length === 0) {
      this.setState({ filtersisUsed: false });
    } else {
      this.setState({ filtersisUsed: true });
    }
    this.setState({ valueCoreOptions: ArrayValue });
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(ArrayValue, valueMultiOptions, valueGradesOptions, valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
    let singleString : string = '';
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
      });
    }
    assignmentListStore!.setFiltersCoreID(singleString);
    this.setState({ coreValueFilter : newValue });
  }

  public handleChangeSelectGoals = async (newValue: Array<any>) => {
    const { assignmentListStore } = this.props;
    let singleString : string = '';
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
      });
    }
    if (newValue.length === 0) {
      this.setState({ filtersisUsed: false });
    } else {
      this.setState({ filtersisUsed: true });
    }
    assignmentListStore!.setFiltersGoalID(singleString);
    this.setState({ goalValueFilter : newValue });
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

  public toggleData = () => {
    const { expand } = this.state;
    if (expand) {
      this.setState({ expand: false });
    } else {
      this.setState({ expand: true });
    }
  }

  public SelectedGrades = () => {
    const { selectedAssignment } = this.state;
    const amountOfGrades = selectedAssignment!.grades ? selectedAssignment!.grades.length : 0;
    if (amountOfGrades > 0) {
      const visibleGrades = selectedAssignment!.grades!.sort((a, b) => a.id - b.id).map((grade) => {
        const title = grade.title.split('.', 1);
        return <span key={grade.id}>{title}{intl.get('new assignment.grade')}</span>;
      });
      return (
        <div className="grades">
          {visibleGrades}
        </div>
      );
    }
    return (
      <div className="grades" />
    );
  }

  public SelectedSubjects = () => {
    const { selectedAssignment } = this.state;
    const amountSubjects = selectedAssignment!.subjects ? selectedAssignment!.subjects.length : 0;
    if (amountSubjects > 0) {
      const visiblesubjects = selectedAssignment!.subjects!.sort((a, b) => a.id - b.id).map((subject) => {
        const title = subject.title;
        return <li key={subject.id}>{title}</li>;
      });
      return (
        <div className="subjects">
          <ul>
            {visiblesubjects}
          </ul>
        </div>
      );
    }
    return (
      <div className="subjects" />
    );
  }

  public SelectedGreepCore = () => {
    const { selectedAssignment } = this.state;
    const amountCoreElements = selectedAssignment!.grepCoreelements ? selectedAssignment!.grepCoreelements.length : 0;
    if (amountCoreElements > 0) {
      const visibilityCores = selectedAssignment!.grepCoreelements!.map((corelement) => {
        const description = corelement.description;
        return <li key={corelement.kode}>{description}</li>;
      });
      return (
        <div className="greepContentList">
          <ul>
            {visibilityCores}
          </ul>
        </div>
      );
    }
    return (
      <div className="greepContentList">
        {intl.get('activity_page.No available content')}
      </div>
    );
  }

  public SelectedCoreGoals = () => {
    const { selectedAssignment } = this.state;
    const amountGoalsElements = selectedAssignment!.grepGoals ? selectedAssignment!.grepGoals.length : 0;
    if (amountGoalsElements > 0) {
      const visibilityGoals = selectedAssignment!.grepGoals!.map((corelement) => {
        const description = corelement.description;
        return <li key={corelement.kode}>{description}</li>;
      });
      return (
        <div className="greepContentList">
          <ul>
            {visibilityGoals}
          </ul>
        </div>
      );
    }
    return (
      <div className="greepContentList">
        {intl.get('activity_page.No available content')}
      </div>
    );
  }

  public SelectedCoreSubjects = () => {
    const { selectedAssignment } = this.state;
    const amountSubjectsElements = selectedAssignment!.grepMaintopic ? selectedAssignment!.grepMaintopic.length : 0;
    if (amountSubjectsElements > 0) {
      const visibilityGoals = selectedAssignment!.grepMaintopic!.map((corelement) => {
        const description = corelement.description;
        return <li key={corelement.kode}>{description}</li>;
      });
      return (
        <div className="greepContentList">
          <ul>
            {visibilityGoals}
          </ul>
        </div>
      );
    }
    return (
      <div className="greepContentList">
        {intl.get('activity_page.No available content')}
      </div>
    );
  }

  public toggleDataCore = () => {
    const { expandCore } = this.state;
    if (expandCore) {
      this.setState({ expandCore: false });
    } else {
      this.setState({ expandCore: true });
    }
  }

  public toggleDataGoals = () => {
    const { expandGoals } = this.state;
    if (expandGoals) {
      this.setState({ expandGoals: false });
    } else {
      this.setState({ expandGoals: true });
    }
  }

  public toggleDataSubjects = () => {
    const { expandSubjects } = this.state;
    if (expandSubjects) {
      this.setState({ expandSubjects: false });
    } else {
      this.setState({ expandSubjects: true });
    }
  }

  public renderInsideData = () => {
    const { expandCore, expandGoals, expandSubjects } = this.state;
    return (
      <div className="defaultContentModal__inside">
        <div className="listItemInside">
          <div className="lisItemInsideIcon">
            <img src={gradeImg} />
          </div>
          <div className="lisItemInsideText">
            <h5>{intl.get('generals.grade')}</h5>
            {this.SelectedGrades()}
          </div>
        </div>
        <div className="listItemInside">
          <div className="lisItemInsideIcon">
            <img src={tagsImg} />
          </div>
          <div className="lisItemInsideText">
            <h5>{intl.get('new assignment.Subject')}</h5>
            {this.SelectedSubjects()}
          </div>
        </div>
        <div className={`listItemInside listItemGreep ${expandCore && 'active'}`}>
          <div className="lisItemInsideIcon">
            <img src={coreImg} />
          </div>
          <div className="lisItemInsideText">
            <h5 onClick={this.toggleDataCore}>{intl.get('new assignment.greep.core')}</h5>
            {this.SelectedGreepCore()}
          </div>
        </div>
        <div className={`listItemInside listItemGreep ${expandGoals && 'active'}`}>
          <div className="lisItemInsideIcon">
            <img src={goalsImg} />
          </div>
          <div className="lisItemInsideText">
            <h5 onClick={this.toggleDataGoals}>{intl.get('new assignment.greep.goals')}</h5>
            {this.SelectedCoreGoals()}
          </div>
        </div>
        <div className={`listItemInside listItemGreep ${expandSubjects && 'active'}`}>
          <div className="lisItemInsideIcon">
            <img src={cogsImg} />
          </div>
          <div className="lisItemInsideText">
            <h5 onClick={this.toggleDataSubjects}>{intl.get('new assignment.greep.subjects')}</h5>
            {this.SelectedCoreSubjects()}
          </div>
        </div>
      </div>
    );
  }

  public renderInformationContent = () => {
    const { selectedAssignmentTitle, selectedAssignmentDescription, expand } = this.state;
    return (
      <div className="defaultContentModal">
        <h2>{intl.get('edit_teaching_path.modals.articles_title')}</h2>
        <div className="defaultContentModal__content">
          <h3>{selectedAssignmentTitle}</h3>
          <p>{selectedAssignmentDescription}</p>
        </div>
        <div className="defaultContentModal__expand">
          <div className={`expandContent ${expand && 'active'}`} onClick={this.toggleData}>{intl.get('edit_teaching_path.modals.expand')}</div>
          {expand && this.renderInsideData()}
        </div>
      </div>
    );
  }

  public renderInformationContentDefault = () => {
    const { contentType } = this.context;
    return (
      <div className="defaultContentModal">
        <h2>{intl.get('edit_teaching_path.modals.assignments_title')}</h2>
        <div>
          <p>{intl.get('edit_teaching_path.modals.assignments_default')}</p>
        </div>
      </div>
    );
  }

  public conditionalGreedData = () => {
    const { greeddata } = this.state;
    if (greeddata) {
      return this.renderInformationContent();
    }
    return this.renderInformationContentDefault();
  }

  public render() {
    const { assignmentListStore } = this.props;

    return (
      <div className="addItemModal__content">
        <div className="addItemModal__left">
          <button className="back-buttonAbs" onClick={this.closeModal}>
            <img src={backIcon} alt="Back" />
            {intl.get('new assignment.go_back')}
          </button>
          {this.conditionalGreedData()}
        </div>
        <div className="addItemModal__right">
          <div className="AssignmentsList flexBox dirColumn">
            {this.renderHeader()}
            <SearchFilter
              subject
              placeholder={intl.get('assignments search.Search')}
              isAssignmentsListFilter
              customCoreTPList={this.state.optionsCore}
              customGoalsTPList={this.state.optionsGoals}
              customMultiList={this.state.optionsMulti}
              customReadingList={this.state.optionsReading}
              filtersisUsed={this.state.filtersisUsed}
              // METHODS
              handleChangeSubject={this.handleChangeSubject}
              handleChangeGrade={this.handleChangeGrade}
              handleInputSearchQuery={this.handleInputSearchQuery}
              handleClickGrade={this.handleClickGrade}
              handleClickSubject={this.handleClickSubject}
              handleClickMulti={this.handleClickMulti}
              handleClickReading={this.handleClickReading}
              handleChangeSelectCore={this.handleChangeSelectCore}
              handleChangeSelectGoals={this.handleChangeSelectGoals}
              handleClickReset={this.handleClickReset}
              // VALUES
              subjectFilterValue={assignmentListStore!.subjectFilterValue}
              gradeFilterValue={assignmentListStore!.gradeFilterValue}
              searchQueryFilterValue={assignmentListStore!.searchQueryFilterValue}
              mainFilterValueTP={this.state.myValueMulti}
              readingFilterValueTP={this.state.myValueReading}
              coreValueFilter={this.state.coreValueFilter}
              goalValueFilter={this.state.goalValueFilter}
            />
            {this.renderAssignmentsList()}
            {this.renderSubmitFooter()}

          </div>
        </div>
      </div>
    );
  }
}
