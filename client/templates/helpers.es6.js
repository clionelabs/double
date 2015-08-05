Template.registerHelper("formatDate", function(date) {
  return date ? moment(date).format('YYYY-MM-DD') : '---';
});

Template.registerHelper("formatDateTime", function(date) {
  return  date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '---';
});

Template.registerHelper("formatDateMonth", function(date) {
  return  date ? moment(date).format('MMMM DD, YYYY') : '---';
});

Template.registerHelper("formatDuration", function(duration) {
  return duration ? moment.duration(duration).humanize() : '---';
});

Template.registerHelper("formatDurationPrecise", function(duration) {
  return moment.duration(duration).format('hh:mm:ss', { trim : false });
});
Template.registerHelper("formatDurationPreciseMs", function(duration) {
  return moment.duration(duration).format('hh:mm:ss SSS', { trim : false });
});

Template.registerHelper("formatAmount", function(amount) {
  return numeral(amount).format('0,0.00');
});

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
