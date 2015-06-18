let _getCurrentTaskSelector = {
  $where: function () {
    _.extend(this, Task.Prototype);
    return this.isWorking(Meteor.userId());
  }
};

Template.assistantTasksDashboard.getRunningTask = () => {
  return Tasks.findOne(_getCurrentTaskSelector);
};

Template.assistantTasksDashboard.helpers({
  getCurrentTask() {
    return Task.transform(Session.get(SessionKeys.CURRENT_TASK));
  }
});
