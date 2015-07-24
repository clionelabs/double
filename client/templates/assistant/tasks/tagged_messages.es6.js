Template.assistantTaskTaggedMessages.onRendered(function() {
  let instance = Template.instance();
  instance.autorun(function() {
    let task = Template.currentData();
    instance.subscribe('taskTaggedMessages', task._id);
  });
});
