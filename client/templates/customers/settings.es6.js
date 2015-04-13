Template.customerSettings.helpers({
  showSidebar : function() {
    return Template._toggleTwoClass(Session.get(Template.customerDashboard.IS_SIDEBAR_VISIBLE), "show", "hide");
  }
});

Template.customerSettings.events({
  "click .close" : function() {
    Session.set(Template.customerDashboard.IS_SIDEBAR_VISIBLE, false);

  }

});