import React, { Component } from 'react';
import { BrowserRouter, Redirect, Switch, Route } from 'react-router-dom';
import intl from 'react-intl-universal';
import moment from 'moment';
import { Provider, inject, observer } from 'mobx-react';
// import { isIE } from 'react-device-detect';
import classNames from 'classnames';

import en from 'locales/en.json';
import nb from 'locales/nb.json';
import nn from 'locales/nn.json';
import { nbMoment } from 'locales/nbMoment';
import { nnMoment } from 'locales/nnMoment';

import { Router } from 'Router';
import { Sidebar } from 'components/layout/Sidebar/Sidebar/Sidebar';
import { AppHeader } from '../layout/AppHeader/AppHeader';
import { AssignStudentToAssignment } from 'assignment/view/AssignStudentToAssignment/AssignStudentToAssignment';
import { AssignStudentToTeachingPath } from 'teachingPath/view/AssignStudentToTeachingPath/AssignStudentToTeachingPath';
import { Submitted } from 'components/pages/Submited/Submitted';
import { LoginPage } from 'user/view/LoginPage/LoginPage';
import { LogOutPage } from 'user/view/LogOutPage/LogOutPage';
import { FeideCodeGetter } from 'user/view/FeideCodeGetter/FeideCodeGetter';
import { NewAssignment } from 'assignment/view/NewAssignment/NewAssignment';
import { CurrentAssignmentPage } from 'assignment/view/CurrentAssignmentPage/CurrentAssignmentPage';
import { CurrentAssignmentPagePreview } from 'assignment/view/CurrentAssignmentPage/CurrentAssignmentPagePreview';
import { CreateNewAssignmentFromArticle } from 'assignment/view/CreateNewAssignmentFromArticle/CreateNewAssignmentFromArticle';
import { PassageTeachingPath } from 'teachingPath/view/PassageTeachingPath/PassageTeachingPath';
import { PreviewTeachingPath } from 'teachingPath/view/PreviewTeachingPath/PreviewTeachingPath';
import { EditTeachingPath } from 'teachingPath/view/EditTeachingPath/EditTeachingPath';
import { ConfirmationPage } from 'components/pages/DistributionPage/ConfirmationPage/ConfirmationPage';

import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { CurrentQuestionaryStore } from 'assignment/view/CurrentAssignmentPage/CurrentQuestionaryStore';
import { AssignmentEvaluationStore } from 'assignment/EvaluationDraft/AssignmentEvaluationStore';
import { TeachingPathEvaluationStore } from 'teachingPath/evaluationDraft/TeachingPathEvaluationStore';
import { UIStore } from 'locales/UIStore';
import { LoginStore } from 'user/view/LoginStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { StudentsListStore } from 'student/StudentsListStore';
import { ActivityStore } from 'activity/ActivityStore';
import { UserType } from 'user/User';
import { QuestionaryTeachingPathStore } from 'teachingPath/questionaryTeachingPath/questionaryTeachingPathStore';
import { RedirectPage } from 'user/view/RedirectPage';
import closeImg from 'assets/images/close.svg';

import { DEFAULT_LOCALE, GENERAL_MOBILE_WIDTH, TABLET_WIDTH } from 'utils/constants';
import { Locales } from 'utils/enums';

import './App.scss';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
// import { IEMessage } from 'components/pages/IEMessage/IEMessage';

// tslint:disable-next-line: no-any
const CurrentAssignmentPageView = (props: any) => <CurrentAssignmentPage {...props} isTeacher />;
const CurrentAssignmentPagePreviewView = (props: any) => <CurrentAssignmentPagePreview {...props} isTeacher />;

// tslint:disable-next-line: no-any
const ViewTeachingPath = (props: any) => <EditTeachingPath {...props} readOnly />;
const loadDataMaintenance = 30000;
const SECOND = 2;

interface Props {
  uiStore?: UIStore;
  loginStore?: LoginStore;
}

const routesWithoutSidebar = [
  '/assignment/:id',
  '/teaching-paths/:id',
  '/teaching-paths/edit',
  '/assignments/edit'
];

const routesWithSidebar = [
  '/teaching-paths/my',
  '/teaching-paths/all',
  '/teaching-paths/answers/:entityId'
];

const emptyRouteStyle = {
  display: 'none',
};

