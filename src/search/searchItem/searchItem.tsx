import React, { Component, SyntheticEvent, createRef } from 'react';
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
import { ArticleContent } from 'search/searchItem/searchItemModal/searchItemContentArticle';
import { TPContent } from 'search/searchItem/searchItemModal/searchItemContentTP';
import { AssignmentContent } from 'search/searchItem/searchItemModal/searchItemContentAssignment';
import { Notification, NotificationTypes } from '../../components/common/Notification/Notification';
import { SortingFilter, StoreState, QueryStringKeys } from 'utils/enums';
import { UserType } from 'user/User';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { TeachingPathsListStore } from '../../teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { EditTeachingPathStore } from '../../teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { AssignmentService, ASSIGNMENT_SERVICE } from 'assignment/service';

import more from 'assets/images/hovered-more.svg';
import lisplacehoder from 'assets/images/list-placeholder.svg';
import './searchItem.scss';

const number7 = 7;
const number6 = 6;
const number5 = 5;
const number4 = 4;
const number3 = 3;
const number2 = 2;
const number2150 = 2150;
const number1800 = 1800;
const number1500 = 1500;
const number1250 = 1250;
const number750 = 750;
const number400 = 400;
const number250 = 250;
const number10 = 10;
const number700 = 200;

interface SearchProps {
  item: Search;
  type: string;
  teachingPathsListStore?: TeachingPathsListStore;
  editTeachingPathStore? :EditTeachingPathStore;
  searchStore?: SearchStore;
}

interface SearchState {
  stateTP: boolean;
  stateAssignment: boolean;
  article: boolean;
  sideteachingpath: boolean;
  sideassignment: boolean;
}

