Template.customerTabs.created = function() {
  if (!Session.get(SessionKeys.ACTIVE_TAB)) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.ActiveTab.CURRENT_TAB);
  }
};

Template.customerTabs.events({
  "click .tab-current" : function(e) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.ActiveTab.CURRENT_TAB);
  },
  "click .tab-recurring" : function(e) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.ActiveTab.RECURRING_TAB);
  },
  "click .tab-completed" : function(e) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.ActiveTab.COMPLETED_TAB);
  }
});

Template.customerTabs.helpers({
  isCurrentActive : function() {
    return _.isEqual(Session.get(SessionKeys.ACTIVE_TAB), SessionEnums.ActiveTab.CURRENT_TAB) ? "active" : "";
  },
  isRecurringActive : function() {
    return _.isEqual(Session.get(SessionKeys.ACTIVE_TAB), SessionEnums.ActiveTab.RECURRING_TAB) ? "active" : "";
  },
  isCompletedActive : function() {
    return _.isEqual(Session.get(SessionKeys.ACTIVE_TAB), SessionEnums.ActiveTab.COMPLETED_TAB) ? "active" : "";
  }
});