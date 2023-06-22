import React, { Component, createRef } from 'react';
import Select from 'react-select';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Grade, Subject, Greep, GreepSelectValue, Language } from 'assignment/Assignment';
import './searchFilters.scss';
import resetImg from 'assets/images/reset-icon.svg';
import { SearchStore } from '../SearchStore';
import { SimpleNumberData, SimpleStringData } from '../Search';
import { WPLENGUAGES } from '../../utils/constants';

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

interface SearchState {
  langs: Array<SimpleStringData>;
  grades: Array<SimpleNumberData>;
  subjects: Array<SimpleNumberData>;
  coreElements: Array<SimpleStringData>;
  topics: Array<SimpleStringData>;
  goals: Array<SimpleStringData>;
  source: Array<SimpleNumberData>;
}
@inject('searchStore')
@observer
class SearchFilters extends Component<SearchProps & RouteComponentProps, SearchState> {
  public state = {
    langs: [],
    grades: [],
    subjects: [],
    coreElements:[],
    topics: [],
    goals: [],
    source: []
  };
  public changeLang = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { searchStore } = this.props;
    const value = e.currentTarget.value;
    searchStore!.myfilterLang = value;
    searchStore!.myfilter.lang = value;
    await searchStore!.getDataSearch();
  }
  public renderLangs = (item: SimpleStringData) => {
    const { myfilterLang, myfilter } = this.props.searchStore!;
    if (item.id === myfilterLang) {
      return (
        <button
          value={item.id}
          key={item.id}
          className="itemFlexFilter active"
        >
          {item.name}
        </button>
      );
    }
    return (
      <button
        value={item.id}
        key={item.id}
        className="itemFlexFilter"
        onClick={this.changeLang}
      >
        {item.name}
      </button>
    );
  }
  public renderGrades = (item: SimpleNumberData) => (
    <button
      value={item.id}
      key={item.id}
      className="itemFlexFilter"
    >
      {item.name}
    </button>
  )
  public renderSubjects = (item: SimpleNumberData) => (
    <button
      value={item.id}
      key={item.id}
      className="itemFlexFilter"
    >
      {item.name}
    </button>
  )
  public renderCoreElements = (item: SimpleStringData) => (
    <button
      value={item.id}
      key={item.id}
      className="itemFlexFilter"
    >
      {item.name}
    </button>
  )
  public renderValueOptions = (data: Array<SimpleStringData>) => {
    const returnArray: Array<GreepSelectValue> = [];
    data.forEach((element) => {
      returnArray.push({
        // tslint:disable-next-line: variable-name
        value: Number(element.id),
        label: element.name
      });
    });
    return returnArray;
  }
  public renderCoreElementsSelected = () => {
    const options = this.renderValueOptions(this.state.coreElements);
    const customStyles = {
      option: () => ({
        fontSize: '14px',
        padding: '5px',
        borderBottom: '1px solid #e7ecef',
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      }),
      multiValue: () => ({
        fontSize: '16px',
        display: 'flex',
        borderRadius: '5px',
        background: 'rgb(230, 230, 230)',
        marginRight: '3px',
        marginBottom: '3px',
        maxWidth: '100%'
      })
    };
    const NoOptionsMessage = () => {
      const { coreElements } = this.state;
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    };
    return (
      <Select
        width="320px"
        components={{ NoOptionsMessage }}
        styles={customStyles}
        options={options}
        placeholder={intl.get('new assignment.greep.core')}
        isClearable={true}
        isMulti
      />
    );
  }
  public renderTopics = (item: SimpleStringData) => (
    <button
      value={item.id}
      key={item.id}
      className="itemFlexFilter"
    >
      {item.name}
    </button>
  )
  public renderCoreGoalsSelected = () => {
    const options = this.renderValueOptions(this.state.goals);
    const customStyles = {
      option: () => ({
        fontSize: '14px',
        padding: '5px',
        borderBottom: '1px solid #e7ecef',
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      }),
      multiValue: () => ({
        fontSize: '16px',
        display: 'flex',
        borderRadius: '5px',
        background: 'rgb(230, 230, 230)',
        marginRight: '3px',
        marginBottom: '3px',
        maxWidth: '100%'
      })
    };
    const NoOptionsMessage = () => {
      const { coreElements } = this.state;
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    };
    return (
      <Select
        width="320px"
        components={{ NoOptionsMessage }}
        styles={customStyles}
        options={options}
        placeholder={intl.get('new assignment.greep.goals')}
        isClearable={true}
        isMulti
      />
    );
  }
  public renderGoals = (item: SimpleStringData) => (
    <button
      value={item.id}
      key={item.id}
      className="itemFlexFilter"
    >
      {item.name}
    </button>
  )
  public renderSource = (item: SimpleNumberData) => (
    <button
      value={item.id}
      key={item.id}
      className="itemFlexFilter"
    >
      {item.name}
    </button>
  )

  public async componentDidMount() {
    const filters = this.props.searchStore!.getFilters;
    this.setState({
      langs: WPLENGUAGES,
      grades: filters!.grades!,
      subjects: filters!.subjects!,
      coreElements: filters!.coreElements!,
      topics: filters!.topics!,
      goals: filters!.goals!,
      source: filters!.source!
    });
  }
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
                    <div className="flexFilter langsItem">
                      {this.state.langs.map(this.renderLangs)}
                    </div>
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
                    {this.state.grades.map(this.renderGrades)}
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
                    {this.state.subjects.map(this.renderSubjects)}
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
                    {this.renderCoreElementsSelected()}
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
                    {this.state.topics.map(this.renderTopics)}
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
                    {this.renderCoreGoalsSelected()}
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
                    {this.state.source.map(this.renderSource)}
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
