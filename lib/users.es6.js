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

  findAssistants: function(selector={}) {
    _.extend(selector, {roles: {$in: [this.Roles.ASSISTANT]}});
    return this.find(selector);
  },

  findCustomers: function(selector={}) {
    _.extend(selector, {roles: {$in: [this.Roles.CUSTOMER]}});
    return this.find(selector);
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
  getNameWithInitial : function() {
    return this.profile.firstName + " " + this.profile.lastName[0] + ".";
  }
};