@inject('uiStore', 'loginStore')
@observer
class LocalizedApp extends Component<Props> {
  public state = {
    isLocalesLoaded: false,
    isMaintenance : false,
    isMaintenanceClose : true,
    isDataText : ''
  };

  private renderEmptyRoute = (path: string) => (
    <Route key={path} path={path}>
      <div style={emptyRouteStyle}/>
    </Route>
  )

  private renderSidebar = (path: string) => (
    <Route key={path} path={path}>
      <Sidebar />
    </Route>
  )

  public maintenanceRender = async () => {
    const mydata = await this.props.loginStore!.getMaintenance_data();
    if (mydata.maintenance_mode) {
      this.setState({ isDataText: mydata.maintenance_msg });
      const MyStartTime = mydata.start_time;
      const MyEndTime = mydata.end_time;
      const MyStartTimeValue = this.changeNewdate(MyStartTime);
      const MyEndTimeValue = this.changeNewdate(MyEndTime);
      const date = new Date();
      const exactlyHour = date.getTime();
      if (MyStartTimeValue <= exactlyHour &&  exactlyHour <= MyEndTimeValue) {
        this.setState({ isMaintenance: true });
      } else {
        this.setState({ isMaintenance: false });
      }
    } else {
      this.setState({ isMaintenance: false });
    }
  }

  public changeNewdate = (valueConverseDate: string) => {
    const year = parseFloat(valueConverseDate.split('-')[0].split('/')[0]);
    const month = parseFloat(valueConverseDate.split('-')[0].split('/')[1]) - 1;
    const day = parseFloat(valueConverseDate.split('-')[0].split('/')[SECOND]);
    const hour = parseFloat(valueConverseDate.split('-')[1].split(':')[0]);
    const minute = parseFloat(valueConverseDate.split('-')[1].split(':')[1]);
    const response = new Date(year, month, day, hour, minute);
    const responseTime = response.getTime();
    return responseTime;
  }

  public componentDidMount() {
    this.loadLocales();
    this.maintenanceRender();
    window.setInterval(
      () => {
        this.maintenanceRender();
      },
      loadDataMaintenance,
    );
  }

  public loadLocales = async () => {
    const { uiStore, loginStore } = this.props;

    const locales = {
      en,
      nb,
      nn
    };

    const currentLocale = localStorage.getItem('currentLocale');

    if (currentLocale && [Locales.EN, Locales.NB, Locales.NN].includes(currentLocale as Locales)) {
      uiStore!.setCurrentLocale(currentLocale);
    } else {
      uiStore!.setCurrentLocale(DEFAULT_LOCALE);
    }

    intl
      .init({
        locales,
        currentLocale: uiStore!.currentLocale,
      })
      .then(() => {
        this.setState({ isLocalesLoaded: true });
        moment.locale(Locales.NB, nbMoment);
        moment.locale(Locales.NN, nnMoment);
      });

    await loginStore!.getLocaleData();
  }

  public closeRenderMaintenance = () => {
    this.setState({ isMaintenance: false });
    this.setState({ isMaintenanceClose: false });
  }

  public renderMaintenance = () => (
    <div className="maintenance">
      <div className="maintenance__content" id="maintenance__content">
        {this.state.isDataText}
      </div>
      <div className="maintenance__close" onClick={this.closeRenderMaintenance}>
        <img src={closeImg} />
        <p>{intl.get('generals.close_maintenance')}</p>
      </div>
    </div>
  )

