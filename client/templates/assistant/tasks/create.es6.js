Template.assistantTaskCreate.events({
  "submit #new-task-form": function (event) {
    event.preventDefault();

    let form = event.target;
    let customerId = form.customerId.value;
    let title = form.title.value;

    let doc = {
      requestorId: customerId,
      responderId: Meteor.userId(),
      title: title
    };
    Tasks.create(doc, function(error, _id) {
      _.extend(doc, { _id : _id });
      Modal.hide();
      Analytics.createRequest(doc, Meteor.userId());
    });
  }
});

