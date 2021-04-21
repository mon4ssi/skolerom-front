import React, { Component, MouseEvent } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import onClickOutside from 'react-onclickoutside';
import en from 'date-fns/locale/en-GB';
import nb from 'date-fns/locale/nb';
import nn from 'date-fns/locale/nn';

import { Locales } from 'utils/enums';

import './CustomCalendar.scss';

registerLocale(Locales.EN, en);
registerLocale(Locales.NB, nb);
registerLocale(Locales.NN, nn);

interface Props {
  currentLocale: string;
  endDate: Date | null;
  onChange: (date: Date, event: React.SyntheticEvent) => void;
  handleClickOutside: (e: MouseEvent) => void;
}

class CustomCalendarComponent extends Component<Props> {

  // public componentDidMount() {
  //   const element = document.getElementsByClassName('--selected')[0];
  //   const elementClone = element.cloneNode(true);

  //   element.innerHTML = '';
  //   element.classList.remove('react-datepicker__day--selected');

  //   element.appendChild(elementClone);
  // }

  public render() {
    const { currentLocale, endDate, onChange } = this.props;
    const currentDate = new Date();

    return (
      // tslint:disable-next-line: jsx-no-lambda
      <div onClick={(event) => { event.preventDefault(); event.stopPropagation(); }} >
        <DatePicker
          locale={currentLocale}
          selectsEnd
          selected={endDate}
          minDate={currentDate}
          startDate={currentDate}
          endDate={endDate}
          onChange={onChange}
          inline
          calendarClassName="Calendar"
        />
      </div>
    );
  }
}

export const CustomCalendar = onClickOutside(CustomCalendarComponent);
