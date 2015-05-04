Template.customerSettings.helpers({
  showSidebar() {
    return Session.get(SessionKeys.IS_SIDEBAR_VISIBLE) ? "show" : "hide";
  },
  getTotalHours() {
    return Meteor.user().profile.plan.maxHour;
  },
  getTotalHourUsed() {
    let tasks = Tasks.find().fetch();
    let ts = _.reduce(tasks, (memo, task) => { return memo + task.getTotalDuration(); }, 0);
    let m = moment.duration(ts);
    return numeral(m.asHours() + (+m.asMinutes() / 60)).format('0,0.00');
  },
  getPercentageOfTimeLeft() {
    let totalHourUsed = numeral().unformat(Template.customerSettings.__helpers.get('getTotalHourUsed')());
    let totalHour =  Template.customerSettings.__helpers.get('getTotalHours')();
    //TODO mechanism to disallow overtime
    let percentage = totalHourUsed / totalHour > 1 ? 1 : totalHourUsed / totalHour;
    return numeral(percentage).format('0%');
  }
});

Template.customerSettings.events({
  "keyup *" : function(e) {
    if (e.targetCode === 27) {
      Session.setAuth(SessionKeys.IS_SIDEBAR_VISIBLE, false);
    }//esc
  },
  "click .close" : function() {
    Session.setAuth(SessionKeys.IS_SIDEBAR_VISIBLE, false);
  },
  "click .logout" : function() {
    let secret = Session.get(SessionKeys.SECRET);
    Meteor.logout();//cannot redirect in callback because the template reload when logout
  }
});