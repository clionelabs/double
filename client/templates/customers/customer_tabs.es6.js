Template.customerTabs.created = function() {
  if (!Session.get(SessionKeys.activeTab)) {
    Session.setAuth(SessionKeys.activeTab, SessionKeys.currentTab);
  }
};

Template.customerTabs.events({
  "click .tab-current" : function(e) {
    Session.setAuth(SessionKeys.activeTab, SessionKeys.currentTab);
  },
  "click .tab-recurring" : function(e) {
    Session.setAuth(SessionKeys.activeTab, SessionKeys.recurringTab);
  },
  "click .tab-completed" : function(e) {
    Session.setAuth(SessionKeys.activeTab, SessionKeys.completedTab);
  }
});

Template.customerTabs.helpers({
  isCurrentActive : function() {
    return _.isEqual(Session.get(SessionKeys.activeTab), SessionKeys.currentTab) ? "active" : "";
  },
  isRecurringActive : function() {
    return _.isEqual(Session.get(SessionKeys.activeTab), SessionKeys.recurringTab) ? "active" : "";
  },
  isCompletedActive : function() {
    return _.isEqual(Session.get(SessionKeys.activeTab), SessionKeys.completedTab) ? "active" : "";
  }
});