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
import * as QueryStringHelper from 'utils/QueryStringHelper';

import more from 'assets/images/hovered-more.svg';
import './searchItem.scss';
const number3 = 3;
const number2 = 2;
interface SearchProps {
  item: Search;
  type: string;
}

@inject('searchStore')
@observer
class SearchItem extends Component<SearchProps & RouteComponentProps> {
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

  public render() {
    const {
      featuredImg,
      description,
      title,
      subjects,
      id
    } = this.props.item;
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
              <div className="more-show">
                <button>
                  <img src={more} />
                </button>
              </div>
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
