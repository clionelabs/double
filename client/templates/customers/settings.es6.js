Template.customerSettings.helpers({
  showSidebar : function() {
    return Session.get(SessionKeys.isSidebarVisible) ? "show" : "hide";
  }
});

Template.customerSettings.events({
  "click .close" : function() {
    Session.setAuth(SessionKeys.isSidebarVisible, false);

  }

});