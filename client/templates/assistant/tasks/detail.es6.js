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


Template.assistantTasksDetail.events({
  "click .comment" : function() {
    Session.setAuth(SessionKeys.genStatusFormKey(this._id), true);
  },
  "click .link" : function() {
    Session.setAuth(SessionKeys.genLinkFormKey(this._id), true);
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

/*
Template.assistantTasksDetailSubItem.events({
  "click .link-delete" : function(e) {
    let taskId = $(e.target).data("task-id");
    Tasks.References.delete(taskId, this._id);
  },
});

Template.assistantTasksDetailSubItem.helpers(_.extend({
  allowDelete : function(type) {
    return _.contains(["link"], type) ? "" : "hidden";
  }
}, TemplateHelpers.Task.SubItem));
*/