@inject('searchStore', 'teachingPathsListStore', 'editTeachingPathStore')
@observer
class SearchItem extends Component<SearchProps & RouteComponentProps, SearchState> {
  private assignmentService: AssignmentService = injector.get(ASSIGNMENT_SERVICE);
  private scrollref = createRef<HTMLDivElement>();
  public state = {
    stateTP: false,
    stateAssignment: false,
    article: false,
    sideteachingpath: false,
    sideassignment: false
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

  public changeStateArticle = () => {
    if (this.state.article) {
      this.setState({
        article: false
      });
    } else {
      this.setState({
        article: true
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

  public onCloseArticle = () => {
    this.setState({
      article: false
    });
  }

  public onCloseTPSide = () => {
    this.setState({
      sideteachingpath: false
    });
  }

  public onCloseAssignmentSide = () => {
    this.setState({
      sideassignment: false
    });
  }

  public calculateline = (width: number) => {
    if (width >= number2150) {
      return number7;
    }
    if (number1800 < width && width < number2150) {
      return number6;
    }
    if (number1500 < width && width <= number1800) {
      return number5;
    }
    if (number1250 < width && width <= number1500) {
      return number4;
    }
    if (number750 < width && width <= number1250) {
      return number3;
    }
    if (number400 < width && width <= number750) {
      return number2;
    }
    if (width <= number400) {
      return 1;
    }
    return number7;
  }

  public ubicarNumero = (numero: number, multiplo: number) => {
    const rango = Math.floor((numero - 1) / multiplo) + 1;
    return rango;
  }

  public openArticle = () => {
    this.setState(
      {
        article: true
      },
      () => {
        const searchListInfo = document.getElementById('searchListInfo');
        const activeArticle = document.getElementById('activeArticle');
        const line = this.calculateline(window.innerWidth);
        // this.ref.current!.scrollHeight - (this.ref.current!.clientHeight * SCROLL_OFFSET) <= this.ref.current!.scrollTop
        if (searchListInfo) {
          if (activeArticle) {
            setTimeout(() => {
              const index = Number(activeArticle.closest('.Inside')!.getAttribute('data-index')) + 1;
              // const indexNotZero = (index == 0) ? 1 : index;
              const ubication = this.ubicarNumero(index, line);
              const multiplesimple = number250 * ubication + number10 * ubication + number10 * (ubication - 1);
              searchListInfo.scroll({
                top: multiplesimple,
                behavior: 'smooth'
              });
            }, number700);
          }
        }
      }
    );
  }

  public openSideTP = () => {
    this.setState({
      sideteachingpath: true
    });
  }

  public openSideAssignment = () => {
    this.setState({
      sideassignment: true
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
      const isCopyApproved = await Notification.create({
        type: NotificationTypes.CONFIRM,
        title: intl.get('assignment list.Are you sure'),
        submitButtonTitle: intl.get('notifications.copy')
      });
      if (isCopyApproved) {
        const copyId = await teachingPathsListStore!.copyEntity(id);
        history.push(`/teaching-paths/edit/${copyId}`);
      }
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
      const isCopyApproved = await Notification.create({
        type: NotificationTypes.CONFIRM,
        title: intl.get('assignment list.Are you sure'),
        submitButtonTitle: intl.get('notifications.copy')
      });
      if (isCopyApproved) {
        const copyId = await teachingPathsListStore!.copyEntity(id);
        history.push(`/teaching-paths/edit/${copyId}`);
      }
    }
    // history.push(`/teaching-paths/view/${id}`);
  }

  public MycopyAssignment = async () => {
    const { teachingPathsListStore, history, item } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;
    const id = item.id;
    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      const isCopyApproved = await Notification.create({
        type: NotificationTypes.CONFIRM,
        title: intl.get('assignment list.Are you sure'),
        submitButtonTitle: intl.get('notifications.copy')
      });
      if (isCopyApproved) {
        const copyId = await this.assignmentService.copyAssignment(id!);
        history.push(`/assignments/edit/${copyId}`);
      }
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

  public asideContent = () => {
    const {
      item
    } = this.props;
    return (
      <ArticleContent item={item} onClose={this.onCloseArticle} />
    );
  }

  public renderSideTP = () => {
    const {
      item
    } = this.props;
    return (
      <TPContent item={item} onClose={this.onCloseTPSide} />
    );
  }

  public renderSideAssignment = () => {
    const {
      item
    } = this.props;
    return (
      <AssignmentContent item={item} onClose={this.onCloseAssignmentSide} />
    );
  }

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
    const articleOpen = (this.state.article) ? 'cardInfoItem__detail active' : 'cardInfoItem__detail';
    const articleOpenCard = (this.state.article) ? 'cardInfoItem__card active' : 'cardInfoItem__card';
    const sendId = (this.state.article) ? 'activeArticle' : '';
    const myimg = featuredImg ? featuredImg : lisplacehoder;
    switch (this.props.type) {
      case 'ARTICLE':
        return (
          <div className="cardInfoItem">
            <div className={articleOpenCard} onClick={this.openArticle}>
              <div className="cardInfoItem__imagen">
                <img src={myimg} />
              </div>
              <div className="cardInfoItem__description">
                <div className="title"><h2>{title}</h2></div>
              </div>
            </div>
            {this.state.article && <div className="triangleCard" />}
            <div className={articleOpen} ref={this.scrollref} id={sendId}>
              {this.state.article && this.asideContent()}
            </div>
          </div>
        );
        break;
      case 'TEACHING-PATH':
        return (
          <div className="cardInfoItem cardInfoItem--TP">
            <div className="cardInfoItem__card" onClick={this.openSideTP}>
              <div className="cardInfoItem__imagen">
                <img src={myimg} />
              </div>
              <div className="cardInfoItem__description">
                <div className="title"><h2>{title}</h2></div>
              </div>
            </div>
            <div className="cardInfoItem--absolute">
              {visibility && this.renderMoreTP()}
              {visibility && this.state.stateTP && this.renderTPOptions()}
            </div>
            {this.state.sideteachingpath && this.renderSideTP()}
          </div>
        );
        break;
      case 'ASSIGNMENT':
        return (
          <div className="cardInfoItem cardInfoItem--relative">
            <div className="cardInfoItem--horizontal" onClick={this.openSideAssignment}>
              <div className="cardInfoItem__left">
                <img src={myimg} />
                <h2>{title}</h2>
              </div>
              <div className="cardInfoItem__right">
                {this.renderSubject(subjects)}
              </div>
            </div>
            <div className="cardInfoItem--absolute">
              {visibility && this.renderMoreAssigment()}
              {visibility && this.state.stateAssignment && this.renderAssignmentOptions()}
            </div>
            {this.state.sideassignment && this.renderSideAssignment()}
          </div>
        );
        break;
      default:
        return (
          <div className="cardInfoItem">
            <div className="cardInfoItem__imagen">
              <img src={myimg} />
            </div>
            <div className="cardInfoItem__description">
              <div className="title"><h2>{title}</h2></div>
            </div>
          </div>
        );
        break;
    }
  }
}

export const SearchItemComponent = withRouter(SearchItem);
