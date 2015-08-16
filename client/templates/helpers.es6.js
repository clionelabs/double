DateFormatter = {
  toDateString : (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : '---';
  },
  toDateTimeString : (date) => {
    return  date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '---';
  },
  toDateMonthString : (date) => {
    return  date ? moment(date).format('MMMM DD, YYYY') : '---';
  }
};

DurationFormatter = {
  toString : (duration)=> {
    return duration ? moment.duration(duration).humanize() : '---';
  },
  toPreciseString : (duration) => {
    return moment.duration(duration).format('hh:mm:ss', { trim : false });
  },
  toPreciseMsString : function(duration) {
    return moment.duration(duration).format('hh:mm:ss.SSS', { trim : false });
  }
};

AmountFormatter = {
  toString : function(amount) {
    return numeral(amount).format('0,0.00');
  }
};

Template.registerHelper("formatDate", DateFormatter.toDateString);
Template.registerHelper("formatDateTime", DateFormatter.toDateTimeString);
Template.registerHelper("formatDateMonth", DateFormatter.toDateMonthString);
Template.registerHelper("formatDuration", DurationFormatter.toString);
Template.registerHelper("formatDurationPrecise", DurationFormatter.toPreciseString);
Template.registerHelper("formatDurationPreciseMs", DurationFormatter.toPreciseMsString);

Template.registerHelper("formatAmount", AmountFormatter.toString);

Template.registerHelper('enableIfIsEditing', function(isEditing) {
  return isEditing.get() ? "false" : "true";
});

Template.registerHelper("formatMessage", function(text) {
  text = Blaze.toHTMLWithData(UI._globalHelpers['emojione'], text);
  text = UI._globalHelpers['nl2br'](text);
  return text;
});

Template.registerHelper('not', function(x) {
  return !x;
});
