let FILTER = {
  INPROGRESS : 'inprogress',
  COMPLETED : 'completed'
};

Template.assistantTasksDashboard.onCreated(function() {
  let instance = this;
  instance.rSubscriptionReady = new ReactiveVar(false);
  instance.rFilter = new ReactiveVar(FILTER.INPROGRESS);
  instance.rCurrentTask = new ReactiveVar();
  instance.rCurrentTaskId = new ReactiveVar(); // TODO: remove this; rCurrentTask should be enough

  this.autorun(function() {
    let data = Template.currentData();
    let currentTaskId = data.currentTaskId;
    if (currentTaskId) {
      instance.subscribe("tasks", {_id: currentTaskId});
      instance.rCurrentTask.set(Tasks.findOne(currentTaskId));
      instance.rCurrentTaskId.set(currentTaskId);
    } else {
      instance.rCurrentTask.set(null);
      instance.rCurrentTaskId.set(null);
    }
  })
});

Template.assistantTasksDashboard.events({
  "click .filters>.inprogress" : function() {
    Template.instance().rFilter.set(FILTER.INPROGRESS);
  },
  "click .filters>.completed" : function() {
    Template.instance().rFilter.set(FILTER.COMPLETED);
  }
});

Template.assistantTasksDashboard.helpers({
  isReady() {
    return Template.instance().subscriptionsReady();
  },
  inProgressTasks() {
    return Tasks.find({completedAt: null});
  },
  completedTasks() {
    return Tasks.find({completedAt: {$not: null}});
  },
  inProgressTasksCount() {
    let inProgressTasks = Template.assistantTasksDashboard.__helpers.get('inProgressTasks')();
    return inProgressTasks.count();
  },
  completedTasksCount() {
    let inProgressTasks = Template.assistantTasksDashboard.__helpers.get('completedTasks')();
    return inProgressTasks.count();
  },
  getRCurrentTaskId() {
    return Template.instance().rCurrentTaskId;
  },
  getCurrentTask() {
    let currentTask = Template.instance().rCurrentTask.get();

    // TODO: following reactive vars should be created in the taskDetail sub-template?!
    return _.extend({}, {
      isDescriptionFormShown : new ReactiveVar(false),
      isLinkFormShown: new ReactiveVar(false),
      isStepFormShown : new ReactiveVar(false)
    }, currentTask);
  },
  tasksWithIsCurrent() {
    let currentTask = Template.instance().rCurrentTask.get();
    let cursor;
    if (Template.instance().rFilter.get() === FILTER.INPROGRESS) {
      cursor =  Tasks.find({completedAt: null}, {sort: {lastModified: -1}});
    } else {
      cursor =  Tasks.find({completedAt: {$not: null}}, {sort: {completedAt: -1}});
    }
    return cursor.map(function(task) {
      return _.extend(task, {
        isCurrent: (currentTask && currentTask._id === task._id)
      });
    });
    return cursor;
  },
  filterIsInprogress() {
    return Template.instance().rFilter.get() === FILTER.INPROGRESS ? "active" : "";
  },
  filterIsCompleted() {
    return Template.instance().rFilter.get() === FILTER.COMPLETED ? "active" : "";
  }
});
