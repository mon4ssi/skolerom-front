import React, { Component, SyntheticEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { injector } from 'Injector';
import debounce from 'lodash/debounce';
import { SearchStore } from '../SearchStore';
import { Search, SimpleNumberData } from '../Search';
import { DEBOUNCE_TIME } from 'utils/constants';
import { lettersNoEn } from 'utils/lettersNoEn';
import { ActionMenu } from 'search/searchItem/searchItemModal/searchItemModal';
import { SortingFilter, StoreState, QueryStringKeys } from 'utils/enums';
import { UserType } from 'user/User';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { TeachingPathsListStore } from '../../teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { EditTeachingPathStore } from '../../teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { AssignmentService, ASSIGNMENT_SERVICE } from 'assignment/service';

import more from 'assets/images/hovered-more.svg';
import './searchItem.scss';
const number3 = 3;
const number2 = 2;
interface SearchProps {
  item: Search;
  type: string;
  teachingPathsListStore?: TeachingPathsListStore;
  editTeachingPathStore? :EditTeachingPathStore;
}

interface SearchState {
  stateTP: boolean;
  stateAssignment: boolean;
}

@inject('searchStore', 'teachingPathsListStore', 'editTeachingPathStore')
@observer
class SearchItem extends Component<SearchProps & RouteComponentProps, SearchState> {
  private assignmentService: AssignmentService = injector.get(ASSIGNMENT_SERVICE);
  public state = {
    stateTP: false,
    stateAssignment: false
  };

  public renderItemSubject = (item: string) => (
    <div className="subjectItem">{item}</div>
  )
  public renderSubject = (subject: Array<SimpleNumberData>) => {
    const length = subject.length;
    const stringarray: Array<string> = [];
    if (length < number3) {
      subject.forEach((subject) => {
        stringarray.push(subject.name);
      });
    } else {
      stringarray.push(subject[0].name);
      stringarray.push(subject[1].name);
      stringarray.push(subject[number2].name);
    }
    return (
      <div className="subjectItems">
        {stringarray.map(this.renderItemSubject)}
      </div>
    );
  }

  public changeStateTP = () => {
    if (this.state.stateTP) {
      this.setState({
        stateTP: false
      });
    } else {
      this.setState({
        stateTP: true
      });
    }
  }

  public changeStateAssignment = () => {
    if (this.state.stateAssignment) {
      this.setState({
        stateAssignment: false
      });
    } else {
      this.setState({
        stateAssignment: true
      });
    }
  }

  public onClose = () => {
    this.setState({
      stateTP: false
    });
  }

  public onCloseAssignment = () => {
    this.setState({
      stateAssignment: false
    });
  }
  public editTeachingPath = (id: number) => {
    const { history } = this.props;
    history.push(`/teaching-paths/edit/${id}`);
  }

  public copyTeachingPath = async (id: number) => {
    const { teachingPathsListStore, history } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;

    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
      const copyId = await teachingPathsListStore!.copyEntity(id);
      history.push(`/teaching-paths/edit/${copyId}`);
    }
    history.push(`/teaching-paths/view/${id}`);
  }

  public deleteTeachingPath = (id: number) => async () => {
    const { teachingPathsListStore, editTeachingPathStore } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;

    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
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

  public viewTeachingPath = (id: number) => {
    const { history } = this.props;
    history.push(`/teaching-paths/view/${id}`);
  }

  public MyeditTeachingPath = () => {
    const { history, item } = this.props;
    const id = item.id;
    history.push(`/teaching-paths/edit/${id}`);
  }

  public MyeditAssignment = () => {
    const { history, item } = this.props;
    const id = item.id;
    history.push(`/assignments/edit/${id}`);
  }

  public MyviewTeachingPath = () => {
    const { history, item } = this.props;
    const id = item.id;
    history.push(`/teaching-paths/view/${id}`);
  }

  public MycopyTeachingPath = async () => {
    const { teachingPathsListStore, history, item } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;
    const id = item.id;
    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
      const copyId = await teachingPathsListStore!.copyEntity(id);
      history.push(`/teaching-paths/edit/${copyId}`);
    }
    history.push(`/teaching-paths/view/${id}`);
  }

  public MycopyAssignment = async () => {
    const { teachingPathsListStore, history, item } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;
    const id = item.id;
    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      const copyId = await this.assignmentService.copyAssignment(id!);
      history.push(`/assignments/edit/${copyId}`);
    }
  }

  public MydeleteTeachingPath = async () => {
    const { teachingPathsListStore, editTeachingPathStore, item } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;
    const id = item.id;
    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
      await editTeachingPathStore!.deleteTeachingPathById(id);
      window.location.reload();
    }
  }

  public MydeleteAssignment = async () => {
    const { teachingPathsListStore, editTeachingPathStore, item } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;
    const id = item.id;
    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
      await this.assignmentService.removeAssignment(id);
      window.location.reload();
    }
  }

  public renderTPOptions = () => {
    const { id } = this.props.item;
    return (
      <ActionMenu
        editTeachingPath={this.MyeditTeachingPath}
        viewTeachingPath={this.MyviewTeachingPath!}
        copyTeachingPath={this.MycopyTeachingPath}
        deleteTeachingPath={this.MydeleteTeachingPath}
        id={id}
        onClose={this.onClose}
      />
    );
  }

  public renderAssignmentOptions = () => {
    const { id } = this.props.item;
    return (
      <ActionMenu
        editTeachingPath={this.MyeditAssignment}
        copyTeachingPath={this.MycopyAssignment}
        deleteTeachingPath={this.MydeleteAssignment}
        id={id}
        onClose={this.onCloseAssignment}
        assignment
      />
    );
  }

  public renderMoreTP = () => (
    <div className="more-show" onClick={this.changeStateTP}>
      <button>
        <img src={more} />
      </button>
    </div>
  )

  public renderMoreAssigment = () => (
    <div className="more-show" onClick={this.changeStateAssignment}>
      <button>
        <img src={more} />
      </button>
    </div>
  )

  public asideContent = () => (
    <div>aqui va contenido de wordpress OMG</div>
  )

  public render() {
    const {
      featuredImg,
      description,
      title,
      subjects,
      id
    } = this.props.item;
    const currentUserType = this.props.teachingPathsListStore!.getCurrentUser()!.type;
    const visibility = (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) ? true : false;
    switch (this.props.type) {
      case 'ARTICLE':
        return (
          <div className="cardInfoItem">
            <div className="cardInfoItem__card">
              <div className="cardInfoItem__imagen">
                <img src={featuredImg} />
              </div>
              <div className="cardInfoItem__description">
                <div className="title"><h2>{title}</h2></div>
                <div className="description">{description}</div>
              </div>
            </div>
            <div className="cardInfoItem__detail">
              {this.asideContent()}
            </div>
          </div>
        );
        break;
      case 'TEACHING-PATH':
        return (
          <div className="cardInfoItem cardInfoItem--horizontal">
            <div className="cardInfoItem__left">
              <img src={featuredImg} />
              <h2>{title}</h2>
            </div>
            <div className="cardInfoItem__right">
              {this.renderSubject(subjects)}
              {visibility && this.renderMoreTP()}
              {visibility && this.state.stateTP && this.renderTPOptions()}
            </div>
          </div>
        );
        break;
      case 'ASSIGNMENT':
        return (
          <div className="cardInfoItem cardInfoItem--horizontal">
            <div className="cardInfoItem__left">
              <img src={featuredImg} />
              <h2>{title}</h2>
            </div>
            <div className="cardInfoItem__right">
              {this.renderSubject(subjects)}
              {visibility && this.renderMoreAssigment()}
              {visibility && this.state.stateAssignment && this.renderAssignmentOptions()}
            </div>
          </div>
        );
        break;
      default:
        return (
          <div className="cardInfoItem">
            <div className="cardInfoItem__imagen">
              <img src={featuredImg} />
            </div>
            <div className="cardInfoItem__description">
              <div className="title"><h2>{title}</h2></div>
              <div className="description">{description}</div>
            </div>
          </div>
        );
        break;
    }
  }
}

export const SearchItemComponent = withRouter(SearchItem);
