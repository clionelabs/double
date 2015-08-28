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
  timezoneOffsetOptions(selectedTimezoneOffset) {
    let options = [];
    for (var o = -12; o <= 12; o++) {
      let value = o * 60;
      let display = o < 0? o: `+${o}`;
      let selected = selectedTimezoneOffset === value;
      options.push({value: value, display: display, selected: selected});
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
  timezoneOffset() {
    let timezoneOffset = D.Configs.get(D.Configs.Keys.BUSINESS_TIMEZONE_OFFSET_IN_MINS);
    return timezoneOffset === null? -1: parseInt(timezoneOffset);
  },
  holidays() {
    let holidays = D.Configs.get(D.Configs.Keys.BUSINESS_HOLIDAYS) || [];
    holidays = _.sortBy(holidays, 'date');
    return holidays;
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

  "change #timezone-offset": function(event) {
    let newValue = $(event.target).val();
    D.Configs.set(D.Configs.Keys.BUSINESS_TIMEZONE_OFFSET_IN_MINS, newValue, _updateCallback);
  },

  "change #is-response-on": function(event) {
    let newValue = $(event.target).is(":checked");
    D.Configs.set(D.Configs.Keys.IS_AUTO_RESPONSE_ON, newValue, _updateCallback);
  },

  "submit #add-holiday-form": function(event) {
    event.preventDefault();
    let form = event.target;
    let date = form.date.value;
    let title = form.title.value;

    if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(date)) {
      Notifications.error("Incorrect date form - Please use yyyy-mm-dd");
      return;
    }
    if (!title) {
      Notifications.error("Missing holiday title - Please enter a title");
      return;
    }

    let holidays = D.Configs.get(D.Configs.Keys.BUSINESS_HOLIDAYS) || [];
    let found = _.reduce(holidays, function(memo, holiday) {
      return memo | holiday.date === date;
    }, false);
    if (found) {
      Notifications.error("Date already existed");
      return;
    }
    holidays.push({date: date, title: title});
    D.Configs.set(D.Configs.Keys.BUSINESS_HOLIDAYS, holidays, _updateCallback);
    form.date.value = '';
    form.title.value = '';
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
  },

  "click .remove-holiday": function(event) {
    let date = this.date;
    let holidays = D.Configs.get(D.Configs.Keys.BUSINESS_HOLIDAYS) || [];
    holidays = _.reject(holidays, function(holiday) {
      return holiday.date === date;
    });
    D.Configs.set(D.Configs.Keys.BUSINESS_HOLIDAYS, holidays, _updateCallback);
  }
});