  public render() {
    const { isMaintenance, isLocalesLoaded } = this.state;
    const { loginStore } = this.props;

    if (!isLocalesLoaded) {
      return (<></>);
    }

    const currentUserRole = JSON.parse(localStorage.getItem('USER_DATA') || '{}').role;
    const contentManagerRoutes = (
      <>
        <Route
          path="/assignments/edit/:id"
          component={NewAssignment}
        />

        <Route
          path="/teaching-paths/edit/:id"
          component={EditTeachingPath}
        />

        <Route
          path="/teaching-paths/view/:id"
          component={ViewTeachingPath}
        />

        <Route
          exact
          path="/assignments/view/:id"
          component={CurrentAssignmentPageView}
        />

        <Route
          exact
          path="/assignments/preview/:id"
          component={CurrentAssignmentPagePreviewView}
        />

        <Route
          path="/teaching-path/preview/:id"
          component={PreviewTeachingPath}
        />

        <Route path="/login" component={LoginPage} />
        <Route path="/logout" component={LogOutPage} />
        <Route path="/dataporten" component={FeideCodeGetter} />
      </>
    );

    const teacherRoutes = (
      <>
        <Route
          path="/assignments/edit/:id"
          component={NewAssignment}
        />

        <Route
          path="/assignments/edit"
          component={CreateNewAssignmentFromArticle}
          exact
        />
        <Route
          path="/assignments/view/:id"
          component={CurrentAssignmentPageView}
        />

        <Route
          exact
          path="/assignments/preview/:id"
          component={CurrentAssignmentPagePreviewView}
        />

        <Route
          path="/teaching-paths/edit/:id"
          component={EditTeachingPath}
        />

        <Route
          path="/teaching-paths/view/:id"
          component={ViewTeachingPath}
        />

        <Route
          path="/teaching-path/preview/:id"
          component={PreviewTeachingPath}
        />

        <Route
          path="/distributed"
          component={ConfirmationPage}
        />

        <Route path="/login" component={LoginPage} />
        <Route path="/logout" component={LogOutPage} />
        <Route path="/dataporten" component={FeideCodeGetter} />
      </>
    );

    const studentRoutes = (
      <>
        <Route
          path="/assignment/:id"
          component={CurrentAssignmentPage}
        />

        <Route
          exact
          path="/teaching-path/:id"
          component={PassageTeachingPath}
        />
        <Route
          path="/submitted"
          component={Submitted}
        />

        <Route path="/login" component={LoginPage} />
        <Route path="/logout" component={LogOutPage} />
        <Route path="/dataporten" component={FeideCodeGetter} />
      </>
    );

    const mainClasses = classNames('App__content', {
      App__content_shifted: this.props.uiStore!.sidebarShown
    });

    // if (isIE) return <IEMessage />;

    /*if (window.screen.width <= TABLET_WIDTH && window.screen.width > GENERAL_MOBILE_WIDTH) {
      window.addEventListener('orientationchange', (event) => {
        if (window.orientation === 0) {
          Notification.create({
            type: NotificationTypes.ERROR,
            title: intl.get('notifications.landscapeMode')
          });
        }
      });
    }*/

    return (
      <BrowserRouter>
        <div className={`App flexBox fw500 ${isMaintenance ? 'isMaintenance' : ''}`}>
          {this.state.isMaintenance && this.state.isMaintenanceClose && this.renderMaintenance()}
          <AppHeader />

          <div className="App__view" id="view">
            {!!loginStore!.currentUser || <Redirect to="/login"/>}
            <div className="App__sidebar">
              <Switch>
                {routesWithSidebar.map(this.renderSidebar)}
                {routesWithoutSidebar.map(this.renderEmptyRoute)}
                <Route path="/">
                  <aside className="App__sidebar">
                    {loginStore!.currentUser && <Sidebar />}
                  </aside>
                </Route>
              </Switch>
            </div>

            <main className={mainClasses}>
              <Switch>
                <Route
                  path="/assignments/:id/invitation"
                  component={AssignStudentToAssignment}
                />
                <Route
                  path="/teaching-path/:id/invitation"
                  component={AssignStudentToTeachingPath}
                />
                <Router />
              </Switch>
            </main>
          </div>

          <Switch>

            {currentUserRole === UserType.Teacher && teacherRoutes}
            {currentUserRole === UserType.Student && studentRoutes}
            {currentUserRole === UserType.ContentManager && contentManagerRoutes}

            <Route path="/login" component={LoginPage} />
            <Route path="/logout" component={LogOutPage} />
            <Route path="/dataporten/auth" component={RedirectPage} />
            <Route path="/dataporten" component={FeideCodeGetter} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export class App extends Component {

  public render() {
    return (
      <Provider
        newAssignmentStore={new NewAssignmentStore()}
        assignmentListStore={new AssignmentListStore()}
        currentQuestionaryStore={new CurrentQuestionaryStore()}
        uiStore={new UIStore()}
        loginStore={new LoginStore()}
        editTeachingPathStore={new EditTeachingPathStore()}
        questionaryTeachingPathStore={new QuestionaryTeachingPathStore()}
        teachingPathsListStore={new TeachingPathsListStore()}
        assignmentEvaluationStore={new AssignmentEvaluationStore()}
        teachingPathEvaluationStore={new TeachingPathEvaluationStore()}
        studentsListStore={new StudentsListStore()}
        activityStore={new ActivityStore()}
      >
        <LocalizedApp />
      </Provider>
    );
  }
}
