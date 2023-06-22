import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import './searchFilters.scss';
import resetImg from 'assets/images/reset-icon.svg';
import { SearchStore } from '../SearchStore';

import filterImg from 'assets/images/filter.svg';
import filterWhiteImg from 'assets/images/filter_white.svg';
import langImg from 'assets/images/lang.svg';
import gradeImg from 'assets/images/grade.svg';
import tagsImg from 'assets/images/tags.svg';
import cogsImg from 'assets/images/cogs.svg';
import coreImg from 'assets/images/core.svg';
import goalsImg from 'assets/images/goals.svg';
import voiceImg from 'assets/images/voice.svg';
import readingImg from 'assets/images/reading-second-icon.svg';

interface SearchProps {
  searchStore?: SearchStore;
}

class SearchFilters extends Component<SearchProps & RouteComponentProps> {
  public render() {
    return(
      <div className="FiltersModal">
        <div className="FiltersModal__header">
          <h5>{intl.get('edit_teaching_path.modals.search.header.title')}</h5>
          <button id="ButtonCloseTp">
            <img src={resetImg} />
            <span>{intl.get('edit_teaching_path.modals.search.header.button')}</span>
          </button>
          </div>
          <div className="FiltersModal__body">
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={langImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('generals.language')}</h3>
                  <div className="itemFilter__core">
                    langs
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={gradeImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('generals.grade')}</h3>
                  <div className="itemFilter__core">
                    grades
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={tagsImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.Subject')}</h3>
                  <div className="itemFilter__core">
                    morecores
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={coreImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.core')}</h3>
                  <div className="itemFilter__core">
                    cres
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={cogsImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.subjects')}</h3>
                  <div className="itemFilter__core">
                    cres
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={goalsImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.goals')}</h3>
                  <div className="itemFilter__core">
                    cres
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={voiceImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.source')}</h3>
                  <div className="itemFilter__core">
                    cres
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    );
  }
}
export const SearchFilter = withRouter(SearchFilters);
