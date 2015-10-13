Template.adminDashboardCustomers.events({
  "click #new-customer-button": function() {
    Modal.show('customerEditForm');
  }
});

Template.adminDashboardCustomerRow.helpers({
  hasAssignedAssistant: function() {
    let placement = Placements.findOne({ customerId: this._id });
    return !!placement;
  },
  assignedAssistantName: function() {
    // The default transform is not applied. Why?
    let placement = Placements.findOne({ customerId: this._id }, { transform: function(doc) {
      return _.extend(doc, Placement);
    }}) || EmptyPlacement;
    return placement.assistantDisplayName();
  },

  availableAssistants: function() {
    let customerId = this._id;
    let data = Router.current().data();
    if (data && data.assistants) {
      return data.assistants.map(function (assistant) {
        return _.extend(assistant, {customerId: customerId}, User);
      });
    } else {
      return null;
    }
  }
});

var _customerRowUpdateCallback = function(error) {
  if (error) {
    Notifications.error("updated failed", "");
  } else {
    Notifications.success("updated successful", "");
  }
};

Template.adminDashboardCustomerRow.events({
  "click .unassign-assistant": function() {
    let customerId = this._id;
    Placements.unassign(customerId, _customerRowUpdateCallback);
  },
  "click .assign-assistant": function(event) {
    let customerId = this.customerId;
    let assistantId = this._id;
    Placements.assign(customerId, assistantId, _customerRowUpdateCallback);
  }
});
