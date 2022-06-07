import { sub } from "date-fns";
import { TimePeriod } from "../config";

export const dateForTimePeriod = (timePeriod: TimePeriod) => {
  switch (timePeriod) {
    case "Hour":
      return sub(Date.now(), { hours: 1 });

    case "Day":
      return sub(Date.now(), { days: 1 });

    case "Week":
      return sub(Date.now(), { weeks: 1 });

    case "Month":
      return sub(Date.now(), { months: 1 });

    case "Year":
      return sub(Date.now(), { years: 1 });

    default:
      return new Date(0);
  }
};
