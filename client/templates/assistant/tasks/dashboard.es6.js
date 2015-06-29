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
    return this.currentTask;
  },
  tasksWithIsCurrent() {
    let currentTask = this.currentTask;
    return _.map(this.tasks.fetch(), function(task) {
      return _.extend({}, { isCurrent : (currentTask._id === task._id) }, task);
    });
  }
});
