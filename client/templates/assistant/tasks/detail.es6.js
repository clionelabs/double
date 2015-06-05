Template.assistantTasksDetail.helpers(_.extend({
  isStartOrPause() {
    return this.isWorking(Meteor.userId()) ? 'Pause' : 'Start';
  },
  disabledIfTaskCompleted() {
    return this.isCompleted() ? "disabled" : "";
  }
}, TemplateHelpers.Task.Message));

Template.assistantTasksDetail.events({
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
    Tasks.startWork(this._id, Meteor.userId());
  },
  "click button.pause": function() {
    Tasks.endWork(this._id, Meteor.userId());
  },
  'click .glyphicon-unchecked' : function(e) {
    Tasks.endWork(this._id, Meteor.userId());
    Tasks.complete(this._id);
  }
});

Template.assistantTasksDetailSubItem.events({
  "click .link-delete" : function(e) {
    let taskId = $(e.target).data("task-id");
    Tasks.References.delete(taskId, this._id);
  },
  'click .time-container' : function() {
    let getTask = (taskId) => {
      return Tasks.findOne({ _id : taskId });
    };
    Modal.show('assistantTasksTimeSheetEdit', _.partial(getTask, this.taskId));
  }
});

Template.assistantTasksDetailSubItem.helpers(_.extend({
  allowDelete : function(type) {
    return _.contains(["link"], type) ? "" : "hidden";
  }
}, TemplateHelpers.Task.SubItem));
