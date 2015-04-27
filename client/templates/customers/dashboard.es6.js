Template.customerDashboard.events({
  "click .settings" : function() {
    Session.setAuth("isContentBlur", true);
  },
  "click .close" : function() {
    Session.setAuth("isContentBlur", false);
  }
});

Template.customerDashboard.helpers({
  "showBlur" : function() {
    return Session.get(SessionKeys.IS_SIDEBAR_VISIBLE) ? "blur" : "";
  },
  "getSelectedTasks" : function() {
    if (Session.get(SessionKeys.ACTIVE_TAB) === SessionEnums.ACTIVE_TAB.CURRENT_TAB) {
      return Tasks.findCurrent();
    } else if (Session.get(SessionKeys.ACTIVE_TAB) === SessionEnums.ACTIVE_TAB.RECURRING_TAB) {
      return Tasks.findRecurring();
    } else {
      return Tasks.findCompleted();
    }
  }
});

