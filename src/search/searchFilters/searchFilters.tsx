import React, { Component, createRef } from 'react';
import Select from 'react-select';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Grade, Subject, Greep, GreepSelectValue, Language } from 'assignment/Assignment';
import './searchFilters.scss';
import resetImg from 'assets/images/reset-icon.svg';
import { SearchStore } from '../SearchStore';
import { SimpleNumberData, SimpleStringData, FilterMeta, SimpleNumberDataTitle } from '../Search';
import { WPLENGUAGES } from '../../utils/constants';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { BooleanFilter, SortingFilter, QueryStringKeysSearch, StoreState } from 'utils/enums';

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
import { filter } from 'lodash';

interface SearchProps {
  filters: FilterMeta;
  mygrades: Array<SimpleNumberData>;
  mysubjects: Array<SimpleNumberData>;
  mycoreElements: Array<SimpleStringData>;
  topics: Array<SimpleStringData>;
  mygoals: Array<SimpleStringData>;
  mysource: Array<SimpleNumberDataTitle>;
  myreading: Array<SimpleNumberDataTitle>;
  visible: boolean;
  searchStore?: SearchStore;
  onSearch?(): void;
  onSearchGrades?(): void;
  onSearchSubjects?(): void;
  onSearchElements?(): void;
  onSearchTopics?(): void;
  onSearchGoals?(): void;
  onSearchSource?(): void;
  onSearchReading?(): void;
  resetSearch?(): void;
  onSearchEnd?(): void;
}

