Template.customerDashboard.IS_SIDEBAR_VISIBLE = "IS_SIDEBAR_VISIBLE";

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
    return Session.get(Template.customerDashboard.IS_SIDEBAR_VISIBLE) ? "blur" : "");
  }
});

