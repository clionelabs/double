Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'welcome',
  onBeforeAction: function() {
    if (Users.isAdmin(Meteor.userId())) {
      Router.go("admin");
    }
    if (Users.isAssistant(Meteor.userId())) {
      Router.go("assistant");
    }
    if (Users.isCustomer(Meteor.userId())) {
      Router.go("customer");
    }
    this.next();
  },
  action: function() {
    this.render('welcome');
  }
});

Router.route('admin', {
  name: 'admin',
  onBeforeAction: function() {
    if (!Users.isAdmin(Meteor.userId())) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn: function() {
    return [
      Meteor.subscribe("assistants"),
      Meteor.subscribe("customers")
    ]
  },
  data: function() {
    var data = {
      assistants: Users.findAssistants(),
      customers: Users.findCustomers()
    }
    return data;
  },
  action: function() {
    this.render('adminDashboard');
  }
});

Router.route('customer', {
  name: 'customer',
  onBeforeAction: function() {
    if (!Users.isCustomer(Meteor.userId())) {
      Router.go("welcome");
    }
    this.next();
  },
  action: function() {
    this.render('customerDashboard');
  }
});
/**
 * To be removed once the user role stuff is ready
 */
Router.route('testcus', {
    name: 'testcus',
    action: function() {
        this.layout('mobile');
        this.render('customerDashboard');
    }
});

Router.route('assistant', {
  name: 'assistant',
  onBeforeAction: function() {
    if (!Users.isAssistant(Meteor.userId())) {
      Router.go("welcome");
    }
    this.next();
  },
  action: function() {
    this.render('assistantDashboard');
  }
});
