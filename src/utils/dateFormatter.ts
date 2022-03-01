import moment from 'moment';

export const getYearMonthDayDate = (date: Date) => {
  const isDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  return new Date(isDate.replace(/-/g, '/'));
};

export const formatDeadline = (date: Date | null) => (
  date && moment(date, 'DD/MM-YYYY').format('(DD/MM-YYYY)')
);
