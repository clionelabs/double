Template.assistantTasksDetail.helpers({
  isWorking() {
    let currentAssistant = Users.findOneAssistant(Meteor.userId());
    return currentAssistant.currentTask();
  },
  isStartOrPause() {
    return this.isWorking(Meteor.userId()) ? 'fa-pause pause' : 'fa-play start';
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
    return _.reduce(this.timesheets, function(memo, timesheetsOfUser) {
      let totalTimeUsedOfUser = _.reduce(timesheetsOfUser, function(memo, timesheet) {
        if (timesheet.startedAt >= weekBeforeTimestamp) {
          return memo + timesheet.duration();
        } else {
          return memo;
        }
      }, 0);
      return memo + totalTimeUsedOfUser;
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
    let task = Tasks.findOne(instance.data._id);
    let currentAssistant = Users.findOneAssistant(Meteor.userId());
    let assistantCurrentTaskStatus = currentAssistant.currentTask();
    if (assistantCurrentTaskStatus && assistantCurrentTaskStatus.status === Assistants.TaskStatus.Stopped) {
      Modal.show('assistantTasksCreateBillable', task);
    }

    _updateTimer();
    _timerFn = Meteor.setInterval(_updateTimer, 1000);
  });
});

Template.assistantTasksDetail.onDestroyed(function() {
  Meteor.clearInterval(_timerFn);
});

Template.assistantTasksDetail.events({
  "click .comment" : function() {
    Session.setAuth(SessionKeys.genStatusFormKey(this._id), true);
  },
  "click .start": function() {
    Assistants.startTask(Meteor.userId(), this._id);
    Tasks.startWork(this._id, Meteor.userId());
  },
  "click .pause": function() {
    Assistants.endTask(Meteor.userId(), this._id);
    Tasks.endWork(this._id, Meteor.userId());
  },
  'click .complete' : function(e) {
    Tasks.complete(this._id);
  },
  'click .total-time-used' : function() {
    let getTask = (taskId) => {
      return Tasks.findOne({ _id : taskId });
    };
    Modal.show('assistantTasksTimeSheetEdit', _.partial(getTask, this._id));
  }
});
