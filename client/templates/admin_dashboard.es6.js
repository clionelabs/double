Template.adminDashboard.helpers({
});

Template.adminDashboardCustomerRow.helpers({
  assignedAssistantName: function() {
    // The default transform is not applied. Why?
    var placement = Placements.findOne({customerId: this._id}, {transform: function(doc) {
      return _.extend(doc, Placement);
    }});
    if (!placement) {
      placement = EmptyPlacement;
    }
    return placement.assistantDisplayName();
  },

  availableAssistants: function() {
    var customerId = this._id;
    var data = Router.current().data();
    return data.assistants.map(function(assistant) {
      return _.extend(assistant, {customerId: customerId});
    });
  }
});

var customerRowUpdateCallback = function(error) {
  if (error) {
    Notifications.error("updated failed", "");
  } else {
    Notifications.success("updated successful", "");
  }
}

Template.adminDashboardCustomerRow.events({
  "click .unassign-assistant": function() {
    var customerId = this._id;
    var placement = Placements.findOne({customerId: customerId});
    if (placement) {
      Placements.remove(placement._id, customerRowUpdateCallback);
    }
  },
  "click .assign-assistant": function(event) {
    var customerId = this.customerId;
    var assistantId = this._id;
    var placement = Placements.findOne({customerId: customerId});
    if (placement) {
      Placements.update(placement._id, {$set: {assistantId: assistantId}}, customerRowUpdateCallback);
    } else {
      Placements.insert({customerId: customerId, assistantId: assistantId}, customerRowUpdateCallback);
    }
  }
});

Template.adminDashboard.events({
  "click #new-assistant-button": function() {
    Modal.show('adminCreateAssistant');
  },

  "click #new-customer-button": function() {
    Modal.show('adminCreateCustomer');
  }
});

Template.adminCreateAssistant.events({
  "submit #new-assistant-form": function (event) {
    event.preventDefault();

    let form = event.target;
    let data = {
      email: form.email.value,
      firstname: form.firstname.value,
      lastname: form.lastname.value
    }
    Meteor.call('createAssistant', data, function(error, result) {
      Modal.hide();
    });
  }
});

Template.adminCreateCustomer.events({
  "submit #new-customer-form": function (event) {
    event.preventDefault();

    let form = event.target;
    let data = {
      email: form.email.value,
      firstname: form.firstname.value,
      lastname: form.lastname.value
    }
    Meteor.call('createCustomer', data, function(error, result) {
      Modal.hide();
    });
  }
});
