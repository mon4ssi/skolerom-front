import moment from 'moment';

export const getYearMonthDayDate = (date: Date) => (
  new Date(date.getFullYear(), date.getMonth(), date.getDate())
);

export const formatDeadline = (date: Date | null) => (
  date && moment(date).format('(DD/MM-YYYY)')
);
