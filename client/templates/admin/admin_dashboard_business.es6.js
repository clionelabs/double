Template.adminDashboardBusiness.onCreated(function() {
  let instance = Template.instance();
  instance.rIsEditingResponseMessage = new ReactiveVar(false);
});

Template.adminDashboardBusiness.helpers({
  isResponseOn() {
    return D.Configs.get(D.Configs.Keys.IS_AUTO_RESPONSE_ON);
  },
  responseMessage() {
    return D.Configs.get(D.Configs.Keys.AUTO_RESPONSE_MESSAGE);
  },
  isEditingResponseMessage() {
    let instance = Template.instance();
    return instance.rIsEditingResponseMessage.get();
  }
});

Template.adminDashboardBusiness.events({
  "change #start-seconds": function(event) {
    let newValue = $(event.target).val();
    console.log("startSeconds: ", newValue);
    //TODO
  },

  "change #end-seconds": function(event) {
    let newValue = $(event.target).val();
    console.log("endSeconds: ", newValue);
    //TODO
  },

  "change #is-response-on": function(event) {
    let newValue = $(event.target).is(":checked");
    console.log("isResponseOn: ", newValue);
    D.Configs.set(D.Configs.Keys.IS_AUTO_RESPONSE_ON, newValue);
  },

  "change #response-message": function(event) {
    let newValue = $(event.target).val();
    console.log("responseText: ", newValue);
  },

  "submit #add-holiday-form": function(event) {
    event.preventDefault();
    let form = event.target;
    let date = form.date.value;
    console.log("submit add holiday form", date);
    //TODO
  },

  "click #response-message-edit-button": function(event) {
    let instance = Template.instance();
    instance.rIsEditingResponseMessage.set(true);
    let textarea = instance.$("#response-message");
    console.log(textarea, textarea.val());
    textarea.attr("readonly", false);
    textarea.focus();
  },

  "click #response-message-update-button": function(event) {
    let instance = Template.instance();
    instance.rIsEditingResponseMessage.set(false);
    let textarea = instance.$("#response-message");
    let content = textarea.val();
    D.Configs.set(D.Configs.Keys.AUTO_RESPONSE_MESSAGE, content, function(error) {
      if (error) {
        Notifications.error("updated failed", "");
      } else {
        Notifications.success("updated successful", "");
        textarea.attr("readonly", true);
      }
    });
  }
});
