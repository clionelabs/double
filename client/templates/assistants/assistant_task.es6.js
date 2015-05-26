Template.assistantTask.helpers(_.extend({
  isStartOrPause() {
    return this.isWorking() ? 'Pause' : 'Start';
  },
  disabledIfTaskCompleted : function() {
    return this.isCompleted() ? "disabled" : "";
  },
}, TemplateHelpers.Task.Message));

Template.assistantTask.events({
  'click .edit': function(e) {
    Session.setAuth(SessionKeys.genDescriptionFormKey(this._id, this.isCurrent), true);
  },
  "click .comment" : function() {
    Session.setAuth(SessionKeys.genStatusFormKey(this._id, this.isCurrent), true);
  },
  "click .link" : function() {
    Session.setAuth(SessionKeys.genLinkFormKey(this._id, this.isCurrent), true);
  },
  "click button.start": function() {
    Tasks.startWork(this._id);
  },
  "click button.pause": function() {
    Tasks.endWork(this._id);
  },
  'click .glyphicon-unchecked' : function(e) {
    Tasks.endWork(this._id);
    Tasks.complete(this._id);
  }
});

Template.assistantTaskSubItem.events({
  "click .link-delete" : function(e) {
    let taskId = $(e.target).data("task-id");
    Tasks.References.delete(taskId, this._id);
  },
  'click .time-container' : function() {
    let getTask = (taskId) => {
      return Tasks.findOne({ _id : taskId });
    };
    Modal.show('timesheetEdit', _.partial(getTask, this.taskId));
  }
});

Template.assistantTaskSubItem.helpers(_.extend({
  allowDelete : function(type) {
    return _.contains(["link"], type) ? "" : "hidden";
  }
}, TemplateHelpers.Task.SubItem));
