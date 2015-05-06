Template.assistantTask.helpers(_.extend({
  isStartOrPause : function() {
    return this.isWorking() ? 'Pause' : 'Start';
  },
  disabledIfTaskCompleted : function() {
    return this.isCompleted() ? "disabled" : "";
  },
  getReferencesWithTaskId : function() {
    let task = this;
    return _.map(this.references,
        function(ref) {
          return _.extend({ taskId : task._id}, ref);
        });
  }
}, TemplateHelpers.Task.Message));

Template.assistantTask.events({
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
  }
});

Template.assistantTaskSubItem.helpers(_.extend({
  allowDelete : function(type) {
    return _.contains(["link"], type) ? "" : "hidden";
  }
}, TemplateHelpers.Task.SubItem));
