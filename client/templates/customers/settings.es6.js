Template.customerSettings.helpers({
  showSidebar : function() {
    return Session.get(SessionKeys.IS_SIDEBAR_VISIBLE) ? "show" : "hide";
  }
});

Template.customerSettings.events({
  "click .close" : function() {
    Session.setAuth(SessionKeys.IS_SIDEBAR_VISIBLE, false);

  }

});