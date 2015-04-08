Template.adminDashboard.helpers({
});

Template.adminDashboardCustomerRow.helpers({
  assignedAssistantName: function() {
    var placement = Placements.findOne({customerId: this._id});
    if (!placement) {
      return '--';
    } else {
      var assistant = Meteor.users.findOne(placement.assistantId);
      return assistant.profile.firstname + ' ' + assistant.profile.lastname;
    }
  },

  availableAssistants: function() {
    var customerId = this._id;
    var data = Router.current().data();
    return data.assistants.map(function(assistant) {
      return _.extend(assistant, {customerId: customerId});
    });
  }
});

Template.adminDashboardCustomerRow.events({
  "click .assign-assistant": function(event) {
    var customerId = this.customerId;
    var assistantId = this._id;
    var placement = Placements.findOne({customerId: customerId});
    if (placement) {
      Placements.update(placement._id, {$set: {assistantId: assistantId}}, function(error) {
        if (error) {
          Notifications.error("updated failed", "");
        } else {
          Notifications.success("updated successful", "");
        }
      });
    } else {
      Placements.insert({customerId: customerId, assistantId: assistantId}, function(error) {
        if (error) {
          Notifications.error("updated failed", "");
        } else {
          Notifications.success("updated successful", "");
        }
      });
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
