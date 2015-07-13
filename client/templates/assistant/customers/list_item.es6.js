
Template.assistantCustomersListItem.events({
  "click .profile" : function() {
    Modal.show('customerEditForm', this);
  },
  "click .customer" : function(e, tmpl) {
    Router.go('assistant.customers.selected', { _id : tmpl.data._id });
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
    return this.isCurrent ? "selected" : "";
  },
  hasNotRepliedClass() {
    return this.hasNotRepliedConversation()? "not-replied": "";
  }
});


