import React, { Component } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';
import moment from 'moment';

import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';

import { MyClasses } from './MyClasses/MyClasses';
import { CustomCalendar } from './CustomCalendar/CustomCalendar';

import { capitalize } from 'utils/capitalize';
import { getYearMonthDayDate } from 'utils/dateFormatter';
import { lettersNoEn } from 'utils/lettersNoEn';

import searchImg from 'assets/images/search.svg';
import clockImg from 'assets/images/rounded-clock.svg';

import './StudentsAssigning.scss';
import { Locales } from 'utils/enums';
import { Loader } from '../../../../common/Loader/Loader';

interface Props {
  store?: NewAssignmentStore | EditTeachingPathStore;
}

interface State {
  isCalendarOpened: boolean;
}

@observer
export class StudentsAssigning extends Component<Props, State> {

  public state = {
    isCalendarOpened: false,
  };

  public toggleOpenCalendar = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState({ isCalendarOpened: !this.state.isCalendarOpened });
  }

  public onDateChange = (date: Date) => {
    const { currentDistribution } = this.props.store!;

    currentDistribution!.setEndDate(getYearMonthDayDate(date));
    this.setState({ isCalendarOpened: false });
    // if (!moment(currentDistribution!.startDate).isSame(getYearMonthDayDate(date))) {
    //   currentDistribution!.setEndDate(getYearMonthDayDate(date));
    //   this.setState({ isCalendarOpened: false });
    // } else {
    //   Notification.create({
    //     type: NotificationTypes.ERROR,
    //     title: intl.get('distribution_page.current_date_validation')
    //   });
    // }
  }

  public renderCalendar = () => {
    const { store } = this.props;
    const currentLocale = store!.getCurrentLocale();

    return (
      <CustomCalendar
        currentLocale={currentLocale}
        endDate={store!.currentDistribution!.endDate}
        onChange={this.onDateChange}
        handleClickOutside={this.toggleOpenCalendar}
      />
    );
  }

  public changeSearchValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (lettersNoEn(event.target.value)) {
      this.props.store!.searchValue = event.target.value;
    }
  }

  public generateDeadline = () => {
    const { store } = this.props;

    const locale = store!.getCurrentLocale();
    switch (locale) {
      case Locales.EN:
        return capitalize(
          moment(store!.currentDistribution!.startDate)
            .locale(locale)
            .to(store!.currentDistribution!.endDate));
      case Locales.NB:
      case Locales.NN:
        return moment(store!.currentDistribution!.startDate)
          .locale(store!.getCurrentLocale())
          .to(store!.currentDistribution!.endDate, true);
      default:
        return null;
    }
  }

  public render() {
    const { store } = this.props;
    const { currentDistribution } = store!;

    if (!currentDistribution) {
      return <div className={'loading'}><Loader /></div>;
    }
    const dueDate = moment(currentDistribution.startDate).isSame(getYearMonthDayDate(currentDistribution.endDate)) ?
      intl.get('distribution_page.due_today') :
      `${this.generateDeadline()} ${intl.get('distribution_page.from_now')}`;

    return (
      <div className="StudentsAssigning">
        <div className="dueDate flexBox dirColumn">
          <div className="title">
            {intl.get('distribution_page.due_date')}
          </div>

          <div className="deadlineInfo flexBox">
            <img src={clockImg} alt="deadline" />
            {dueDate}
            (
              <span onClick={this.toggleOpenCalendar}>
              {intl.get('distribution_page.change')}
              </span>
            )
            {this.state.isCalendarOpened && this.renderCalendar()}
          </div>
        </div>

          <div className="assignToClass">
            {intl.get('new assignment.Assign to class')}
          </div>

          <div className="searchClassesContainer">
            <input
              value={store!.searchValue}
              onChange={this.changeSearchValue}
              className="searchClasses"
              placeholder={intl.get('distribution_page.search_placeholder')}
              aria-labelledby="searchClassesId"
              aria-required="true"
              aria-invalid="false"
            />
            <img src={searchImg} alt="search" />
          </div>

        <MyClasses store={store} />

      </div>
    );
  }
}
