Template.adminDashboard.helpers({
  isAssistantsTabSelected() {
    return Template.instance().selectedTabVar.get() === 'assistants';
  },

  isCustomersTabSelected() {
    return Template.instance().selectedTabVar.get() === 'customers';
  },

  isBusinessTabSelected() {
    return Template.instance().selectedTabVar.get() === 'business';
  },

  isServicesTabSelected() {
    return Template.instance().selectedTabVar.get() === 'services';
  },

  contentTemplateName() {
    let selectedTab = Template.instance().selectedTabVar.get();
    if (selectedTab === 'assistants') {
      return 'adminDashboardAssistants';
    } else if (selectedTab === 'customers') {
      return 'adminDashboardCustomers';
    } else if (selectedTab === 'business') {
      return 'adminDashboardBusiness';
    } else if (selectedTab === 'services') {
      return 'adminDashboardServices';
    }
  }
});


Template.adminDashboard.onCreated(function() {
  let instance = Template.instance();
  instance.selectedTabVar = new ReactiveVar('customers');
});

Template.adminDashboard.events({
  "click .customers-tab": function() {
    Template.instance().selectedTabVar.set("customers");
  },

  "click .assistants-tab": function() {
    Template.instance().selectedTabVar.set("assistants");
  },

  "click .business-tab": function() {
    Template.instance().selectedTabVar.set("business");
  },

  "click .services-tab": function() {
    Template.instance().selectedTabVar.set("services");
  }
});
