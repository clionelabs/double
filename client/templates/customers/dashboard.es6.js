Template.customerDashboard.isSidebarVisible = "isSidebarVisible";

Template.customerDashboard.events({
  "click .settings" : function() {
    Session.set("isContentBlur", true);
  },
  "click .close" : function() {
    Session.set("isContentBlur", false);
  }
});

Template.customerDashboard.helpers({
  "showBlur" : function() {
    return Template._toggleTwoClass(Session.get(Template.customerDashboard.isSidebarVisible), "blur", "");
  }
});

