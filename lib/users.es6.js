/**
 * Helper class to manage different types of users
 */
Users = _.extend({}, D.Users, {
  editCustomer(userId, options) {
    let modifier = { $set :
      {
        'profile.firstname' : options.profile.firstname,
        'profile.lastname' : options.profile.lastname,
        'profile.plan.maxHour' : options.profile.plan.maxHour
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
        return _.extend(doc, User);
      }
    });
  },
  findOneAssistant(selector={}) {
    return D.Users.findOneAssistant(selector, {
      transform: function (doc) {
        return _.extend(doc, User);
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

  find(selector) {
    return Meteor.users.find(selector, { transform: function(doc) {
      return _.extend(doc, User);
    }} );
  },

  findOne(selector) {
    return Meteor.users.findOne(selector, {transform: function(doc) {
      return _.extend(doc, User);
    }});
  }
});

User = _.extend({}, D.User);

Customers = {
  Preference : {
    add : (userId, preferenceMessage, callback) => {
      let selector = { _id : userId };
      let preference = { _id : Random.id(), message : preferenceMessage };
      Meteor.users.update(selector, { $push : { "profile.preferences" : preference }}, callback);
    },
    delete : (userId, preferenceId, callback) => {
      let selector = { _id : userId };
      Meteor.users.update(selector, { $pull : { "profile.preferences" : { "_id" : preferenceId }}}, callback);
    }
  },
  callAssistant : (userId) => {
    let selector = { _id : userId };
    Meteor.users.update(selector, { $set : { "profile.isCalling" : true }});
  },
  cancelCallAssistant : (userId) => {
    let selector = { _id : userId };
    Meteor.users.update(selector, { $set : { "profile.isCalling" : false }});
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
  }
};

Meteor.users.allow({
  update(userId, doc, fields, modifier) {
    let isUpdatingProfile = _.contains(fields, "profile");
    return  isUpdatingProfile ;
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
