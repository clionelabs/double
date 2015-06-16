
Template.assistantCustomersListItem.events({
  "click .profile" : function() {
    Modal.show('customerEditForm', this);
  },
  "click .customer" : function(e, tmpl) {
    Router.go('assistant.customers', { _id : tmpl.data._id });
  }
});

Template.assistantCustomersListItem.helpers({
  tasks() {
    return Tasks.find({ requestorId: this._id }, { sort: { title: 1 }});
  },
  animateIfIsCalling() {
    let thisCustomer = _.extend(this, Customer);
    return (thisCustomer.isCalling()) ? "animated infinite wobble" : "";
  },
  isSelected() {
    let currentCustomer = Session.get(SessionKeys.CURRENT_CUSTOMER);
    if (currentCustomer) {
      return _.isEqual(this._id, currentCustomer._id) ? "selected" : "";
    } else {
      return "";
    }
  },
  hasNotRepliedClass() {
    return this.hasNotRepliedConversation()? "not-replied": "";
  }
});


