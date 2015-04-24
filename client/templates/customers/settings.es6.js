Template.customerSettings.helpers({
  showSidebar : function() {
    return Session.get(Template.customerDashboard.IS_SIDEBAR_VISIBLE) ? "show" : "hide";
  }
});

Template.customerSettings.events({
  "click .close" : function() {
    Session.setAuth(Template.customerDashboard.IS_SIDEBAR_VISIBLE, false);

  }

});