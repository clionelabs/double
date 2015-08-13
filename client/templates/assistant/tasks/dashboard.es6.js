let FILTER = {
  CURRENT : 'current',
  COMPLETED : 'completed'
};

Template.assistantTasksDashboard.onCreated(function() {
  Template.instance().filter = new ReactiveVar(FILTER.CURRENT);
});

Template.assistantTasksDashboard.events({
  "click .filters>.current" : function() {
    Template.instance().filter.set(FILTER.CURRENT);
  },
  "click .filters>.completed" : function() {
    Template.instance().filter.set(FILTER.COMPLETED);
  }
});

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
    let tasks = Template.instance().filter.get() === FILTER.CURRENT ? this.tasks : this.completedTasks;
    let currentTask = Template.currentData().currentTask;
    return _.map(tasks.fetch(), function(task) {
      return _.extend({}, { isCurrent : (currentTask._id === task._id) }, task);
    });
  },
  filterIsCurrent() {
    return Template.instance().filter.get() === FILTER.CURRENT ? "active" : "";
  },
  filterIsCompleted() {
    return Template.instance().filter.get() === FILTER.COMPLETED ? "active" : "";
  }
});
