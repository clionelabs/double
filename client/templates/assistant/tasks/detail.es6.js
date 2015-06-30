Template.assistantTasksDetail.helpers({
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
    return Users.findOneCustomer({ _id : this.requestorId }).displayName();
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
  let task = instance.data;
  instance.autorun(function() {
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
    Tasks.startWork(this._id, Meteor.userId());
  },
  "click .pause": function() {
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

