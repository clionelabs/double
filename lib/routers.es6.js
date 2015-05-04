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
      Meteor.subscribe("customers"),
      Meteor.subscribe("placements")
    ]
  },
  data: function() {
    let data = {
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
  waitOn: function() {
    return [
      Meteor.subscribe("assistants"),
      Meteor.subscribe("myTasks")
    ]
  },
  onBeforeAction: function() {
    if (Meteor.userId()) {
      if (!Users.isCustomer(Meteor.userId())) {
        Router.go("welcome");
      }
      this.next();
    } else {
      let secret = Session.get(SessionKeys.SECRET);
      if (secret) {
        Router.go('secretLoginFailed', {secret : secret});
      }
    }
  },
  action: function() {
    this.layout('mobile');
    this.render('customerDashboard');
  },
  data : function() {
    let tasks = Tasks.find();
    let assistant = Users.findAssistants().fetch()[0];
    return {
      tasks : tasks,
      assistant : assistant
    }
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
  waitOn: function() {
    return [
      Meteor.subscribe("customers"),
      Meteor.subscribe("assistants"),
      Meteor.subscribe("placements"),
      Meteor.subscribe("myTasks")
    ]
  },
  data: function() {
    let data = {
      placements: Placements.find({assistantId: Meteor.userId()}),
      customers: Users.findCustomers(),
      tasks: Tasks.find()
    }
    return data;
  },
  action: function() {
    this.render('assistantDashboard');
  }
});

Router.route('secretLoginRequest', {
  name: 'secretLoginRequest',
  action: function() {
    this.render('secretLoginRequest');
  }
});

Router.route('secretLogin/:secret', {
  name: 'secretLogin',
  action: function() {
    let secret = this.params.secret;
    let loginRequest = {secret: secret};
    Accounts.callLoginMethod({
      methodArguments: [loginRequest],
      userCallback: function(err) {
        if (err) {
          Router.go("secretLoginFailed", {secret: secret});
        } else {
          Session.setPersistent(SessionKeys.SECRET, secret);
          Router.go("welcome");
        }
      }
    });
  }
});

Router.route('secretLoginFailed/:secret', {
  name: 'secretLoginFailed',
  data: function() {
    console.log("failed");
    var secret = this.params.secret;
    return {
      'secret': secret
    }
  },
  action: function() {
    this.render('secretLoginFailed');
  }
});