interface SearchState {
  langs: Array<SimpleStringData>;
  grades: Array<SimpleNumberData>;
  subjects: Array<SimpleNumberData>;
  coreElements: Array<SimpleStringData>;
  topics: Array<SimpleStringData>;
  goals: Array<SimpleStringData>;
  source: Array<SimpleNumberDataTitle>;
  reading: Array<SimpleNumberDataTitle>;
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
    source: [],
    reading: []
  };
  // Langs init
  public changeLang = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { searchStore } = this.props;
    const value = e.currentTarget.value;
    searchStore!.myfilterLang = value;
    searchStore!.myfilter.localeId = value;
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.LANG,
      value ? value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
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
  // Langs end
  // Grades init
  public changeGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { searchStore } = this.props;
    const value = e.currentTarget.value;
    if (searchStore!.myfilter.grades!.includes(Number(value))) {
      searchStore!.myfilter.grades! = searchStore!.myfilter.grades!.filter(item => item !== Number(value));
    } else {
      searchStore!.myfilter.grades!.push(Number(value));
    }
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.GRADE,
      String(searchStore!.myfilter.grades!) ? String(searchStore!.myfilter.grades!) : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.props.onSearchGrades!();
  }
  public renderGrades = (item: SimpleNumberData) => {
    const { myfilter } = this.props.searchStore!;
    const gradetitle: Array<string> = item.name.split('. ');
    let title:string = gradetitle[0];
    if (gradetitle.length > 1) {
      title = gradetitle[0] + intl.get('new assignment.grade');
    }
    let activeclass = 'itemFlexFilter';
    if (myfilter.grades!) {
      myfilter.grades!.forEach((g) => {
        if (Number(item.id) === Number(g)) {
          activeclass = 'itemFlexFilter active';
        }
      });
    }
    return (
      <button
        value={item.id}
        key={item.id}
        className={activeclass}
        onClick={this.changeGrade}
      >
        {title}
      </button>
    );
  }
  // Grades end
  // Subjects init
  public changeSubject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { searchStore } = this.props;
    const value = e.currentTarget.value;
    if (searchStore!.myfilter.subjects!.includes(Number(value))) {
      searchStore!.myfilter.subjects! = searchStore!.myfilter.subjects!.filter(item => item !== Number(value));
    } else {
      searchStore!.myfilter.subjects!.push(Number(value));
    }
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.SUBJECT,
      String(searchStore!.myfilter.subjects!) ? String(searchStore!.myfilter.subjects!) : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.props.onSearchSubjects!();
  }
  public renderSubjects = (item: SimpleNumberData) => {
    const { myfilter } = this.props.searchStore!;
    let activeclass = 'itemFlexFilter';
    if (myfilter.subjects!) {
      myfilter.subjects!.forEach((g) => {
        if (Number(item.id) === Number(g)) {
          activeclass = 'itemFlexFilter active';
        }
      });
    }
    return (
      <button
        value={item.id}
        key={item.id}
        className={activeclass}
        onClick={this.changeSubject}
      >
        {item.name}
      </button>
    );
  }
  // Subjects end
  // Core Elements init
  public renderValueOptions = (data: Array<SimpleStringData>) => {
    const returnArray: Array<GreepSelectValue> = [];
    data.forEach((element) => {
      returnArray.push({
        // tslint:disable-next-line: variable-name
        value: element.id,
        label: element.name
      });
    });
    return returnArray;
  }
  public handleChangeSelectCore = async (newValue: any) => {
    const { searchStore } = this.props!;
    const valueString: Array<string> = [];
    if (newValue) {
      newValue.forEach((f: any) => {
        valueString.push(f.value);
      });
    }
    if (searchStore!.myfilter.coreElements) {
      searchStore!.myfilter.coreElements = valueString;
    }
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.GREPCOREELEMENTSIDS,
      String(searchStore!.myfilter.coreElements!) ? String(searchStore!.myfilter.coreElements!) : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.props.onSearchElements!();
  }
  public renderCoreElementsSelected = () => {
    const { myfilter } = this.props.searchStore!;
    const options = this.renderValueOptions(this.props.mycoreElements);
    const valueString: Array<any> = [];
    if (myfilter!.coreElements) {
      myfilter!.coreElements.forEach((f: any) => {
        const enjoy = options.find(x => x.value === f);
        if (enjoy) {
          valueString.push(enjoy);
        }
      });
    }
    const customStyles = {
      option: () => ({
        width: '320px',
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
        components={{ NoOptionsMessage }}
        styles={customStyles}
        options={options}
        onChange={this.handleChangeSelectCore}
        defaultValue={valueString}
        placeholder={intl.get('new assignment.greep.core')}
        isClearable={true}
        isMulti
      />
    );
  }
  // Core Elements end
  // Topics init
  public changeTopic = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { searchStore } = this.props;
    const value = e.currentTarget.value;
    if (searchStore!.myfilter.topics!.includes(String(value))) {
      searchStore!.myfilter.topics! = searchStore!.myfilter.topics!.filter(item => item !== String(value));
    } else {
      searchStore!.myfilter.topics!.push(String(value));
    }
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.GREPMAINTOPICSIDS,
      String(searchStore!.myfilter.topics!) ? String(searchStore!.myfilter.topics!) : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.props.onSearchTopics!();
  }
  public renderTopics = (item: SimpleStringData) => {
    const { myfilter } = this.props.searchStore!;
    let activeclass = 'itemFlexFilter';
    if (myfilter.topics!) {
      myfilter.topics!.forEach((g) => {
        if (String(item.id) === String(g)) {
          activeclass = 'itemFlexFilter active';
        }
      });
    }
    return (
      <button
        value={item.id}
        key={item.id}
        className={activeclass}
        onClick={this.changeTopic}
      >
        {item.name}
      </button>
    );
  }
  // Topics End
  // Goals Init
  public handleChangeSelectGoals = async (newValue: any) => {
    const { searchStore } = this.props!;
    const valueString: Array<string> = [];
    if (newValue) {
      newValue.forEach((f: any) => {
        valueString.push(f.value);
      });
    }
    if (searchStore!.myfilter.goals) {
      searchStore!.myfilter.goals = valueString;
    }
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.GREEPGOALSIDS,
      String(searchStore!.myfilter.goals!) ? String(searchStore!.myfilter.goals!) : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.props.onSearchGoals!();
  }
  public renderCoreGoalsSelected = () => {
    const { myfilter } = this.props.searchStore!;
    const valueString: Array<any> = [];
    const options = this.renderValueOptions(this.props.mygoals);
    if (myfilter!.goals) {
      myfilter!.goals.forEach((f: any) => {
        const enjoy = options.find(x => x.value === f);
        if (enjoy) {
          valueString.push(enjoy);
        }
      });
    }
    const customStyles = {
      option: () => ({
        width: '320px',
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
        components={{ NoOptionsMessage }}
        styles={customStyles}
        options={options}
        onChange={this.handleChangeSelectGoals}
        defaultValue={valueString}
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
  // Goals End
  // Source Init
  public changeSource = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { searchStore } = this.props;
    const value = e.currentTarget.value;
    if (searchStore!.myfilter.sources!.includes(Number(value))) {
      searchStore!.myfilter.sources! = searchStore!.myfilter.sources!.filter(item => item !== Number(value));
    } else {
      searchStore!.myfilter.sources!.push(Number(value));
    }
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.SOURCE,
      String(searchStore!.myfilter.sources!) ? String(searchStore!.myfilter.sources!) : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.props.onSearchSource!();
  }
  public renderSource = (item: SimpleNumberDataTitle) => {
    const { myfilter } = this.props.searchStore!;
    let activeclass = 'itemFlexFilter';
    if (myfilter.sources!) {
      myfilter.sources!.forEach((g) => {
        if (Number(item.id) === Number(g)) {
          activeclass = 'itemFlexFilter active';
        }
      });
    }
    if (item.name) {
      return (
        <button
          value={item.id}
          key={item.id}
          className={activeclass}
          onClick={this.changeSource}
        >
          {item.name}
        </button>
      );
    }
  }

  // end source
  // init reading
  public changeReading = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { searchStore } = this.props;
    const value = e.currentTarget.value;
    if (searchStore!.myfilter.readingInSubjects!.includes(Number(value))) {
      searchStore!.myfilter.readingInSubjects! = searchStore!.myfilter.readingInSubjects!.filter(item => item !== Number(value));
    } else {
      searchStore!.myfilter.readingInSubjects!.push(Number(value));
    }
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.GREPREADINGINSUBJECT,
      String(searchStore!.myfilter.readingInSubjects!) ? String(searchStore!.myfilter.readingInSubjects!) : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.props.onSearchReading!();
  }
  public renderReading = (item: SimpleNumberDataTitle) => {
    const { myfilter } = this.props.searchStore!;
    let activeclass = 'itemFlexFilter';
    if (myfilter.readingInSubjects!) {
      myfilter.readingInSubjects!.forEach((g) => {
        if (Number(item.id) === Number(g)) {
          activeclass = 'itemFlexFilter active';
        }
      });
    }
    return (
      <button
        value={item.id}
        key={item.id}
        className={activeclass}
        onClick={this.changeReading}
      >
        {item.name}
      </button>
    );
  }

  public resetFilters = async () => {
    const filters = this.props.searchStore!.getFilters;
    this.props.searchStore!.resetFilters();
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.GRADE, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.SUBJECT, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.GREEPGOALSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.GREPCOREELEMENTSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.GREPMAINTOPICSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.GREPREADINGINSUBJECT, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.SOURCE, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.setState({
      grades: filters!.grades!,
      subjects: filters!.subjects!,
      coreElements: filters!.coreElements!,
      topics: filters!.topics!,
      goals: filters!.goals!,
      source: filters!.sources!,
      reading: filters!.readingInSubjects!
    });
    this.props.resetSearch!();
    this.props.onSearch!();
  }

  public async componentDidMount() {
    const filters = this.props.filters;
    this.setState({
      grades: filters!.grades!,
      subjects: filters!.subjects!,
      coreElements: filters!.coreElements!,
      topics: filters!.topics!,
      goals: filters!.goals!,
      source: filters!.sources!,
      reading: filters!.readingInSubjects!
    });
  }

  public emptyData = () => <div className="minimalLoading"><span /><span /><span /></div>;

  public pateticRenderTopics = () => (
    <div className="itemFilter">
      <div className="itemFilter__left">
        <img src={cogsImg} />
      </div>
      <div className="itemFilter__right">
        <h3>{intl.get('new assignment.greep.subjects')}</h3>
        <div className="itemFilter__core">
          {this.props.visible && this.props.topics.map(this.renderTopics)}
          {!this.props.visible && this.emptyData()}
        </div>
      </div>
    </div>
  )

  public renderPateticSource = () => (
    <div className="itemFilter">
      <div className="itemFilter__left">
        <img src={voiceImg} />
      </div>
      <div className="itemFilter__right">
        <h3>{intl.get('new assignment.greep.source')}</h3>
        <div className="itemFilter__core">
          {this.props.visible && this.props.mysource.map(this.renderSource)}
          {!this.props.visible && this.emptyData()}
        </div>
      </div>
    </div>
  )

  public pateticRenderReading = () => (
    <div className="itemFilter">
      <div className="itemFilter__left">
        <img src={readingImg} />
      </div>
      <div className="itemFilter__right">
        <h3>{intl.get('new assignment.greep.reading')}</h3>
        <div className="itemFilter__core">
          {this.props.visible && this.props.myreading.map(this.renderReading)}
          {!this.props.visible && this.emptyData()}
        </div>
      </div>
    </div>
  )

  public render() {
    const renderSource = (this.props.mysource.length > 0) ? true : false;
    const renderReading = (this.props.myreading.length > 0) ? true : false;
    const renderTopicsL = (this.props.topics.length > 0) ? true : false;
    return(
      <div className="FiltersModal">
        <div className="FiltersModal__header">
          <h5>{intl.get('edit_teaching_path.modals.search.header.title')}</h5>
          <button id="ButtonCloseTp" onClick={this.resetFilters}>
            <img src={resetImg} />
            <span>{intl.get('edit_teaching_path.modals.search.header.button')}</span>
          </button>
          </div>
          <div className="FiltersModal__body">
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={gradeImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('generals.grade')}</h3>
                  <div className="itemFilter__core">
                    {this.props.mygrades.map(this.renderGrades)}
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
                    {this.props.visible && this.props.mysubjects.map(this.renderSubjects)}
                    {!this.props.visible && this.emptyData()}
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
                    {this.props.visible && this.renderCoreElementsSelected()}
                    {!this.props.visible && this.emptyData()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              {renderTopicsL && this.pateticRenderTopics()}
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={goalsImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.goals')}</h3>
                  <div className="itemFilter__core">
                    {this.props.visible && this.renderCoreGoalsSelected()}
                    {!this.props.visible && this.emptyData()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              {renderSource && this.renderPateticSource()}
            </div>
            <div className="FiltersModal__body__item">
              {renderReading && this.pateticRenderReading()}
            </div>
          </div>
      </div>
    );
  }
}
export const SearchFilter = withRouter(SearchFilters);
