export const getStartOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  return new Date(date.setDate(diff));
};

export const getEndOfWeek = (date: Date): Date => {
  const endOfWeek = new Date(date);
  endOfWeek.setDate(date.getDate() + (6 - date.getDay()));

  return endOfWeek;
};

export const getStartOfDay = (date: Date = new Date()): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

export const getEndOfDay = (date: Date = new Date()): Date => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

export function calculatePreviousWeek() {
  const now = new Date();

  const startOfCurrentWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const endOfPreviousWeek = new Date(startOfCurrentWeek.setSeconds(-1));
  const startOfPreviousWeek = new Date(startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - 6));

  return {
    start: startOfPreviousWeek,
    end: endOfPreviousWeek,
  };
}

export const calculateStartAndEndOfWeek = (date: Date = new Date()): { start: Date; end: Date } => {
  const currentDate = new Date(date);

  const startOfWeek = new Date(currentDate);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const endOfWeek = new Date(currentDate);
  endOfWeek.setHours(23, 59, 59, 999);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

  return { start: startOfWeek, end: endOfWeek };
};

export const calculateStartAndEndOfMonth = (date: Date = new Date()): { start: Date; end: Date } => {
  const currentDate = new Date(date);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return { start: startOfMonth, end: endOfMonth };
};

export const calculateStartAndEndOfDay = (startDate = new Date(), endDate = new Date()): { start: Date; end: Date } => {
  const currentDate = new Date(startDate);

  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  return { start: startOfDay, end: endOfDay };
};

export const calculateValidityDate = (days = 90): Date => {
  const currentDate = new Date();
  const date = new Date(currentDate.setDate(currentDate.getDate() + days));

  return date;
};
