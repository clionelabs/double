Template.customerTabs.created = function() {
  if (!Session.get(SessionKeys.activeTab)) {
    Session.setAuth(SessionKeys.activeTab, SessionEnums.activeTab.currentTab);
  }
};

Template.customerTabs.events({
  "click .tab-current" : function(e) {
    Session.setAuth(SessionKeys.activeTab, SessionEnums.activeTab.currentTab);
  },
  "click .tab-recurring" : function(e) {
    Session.setAuth(SessionKeys.activeTab, SessionEnums.activeTab.recurringTab);
  },
  "click .tab-completed" : function(e) {
    Session.setAuth(SessionKeys.activeTab, SessionEnums.activeTab.completedTab);
  }
});

Template.customerTabs.helpers({
  isCurrentActive : function() {
    return _.isEqual(Session.get(SessionKeys.activeTab), SessionEnums.activeTab.currentTab) ? "active" : "";
  },
  isRecurringActive : function() {
    return _.isEqual(Session.get(SessionKeys.activeTab), SessionEnums.activeTab.recurringTab) ? "active" : "";
  },
  isCompletedActive : function() {
    return _.isEqual(Session.get(SessionKeys.activeTab), SessionEnums.activeTab.completedTab) ? "active" : "";
  }
});