Iron.Router.plugins.lockWhenHasCurrentTask = function(router, options) {
  router.onBeforeAction(function(){
    let currentUserId = Meteor.userId();
    let currentUser = currentUserId ? Users.findOneAssistant(currentUserId) : null;
    let currentTask = currentUser ? currentUser.currentTask() : null;
    if (currentTask && router.current().params._id !== currentTask.taskId) {
      Router.go('assistant.tasks.is.working', {_id: currentTask.taskId });
    } else {
      this.next();
    }
  });
};

Router.plugin('lockWhenHasCurrentTask', {
  only : ['assistant.tasks']
});

