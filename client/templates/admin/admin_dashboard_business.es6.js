Template.adminDashboardBusiness.onCreated(function() {
  let instance = Template.instance();
  instance.rIsEditingResponseMessage = new ReactiveVar(false);
});

Template.adminDashboardBusiness.helpers({
  timeOptions(selectedTime) {
    let options = [];
    for (var s = 0; s < 3600 * 24; s += 1800) {
      let h = Math.floor(s / 3600);
      h = h < 10? `0${h}`: h;
      let m = (s / 1800 % 2 == 0)? '00': '30';
      let selected = s === selectedTime;
      options.push({value: s, display: `${h}:${m}`, selected: selected});
    }
    return options;
  },
  isResponseOn() {
    return D.Configs.get(D.Configs.Keys.IS_AUTO_RESPONSE_ON);
  },
  responseMessage() {
    return D.Configs.get(D.Configs.Keys.AUTO_RESPONSE_MESSAGE);
  },
  startTime() {
    let time = D.Configs.get(D.Configs.Keys.BUSINESS_START_TIME_IN_SECS);
    return time === null? -1: parseInt(time);
  },
  endTime() {
    let time = D.Configs.get(D.Configs.Keys.BUSINESS_END_TIME_IN_SECS);
    return time === null? -1: parseInt(time);
  },
  isEditingResponseMessage() {
    let instance = Template.instance();
    return instance.rIsEditingResponseMessage.get();
  }
});

let _updateCallback = function(error) {
  if (error) {
    Notifications.error("updated failed", "");
  } else {
    Notifications.success("updated successful", "");
  }
}

Template.adminDashboardBusiness.events({
  "change #start-seconds": function(event) {
    let newValue = $(event.target).val();
    D.Configs.set(D.Configs.Keys.BUSINESS_START_TIME_IN_SECS, newValue, _updateCallback);
  },

  "change #end-seconds": function(event) {
    let newValue = $(event.target).val();
    D.Configs.set(D.Configs.Keys.BUSINESS_END_TIME_IN_SECS, newValue, _updateCallback);
  },

  "change #is-response-on": function(event) {
    let newValue = $(event.target).is(":checked");
    D.Configs.set(D.Configs.Keys.IS_AUTO_RESPONSE_ON, newValue, _updateCallback);
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
    D.Configs.set(D.Configs.Keys.AUTO_RESPONSE_MESSAGE, content, _updateCallback);
    textarea.attr("readonly", true);
  }
});
