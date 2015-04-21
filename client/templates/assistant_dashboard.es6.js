Template.assistantDashboard.helpers({
  myCustomers: function() {
    return this.placements.map(function(placement) {
      return Users.findOne(placement.customerId);
    });
  }
});

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

Template.assistantDashboardTask.events({
  "click .start-task-button": function() {
    Tasks.startWork(this._id);
  },
  "click .end-task-button": function() {
    Tasks.endWork(this._id);
  }
});

Template.assistantCreateTask.events({
  "submit #new-task-form": function (event) {
    event.preventDefault();

    let form = event.target;
    let customerId = form.customerId.value;
    let title = form.title.value;

    let doc = {
      requestorId: customerId,
      responderId: Meteor.userId(),
      title: title
    }
    Tasks.create(doc, function() {
      Modal.hide();
    });
  }
});
