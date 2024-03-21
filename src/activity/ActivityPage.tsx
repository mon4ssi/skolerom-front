import React, { Component, createRef, ChangeEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { lettersNoEn } from 'utils/lettersNoEn';

import { IListWidgetItem, ListWidget } from './Widget/ListWidget';
import { SliderWidget } from './Widget/SliderWidget';
import { StatisticWidget } from './Widget/StatisticWidget/StatisticWidget';
import { LoginStore } from 'user/view/LoginStore';
import { ActivityStore } from './ActivityStore';
import { RecentActivitiesList } from './RecentActivity/RecentActivity';
import { Assignment } from '../assignment/Assignment';
import { TeachingPath } from '../teachingPath/TeachingPath';
import { UserType } from '../user/User';
import { Popup } from 'components/common/Popup/Popup';
import { Loader } from 'components/common/Loader/Loader';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';

import assignmentsImg from 'assets/images/assignment.svg';
import teachingPathImg from 'assets/images/teaching-path.svg';
import search from 'assets/images/search-bold.svg';

import placeholder from 'assets/images/list-placeholder.svg';

import './ActivityPage.scss';

const loadRecentActivityInterval = 30000;
const ENTER_KEYCODE = 13;
const studentAmountArticles = 7;
const teacherAmountArticles = 4;
const number200 = 200;
const number2 = 2;
const numb99 = 90000;
const num100 = 10000;

interface ActivityPageProps {
  newAssignmentStore?: NewAssignmentStore;
  editTeachingPathStore?: EditTeachingPathStore;
  assignmentListStore?: AssignmentListStore;
  activityStore?: ActivityStore;
  loginStore?: LoginStore;
  role: UserType;
}

interface ActivityPageState {
  iframeURL: string;
  popupShown: boolean;
  isPause: boolean;
  chargeIframe: boolean;
  openModalInside: boolean;
  searchQueryValue : string;
  mathversion: number;
}

@inject('activityStore', 'loginStore', 'newAssignmentStore', 'editTeachingPathStore', 'assignmentListStore')
@observer
class Activity extends Component<ActivityPageProps & RouteComponentProps, ActivityPageState> {
  private ref = createRef<HTMLDivElement>();
  private activityAsideReft = createRef<HTMLDivElement>();
  private iframeref = createRef<HTMLIFrameElement>();
  private getRecentActivityWithInterval: number = 0;

  public state = {
    iframeURL: '',
    popupShown: false,
    isPause: false,
    chargeIframe: false,
    openModalInside: false,
    searchQueryValue : '',
    mathversion: 0
  };

  private loadWidgetData() {
    const { role, activityStore } = this.props;
    switch (role) {
      case UserType.Teacher:
        activityStore!.loadSliderWidget(UserType.Teacher);
        break;
      case UserType.Student:
        activityStore!.loadSliderWidget(UserType.Student);
        break;
      case UserType.ContentManager:
        activityStore!.loadSliderWidget(UserType.Teacher);
        activityStore!.loadSliderWidget(UserType.Student);
        break;
      default:
        throw new Error(`Undefined user role: ${role}`);
    }
  }

  private onClickArticle = (url: string) => () => {
    window.open(url, '_blank');
  }

  private onClickTeachingPath = (teachingPath: TeachingPath) => () => {
    if (teachingPath.view === 'edit') {
      return this.props.history.push(`/teaching-paths/edit/${teachingPath.id}`);
    }
    return this.props.history.push(`/teaching-paths/view/${teachingPath.id}`, {
      readOnly: true
    });
  }

  private onClickAssignment = (assignment: Assignment) => () => {
    if (assignment.view === 'edit') {
      return this.props.history.push(`/assignments/edit/${assignment.id}`);
    }
    return this.props.history.push(`/assignments/view/${assignment.id}`, {
      readOnly: true
    });
  }

  private closePopup = () => {
    this.setState({
      popupShown: false,
      iframeURL: '',
    });
  }

  private openPopup = (url: string) => {
    this.setState({
      popupShown: true,
      iframeURL: url,
    });
  }

  private getNewestArticles = (): Array<IListWidgetItem> => {
    const { activityStore } = this.props;

    return activityStore!.newestArticles.map((article) => {
      const widgetItem = {
        id: article.id,
        text: article.title,
        imageSrc: (article.images && article.images.url) ? article.images.url : placeholder,
        onClick: this.onClickArticle(article.url!)
      } as IListWidgetItem;
      return widgetItem;
    }
    );
  }

  private getNewestAssignments = (): Array<IListWidgetItem> => {
    const { activityStore } = this.props;

    return activityStore!.newestAssignments.map((assignment) => {
      const widgetItem = {
        id: assignment.id,
        text: assignment.title,
        imageSrc: assignment.featuredImage ? assignment.featuredImage : placeholder,
        onClick: this.onClickAssignment(assignment)
      } as IListWidgetItem;
      return widgetItem;
    }
    );
  }

  private getNewestTeachingPaths = (): Array<IListWidgetItem> => {
    const { activityStore } = this.props;

    return activityStore!.newestTeachingPaths.map((teachingPath) => {
      const widgetItem = {
        id: teachingPath.id,
        text: teachingPath.title,
        imageSrc: teachingPath.featuredImage || placeholder,
        onClick: this.onClickTeachingPath(teachingPath)
      } as IListWidgetItem;
      return widgetItem;
    }
    );
  }

  private renderRecentActivitiesList = () =>
    this.props.role !== UserType.Student && (
        <div className="ActivityPage__widget" aria-live="polite">
          <RecentActivitiesList/>
        </div>
      )

  private renderTeachingPathList = () => {
    const { activityStore, role } = this.props;

    return (role === UserType.Teacher || role === UserType.ContentManager) && (
        <div className="ActivityPage__widget">
          <ListWidget
            state={activityStore!.newestTeachingPathState}
            title={intl.get('activity_page.new_teaching_path')}
            items={this.getNewestTeachingPaths()}
          />
        </div>
      );
  }

  private renderStatisticWidget = () => {
    const { activityStore, role } = this.props;

    return role !== UserType.Student && (
      <div className="ActivityPage__widget">
        <StatisticWidget
          state={activityStore!.statisticWidgetState}
          widget={activityStore!.statisticWidget}
        />
      </div>
    );
  }

  private renderSliderWidget = (role: UserType.Student | UserType.Teacher) => {
    const { activityStore } = this.props;
    return (
      <div className="ActivityPage__widgetSlider ActivityPage__widget">
        <SliderWidget
          onPopup={this.openPopup}
          state={activityStore!.getSliderWidgetState(role)}
          widget={activityStore!.getSliderWidget(role)}
        />
      </div>
    );
  }

  private renderSliderWidgetBlock = () => {
    const { role } = this.props;
    return (
      <>
        {role === UserType.ContentManager && <span className={'ActivityPage__targetRoleTitle'}>{intl.get('activity_page.teacher’s_view')}</span>}
        {this.renderSliderWidget(role === UserType.Student ? UserType.Student : UserType.Teacher)}
        {role === UserType.ContentManager && <span className={'ActivityPage__targetRoleTitle'}>{intl.get('activity_page.student’s_view')}</span>}
        {role === UserType.ContentManager && this.renderSliderWidget(UserType.Student)}
        {this.renderPopup()}
      </>
    );
  }

  private renderAssignmentWidget = () => {
    const { activityStore, role } = this.props;

    return (role === UserType.Teacher || role === UserType.ContentManager) && (
      <div className="ActivityPage__widget">
        <ListWidget
          state={activityStore!.newestAssignmentsState}
          title={intl.get('activity_page.new_assignments')}
          items={this.getNewestAssignments()}
        />
      </div>
    );
  }

  // don't move to SliderWidget component because of issues with z-index on Content Manager side:
  // the second slider overlay popup related to first slider
  private renderPopup() {
    return (
      <Popup
        visible={this.state.popupShown}
        onClose={this.closePopup}
      >
        <iframe
          title="SliderWidget"
          src={this.state.iframeURL}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Popup>
    );
  }

  public componentDidMount() {
    const { activityStore, role } = this.props;
    this.setState({
      mathversion : Math.floor(Math.random() * numb99) + num100
    });
    // activityStore!.loadNewestArticles(role === UserType.Student ? studentAmountArticles : teacherAmountArticles);
    if (role === UserType.Teacher || role === UserType.ContentManager) {
      // activityStore!.loadNewestTeachingPaths();
      // activityStore!.loadNewestAssignments();
    }
    if (role === UserType.Teacher) {
      // activityStore!.loadRecentActivity();
      // activityStore!.loadStatisticWidget();
      if (!this.state.isPause) {
        this.getRecentActivityWithInterval = window.setInterval(
          () => {
            this.props.activityStore!.loadRecentActivity();
          },
          loadRecentActivityInterval,
        );
      }
    }
    // this.loadWidgetData();
    document.addEventListener('keyup', this.handleKeyboardControl);
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const classDivPath = (event.composedPath()[0] as Element).className;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    const qlEditorText = 'ql-editor';
    if (htmlPathArea !== htmlText && htmlPathArea !== inputText && classDivPath !== qlEditorText) {
      if ((event.shiftKey && event.key === 'H') || (event.shiftKey && event.key === 'h')) {
        this.ref.current!.focus();
      }
    }
  }

  public stopComponent() {
    if (this.props.activityStore) {
      if (!this.state.isPause) {
        this.setState({
          isPause: true
        });
        window.clearInterval(this.getRecentActivityWithInterval);
      } else {
        this.setState({
          isPause: false
        });
        this.getRecentActivityWithInterval = window.setInterval(
          () => {
            this.props.activityStore!.loadRecentActivity();
          },
          loadRecentActivityInterval,
        );
      }
    }
  }

  public componentWillUnmount() {
    const { activityStore, role } = this.props;
    // activityStore!.resetNewestArticles();
    if (role === UserType.Teacher) {
      // window.clearInterval(this.getRecentActivityWithInterval);
      // activityStore!.resetNewestTeachingPaths();
    }
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public iframeRender = () => {
    const { activityStore, role } = this.props;
    // const url = activityStore!.urliframe.toString();
    const urlteacher = `${process.env.REACT_APP_WP_URL}/wp-content/uploads/sites/2/mainapp/main_app_page.html?version=${this.state.mathversion}`;
    const urlstunded = `${process.env.REACT_APP_WP_URL}/wp-content/uploads/sites/2/mainapp/main_app_page.html?version=${this.state.mathversion}`;
    const url = (role === 'STUDENT') ? urlstunded : urlteacher;
    const anyclass = this.state.chargeIframe ? 'iframeContent' : 'iframeContent hidden';
    return (
      <div className={anyclass}>
        <iframe
          src={url}
          ref={this.iframeref}
          width={'100%'}
          onLoad={() => this.resize()}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  public changeModalInside = () => {
    if (this.state.openModalInside) {
      this.setState({ openModalInside: false });
    } else {
      this.setState({ openModalInside: true });
    }
  }

  public createAndGoToAssignment = async () => {
    const { newAssignmentStore, history } = this.props;
    const id = await newAssignmentStore!
      .createAssigment()
      .then(response => response.id);
    history.push(`/assignments/edit/${id}`);
  }

  public createTeachingPath = async () => {
    const { editTeachingPathStore, history } = this.props;
    const id = await editTeachingPathStore!
      .createTeachingPath()
      .then(response => response.id);
    history.push(`/teaching-paths/edit/${id}`);
  }

  public renderModal = () => (
    <div className="insideModal">
      <ul>
        <li>
          <a href="javascript:void(0)" onClick={this.createTeachingPath}>
            <img src={teachingPathImg} />
            {intl.get('teaching path')}
          </a>
        </li>
        <li>
          <a href="javascript:void(0)" onClick={this.createAndGoToAssignment}>
            <img src={assignmentsImg} />
            {intl.get('assignment')}
          </a>
        </li>
      </ul>
    </div>
  )

  public handleInputSearchQueryonKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { history } = this.props;
    const val = e.currentTarget.value;
    if (lettersNoEn(val)) {
      this.setState({ searchQueryValue: e.currentTarget.value });
      if (val.length > number2) {
        if (e.key === 'Enter') {
          history.push(`/search/article?search=${val}`);
        }
      }
    }
  }

  public handleInputSearchQuery = async (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (lettersNoEn(val)) {
      this.setState({ searchQueryValue: e.target.value });
    }
  }

  public resize = () => {
    /* const heightActivy = Number(this.activityAsideReft.current!.clientHeight) + number200;
    const stringHeight = `${String(heightActivy)}px`;
    this.iframeref.current!.setAttribute('height', stringHeight); */
    this.setState({
      chargeIframe: true
    });
  }

  public renderNewButton = () => (
    <div className="ActivityPage__searchBar__right">
      <button className="CreateButton" onClick={this.changeModalInside}>
        <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill-rule="evenodd"><path fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z" /></svg>
        {intl.get('new')}
      </button>
      {this.state.openModalInside && this.renderModal()}
    </div>
  )

  public render() {
    const { activityStore, loginStore, role } = this.props;
    const username = loginStore!.currentUser ? loginStore!.currentUser.name : 'username';
    const isContentManager = loginStore!.currentUser!.type === UserType.ContentManager;
    const isNotStudent = (role === UserType.Teacher || role === UserType.ContentManager) ? true : false ;
    const classIsNotStudent = isNotStudent ? 'ActivityPage__searchBar__left' : 'ActivityPage__searchBar__left active';
    return (
      <div className="ActivityPage">
        <div className="ActivityPage__greeting" ref={this.ref}>
          <h1>{intl.get('activity_page.Hello')} {username}</h1>
        </div>
        <div className="ActivityPage__searchBar">
          <div className={classIsNotStudent}>
            <img src={search} />
            <input
              type="text"
              placeholder={intl.get('assignments search.Search')}
              aria-required="true"
              aria-invalid="false"
              value={this.state.searchQueryValue}
              onChange={this.handleInputSearchQuery}
              onKeyUp={this.handleInputSearchQueryonKeyUp}
            />
          </div>
          {(isNotStudent) && this.renderNewButton()}
        </div>
        <div className="ActivityPage__content">
          <div className="ActivityPage__main">
            {!this.state.chargeIframe && <Loader />}
            {this.iframeRender()}
          </div>
        </div>
      </div>
    );
  }
}

export const ActivityPage = withRouter(Activity);
