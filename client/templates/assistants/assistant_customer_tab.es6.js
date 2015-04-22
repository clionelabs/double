Template.assistantDashboardCustomerTab.getCurrentTask = () => {
  return Tasks.findOne({ _id : Session.get(SessionKeys.currentTask)});
};

Template.assistantDashboardCustomerTab.onRendered(function() {
  if (Template.assistantDashboardCustomerTab.getCurrentTask().isWorking()) {
    Modal.show("currentTask", Template.assistantTask.readyFocusTask);
  }
});

Template.assistantDashboardCustomerTab.helpers({
  tasks: function() {
    return Tasks.find({requestorId: this._id}, {sort: {title: 1}});
  },
  getCurrentTask : Template.assistantDashboardCustomerTab.getCurrentTask

});

Template.assistantDashboardCustomerTab.events({
  "click .new-task-button": function() {
    let data = {
      customerId: this._id
    };
    Modal.show('assistantCreateTask', data);
  }
});
