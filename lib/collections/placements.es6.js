/**
 * @property {String} customerId (unique)
 * @property {String} assistantId
 */

Placements = new Meteor.Collection("placements", function(doc) {
  return _.extend(doc, Placement);
});

Placements.allow({
  insert: function(userId) {
    return Users.isAdmin(userId);
  },
  update: function(userId) {
    return Users.isAdmin(userId);
  },
  remove: function(userId) {
    return Users.isAdmin(userId);
  }
});

Placements.unassign = function(customerId, callback) {
  var placement = Placements.findOne({customerId: customerId});
  Placements.remove(placement._id, callback);
}

Placements.assign = function(customerId, assistantId, callback) {
  var placement = Placements.findOne({customerId: customerId});
  if (placement) {
    Placements.update(placement._id, {$set: {assistantId: assistantId}}, callback);
  } else {
    Placements.insert({customerId: customerId, assistantId: assistantId}, callback);
  }
}

Placement = {
  assistantDisplayName: function() {
    var assistant = Users.findOne(this.assistantId);
    return assistant.displayName();
  }
}

EmptyPlacement = {
  assistantDisplayName: function() {
    return "--";
  }
}
