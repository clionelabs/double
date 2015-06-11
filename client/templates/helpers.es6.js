Template.registerHelper("formatDate", function(date) {
  return moment(date).format('YYYY-MM-DD');
});

Template.registerHelper("formatDateTime", function(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
});

Template.registerHelper("formatDuration", function(duration) {
  return moment.duration(duration).humanize();
});

Template.registerHelper("formatDurationPrecise", function(duration) {
  return moment.duration(duration).format('hh:mm:ss', { trim : false });
});
