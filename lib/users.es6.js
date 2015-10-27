/**
 * Helper class to manage different types of users
 */
Users = _.extend({}, D.Users, {
  editCustomer(userId, options) {
    let modifier = { $set :
      {
        'profile.firstname' : options.profile.firstname,
        'profile.lastname' : options.profile.lastname,
        'profile.hourlyRate' : options.profile.hourlyRate,
        'profile.creditMs' : options.profile.creditMs
      }
    };
    return Meteor.users.update({ _id : userId }, modifier);
  },

  findCustomers(selector={}) {
    return D.Users.findCustomers(selector, {
      transform: function (doc) {
        return _.extend(doc, User, Customer);
      }
    });
  },
  findAssistants(selector={}) {
    return D.Users.findAssistants(selector, {
      transform: function (doc) {
        return _.extend(doc, User, Assistant);
      }
    });
  },
  findOneAssistant(selector={}) {
    return D.Users.findOneAssistant(selector, {
      transform: function (doc) {
        return _.extend(doc, User, Assistant);
      }
    });
  },
  findOneCustomer(selector={}) {
    return D.Users.findOneCustomer(selector, {
      transform: function (doc) {
        return _.extend(doc, User, Customer);
      }
    });
  },
});

User = _.extend({}, D.User);

Assistant = {
  currentTask() {
    return this.profile.currentTask;
  },
  lastBankTaskTimestamp(taskId) {
    return this.profile.lastBankTasksTimestamp && this.profile.lastBankTasksTimestamp[taskId]
        ? this.profile.lastBankTasksTimestamp[taskId] : 0;
  }
};

Assistants = {
  TaskStatus: {
    Started: 'started',
    Stopped: 'stopped'
  },
  startTask(userId, taskId) {
    let selector = { _id : userId };
    let userProfile = Meteor.users.findOne(selector).profile;
    if (!userProfile.currentTask) {
      return Meteor.users.update(selector,
          { $set:
          { "profile.currentTask":
          {
            taskId : taskId,
            status : this.TaskStatus.Started,
            startedAt : moment().valueOf()
          }}});
    } else {
      throw new Meteor.Error('There is running or stopped task');
    }
  },
  endTask(userId, taskId) {
    let selector = { _id : userId };
    let userProfile = Meteor.users.findOne(selector).profile;
    if (userProfile.currentTask && !userProfile.currentTask.endedAt) {
      let oldCurrentTask = userProfile.currentTask;
      return Meteor.users.update(selector,
          { $set:
          { "profile.currentTask":
              _.extend({}, oldCurrentTask, {
                status : this.TaskStatus.Stopped,
                endedAt : moment().valueOf()
              })
          }});
    } else {
      throw new Meteor.Error('There is no running task');
    }
  },
  bankTask(userId, taskId) {
    let selector = { _id : userId };
    let userProfile = Meteor.users.findOne(selector).profile;
    if (userProfile.currentTask && userProfile.currentTask.startedAt && userProfile.currentTask.endedAt) {
      let modifier =
      {
        $unset: { "profile.currentTask": "" },
        $set : {}
      };
      modifier.$set['profile.lastBankTasksTimestamp.' + taskId] = moment().valueOf();
      return Meteor.users.update(selector, modifier);
    } else {
      throw new Meteor.Error('There is no stopped task');
    }

  }
};

Customers = {
  Preference : {
    add : (userId, preferenceMessage, callback) => {
      let selector = { _id : userId };
      let preference = { _id : Random.id(), message : preferenceMessage };
      return Meteor.users.update(selector, { $push : { "profile.preferences" : preference }}, callback);
    },
    delete : (userId, preferenceId, callback) => {
      let selector = { _id : userId };
      return Meteor.users.update(selector, { $pull : { "profile.preferences" : { "_id" : preferenceId }}}, callback);
    }
  },
  callAssistant : (userId) => {
    let selector = { _id : userId };
    return Meteor.users.update(selector, { $set : { "profile.isCalling" : true }});
  },
  cancelCallAssistant : (userId) => {
    let selector = { _id : userId };
    return Meteor.users.update(selector, { $set : { "profile.isCalling" : false }});
  },
  deductCreditMs : (userId, msToBeDeduct, cb) => {
    let selector = { _id : userId };
    let user = Users.findOneCustomer(selector);
    let resultMs = _.max([ 0, user.profile.creditMs - msToBeDeduct ]);
    return Meteor.users.update(user._id, { $set : { "profile.creditMs" : resultMs }}, cb);
  }
};

Customer = {
  isCalling() {
    return this.profile.isCalling;
  },
  getPreferences() {
    return this.profile.preferences || [];
  },
  hasNotRepliedConversation() {
    let hasNotReplied = _.reduce(D.Channels.find({customerId: this._id}).fetch(), function(memo, channel) {
      return memo | channel.isNotReplied();
    }, false);
    return hasNotReplied;
  },
  hasPaymentMethod() {
    return this.payment && this.payment.isAuthorized;
  },
  isOnline() {
    let isOnline = _.reduce(D.Channels.find({customerId: this._id}).fetch(), function(memo, channel) {
      return memo | channel.isOnline();
    }, false);
    return isOnline;
  },
  hourlyRate() {
    return this.profile && this.profile.hourlyRate ? this.profile.hourlyRate : 0;
  },
  creditMs() {
    return this.profile && this.profile.creditMs ? this.profile.creditMs : 0;
  },
  lastFeedbackEmailSendAt(taskId) {
    const customer = this;
    if (taskId) {
      return _.filter(Feedbacks.find({ customerId : customer._id }).fetch(), function(feedback) {
        return (feedback.taskId === taskId);
      });
    } else {
      return _.max(_.pluck(Feedbacks.find({ customerId : customer._id }).fetch(), 'sendAt'));
    }
  },
  getCurrentPlan() {
    const selector = { customerId : this._id, endedAt : { $exists : false }};
    const subscription = Subscriptions.findOne(selector);
    return Plans.findOne(subscription.planId);
  },
  getRechargedAts(from, to) {
    const subscriptions = Subscriptions.find(
      { $and : [
        {customerId : this._id},
        { $or : [
          { endedAt : { $exists : false }},
          { endedAt : { $gte : from }}
        ]}
      ]}).fetch();
    return _.flatten(_.map(subscriptions, function(subscription) {
      if (subscription) {
        const plan = Plans.findOne(subscription.planId);
        const rechargedAts = _.filter(subscription.rechargedAts, function(rechargedAt) {
          return rechargedAt > from && rechargedAt <= to;
        });
        return _.map(rechargedAts, function(rechargedAt) {
          return {
            name : plan.name,
            amount : plan.amount,
            chargedAt : rechargedAt
          }
        });
      } else {
        return [];
      }
    }));
  }
};

Meteor.users.allow({
  update(userId, doc, fields, modifier) {
    let isUpdatingProfile = _.contains(fields, "profile");
    return  isUpdatingProfile;
  }
});

EmptyUser = _.extend({
  _id : "none",
  profile : {
    firstname : "None selected",
    lastname : ""
  }
}, User);

EmptyCustomer = _.extend({}, EmptyUser, Customer);
