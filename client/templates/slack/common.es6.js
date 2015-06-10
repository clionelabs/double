Handlebars.registerHelper('formatTimestamp', function(timestamp) {
  if (!timestamp) return '--';
  return moment(timestamp).format('MM-DD HH:mm:ss');
});
