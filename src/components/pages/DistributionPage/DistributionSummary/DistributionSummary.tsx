import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { observer } from 'mobx-react';
import moment from 'moment';

import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';

import { MyClasses } from '../DistributionContent/StudentsAssigning/MyClasses/MyClasses';
import { capitalize } from 'utils/capitalize';
import { getYearMonthDayDate } from 'utils/dateFormatter';

import studentsImg from 'assets/images/students.svg';

import './DistributionSummary.scss';
import { Locales } from 'utils/enums';

interface Props {
  store?: NewAssignmentStore | EditTeachingPathStore;
  localeKey: string;
}

@observer
export class DistributionSummary extends Component<Props> {

  public renderClasses = () => {
    const { store, localeKey } = this.props;
    if (store!.selectedGroups.length === 0) {
      return <span className="noStudents fw300">{intl.get(`distribution_page.${localeKey}.no_assigned_students`)}</span>;
    }
    return <MyClasses store={store} readOnly={true}/>;
  }

  public generateFormatDate = () => {
    const locale = this.props.store!.getCurrentLocale();
    switch (locale) {
      case Locales.NB: return 'D. MMMM YYYY';
      case Locales.EN: return 'Dt\\h of MMMM, YYYY';
      default:
        return 'Dt\\h of MMMM, YYYY';
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
      default: return null;
    }
  }

  public render() {
    const { store } = this.props;
    const { currentDistribution } = store!;

    if (!currentDistribution) {
      return <div>{intl.get('loading')}</div>;
    }

    const dueDate = moment(currentDistribution.startDate).isSame(getYearMonthDayDate(currentDistribution.endDate)) ?
      intl.get('distribution_page.due_today') :
      `${this.generateDeadline()} ${intl.get('distribution_page.from_now')}`;
    return (
      <div className="summary">

        <div className="titleSummary">
          {intl.get('distribution_page.summary')}
        </div>

        <div className="headerSummary">
          <div className="flexBox">
            <img src={studentsImg} alt="students" className="studentsImg" />
            <p>{intl.get('distribution_page.assign_to')}</p>
          </div>

          <div className={'date fs15'}>
            {dueDate}
            ({moment(currentDistribution.endDate).locale(store!.getCurrentLocale()).format(this.generateFormatDate())})
          </div>
        </div>

        {this.renderClasses()}

      </div>
    );
  }
}
