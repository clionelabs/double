Template.assistantTasksDetail.helpers({
  isWorking() {
    let currentAssistant = Users.findOneAssistant(Meteor.userId());
    return currentAssistant && currentAssistant.currentTask() && currentAssistant.currentTask() === this._id;
  },
  isStartOrPause() {
    if (Users.isAdmin(Meteor.userId())) return 'fa-stop';

    let currentAssistant = Users.findOneAssistant(Meteor.userId());
    let currentTask = currentAssistant && currentAssistant.currentTask();
    return currentTask && currentTask.taskId === this._id ? 'fa-pause pause' : 'fa-play start';
  },
  ifTaskCompleted() {
    return this.isCompleted() ? "completed" : "not-completed";
  },
  getLatestStatus() {
    return this.getLatestStatus(Meteor.userId());
  },
  getFormattedTotalDuration() {
    _timerDep.depend();
    let formatter = UI._globalHelpers['formatDurationPrecise'];
    return formatter(this.totalDuration());
  },
  getCustomerName() {
    let customer = Users.findOneCustomer({ _id : this.requestorId });
    if (customer) { return customer.displayName(); }
  },
  last7DaysTimeUsed() {
    let weekBeforeTimestamp = moment().subtract(7, 'd').valueOf();
    return _.reduce(this.steps, function(memo, step) {
      return memo + step.duration(weekBeforeTimestamp, moment().valueOf());
    }, 0);
  }
});

let _timerDep = new Tracker.Dependency();
let _timerFn = null;

let _updateTimer = () => {
  _timerDep.changed();
};

Template.assistantTasksDetail.onRendered(function() {
  let instance = this;
  instance.autorun(function() {
    let task = Template.currentData();
    let currentAssistant = Users.findOneAssistant(Meteor.userId());
    let assistantCurrentTaskStatus = currentAssistant && currentAssistant.currentTask();
    if (assistantCurrentTaskStatus
          && assistantCurrentTaskStatus.status === Assistants.TaskStatus.Stopped
          && assistantCurrentTaskStatus.taskId === task._id
        ) {
      Modal.show('assistantTasksCreateBillable', task);
    } else {
      Modal.hide();
    }

    _updateTimer();
    _timerFn = Meteor.setInterval(_updateTimer, 1000);
  });
});

Template.assistantTasksDetail.onDestroyed(function() {
  Meteor.clearInterval(_timerFn);
});

Template.assistantTasksDetail.events({
  "click .start": function() {
    Assistants.startTask(Meteor.userId(), this._id);
  },
  "click .pause": function() {
    Assistants.endTask(Meteor.userId(), this._id);
  },
  'click .complete' : function(e) {
    Tasks.complete(this._id);
  }
});
