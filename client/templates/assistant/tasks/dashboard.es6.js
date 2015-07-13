Template.assistantTasksDashboard.helpers({
  getCurrentTask() {
    let currentTask = this.currentTask;
    return _.extend({}, {
            isDescriptionFormShown : new ReactiveVar(false),
            isLinkFormShown: new ReactiveVar(false),
            isStepFormShown : new ReactiveVar(false)
          },
        currentTask);
  },
  tasksWithIsCurrent() {
    let currentTask = Template.currentData().currentTask;
    return _.map(this.tasks.fetch(), function(task) {
      return _.extend({}, { isCurrent : (currentTask._id === task._id) }, task);
    });
  }
});
