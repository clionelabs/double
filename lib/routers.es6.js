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
    ];
  },
  data() {
    return {
      assistants: Users.findAssistants(),
      customers: Users.findCustomers()
    };
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
    ];
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
    };
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
  action() {
    if (!Session.get(SessionKeys.CURRENT_ASSISTANT_TAB)
        || Session.get(SessionKeys.CURRENT_ASSISTANT_TAB) === AssistantTabType.TASKS) {
      Router.go("assistant.tasks");
    } else if (Session.get(SessionKeys.CURRENT_ASSISTANT_TAB) === AssistantTabType.CUSTOMERS) {
      Router.go("assistant.customers");
    }
  }
});

Router.route('assistant/customers/:_id?', {
  name: 'assistant.customers',
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
      Meteor.subscribe("myTasks"),
      Meteor.subscribe("routedChannels")
    ];
  },
  data() {
    return {
      placements: Placements.find({ assistantId: Meteor.userId() }),
      customers: Users.findCustomers(),
      tasks: Tasks.find()
    };
  },
  action() {
    if (this.params._id) {
      let userSelector = { _id : this.params._id };
      Session.setAuth(SessionKeys.CURRENT_CUSTOMER, Users.findCustomers(userSelector).fetch()[0]);
      Session.setAuth(SessionKeys.CURRENT_ASSISTANT_TAB, AssistantTabType.CUSTOMERS);
      this.render('assistantCustomersDashboard');
    } else {
      let currentUser = Session.get(SessionKeys.CURRENT_CUSTOMER);
      if (!currentUser) {
        Router.go('assistant.customers', { _id : Users.findCustomers().fetch()[0]._id });
      } else {
        Router.go('assistant.customers', { _id : currentUser._id });
      }
    }

  }
});

Router.route('assistant/tasks/:_id?', {
  name: 'assistant.tasks',
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
    ];
  },
  data() {
    return {
      placements: Placements.find({ assistantId: Meteor.userId() }),
      tasks: Tasks.find()
    };
  },
  action() {
    if (this.params._id) {

      let tasksSelector = { _id : this.params._id };
      Session.setAuth(SessionKeys.CURRENT_TASK, Tasks.findOne(tasksSelector));
      Session.setAuth(SessionKeys.CURRENT_ASSISTANT_TAB, AssistantTabType.TASKS);
      this.render('assistantTasksDashboard');
    } else {
      let currentUser = Session.get(SessionKeys.CURRENT_CUSTOMER);
      if (!currentUser) {
        Router.go('assistant.customers');
      }

      let currentTask =  Session.get(SessionKeys.CURRENT_TASK);
      if (!currentTask) {
        currentTask = Tasks.findOne();
      }
      Router.go('assistant.tasks', { _id : currentTask._id });
    }
  }
});

Router.route('assistant/unrouted', {
  name: 'assistant.unrouted',
  onBeforeAction() {
    if (!Users.isAssistant(Meteor.userId())) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    return [
      Meteor.subscribe("customers"),
      Meteor.subscribe("unroutedChannels")
    ]
  },
  data() {
    return {
      customers: Users.findCustomers()
    }
  },
  action() {
    this.render('assistantUnroutedDashboard');
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
    let loginRequest = { secret: secret };
    Accounts.callLoginMethod({
      methodArguments: [loginRequest],
      userCallback: function(err) {
        if (err) {
          Router.go("secretLoginFailed", { secret: secret });
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
    let secret = this.params.secret;
    return {
      'secret': secret
    };
  },
  action() {
    this.render('secretLoginFailed');
  }
});
