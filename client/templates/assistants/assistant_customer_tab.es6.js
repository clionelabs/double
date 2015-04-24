Template.assistantDashboardCustomerTab.getCurrentTask = () => {
  return Tasks.findOne({ _id : Session.get(SessionKeys.currentTask)});
};

Template.assistantDashboardCustomerTab.onRendered(function() {
  if (Template.assistantDashboardCustomerTab.getCurrentTask()) {
    //Used function to
    Modal.show("currentTask", Template.assistantDashboardCustomerTab.getCurrentTask);
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
