Template.customerDashboard.IS_SIDEBAR_VISIBLE = "IS_SIDEBAR_VISIBLE";

Template.customerDashboard.events({
  "click .settings" : function() {
    Session.setAuth("isContentBlur", true);
  },
  "click .close" : function() {
    Session.setAuth("isContentBlur", false);
  }
});

Template.customerDashboard.helpers({
  "showBlur" : function() {
    return Session.get(Template.customerDashboard.IS_SIDEBAR_VISIBLE) ? "blur" : "";
  }
});

