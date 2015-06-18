let _submitFn = (form, taskId) => {
  let message = form.target.message.value;
  Tasks.Status.change(message, taskId, Meteor.userId(),
      () => {
        form.target.reset();
      });
};

Template.assistantTasksDetailStatusForm.helpers({
  getFlattenedStatuses() {
    let statuses = _.reduce(this.statuses, (memo, statusesOfUser, userId) => {
      let flattenedStatuses = _.map(statusesOfUser, (status) => {
        return _.extend(status, { userId : userId });
      });
      return memo.concat(flattenedStatuses);
    }, []);
    return _.sortBy(statuses, 'createdAt').reverse();
  }
});

Template.assistantTasksDetailStatusForm.events({
  "submit form.change-status" : function(e) {
    e.preventDefault();
    return _submitFn(e, this._id);
  }
});
