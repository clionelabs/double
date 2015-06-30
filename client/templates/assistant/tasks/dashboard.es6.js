Template.assistantTasksDashboard.helpers({
  getCurrentTask() {
    return Template.currentData().currentTask;
  },
  tasksWithIsCurrent() {
    let currentTask = Template.currentData().currentTask;
    return _.map(this.tasks.fetch(), function(task) {
      return _.extend({}, { isCurrent : (currentTask._id === task._id) }, task);
    });
  }
});
