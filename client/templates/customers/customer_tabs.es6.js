Template.customerTabs.created = function() {
  if (!Session.get(SessionKeys.ACTIVE_TAB)) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.ACTIVE_TAB.CURRENT_TAB);
  }
};

Template.customerTabs.events({
  "click .tab-current" : function(e) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.ACTIVE_TAB.CURRENT_TAB);
  },
  "click .tab-recurring" : function(e) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.ACTIVE_TAB.RECURRING_TAB);
  },
  "click .tab-completed" : function(e) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.ACTIVE_TAB.COMPLETED_TAB);
  }
});

Template.customerTabs.helpers({
  isCurrentActive : function() {
    return _.isEqual(Session.get(SessionKeys.ACTIVE_TAB), SessionEnums.ACTIVE_TAB.CURRENT_TAB) ? "active" : "";
  },
  isRecurringActive : function() {
    return _.isEqual(Session.get(SessionKeys.ACTIVE_TAB), SessionEnums.ACTIVE_TAB.RECURRING_TAB) ? "active" : "";
  },
  isCompletedActive : function() {
    return _.isEqual(Session.get(SessionKeys.ACTIVE_TAB), SessionEnums.ACTIVE_TAB.COMPLETED_TAB) ? "active" : "";
  }
});