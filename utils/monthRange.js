const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isValidMonth(month) {
  return typeof month === "string" && MONTH_PATTERN.test(month);
}

export function parseMonth(month) {
  if (!isValidMonth(month)) return null;
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex - 1, 1);
}

export function monthBounds(month) {
  const start = parseMonth(month);
  if (!start) return null;
  return {
    start,
    end: new Date(start.getFullYear(), start.getMonth() + 1, 1),
  };
}

export function shiftMonth(month, offset) {
  const start = parseMonth(month);
  if (!start) return null;
  const shifted = new Date(start.getFullYear(), start.getMonth() + offset, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(month, { withYear = true } = {}) {
  const start = parseMonth(month);
  if (!start) return month || "";
  const name = MONTH_NAMES[start.getMonth()];
  return withYear ? `${name} ${start.getFullYear()}` : name;
}

export function daysInMonth(month) {
  const start = parseMonth(month);
  return start ? new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() : 0;
}
