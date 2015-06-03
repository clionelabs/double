Template.assistantTasksRunning._timeoutFn = null;

Template.assistantTasksRunning._updateTimer = function() {
  let assistantTasksRunning = Template.assistantTasksDashboard.getRunningTask();
  Session.setAuth(SessionKeys.CURRENT_TIME_USED, assistantTasksRunning.totalDuration());
};

Template.assistantTasksRunning.onCreated(function() {
  this.data = _.extend(
      this.data,
      { isCurrent : true });
});

Template.assistantTasksRunning.onRendered(function() {
  Template.assistantTasksRunning._updateTimer();
  Template.assistantTasksRunning._timeoutFn = Meteor.setInterval(function() {
    Template.assistantTasksRunning._updateTimer();
  }, 1000);

});

Template.assistantTasksRunning.helpers({
  getTimeUsed : function() {
    return moment.duration(+Session.get(SessionKeys.CURRENT_TIME_USED)).format('hh:mm:ss', { trim : false });
  },
  getCustomerName : function() {
    let assistantTasksRunning = Template.assistantTasksDashboard.getRunningTask();
    return Users.findCustomers({ _id : assistantTasksRunning.requestorId }).fetch()[0].displayName();
  }
});

Template.assistantTasksRunning.onDestroyed(function(){
  Meteor.clearInterval(Template.assistantTasksRunning._timeoutFn);
  Template.assistantTasksRunning._timeoutFn = null;
  Session.clear(SessionKeys.CURRENT_TIME_USED);
});
