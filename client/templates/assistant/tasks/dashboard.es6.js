let FILTER = {
  CURRENT : 'current',
  COMPLETED : 'completed'
};

Template.assistantTasksDashboard.onCreated(function() {
  Template.instance().filter = new ReactiveVar(FILTER.CURRENT);
  Template.instance().rCurrentTaskId = new ReactiveVar();
});

Template.assistantTasksDashboard.onRendered(function() {
  this.autorun(function() {
    let currentTask = Template.currentData().currentTask;
    Template.instance().rCurrentTaskId.set(currentTask._id);
  })
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
  getRCurrentTaskId() {
    return Template.instance().rCurrentTaskId;
  },
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
    return _.sortBy(_.map(tasks.fetch(), function(task) {
      return _.extend({}, { isCurrent : (currentTask._id === task._id) }, task);
    }), function(task) {
      if (task.completedAt) {
        return task.completedAt;
      } else {
        return task.lastModified;
      }
    });
  },
  filterIsCurrent() {
    return Template.instance().filter.get() === FILTER.CURRENT ? "active" : "";
  },
  filterIsCompleted() {
    return Template.instance().filter.get() === FILTER.COMPLETED ? "active" : "";
  }
});
