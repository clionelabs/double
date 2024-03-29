Template.assistantCustomersListItem.events({
  "click .profile" : function() {
    Modal.show('customerEditForm', this);
  },
});

Template.assistantCustomersListItem.helpers({
  getRouteData() {
    return { _id : this._id };
  },
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
  },
  isOnline() {
    return this.isOnline();
  }
});


