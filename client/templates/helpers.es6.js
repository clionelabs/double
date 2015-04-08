Template.registerHelper("formatDate", function(date) {
  return moment(date).format('YYYY-MM-DD');
});

Template.registerHelper("formatDuration", function(duration) {
  console.log(duration);
  return moment.duration(duration).humanize();
});
