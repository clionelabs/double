Template.assistantTaskTaggedMessages.onRendered(function() {
  let instance = Template.instance();
  let task = Template.currentData();
  instance.subscribe('taskTaggedMessages', task._id);
});
