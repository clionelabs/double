Template.assistantDashboardCustomerTab.helpers({
  tasks: function() {
    return Tasks.find({requestorId: this._id}, {sort: {title: 1}});
  }
});

Template.assistantDashboardCustomerTab.events({
  "click .new-task-button": function() {
    let data = {
      customerId: this._id
    }
    Modal.show('assistantCreateTask', data);
  }
});


