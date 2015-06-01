Template.customerTabs.created = function() {
  if (!Session.get(SessionKeys.ACTIVE_TAB)) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.CustomerCurrentTab.PROCESSING_TAB);
  }
};

Template.customerTabs.events({
  "click .tab-processing" : function(e) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.CustomerCurrentTab.PROCESSING_TAB);
  },
  "click .tab-recurring" : function(e) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.CustomerCurrentTab.RECURRING_TAB);
  },
  "click .tab-completed" : function(e) {
    Session.setAuth(SessionKeys.ACTIVE_TAB, SessionEnums.CustomerCurrentTab.COMPLETED_TAB);
  }
});

Template.customerTabs.helpers({
  isProcessingActive : function() {
    return _.isEqual(Session.get(SessionKeys.ACTIVE_TAB), SessionEnums.CustomerCurrentTab.PROCESSING_TAB) ? "active" : "";
  },
  isRecurringActive : function() {
    return _.isEqual(Session.get(SessionKeys.ACTIVE_TAB), SessionEnums.CustomerCurrentTab.RECURRING_TAB) ? "active" : "";
  },
  isCompletedActive : function() {
    return _.isEqual(Session.get(SessionKeys.ACTIVE_TAB), SessionEnums.CustomerCurrentTab.COMPLETED_TAB) ? "active" : "";
  }
});