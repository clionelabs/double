let subs = new SubsManager();

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
      subs.subscribe("assistants"),
      subs.subscribe("customers"),
      subs.subscribe("placements")
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
      subs.subscribe("assistants"),
      subs.subscribe("myTasks")
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
    if (!(Users.isAssistant(Meteor.userId()) || Users.isAdmin(Meteor.userId()))) {
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
    if (!(Users.isAssistant(Meteor.userId()) || Users.isAdmin(Meteor.userId()))) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    return [
      subs.subscribe("customers"),
      subs.subscribe("assistants"),
      subs.subscribe("placements"),
      subs.subscribe("myInProcessTasks"),
      subs.subscribe("routedChannels")
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
      let users = Users.findCustomers(userSelector).fetch();
      Session.setAuth(SessionKeys.CURRENT_CUSTOMER, users.length > 0 ? users[0] : EmptyCustomer);
      Session.setAuth(SessionKeys.CURRENT_ASSISTANT_TAB, AssistantTabType.CUSTOMERS);
      this.render('assistantCustomersDashboard');
    } else {
      let currentUser = Session.get(SessionKeys.CURRENT_CUSTOMER);
      if (!currentUser) {
        let users = Users.findCustomers().fetch();
        Router.go('assistant.customers', { _id : users.length > 0 ? users[0]._id : EmptyCustomer._id });
      } else {
        Router.go('assistant.customers', { _id : currentUser._id });
      }
    }
  }
});

// Note: Crazy story: There is an mysterious `Error: Handler with name b already exists` error appearing on production mode after we start using subManager. It runs perfectly fine on local. Perhaps it's due to some unknown bugs in the meteor compression/ minification. Surprisingly and interestingly, by inserting a dummy statement here make the error goes away. (of course it's still hidden somewhere).
// TODO: Fix this, if you can. Replicate the problem by: removing the below statement, then run meteor with production mode, i.e. `meteor --production`
let MYSTERY = 'mystery';

Router.route('assistant/tasks/:_id?', {
  name: 'assistant.tasks',
  onBeforeAction() {
    if (!(Users.isAssistant(Meteor.userId()) || Users.isAdmin(Meteor.userId()))) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    return [
      subs.subscribe("customers"),
      subs.subscribe("assistants"),
      subs.subscribe("placements"),
      subs.subscribe("myInProcessTasks")
    ];
  },
  data() {
    let taskSelector = { _id : this.params._id };
    return {
      placements: Placements.find({ assistantId: Meteor.userId() }),
      tasks: Tasks.find(),
      currentTask : Tasks.findOne(taskSelector)
    };
  },
  action() {
    if (this.params._id) {
      this.render('assistantTasksDashboard');
    } else {
      let currentUser = Session.get(SessionKeys.CURRENT_CUSTOMER);
      if (!currentUser) {
        Router.go('assistant.customers');
      }

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
    if (!(Users.isAssistant(Meteor.userId()) || Users.isAdmin(Meteor.userId()))) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    return [
      subs.subscribe("customers"),
      subs.subscribe("unroutedChannels")
    ]
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
