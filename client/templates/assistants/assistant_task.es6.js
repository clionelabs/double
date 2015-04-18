Template.assistantTask.helpers({

});

Template.assistantTask.events({
  "click button.start": function() {
    Tasks.startWork(this._id);
  },
  "click button.end": function() {
    Tasks.endWork(this._id);
  }
});

Template.assistantTaskSubItem.helpers({
  assistantTaskSubItemMessage : function() {
    return this.url ? "assistantTaskSubItemMessageWithUrl" : "assistantTaskSubItemMessageWithoutUrl" ;
  }
});
