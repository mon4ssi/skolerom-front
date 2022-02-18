import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { RouteChildrenProps, RouteComponentProps, withRouter } from 'react-router-dom';
import isNull from 'lodash/isNull';

import { NewAssignmentStore } from './NewAssignmentStore';
import { AttachmentContentType, AttachmentContentTypeContext } from './AttachmentContentTypeContext';

import { Header } from './Header/Header';
import { AssignmentTitle } from './AssignmentTitle/AssignmentTitle';
import { AddQuestion } from './AddQuestion/AddQuestion';
import { Preview } from './Preview/Preview';
import { QuestionsList } from './Questions/QuestionsList';
import { PublishingPage } from 'components/pages/PublishingPage/PublishingPage';
import { DistributionPage } from 'components/pages/DistributionPage/DistributionPage';
import { SetRelatedArticles } from './SetRelatedArticles/SetRelatedArticles';
import { Loader } from 'components/common/Loader/Loader';

import './NewAssignment.scss';
import { TeacherGuidanceAssigModal } from '../TeacherGuidance/TeacherGuidanceAssigModal';

interface Props extends RouteChildrenProps<{ id: string }> {
  newAssignmentStore?: NewAssignmentStore;
}

interface State {
  contentType: AttachmentContentType | null;
}

@inject('newAssignmentStore', 'assignmentListStore')
@observer
class NewAssignmentComponent extends Component<Props & RouteComponentProps, State> {
  public static contextType = AttachmentContentTypeContext;

  public state = {
    contentType: null,
  };

  private changeContentType = (contentType: AttachmentContentType | null) => {
    this.setState({ contentType });
  }

  public async componentDidMount() {
    const { newAssignmentStore, history } = this.props;
    newAssignmentStore!.getArticles({});
    const response = await newAssignmentStore!.getAssigmentForEditing(this.getParams());
    const headerArray = Array.from(document.getElementsByClassName('AppHeader') as HTMLCollectionOf<HTMLElement>);
    headerArray[0].style.display = 'none';
    if (isNull(response)) {
      history.push('/not-found');
    }
  }

  public componentWillUnmount() {
    this.props.newAssignmentStore!.clearAssignmentContainer();
    const headerArray = Array.from(document.getElementsByClassName('AppHeader') as HTMLCollectionOf<HTMLElement>);
    headerArray[0].style.display = 'flex';
  }

  public getParams = (): number =>
    Number(this.props!.match!.params!.id)

  public renderCreationPage = () => {
    const { newAssignmentStore, location } = this.props;
    const { contentType } = this.state;
    const currentAssignment = newAssignmentStore!.currentEntity!;

    const backdrop = (!isNull(contentType) && Number(contentType) > 0) ? 'backdrop' : '';

    return !location!.pathname.includes('distribute') &&
      !location!.pathname.includes('publish') && (
        <>
          <Header
            isCreation
            newAssignmentStore={this.props.newAssignmentStore}
          />
          <div className="main flexBox spaceBetween">
            <div className={'addAssignmentFlow w50'}>
              <AssignmentTitle assignment={currentAssignment} />
              <TeacherGuidanceAssigModal
                newAssignmentStore={newAssignmentStore}
                drafAssignment={currentAssignment}
              />
              <SetRelatedArticles />
              <QuestionsList assignment={currentAssignment} />
              <AddQuestion />
            </div>
            {backdrop && <div className={'backdrop'} />}
            <Preview />
          </div>
        </>
      );
  }

  public renderPublishingPage = () => (
    this.props.location!.pathname.includes('publish') && (
      <>
        <Header isPublishing />
        <PublishingPage store={this.props.newAssignmentStore} from="ASSIGNMENT"/>
      </>
    )
  )

  public renderDistributionPage = () => (
    this.props.location!.pathname.includes('distribute') && (
      <>
        <Header isDistribution />
        <DistributionPage store={this.props.newAssignmentStore} />
      </>
    )
  )

  public render() {
    const { contentType } = this.state;
    const { newAssignmentStore } = this.props;
    const { assignmentContainer } = newAssignmentStore!;

    if (!assignmentContainer) {
      return (
        <div className={'loading'}><Loader /></div>
      );
    }

    return (
      <div className="NewAssignment flexBox dirColumn">
        <AttachmentContentTypeContext.Provider value={{ contentType, changeContentType: this.changeContentType }}>

          {this.renderCreationPage()}

          {this.renderPublishingPage()}

          {this.renderDistributionPage()}

        </AttachmentContentTypeContext.Provider>
      </div>
    );
  }
}

export const NewAssignment = withRouter(NewAssignmentComponent);
