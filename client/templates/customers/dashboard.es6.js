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
    return Session.get(SessionKeys.isSidebarVisible) ? "blur" : "";
  },
  "getSelectedTasks" : function() {
    if (Session.get(SessionKeys.activeTab) === SessionEnums.activeTab.currentTab) {
      return Tasks.findCurrent();
    } else if (Session.get(SessionKeys.activeTab) === SessionEnums.activeTab.recurringTab) {
      return Tasks.findRecurring();
    } else {
      return Tasks.findCompleted();
    }
  }
});

