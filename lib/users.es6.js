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

  findAssistants: function() {
    return Meteor.users.find({roles: {$in: [this.Roles.ASSISTANT]}});
  },

  findCustomers: function() {
    return Meteor.users.find({roles: {$in: [this.Roles.CUSTOMER]}});
  }
}
