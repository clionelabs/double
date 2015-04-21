/**
 * @property {String} userId
 * @property {String} secret
 * @property {Boolean} accessedAt
 * @property {Timestamp} createdAt
 */
LoginTokens = new Meteor.Collection("login_tokens", {
  transform: function(doc) {
    return _.extend(doc, LoginToken);
  }
});

LoginTokens.create = function(userId) {
  let secret = Random.secret();
  let doc = {
    userId: userId,
    secret: secret,
    accessedAt: null,
    createdAt: moment().valueOf()
  }
  LoginTokens.insert(doc);
  return secret;
}

LoginTokens.loginHandler = function(loginRequest) {
  if (!loginRequest.secret) { // don't handle
    return undefined;
  }

  let token = LoginTokens.findOne({secret: loginRequest.secret});
  if (!token) {
    throw new Meteor.Error(403, "secret not found");
  }

  if (!token.isValid()) {
    throw new Meteor.Error(403, "Invalid secret");
  }

  LoginTokens.update(token._id, {$set: {accessedAt: moment().valueOf()}});

  return {
    userId: token.userId
  }
}

LoginToken = {
  isValid: function() {
    return this.accessedAt === null;
  }
}
