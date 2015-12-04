DateFormatter = {
  toDateString : (date) => {
    return DateFormatter.toDateStringWithTimeZone(date);
  },
  toDateStringWithTimeZone : (date, timezone) => {
    const dateMoment = date ? moment(date) : null;
    if (date && timezone) {
      console.log(timezone);
      dateMoment.tz(timezone);
    }
    return dateMoment ? dateMoment.format('YYYY-MM-DD') : '---';
  },
  toDateTimeString : (date) => {
    return DateFormatter.toDateTimeStringWithTimeZone(date);
  },
  toDateTimeStringWithTimeZone : (date, timezone) => {
    const dateMoment = date ? moment(date) : null;
    if (date && timezone) {
      dateMoment.tz(timezone);
    }
    return dateMoment ? dateMoment.format('YYYY-MM-DD HH:mm:ss') : '---';
  },
  toDateMonthString : (date) => {
    return DateFormatter.toDateMonthStringWithTimeZone(date);
  },
  toDateMonthStringWithTimeZone : (date, timezone) => {
    const dateMoment = date ? moment(date) : null;
    if (date && timezone) {
      dateMoment.tz(timezone);
    }
    return dateMoment ? dateMoment.format('MMMM DD, YYYY') : '---';
  },
  toDateShortMonthString : (date) => {
    return DateFormatter.toDateShortMonthStringWithTimeZone(date);
  },
  toDateShortMonthStringWithTimeZone : (date, timezone) => {
    const dateMoment = date ? moment(date) : null;
    if (date && timezone) {
      dateMoment.tz(timezone);
    }
    return dateMoment ? dateMoment.format('MMM DD, YYYY') : '---';
  }
};

DurationFormatter = {
  toMinute : (duration) => {
    return duration / 1000 / 60;
  },
  toString : (duration)=> {
    return duration ? moment.duration(duration).humanize(true) : '---';
  },
  toPreciseString : (duration) => {
    return moment.duration(duration).format('hh:mm:ss', { trim : false });
  },
  toPreciseMsString : function(duration) {
    return moment.duration(duration).format('hh:mm:ss.SSS', { trim : false });
  }
};

DurationConverter = {
  minutesToMs : (minute) => {
    return minute * 60 * 1000;
  }
};

AmountFormatter = {
  toString : function(amount) {
    return numeral(amount).format('0,0.00');
  }
};
