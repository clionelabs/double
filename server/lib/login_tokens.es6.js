/**
 * A one-time login mechanic for direct login via url.
 * By accesing the secret url, the user will login to the system, as if he's login via password.
 * The secret link will be invalidated immediately after being accessed the first time.
 *
 * @property {String} userId
 * @property {String} secret
 * @property {Boolean} accessedAt
 * @property {Timestamp} createdAt
 */
LoginLinks = new Meteor.Collection("login_links", {
  transform: function(doc) {
    return _.extend(doc, LoginLink);
  }
});

/**
 * Create a login link for a given userId
 * @param {String} userId
 */
LoginLinks.create = function(userId) {
  let secret = Random.secret();
  let doc = {
    userId: userId,
    secret: secret,
    accessedAt: null,
    createdAt: moment().valueOf()
  }
  var id = LoginLinks.insert(doc);
  return id;
}

/**
 * Implement Meteor Account LoginHandler
 * Ref: https://github.com/meteor/meteor/blob/devel/packages/accounts-base/accounts_server.js
 */
LoginLinks.loginHandler = function(loginRequest) {
  if (!loginRequest.secret) { // don't handle
    return undefined;  // return undefined means we will not handle the login request
  }

  let link = LoginLinks.findOne({secret: loginRequest.secret});
  if (!link) {
    throw new Meteor.Error(403, "secret not found");
  }

  if (!link.isValid()) {
    throw new Meteor.Error(403, "invalid secret");
  }

  LoginLinks._setAccessed(link._id);

  // login successful
  return {
    userId: link.userId
  }
}

LoginLinks._setAccessed = function(linkId) {
  LoginLinks.update(linkId, {$set: {accessedAt: moment().valueOf()}});
}

/**
 * Prototype to provide extra behaviours for LoginLinks documents
 */
LoginLink = {
  isValid: function() {
    return this.accessedAt === null;
  }
}