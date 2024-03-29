/**
 * We make a separate routers2 file here to avoid the mysterious Handler with name 'C' exists error
 * That's the only reason to have separate routers file. Can merge them if the error is fixed
 */
let subs = RouterSubs;

Router.configure({
  layoutTemplate: 'layout'
});

Router.route('assistant/tasksSummary', {
  name: 'assistant.tasksSummary',
  onBeforeAction() {
    if (!(Users.isAssistant(Meteor.userId()) || Users.isAdmin(Meteor.userId()))) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    return [
      subs.subscribe("myTasks"),
      subs.subscribe("customers")
    ];
  },
  action() {
    this.render('assistantTasksSummary');
  }
});

/**
 * Redirect to the approimate url
 *   if channel is assigned to customer
 *     go to customer tab with the channel selected
 *   otherwise,
 *     go to incoming tab with the channel selected
 */
Router.route('channel/:_id', {
  name: 'channel.default',

  where: 'server',

  action() {
    let channelId = this.params._id;
    let channel = D.Channels.findOne(channelId);
    let url;
    if (channel.customerId) {
      url = Router.routes['assistant.customers.selected'].url({
        _id: channel.customerId
      }, {
        query: {selectedChannel: channelId}
      });
    } else {
      url = Router.routes['assistant.unrouted'].url({
      }, {
        query: {selectedChannelId: channelId}
      });
    }

    this.response.writeHead(302, {
      'Location': url
    });
    this.response.end();
  }
});

Router.route('/', {
  name: 'welcome',
  onBeforeAction() {
    if (Users.isAdmin(Meteor.userId())) {
      Router.go("assistant.tasksSummary");
    }
    if (Users.isAssistant(Meteor.userId())) {
      Router.go("assistant.tasksSummary");
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
      subs.subscribe("placements"),
      subs.subscribe("configs")
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
    Router.go("assistant.customers.unselected");
  }
});

Router.route('assistant/customers', {
  name: 'assistant.customers.unselected',
  onBeforeAction() {
    if (!(Users.isAssistant(Meteor.userId()) || Users.isAdmin(Meteor.userId()))) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    return [
      subs.subscribe("me"),
      subs.subscribe("customers", {}, {fields: {profile: 1, assistantId: 1, roles: 1}}),
      subs.subscribe("placements")
    ];
  },
  action() {
    let placements = Placements.find({ assistantId : Meteor.userId() }).fetch();
    let customerIds = _.pluck(placements, 'customerId');
    let user = Users.findOneCustomer({ _id : { $in : customerIds }}) || EmptyCustomer;
    Router.go('assistant.customers.selected', user, { replaceState : true });
  }
});

Router.route('assistant/customers/:_id', {
  name: 'assistant.customers.selected',
  onBeforeAction() {
    if (!(Users.isAssistant(Meteor.userId()) || Users.isAdmin(Meteor.userId()))) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    return [
      subs.subscribe("me"),
      subs.subscribe("customers", {}, {fields: {profile: 1, assistantId: 1, roles: 1}}),
      subs.subscribe("placements"),
      subs.subscribe("routedChannels")
    ]
  },
  data() {
    const isShowCompletedTask = this.params.query.isShowCompletedTask === 'true' ? true : false;
    return {
      currentCustomerId: this.params._id,
      selectedChannelId: this.params.query.selectedChannel,
      isShowCompletedTask : isShowCompletedTask
    };
  },
  action() {
    this.render('assistantCustomersDashboard');
  }
});

Router.route('assistant/customers/:customerId/invoices/', {
  name: 'assistant.customers.invoices',
  onBeforeAction() {
    if (!(Users.isAssistant(Meteor.userId()) || Users.isAdmin(Meteor.userId()))) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    let customerId = this.params.customerId;
    return [
      subs.subscribe("customerInvoices", customerId)
    ];
  },
  action() {
    let customerId = this.params.customerId;
    let invoice = Invoices.findOne({ customerId :  customerId }) || EmptyInvoice;
    Router.go(
      'assistant.customers.invoices.selected',
      { customerId : customerId, invoiceId : invoice._id },
      { replaceState : true });
  }
});

Router.route('assistant/customers/:customerId/invoices/:invoiceId', {
  name: 'assistant.customers.invoices.selected',
  /** should put `_isStatic` here */
  waitOn() {
    const invoiceId = this.params.invoiceId;
    const customerId = this.params.customerId;

    if (!_isStatic(this)) {
      return [
        subs.subscribe("myTasks"),
        subs.subscribe("customers"),
        subs.subscribe('plans'),
        subs.subscribe('subscriptions'),
        subs.subscribe("customerInvoices", customerId)
      ];
    } else {
      return [ subs.subscribe('invoiceOnly', invoiceId) ];
    }
  },
  onBeforeAction() {
    if (!(Users.isAssistant(Meteor.userId()) || Users.isAdmin(Meteor.userId()))) {
      this.redirect("welcome");
    }
    this.next();
  },
  data() {
    const customerId = this.params.customerId;
    const invoiceId = this.params.invoiceId;

    let data = {};
    const isStatic = _isStatic(this);
    if (!isStatic) {
      data.currentCustomer = Users.findOneCustomer(customerId);
      data.customerInvoices = Invoices.find({customerId: customerId});
      data.currentInvoice = Invoices.findOne({ _id : invoiceId });
    } else {
      let currentCustomer = Users.findOneCustomer(customerId);
      data = _.extend(data, Invoices.findOne({ _id : invoiceId }));
      if (data && currentCustomer) {
        _.extend(data, {
          isStatic: isStatic,
          isCustomerPaymentMethodAvailable: currentCustomer.hasPaymentMethod(),
          customerFirstName: currentCustomer.firstName(),
          customerFullName: currentCustomer.displayName(),
        });
      }
    }
    return data;
  },
  action() {
    if (_isStatic(this)) {
      this.layout('raw');
      this.render('assistantsInvoiceActualForm');
    } else {
      this.render('assistantInvoiceDashboard');
    }
  }
});

// Note: Crazy story: There is an mysterious `Error: Handler with name b already exists` error appearing on production mode after we start using subManager. It runs perfectly fine on local. Perhaps it's due to some unknown bugs in the meteor compression/ minification. Surprisingly and interestingly, by inserting a dummy statement here make the error goes away. (of course it's still hidden somewhere).
// TODO: Fix this, if you can. Replicate the problem by: removing the below statement, then run meteor with production mode, i.e. `meteor --production`
// let MYSTERY = 'mystery';

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
      subs.subscribe('feedbacks'),
      subs.subscribe("tasks", {}, {fields: {steps: 0, statuses: 0, oneTimePurchases: 0, references: 0}}),
      subs.subscribe("me"),
      subs.subscribe("customers", {}, {fields: {profile: 1, assistantId: 1, roles: 1}}),
      subs.subscribe("placements")
    ];
  },
  data() {
    let taskId = this.params._id;
    return {
      currentTaskId: taskId
    }
  },
  action() {
    if (this.params._id) {
      this.render('assistantTasksDashboard');
    } else {
      let currentTask = Tasks.findOne();
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
    ];
  },
  data() {
    let isShowSpam = this.params.query.isShowSpam;
    let selectedChannelId = this.params.query.selectedChannelId;
    return {
      isShowSpam : isShowSpam,
      selectedChannelId : selectedChannelId
    };
  },
  action() {
    this.render('assistantUnroutedDashboard');
  },
  fastRender: true
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
