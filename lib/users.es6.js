/**
 * Helper class to manage different types of users
 */
Users = {
  Roles: {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    ASSISTANT: 'assistant'
  },

  isAdmin: function(userId) {
    return Roles.userIsInRole(userId, [this.Roles.ADMIN]);
  },

  isCustomer: function(userId) {
    return Roles.userIsInRole(userId, [this.Roles.CUSTOMER]);
  },

  isAssistant: function(userId) {
    return Roles.userIsInRole(userId, [this.Roles.ASSISTANT]);
  },

  createAdmin: function(options) {
    let userId = Accounts.createUser(options);
    Roles.addUsersToRoles(userId, this.Roles.ADMIN);
    return userId;
  },

  createAssistant: function(options) {
    let userId = Accounts.createUser(options);
    Roles.addUsersToRoles(userId, this.Roles.ASSISTANT);
    return userId;
  },

  createCustomer: function(options) {
    let userId = Accounts.createUser(options);
    Roles.addUsersToRoles(userId, this.Roles.CUSTOMER);
    return userId;
  },

  editCustomer: function(userId, options) {
    let modifier = { $set :
      {
        'profile.firstname' : options.profile.firstname,
        'profile.lastname' : options.profile.lastname,
        'profile.plan.maxHour' : options.profile.plan.maxHour
      }
    };
    return Meteor.users.update({ _id : userId}, modifier);
  },

  findAssistants: function(selector={}) {
    _.extend(selector, {roles: {$in: [this.Roles.ASSISTANT]}});
    return this.find(selector);
  },

  findCustomers: function(selector={}) {
    _.extend(selector, {roles: {$in: [this.Roles.CUSTOMER]}});
    return Meteor.users.find(selector , {
      transform : function(doc) {
        return _.extend(doc, Customer, User);
      }
    });
  },

  find: function(selector) {
    return Meteor.users.find(selector, {transform: function(doc) {
      return _.extend(doc, User);
    }});
  },

  findOne: function(selector) {
    return Meteor.users.findOne(selector, {transform: function(doc) {
      return _.extend(doc, User);
    }});
  }
};

User = {
  displayName: function() {
    return this.profile.firstname + " " + this.profile.lastname;
  },
  displayNameWithInitial : function() {
    return this.profile.firstname + " " + this.profile.lastname[0] + ".";
  }
};

Customers = {};
Customers.Preference = {};
Customers.Preference.add = (userId, preferenceMessage, callback) => {
  let selector = { _id : userId };
  let preference = { _id : Random.id(), message : preferenceMessage };
  Meteor.users.update(selector,{ $push : { "profile.preferences" : preference }}, callback);
};

Customers.Preference.delete = (userId, preferenceId, callback) => {
  let selector = { _id : userId };
  Meteor.users.update(selector,{ $pull : { "profile.preferences" : { "_id" : preferenceId }}}, callback);
};

Customers.callAssistant = (userId) => {
  let selector = { _id : userId };
  Meteor.users.update(selector, { $set : { "profile.isCalling" : true }});
};

Customers.cancelCallAssistant = (userId) => {
  let selector = { _id : userId };
  Meteor.users.update(selector, { $set : { "profile.isCalling" : false }});
};

Customer = {
  isCalling() {
    return this.profile.isCalling;
  },
  getPreferences() {
    return this.profile.preferences || [];
  }
};

Meteor.users.allow({
  update : function(userId, doc, fields, modifier) {
    let isUpdatingProfile = _.contains(fields, "profile");
    let assistantIsServingCustomer = Placements.findOne({ customerId : doc._id , assistantId : userId });
    let isPushOrPull = _.has(modifier, "$push") || _.has(modifier, "$pull");
    return  isUpdatingProfile && assistantIsServingCustomer && isPushOrPull;
  }
});
