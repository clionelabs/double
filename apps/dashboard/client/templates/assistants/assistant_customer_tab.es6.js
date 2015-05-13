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
  "click .profile" : function() {
    Modal.show('customerEditForm', this);
  },
  "click .new-task-scheduler-button": function() {
    let data = {
      customerId: this._id
    }
    Modal.show('assistantCreateTaskSchedule', data);
  }
});

Template.assistantDashboardCustomerTab._submitPreferenceFn = (form, taskId, isCurrent) => {
  let message = form.target.message.value;
  Tasks.Status.change(message, taskId,
      () => {
        form.target.reset();
        Session.setAuth(SessionKeys.genStatusFormKey(taskId, isCurrent), false);
      });
};

Template.assistantTaskStatusForm.onRendered(function() {
  let selfTemplate = this;
  selfTemplate.$('.form-container').on('transitionend onanimationend', function(e) {
    if ($(e.target).height() > 1) {
      selfTemplate.$('.status-message').focus();
    }
  });
});

Template.assistantTaskStatusForm.helpers({
  isStatusFormShown : function() {
    return Session.get(SessionKeys.genStatusFormKey(this._id, this.isCurrent)) ? "" : "not-shown";
  },
  genFormKey : function(taskId, isCurrent) {
    return SessionKeys.genStatusFormKey(taskId, isCurrent);
  }
});

Template.assistantTaskStatusForm.events({
  "submit .task-status-change" : function(e) {
    e.preventDefault();
    return Template.assistantTaskStatusForm._submitFn(e, this._id, this.isCurrent);
  },
  "keyup .task-status-change input" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.setAuth(SessionKeys.genStatusFormKey(this._id, this.isCurrent), false);
    }
  }
});
