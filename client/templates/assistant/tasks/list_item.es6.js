Template.assistantTasksListItem.helpers({
  isSelected() {
    return this.isCurrent ? "selected" : "";
  },
  status() {
    //TODO
    return "offline";
  },
  getLastModified() {
    return moment().subtract(moment(this.lastModified));
  }
});
Template.assistantTasksListItem.events({
  "click .task" : function(e, tmpl) {
    Router.go('assistant.tasks', { _id : tmpl.data._id });
  }
});
