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
  data : function () {
    //TODO remove when integration is done
    let data = {
      user : {
        hoursUsed : 7.5,
        totalHours : 10,
        percentageOfTimeLeft : function() {
          return (this.hoursUsed / this.totalHours * 100) + "%";
        }
      },
      assistant : {
        profile : {
          url : "/double.png",
          firstName : "Crystal",
          lastName : "Chan"
        }
      },
      tasks : [
        {
          recurringId : 1,
          name: "This is an recurring event"
        },
        {
          name: "This is an event with status",
          statuses: [{message : "This is the latest status"}, { message : "This will not shown"}]
        },
        {
          name: "This is an event with deadline",
          deadline: new Date()
        },
        {
          name: "This is an event with references",
          references: [{name: "Google", url: "http://www.google.com"}, {name: "Ask Double", url : "http://www.askdouble.com"}]
        },
        {
          name: "This is a completed event",
          timesheets : [
            {
              startedTimestamp: moment().subtract(1, 'h').valueOf(),
              completedTimestamp: moment().valueOf()
            },
            {
              startedTimestamp: moment().subtract(3, 'h').valueOf(),
              completedTimestamp: moment().valueOf()
            }
          ]
        }
      ]
    };
    data.tasks = _.map(data.tasks, function(task) {
      let Task = function(doc) {
        _.extend(this, doc);
      };
      Task.prototype.getRecurringCriteriaString = function () {
        if (this.recurringId) {
          return "Every weekday";
        } else {
          return null;
        }
      };
      Task.prototype.getLatestStatus = function() {
        if (this.statuses) {
          return this.statuses[0].message;
        } else {
          return null;
        }
      };
      Task.prototype.getTotalDuration = function() {
        if (this.timesheets) {
          let sumDuration = function (memo, task) {
            let duration = moment(task.completedTimestamp).subtract(moment(task.startedTimestamp));
            return memo + moment.duration(duration).asMilliseconds();
          };
          return _.reduce(this.timesheets, sumDuration, 0);
        }
      };
      return new Task(task);
    });

    let Assistants = function(doc) {
      _.extend(this, doc);
    };

    Assistants.prototype.getNameWithInitial = function() {
      return this.profile.firstName + " " + this.profile.lastName[0] + ".";
    };

    data.assistant = new Assistants(data.assistant);
    //TODO remove when integration is done
    return data;
  },
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
  waitOn: function() {
    return [
      Meteor.subscribe("customers"),
      Meteor.subscribe("assistants"),
      Meteor.subscribe("placements"),
      Meteor.subscribe("tasks")
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

Router.route('secretLogin/:secret', {
  name: 'secretLogin',
  action: function() {
    var secret = this.params.secret;
    var loginRequest = {secret: secret};
    Accounts.callLoginMethod({
      methodArguments: [loginRequest],
      userCallback: function(err) {
        if (err) {
          Router.go("secretLoginFailed");
        } else {
          Router.go("welcome");
        }
      }
    });
  }
});

Router.route('secretLoginFailed', {
  name: 'secretLoginFailed',
  action: function() {
    this.render('secretLoginFailed');
  }
});
