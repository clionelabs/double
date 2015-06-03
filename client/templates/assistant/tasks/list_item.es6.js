Template.assistantTasksListItem.helpers({
  isSelected() {
    let currentTask = Session.get(SessionKeys.CURRENT_TASK);
    if (currentTask) {
      return _.isEqual(this._id, currentTask._id) ? "selected flash animated" : "";
    } else {
      return "";
    }
  }
});
Template.assistantTasksListItem.events({
  "click .task" : function(e, tmpl) {
    Router.go('assistant.tasks', { _id : tmpl.data._id });
  }
});
