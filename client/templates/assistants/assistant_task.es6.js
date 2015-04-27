Template.assistantTask.helpers(_.extend({
  isStartOrPause : function() {
    return this.isWorking() ? 'Pause' : 'Start';
  },
  disabledIfTaskCompleted : function() {
    return this.isCompleted() ? "disabled" : "";
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
  'click .checkbox.glyphicon-unchecked' : function(e) {
    Tasks.endWork(this._id);
    Tasks.complete(this._id);
  }
});

Template.assistantTaskSubItem.helpers(TemplateHelpers.Task.SubItem);
