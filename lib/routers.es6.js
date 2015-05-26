Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'welcome',
  onBeforeAction() {
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
  action() {
    this.render('welcome');
  }
});

Router.route('admin', {
  name: 'admin',
  onBeforeAction() {
    if (!Users.isAdmin(Meteor.userId())) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    return [
      Meteor.subscribe("assistants"),
      Meteor.subscribe("customers"),
      Meteor.subscribe("placements")
    ]
  },
  data() {
    let data = {
      assistants: Users.findAssistants(),
      customers: Users.findCustomers()
    };
    return data;
  },
  action() {
    this.render('adminDashboard');
  }
});

Router.route('customer', {
  name: 'customer',
  waitOn() {
    return [
      Meteor.subscribe("assistants"),
      Meteor.subscribe("myTasks")
    ]
  },
  onBeforeAction() {
    if (Meteor.userId()) {
      if (!Users.isCustomer(Meteor.userId())) {
        Router.go("welcome");
      }
      this.next();
    } else {
      window.location = 'http://www.askdouble.com';
    }
  },
  action() {
    this.layout('mobile');
    this.render('customerDashboard');
  },
  data() {
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
  onBeforeAction() {
    if (!Users.isAssistant(Meteor.userId())) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    return [
      Meteor.subscribe("customers"),
      Meteor.subscribe("assistants"),
      Meteor.subscribe("placements"),
      Meteor.subscribe("myTasks")
    ]
  },
  data() {
    let data = {
      placements: Placements.find({assistantId: Meteor.userId()}),
      customers: Users.findCustomers(),
      tasks: Tasks.find()
    }
    return data;
  },
  action() {
    if (!Session.get(SessionKeys.CURRENT_CUSTOMER)) {
      Session.setAuth(SessionKeys.CURRENT_CUSTOMER, Users.findCustomers().fetch()[0]);
    }
    this.render('assistantDashboard');
  }
});

Router.route('secretLoginRequest', {
  name: 'secretLoginRequest',
  action() {
    this.render('secretLoginRequest');
  }
});

Router.route('secretLogin/:secret', {
  name: 'secretLogin',
  action() {
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
  data() {
    var secret = this.params.secret;
    return {
      'secret': secret
    }
  },
  action() {
    this.render('secretLoginFailed');
  }
});
