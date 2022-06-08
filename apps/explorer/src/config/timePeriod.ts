export type TimePeriod =
  | "Hour"
  | "Day"
  | "Week"
  | "Month"
  | "3_Month"
  | "6_Month"
  | "Year"
  | "Max";

export const ValidTimePeriods: Array<TimePeriod> = [
  "Hour",
  "Day",
  "Week",
  "Month",
  "3_Month",
  "6_Month",
  "Year",
  "Max",
];
