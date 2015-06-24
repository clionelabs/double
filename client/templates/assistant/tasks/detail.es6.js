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
    let formatter = UI._globalHelpers['formatDurationPrecise'];
    return formatter(+Session.get(SessionKeys.CURRENT_TIME_USED));
  },
  getCustomerName() {
    return Users.findCustomers({ _id : this.requestorId }).fetch()[0].displayName();
  },
  last7DaysTimeUsed() {
    let weekBeforeTimestamp = moment().subtract(7, 'd').valueOf();
    console.log(this);
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

let _timeoutFn = null;

let _updateTimer = (task) => {
  Session.setAuth(SessionKeys.CURRENT_TIME_USED, Tasks.findOne(task._id).totalDuration());
};


Template.assistantTasksDetail.onRendered(function() {
  let task = this.data;
  _updateTimer(task);
  _timeoutFn = Meteor.setInterval(_.partial(
    _updateTimer, task), 1000);
});

Template.assistantTasksDetail.onDestroyed(function() {
  Meteor.clearInterval(_timeoutFn);
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
    Tasks.toggleComplete(this._id);
  },
  'click .total-time-used' : function() {
    let getTask = (taskId) => {
      return Tasks.findOne({ _id : taskId });
    };
    Modal.show('assistantTasksTimeSheetEdit', _.partial(getTask, this._id));
  }
});

