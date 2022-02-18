import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { Assignment, GreepSelectValue, FilterGrep, Greep, GrepFilters, GoalsData, Subject, Grade } from 'assignment/Assignment';
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
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
const MAGICNUMBER100 = -1;
const MAGICNUMBER1 = 1;
const showDelay = 500;
const SOURCE = 'ASSIGNMENT';
interface AssignmentProps {
  editTeachingPathStore?: EditTeachingPathStore;
  assignment: Assignment;
  addItem: (item: Assignment) => void;
  removeItem: (item: Assignment) => void;
  toSelectItem: (item: Assignment) => void;
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

  public isSelectedItem = () => {
    const { assignment } = this.props;
    const assignmentItem  = Array.from(document.getElementsByClassName('assignmentItem') as HTMLCollectionOf<HTMLElement>);
    assignmentItem.forEach((e) => {
      e.classList.remove('selectedItem');
    });
    const rootDiv = document.getElementById(`assignmentItem_${assignment.id}`);
    if (typeof(rootDiv) !== 'undefined') {
      rootDiv!.classList.add('selectedItem');
    }
  }
  public toSelectItem = () => {
    const { toSelectItem, assignment } = this.props;
    this.isSelectedItem();
    toSelectItem(assignment);
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
      <div
        key={assignment.id}
        className="assignmentItem flexBox spaceBetween"
        id={`assignmentItem_${assignment.id}`}
        onClick={this.toSelectItem}
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
          <a href="javascript:void(0)" className="itemIsSelected" onClick={this.handleSelectAssignment}>
            <img
              src={this.isAssignmentSelected() ? checkFilledImg : checkImg}
              alt={this.isAssignmentSelected() ? intl.get('generals.unselected_assignment') : intl.get('generals.selected_assignment')}
              title={this.isAssignmentSelected() ? intl.get('generals.unselected_assignment') : intl.get('generals.selected_assignment')}
            />
          </a>
        </div>
      </div>
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
  selectedAssignmentID: string;
  selectedAssignmentDescription: string;
  expand: boolean;
  expandCore: boolean;
  expandGoals: boolean;
  expandSubjects: boolean;
  myValueGrade: Array<number>;
  myValueSubject: Array<number>;
  myValueMulti: Array<number>;
  myValueReading: Array<number>;
  myValueCore: Array<any>;
  myValueGoal: Array<any>;
  optionsCore: Array<GreepSelectValue>;
  optionsMulti: Array<Greep>;
  optionsReading: Array<Greep>;
  optionsSubjects: Array<GrepFilters>;
  optionsGrades: Array<GrepFilters>;
  optionsGoals: Array<GreepSelectValue>;
  customGradeChildrenList: Array<Grade>;
  valueCoreOptions: Array<number>;
  valueMultiOptions: Array<number>;
  valuereadingOptions: number;
  valueGradesOptions: Array<number>;
  valueSubjectsOptions: Array<number>;
  valueGoalsOptions: Array<number>;
  grepFiltersData: FilterGrep;
  coreValueFilter: Array<any>;
  goalValueFilter: Array<any>;
  subjectsArrayFilter: Array<Subject>;
  valueStringGoalsOptions: Array<string>;
  filtersisUsed: boolean;
  filtersAjaxLoading: boolean;
  filtersAjaxLoadingGoals: boolean;
  isEdit: boolean;
  isEditSingle: boolean;
  gradesArrayFilter: Array<Grade>;
  isChangeAssingment: boolean;
  idChangeAssingment: number;
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
      selectedAssignmentID: '',
      selectedAssignmentDescription: '',
      selectedAssignment: null,
      expandCore: true,
      expandGoals: true,
      expandSubjects: true,
      myValueSubject: [],
      myValueGrade: [],
      myValueMulti: [],
      myValueReading: [],
      myValueCore: [],
      myValueGoal: [],
      optionsCore: [],
      optionsMulti: [],
      optionsReading: [],
      optionsSubjects: [],
      optionsGrades: [],
      optionsGoals: [],
      customGradeChildrenList: [],
      valueCoreOptions: [],
      valueMultiOptions: [],
      valuereadingOptions: 0,
      valueGradesOptions: [],
      valueSubjectsOptions: [],
      valueGoalsOptions: [],
      grepFiltersData: {},
      coreValueFilter: [],
      goalValueFilter: [],
      subjectsArrayFilter: [],
      valueStringGoalsOptions: [],
      filtersisUsed: false,
      filtersAjaxLoading: false,
      filtersAjaxLoadingGoals: false,
      isEdit: this.props.editTeachingPathStore!.returnIsEditAssignments()!,
      isEditSingle: false,
      gradesArrayFilter: [],
      isChangeAssingment: false,
      idChangeAssingment: 0
    };
  }

  private getAllChildrenItems = () => {
    const { currentNode } = this.props.editTeachingPathStore!;
    const EditAssingmentSeleted : Array<Assignment> = [];
    if (this.props.editTeachingPathStore!.returnIsEditAssignments()!) {
      currentNode!.items!.forEach((el) => {
        if (Number(el.value.id) === this.props.editTeachingPathStore!.getAssignmentInEdit()) {
          EditAssingmentSeleted.push(el.value as Assignment);
        }
      });
      this.setState({ idChangeAssingment: EditAssingmentSeleted[0].id });
      return EditAssingmentSeleted;
    }
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
          wp_id: element.wp_id,
          filterStatus: element.filterStatus,
          // tslint:disable-next-line: variable-name
          grade_parent: element.grade_parent,
          // tslint:disable-next-line: variable-name
          name_sub: element.name_sub
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

  public async assigValueData(grades: string, subjects: string, core?: string, goals?: string) {
    const { editTeachingPathStore, assignmentListStore } = this.props;
    this.setState({ filtersAjaxLoading: true });
    const grepFiltersDataAwait = await assignmentListStore!.getGrepFiltersAssignment(grades, subjects, core, goals);
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
      optionsGoals: this.renderValueOptions(grepFiltersDataAwait, 'goals').sort((a, b) => (a.label > b.label) ? 1 : -1)
    });
    this.setState(
      {
        optionsSubjects : this.renderValueOptionsBasics(grepFiltersDataAwait, 'subject')
      },
      () => {
        this.setState(
          {
            subjectsArrayFilter: this.renderDataSubjects(this.state.optionsSubjects)
          },
          () => {
            const ArrayValue : Array<number> = [];
            this.state.subjectsArrayFilter!.forEach((element) => {
              this.state.myValueSubject.forEach((el) => {
                if (Number(element.id) === Number(el)) {
                  ArrayValue.push(element.id);
                }
              });
            });
            this.setState({ myValueSubject: ArrayValue });
            if (grades !== '' && subjects !== '') {
              assignmentListStore!.setFiltersSubjectID(String(this.state.myValueSubject));
            }
          }
        );
      }
    );
    this.setState(
      {
        optionsGrades : this.renderValueOptionsBasics(grepFiltersDataAwait, 'grade')
      },
      () => {
        this.setState(
          {
            gradesArrayFilter: this.renderDataGrades(this.state.optionsGrades)
          },
          () => {
            const ArrayValue: Array<number> = [];
            const newArrayGradeChildren: Array<Grade> = [];
            this.state.gradesArrayFilter!.forEach((element) => {
              if (element.grade_parent !== null) {
                newArrayGradeChildren.push(element);
              }
              this.state.myValueGrade.forEach((el) => {
                if (Number(element.id) === Number(el)) {
                  ArrayValue.push(element.id);
                }
              });
            });
            this.setState({
              myValueGrade: ArrayValue
            });
            if (grades !== '' && subjects !== '') {
              assignmentListStore!.setFiltersGradeID(String(ArrayValue));
            }
          }
        );
      }
    );
    this.setState({ filtersAjaxLoading: false });
  }

  public renderDataSubjects = (data: Array<GrepFilters>) => {
    const returnArray : Array<Subject> = [];
    data!.forEach((element) => {
      returnArray.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.wp_id),
        title: element.name
      });
    });
    return returnArray;
  }

  public renderDataGrades = (data: Array<GrepFilters>) => {
    const returnArray: Array<any> = [];
    data!.forEach((element) => {
      returnArray.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.wp_id),
        title: element.name,
        filterStatus: element.filterStatus,
        // tslint:disable-next-line: variable-name
        grade_parent: element.grade_parent,
        // tslint:disable-next-line: variable-name
        name_sub: element.name_sub
      });
    });
    return returnArray;
  }

  public async componentDidMount() {
    const { editTeachingPathStore } = this.props;
    const { valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions } = this.state;
    this.props.assignmentListStore!.clearMyAssignmentsList();
    this.props.assignmentListStore!.myAssignments = [];
    this.props.assignmentListStore!.setTypeOfAssignmentsList('all');
    this.setState({ itemsForNewChildren: this.getAllChildrenItems() });
    this.props.assignmentListStore!.setFromTeachingPath(true);
    this.props.assignmentListStore!.setFiltersForTeachingPath();
    document.addEventListener('keyup', this.handleKeyboardControl);
    this.refButton.current!.focus();
    this.setState({ filtersAjaxLoading: true });
    this.assigValueData('', '', '', '');
    this.setState({ filtersAjaxLoading: false });
    const listGoals = [''];
    this.setState({
      valueStringGoalsOptions: listGoals
    });
    /*this.setState({ filtersAjaxLoadingGoals: true });
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions, listGoals, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data).sort((a, b) => (a.label > b.label) ? 1 : -1)
    });
    this.setState({ filtersAjaxLoadingGoals: false });*/
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
    if (this.state.isEdit) {
      if (this.state.isEditSingle) {
        this.setState({ itemsForNewChildren: [...this.state.itemsForNewChildren, item] });
        this.setState({ greeddata: true });
        this.setState({ selectedAssignmentID: String(item.id) });
        this.setState({ selectedAssignmentTitle: item.title });
        this.setState({ selectedAssignmentDescription: item.description });
        this.setState({ selectedAssignment: item });
        this.setState({ isEditSingle: false });
      } else {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('edit_teaching_path.notifications.neccesary_edit_asignment')
        });
      }
    } else {
      if (ifAddingItemIsSaved) {
        this.setState({ removingItems: this.state.removingItems.filter((el: Assignment) => el.id !== item.id) });
      }
      this.setState({ itemsForNewChildren: [...this.state.itemsForNewChildren, item] });
      /*this.setState({ greeddata: true });
      this.setState({ selectedAssignmentTitle: item.title });
      this.setState({ selectedAssignmentDescription: item.description });
      this.setState({ selectedAssignment: item });*/
    }
  }

  public toSelectItem = (item: Assignment) => {
    this.setState({
      greeddata: true,
      selectedAssignmentTitle: item.title,
      selectedAssignmentDescription: item.description,
      selectedAssignmentID: String(item.id),
      selectedAssignment: item
    });
  }

  public removeItemFromNewChild = async (item: Assignment) => {
    const { currentNode } = this.props.editTeachingPathStore!;

    const ifRemovableItemIsSaved = !!currentNode!.children.filter(
      child => child.items!.find(el => el.value.id === item.id)
    ).length;

    if (ifRemovableItemIsSaved) {
      this.setState({ removingItems: [...this.state.removingItems, item] });
    }
    if (this.state.isEdit) {
      this.setState({ isEditSingle: true });
      this.setState({ isChangeAssingment: true });
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
    if (this.state.isEdit) {
      if (itemsForNewChildren.length) {
        if (this.state.isChangeAssingment) {
          editTeachingPathStore!.currentNode!.editItem(this.state.idChangeAssingment, itemsForNewChildren[0]);
          editTeachingPathStore!.currentEntity!.save();
        }
        this.context.changeContentType(null);
        editTeachingPathStore!.setCurrentNode(null);
      } else {
        editTeachingPathStore!.currentEntity!.save();
        this.context.changeContentType(null);
        editTeachingPathStore!.setCurrentNode(null);
      }
      editTeachingPathStore!.falseIsEditAssignments();
    } else {
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
    if (this.state.isEdit) {
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
          {/* <a href="javascript:void(0)" onClick={this.redirectAssigment}>{intl.get('edit_teaching_path.modals.articles')}</a>*/}
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
          toSelectItem={this.toSelectItem}
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

    let sortedAssignments: Array<Assignment> = [];

    /*const sortedAssignments = assignmentsList.sort(
      (assignment) => {
        const isSelected = !!this.state.itemsForNewChildren.filter(
          (item: Assignment) => item.id === assignment.id
        ).length;
        if (isSelected) {
          return -1;
        }
        return 0;
      }
    );*/
    /*let sortedAssignments: Array<Assignment>= [];
    this.state.itemsForNewChildren.forEach((item) => {
      sortedAssignments = [...assignmentsList.filter((assig: Assignment) => assig.id !== item.id )];
    });*/

    const idValis: Array<number> = [];
    this.state.itemsForNewChildren.forEach((item) => {
      idValis.push(Number(item.id));
    });

    assignmentsList.forEach((assig) => {
      if (!idValis.includes(Number(assig.id))) {
        sortedAssignments.push(assig);
      }
    });

    sortedAssignments = this.state.itemsForNewChildren.concat(sortedAssignments);
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
    const { assignmentListStore, editTeachingPathStore } = this.props;
    const { optionsSubjects, valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    const valueSelectedSubjects = this.state.myValueSubject;
    const value = e.currentTarget.value;
    const valueToArray: Array<number> = [];
    if (!valueSelectedSubjects!.includes(Number(value))) {
      valueSelectedSubjects!.push(Number(value));
      this.setState({ filtersisUsed: true });
    } else {
      if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
        this.setState({ filtersisUsed: true });
      } else {
        this.setState({ filtersisUsed: false });
      }
      const indexSelected = valueSelectedSubjects!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedSubjects!.splice(indexSelected, 1);
      }
    }
    this.setState({
      myValueSubject: valueSelectedSubjects
    });
    optionsSubjects!.forEach((element) => {
      valueSelectedSubjects.forEach((el) => {
        if (Number(element.wp_id) === Number(el)) {
          valueToArray.push(element.id);
          this.setState({ valueSubjectsOptions: valueToArray });
        }
      });
    });
    this.assigValueData(String(this.state.myValueGrade), String(valueSelectedSubjects), '', '');
    assignmentListStore!.setFiltersSubjectID(String(valueSelectedSubjects));
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
    const { assignmentListStore, editTeachingPathStore } = this.props;
    const { optionsGrades, valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    const currentTarget = e.currentTarget;
    // const valueSelectedGrades = this.state.myValueSubject;
    let valueSelectedGrades: Array<number> = [];
    const value = e.currentTarget.value;
    const arrayMyValue = value.split(',');
    const NumberArrayMyValue = [];
    const valueToArray: Array<number> = [];
    const newArrayGradeChildren: Array<Grade> = [];
    let isInclude = this.state.myValueGrade!.includes(Number(value));
    if (arrayMyValue.length > 1) {
      arrayMyValue.forEach((ar) => {
        isInclude = this.state.myValueGrade!.includes(Number(ar));
        NumberArrayMyValue.push(Number(ar));
      });
    } else {
      NumberArrayMyValue.push(Number(value));
    }
    if (!isInclude) {
      currentTarget.classList.add('active');
      valueSelectedGrades = NumberArrayMyValue;
    } else {
      currentTarget.classList.remove('active');
      valueSelectedGrades = [];
      /*const indexSelected = valueSelectedGrades!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedGrades!.splice(indexSelected, 1);
      }*/
    }
    optionsGrades!.forEach((element) => {
      valueSelectedGrades.forEach((el) => {
        if (Number(element.wp_id) === Number(el)) {
          valueToArray.push(element.id);
          if (element.grade_parent !== null) {
            newArrayGradeChildren.push({
              id: element.wp_id,
              title: element.name,
              filterStatus: element.filterStatus,
              grade_parent: element.grade_parent,
              name_sub: element.name_sub
            });
          }
        }
      });
    });
    this.setState({ valueGradesOptions: valueToArray });
    this.setState({ customGradeChildrenList: newArrayGradeChildren });
    this.setState({
      myValueGrade: valueSelectedGrades
    });
    this.assigValueData(String(valueSelectedGrades), String(valueSubjectsOptions), '', '');
    assignmentListStore!.setFiltersGradeID(String(valueSelectedGrades));
  }

  public handleClickChildrenGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { assignmentListStore, editTeachingPathStore } = this.props;
    const { optionsGrades, valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    const currentTarget = e.currentTarget;
    // const valueSelectedGrades = this.state.myValueSubject;
    let valueSelectedGrades: Array<number> = [];
    const value = e.currentTarget.value;
    const arrayMyValue = value.split(',');
    const NumberArrayMyValue = [];
    const valueToArray: Array<number> = [];

    if (value === String(this.state.myValueGrade)) {
      currentTarget.classList.remove('active');
      valueSelectedGrades = [];
    } else {
      currentTarget.classList.add('active');
      arrayMyValue.forEach((ar) => {
        valueSelectedGrades.push(Number(ar));
      });
    }
    optionsGrades!.forEach((element) => {
      valueSelectedGrades.forEach((el) => {
        if (Number(element.wp_id) === Number(el)) {
          valueToArray.push(element.id);
        }
      });
    });
    this.setState({
      myValueGrade: valueSelectedGrades
    });
    this.setState({ valueGradesOptions: valueToArray });
    this.assigValueData(String(valueSelectedGrades), String(valueSubjectsOptions), '', '');
    assignmentListStore!.setFiltersGradeID(String(valueSelectedGrades));
  }

  public handleClickMulti = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { assignmentListStore, editTeachingPathStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    const valueSelectedMulti = this.state.myValueMulti;
    const value = e.currentTarget.value;
    if (!valueSelectedMulti!.includes(Number(value))) {
      valueSelectedMulti!.push(Number(value));
      this.setState({ filtersisUsed: true });
    } else {
      const indexSelected = valueSelectedMulti!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedMulti!.splice(indexSelected, 1);
      }
      if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
        this.setState({ filtersisUsed: true });
      } else {
        this.setState({ filtersisUsed: false });
      }
    }
    assignmentListStore!.setFiltersMultiID(String(valueSelectedMulti));
    this.setState({ valueMultiOptions: valueSelectedMulti });
    /*this.setState({ filtersAjaxLoadingGoals: true });
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(valueCoreOptions, [Number(e.currentTarget.value)], valueGradesOptions, valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data).sort((a, b) => (a.label > b.label) ? 1 : -1)
    });
    this.setState({ filtersAjaxLoadingGoals: false });*/

  }

  public handleClickReading = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const valueSelectedReading = this.state.myValueReading;
    const { assignmentListStore } = this.props;
    this.setState({ valuereadingOptions: Number(value) });
    if (!valueSelectedReading!.includes(Number(value))) {
      valueSelectedReading!.push(Number(value));
      this.setState({ filtersisUsed: true });
    } else {
      const indexSelected = valueSelectedReading!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedReading!.splice(indexSelected, 1);
      }
      if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
        this.setState({ filtersisUsed: true });
      } else {
        this.setState({ filtersisUsed: false });
      }
    }
    assignmentListStore!.setFiltersReadingID(String(valueSelectedReading));
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
      myValueMulti : [],
      myValueReading : [],
      myValueGrade : [],
      myValueSubject : [],
      coreValueFilter : [],
      goalValueFilter : [],
      filtersisUsed: false,
    });
    this.assigValueData('', '', '', '');
    /*this.setState({ filtersAjaxLoadingGoals: true });
    const grepFiltergoalssDataAwait = await this.props.editTeachingPathStore!.getGrepGoalsFilters([], [], [], [], [], MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data).sort((a, b) => (a.label > b.label) ? 1 : -1)
    });
    this.setState({ filtersAjaxLoadingGoals: false });*/
  }

  public handleChangeSelectCore = async (newValue: Array<any>) => {
    const ArrayValue: Array<number> = [];
    const { assignmentListStore, editTeachingPathStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    newValue.forEach((e) => {
      ArrayValue.push(e.value);
    });
    this.setState(
      {
        myValueCore : newValue
      },
      () => {
        if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
          this.setState({ filtersisUsed: true });
        } else {
          this.setState({ filtersisUsed: false });
        }
      }
    );
    this.setState({ valueCoreOptions: ArrayValue });
    this.assigValueData(String(this.state.myValueGrade), String(this.state.myValueSubject), String(ArrayValue), String(this.state.myValueGoal));
    /*this.setState({ filtersAjaxLoadingGoals: true });
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(ArrayValue, valueMultiOptions, valueGradesOptions, valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data).sort((a, b) => (a.label > b.label) ? 1 : -1)
    });
    this.setState({ filtersAjaxLoadingGoals: false });*/
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
    const ArrayValue: Array<number> = [];
    let singleString : string = '';
    this.setState(
      {
        myValueGoal : newValue
      },
      () => {
        if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
          this.setState({ filtersisUsed: true });
        } else {
          this.setState({ filtersisUsed: false });
        }
      }
    );
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
      });
    }
    newValue.forEach((e) => {
      ArrayValue.push(e.value);
    });
    this.assigValueData(String(this.state.myValueGrade), String(this.state.myValueSubject), String(this.state.myValueCore), String(ArrayValue));
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
  public openAssignmentReading = (e: React.MouseEvent<HTMLButtonElement>) => {
    const url = e.currentTarget.value;
    window.open(`${url}`, '_blank');
  }

  public renderInformationContent = () => {
    const { selectedAssignmentTitle, selectedAssignmentDescription, selectedAssignmentID, expand } = this.state;
    const textexpand = expand ? intl.get('edit_teaching_path.modals.expandclose') : intl.get('edit_teaching_path.modals.expand');
    const url = `/assignments/view/${selectedAssignmentID}?preview`;
    return (
      <div className="defaultContentModal">
        <h2>{intl.get('edit_teaching_path.modals.assignments_title')}</h2>
        <div className="defaultContentModal__content">
          <h3>{selectedAssignmentTitle}</h3>
          <p>{selectedAssignmentDescription}</p>
          <button value={url} className="CreateButton" onClick={this.openAssignmentReading}>{intl.get('edit_teaching_path.modals.assignments_read')}</button>
        </div>
        <div className="defaultContentModal__expand">
          <div className={`expandContent ${expand && 'active'}`} onClick={this.toggleData}>{textexpand}</div>
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
              customGradesList={this.state.gradesArrayFilter}
              customCoreTPList={this.state.optionsCore}
              customGoalsTPList={this.state.optionsGoals}
              customMultiList={this.state.optionsMulti}
              customReadingList={this.state.optionsReading}
              customGradeChildrenList={this.state.customGradeChildrenList}
              filtersisUsed={this.state.filtersisUsed}
              filtersAjaxLoading={this.state.filtersAjaxLoading}
              filtersAjaxLoadingGoals={this.state.filtersAjaxLoadingGoals}
              customSubjectsList={this.state.subjectsArrayFilter}
              // METHODS
              handleChangeSubject={this.handleChangeSubject}
              handleChangeGrade={this.handleChangeGrade}
              handleClickChildrenGrade={this.handleClickChildrenGrade}
              handleInputSearchQuery={this.handleInputSearchQuery}
              handleClickGrade={this.handleClickGrade}
              handleClickSubject={this.handleClickSubject}
              handleClickMulti={this.handleClickMulti}
              handleClickReading={this.handleClickReading}
              handleChangeSelectCore={this.handleChangeSelectCore}
              handleChangeSelectGoals={this.handleChangeSelectGoals}
              handleClickReset={this.handleClickReset}
              // VALUES
              defaultValueSubjectFilter={String(assignmentListStore!.subjectFilterValue)}
              defaultValueGradeFilter={String(assignmentListStore!.gradeFilterValue)}
              searchQueryFilterValue={assignmentListStore!.searchQueryFilterValue}
              defaultValueMainFilter={String(this.state.myValueMulti)}
              defaultValueReadingFilter={String(this.state.myValueReading)}
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
