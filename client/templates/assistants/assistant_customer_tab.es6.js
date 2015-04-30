let _getCurrentTaskSelector = {
  $where: function () {
          _.extend(this, Task.Prototype);
          return this.isWorking();
  }
};

Template.assistantDashboardCustomerTab.getCurrentTask = () => {
  return Tasks.findOne(_getCurrentTaskSelector);
};

Template.assistantDashboardCustomerTab.onRendered(function() {
  Tasks.find(_getCurrentTaskSelector).observe({
    added(task) {
      //Modal.show need a function argument to be reactive #gotcha
      Modal.show("currentTask", Template.assistantDashboardCustomerTab.getCurrentTask);
    },
    removed() {
      Modal.hide("currentTask");
    }
  });
});

Template.assistantDashboardCustomerTab.helpers({
  tasks() {
    return Tasks.find({requestorId: this._id}, {sort: {title: 1}});
  },
  getCurrentTask : Template.assistantDashboardCustomerTab.getCurrentTask,

  animateIfIsCalling() {
    let thisCustomer = _.extend(this, Customer);
    return (thisCustomer.isCalling()) ? "animated infinite wobble" : "";
  }

});

Template.assistantDashboardCustomerTab.events({
  "click .new-task-button": function() {
    let data = {
      customerId: this._id
    };
    Modal.show('assistantCreateTask', data);
  },
  "click .new-task-scheduler-button": function() {
    let data = {
      customerId: this._id
    }
    Modal.show('assistantCreateTaskSchedule', data);
  }
});
