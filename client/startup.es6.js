Meteor.startup(function() {
  Tracker.autorun(function() {
    const user = Meteor.user();
    Mixpanel.clearUp();
  })
});
