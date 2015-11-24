Template.assistantCustomersListItem.onRendered(function() {
  this.subscribe("tasks", {}, {fields: {requestorId: 1, steps: 1}});
  this.subscribe("invoices");
});

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
  },
  tasksNotBilledTime() {
    let lastBillDate = Invoices.findLastBilledDate(this._id) + 1;
    let tasksOfCustomer = Tasks.find({ requestorId : this._id }).fetch();
    return _.reduce(tasksOfCustomer, function(memo, task) {
      return memo + task.totalDuration(lastBillDate);
    }, 0);
  }
});


