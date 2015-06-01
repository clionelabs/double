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
    if (Session.get(SessionKeys.ACTIVE_TAB) === SessionEnums.CustomerCurrentTab.PROCESSING_TAB) {
      return Tasks.findProcessing();
    } else if (Session.get(SessionKeys.ACTIVE_TAB) === SessionEnums.CustomerCurrentTab.RECURRING_TAB) {
      return Tasks.findRecurring();
    } else {
      return Tasks.findCompleted();
    }
  }
});

