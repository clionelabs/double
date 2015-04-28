Template.assistantCreateTaskSchedule.events({
  // TODO: user friendly inputs for recurrence rule
  "submit #new-task-schedule-form": function (event) {
    event.preventDefault();

    let form = event.target;
    let customerId = form.customerId.value;
    let ruleString = form.ruleString.value;
    let title = form.title.value;

    let doc = {
      customerId: customerId,
      ruleString: ruleString,
      title: title
    }

    Meteor.call('createTaskScheduler', doc, function(error) {
      Modal.hide();
    });
  }
});
