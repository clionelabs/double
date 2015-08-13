Template.assistantTaskTaggedMessages.onRendered(function() {
  let instance = Template.instance();
  instance.autorun(function() {
    let task = Template.currentData();
    instance.subscribe('taskTaggedMessages', task._id);
  });
});

Template.assistantTaskTaggedMessages.events({
  "click .add" : function() {
    let task = Template.currentData();
    Router.go('assistant.customers.selected', { _id : task.requestorId });
  }
});
