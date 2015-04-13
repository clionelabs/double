Template.customerSettings.helpers({
  showSidebar : function() {
    return Template._toggleTwoClass(Session.get(Template.customerDashboard.isSidebarVisible), "show", "hide");
  }
});

Template.customerSettings.events({
  "click .close" : function() {
    Session.set(Template.customerDashboard.isSidebarVisible, false);

  }

});