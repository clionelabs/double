Template.assistantTasksIsWorking.events({
  "click button" : function() {
    let currentTaskId = Users.findOneAssistant(Meteor.userId()).currentTask().taskId;
    Router.go('assistant.tasks', { _id : currentTaskId });
  }
});
