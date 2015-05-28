Meteor.methods({
  createAssistant(data) {
    let email = data.email;
    let firstname = data.firstname;
    let lastname = data.lastname;
    let url = data.url;

    let userId = Users.createAssistant({
      email: email,
      password: Meteor.uuid(),
      profile: {
        firstname: firstname,
        lastname: lastname,
        url: url
      }
    });

    if (Meteor.settings.defaultAccountPassword) {
      Accounts.setPassword(userId, Meteor.settings.defaultAccountPassword);
    }
  },

  createCustomer(data) {
    let email = data.email;
    let firstname = data.firstname;
    let lastname = data.lastname;
    let plan = data.plan;

    let userId = Users.createCustomer({
      email: email,
      password: Meteor.uuid(),
      profile: {
        firstname: firstname,
        lastname: lastname,
        plan: plan
      }
    });

    if (Meteor.settings.defaultAccountPassword) {
      Accounts.setPassword(userId, Meteor.settings.defaultAccountPassword);
    }
  },
  editCustomer(userId, data) {
    let email = data.email;
    let firstname = data.firstname;
    let lastname = data.lastname;
    let plan = data.plan;

    Users.editCustomer(userId,
        {
          profile: {
            firstname: firstname,
            lastname: lastname,
            plan: plan
          }
        });
  },

  requestLoginAccess(email) {
    let user = Meteor.users.findOne({emails: {$elemMatch: {address: email}}});
    if (!user) {
      throw Meteor.Error("user not found", "");
    }
    LoginLinks.createAndSendAccess(user);
  },

  requestLoginAccessWithOldSecret(secret) {
    let oldLink = LoginLinks.findOne({secret: secret});
    if (!oldLink) {
      throw Meteor.Error("secret not found", "");
    }
    let user = Meteor.users.findOne(oldLink.userId);
    LoginLinks.createAndSendAccess(user);
  },

  exportTimesheet(from, to, customerId) {
    let customer = Users.findOne({ _id : customerId});
    let tasks = customerId ? Tasks.findRequestedBy(customerId).fetch() : Tasks.find().fetch();
    let data = _.reduce(tasks, (memo, task) => {
      memo.push( {
        customerId : customer._id,
        customerName : customer.displayName(),
        taskId: task._id,
        taskTitle: task.title,
        taskStartAt: moment(task.createdAt).format(),
        taskCompletedAt: task.completedAt ? moment(task.completedAt).format() : null,
        taskDuration: task.totalDuration()
      });
      return memo;
    }, []);

    return CSV.export(data);
  }

});
