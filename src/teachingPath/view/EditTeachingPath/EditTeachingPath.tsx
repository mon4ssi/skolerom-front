import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { RouteChildrenProps, RouteComponentProps, withRouter } from 'react-router-dom';

import { ItemContentType, ItemContentTypeContext } from './ItemContentTypeContext';
import { EditTeachingPathStore } from './EditTeachingPathStore';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { CreationPage } from './CreationPage/CreationPage';
import { PublishingPage } from 'components/pages/PublishingPage/PublishingPage';
import { DistributionPage } from 'components/pages/DistributionPage/DistributionPage';
import { Header } from './Header/Header';
import { Loader } from 'components/common/Loader/Loader';
import { STATUS_FORBIDDEN } from 'utils/constants';

import './EditTeachingPath.scss';

interface Props extends RouteChildrenProps<{ id: string }> {
  editTeachingPathStore?: EditTeachingPathStore;
  newAssignmentStore?: NewAssignmentStore;
  readOnly?: boolean;
}
interface State {
  contentType: ItemContentType | null;
}

@inject('newAssignmentStore', 'editTeachingPathStore')
@observer
class EditTeachingPathComponent extends Component<Props & RouteComponentProps, State> {

  public state = {
    contentType: null,
  };

  private changeContentType = (contentType: ItemContentType | null) => {
    this.setState({ contentType });
  }

  public async componentDidMount() {
    const { editTeachingPathStore, readOnly, history } = this.props;
    const { getTeachingPathForEditing, isAssignmentCreating, getDraftForeignTeachingPath } = editTeachingPathStore!;

    this.props.editTeachingPathStore!.getArticles({});
    const headerArray = Array.from(document.getElementsByClassName('AppHeader') as HTMLCollectionOf<HTMLElement>);
    headerArray[0].style.display = 'none';

    if (!isAssignmentCreating) {
      if (readOnly) {
        const result = await getDraftForeignTeachingPath(this.getParams());
        if (result.isOwnedByMe()) {
          this.props.history.replace(`/teaching-paths/edit/${this.getParams()}`);
        }
      } else {
        try {
          await getTeachingPathForEditing(this.getParams());
        } catch (error) {
          if (error.response && error.response.status === STATUS_FORBIDDEN) {
            history.push('/not-found');
          }
        }
      }
    } else {
      editTeachingPathStore!.setIsAssignmentCreating(false);
    }
  }

  public componentWillUnmount() {
    if (!this.props.editTeachingPathStore!.isAssignmentCreating) {
      this.props.editTeachingPathStore!.resetTeachingPath();
    }
    const headerArray = Array.from(document.getElementsByClassName('AppHeader') as HTMLCollectionOf<HTMLElement>);
    headerArray[0].style.display = 'flex';
  }

  public getParams = (): number => (
    Number(this.props!.match!.params!.id)
  )

  public renderCreationPage = () => {
    const { location, readOnly } = this.props;
    return !location!.pathname.includes('distribute') &&
      !location!.pathname.includes('publish') && (
        <CreationPage readOnly={readOnly} />
      );
  }

  public renderPublishingPage = () => (
    this.props.location!.pathname.includes('publish') && (
      <>
        <Header isPublishing />
        <PublishingPage store={this.props.editTeachingPathStore} from="TEACHINGPATH"/>
      </>
    )
  )

  public renderDistributionPage = () => (
    this.props.location!.pathname.includes('distribute') && (
      <>
        <Header isDistribution />
        <DistributionPage store={this.props.editTeachingPathStore} />
      </>
    )
  )

  public render() {
    const { contentType } = this.state;
    const { teachingPathContainer } = this.props.editTeachingPathStore!;

    if (!teachingPathContainer) {
      return (
        <div className={'loading'}><Loader /></div>
      );
    }

    return (
      <div className="EditTeachingPath">
        <ItemContentTypeContext.Provider value={{ contentType, changeContentType: this.changeContentType }}>

          {this.renderCreationPage()}
          {this.renderPublishingPage()}
          {this.renderDistributionPage()}

        </ItemContentTypeContext.Provider>

      </div>
    );
  }
}

export const EditTeachingPath = withRouter(EditTeachingPathComponent);
