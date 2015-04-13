Template.registerHelper("formatDate", function(date) {
  return moment(date).format('YYYY-MM-DD');
});

Template.registerHelper("formatDuration", function(duration) {
  return moment.duration(duration).humanize();
});

Template._toggleTwoClass = function(bool, onClass, offClass) {
  return bool ? onClass : offClass;
};
