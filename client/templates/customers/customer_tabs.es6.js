Template.customerTabs.ACTIVE = "activeTab";
Template.customerTabs.CURRENT = "current";
Template.customerTabs.RECURRING = "recurring";
Template.customerTabs.COMPLETED = "completed";

Template.customerTabs.created = function() {
  Session.setDefault(Template.customerTabs.ACTIVE, Template.customerTabs.CURRENT);
};

Template.customerTabs.rendered = function() {
  $(".tab-" + Session.get(Template.customerTabs.ACTIVE)).addClass("active");
};

Template.customerTabs.events({
  "click .tab" : function(e) {
    $(".tab").removeClass("active");
    $(e.currentTarget).addClass("active");
  }

});