import React, { Component, SyntheticEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import { SearchStore } from '../SearchStore';
import { Search, SimpleNumberData } from '../Search';
import { DEBOUNCE_TIME } from 'utils/constants';
import { lettersNoEn } from 'utils/lettersNoEn';
import { SortingFilter, StoreState, QueryStringKeys } from 'utils/enums';
import { UserType } from 'user/User';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { TeachingPathsListStore } from '../../teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { EditTeachingPathStore } from '../../teachingPath/view/EditTeachingPath/EditTeachingPathStore';

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
}

@inject('searchStore', 'teachingPathsListStore', 'editTeachingPathStore')
@observer
class SearchItem extends Component<SearchProps & RouteComponentProps, SearchState> {
  public state = {
    stateTP: false
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

  public renderTPOptions = () => {
    const { id } = this.props.item;
    return (
      <div className="cardInfoItem__tooltip">
        <ul className="flexBox dirColumn">
          <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={() => { this.editTeachingPath(id); }}>{intl.get('teaching_paths_list.edit')}</a></li>
          <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={() => { this.viewTeachingPath(id); }}>{intl.get('teaching_paths_list.view')}</a></li>
          <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={() => { this.copyTeachingPath(id); }}>{intl.get('teaching_paths_list.copy')}</a></li>
          <li className={'fw500 flexBox fs15 editOrDeleteValue'}><a href="javascript:void(0)" onClick={() => { this.deleteTeachingPath(id); }}>{intl.get('teaching_paths_list.delete')}</a></li>
        </ul>
      </div>
    );
  }

  public renderMoreTP = () => (
    <div className="more-show" onClick={this.changeStateTP}>
      <button>
        <img src={more} />
      </button>
    </div>
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
              <div className="more-show">
                <button>
                  <img src={more} />
                </button>
              </div>
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
