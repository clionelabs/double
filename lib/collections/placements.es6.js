Placements = new Meteor.Collection("placements", function(doc) {
  return Placement.createFromDoc(doc);
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

/**
 * @property {String} customerId (unique)
 * @property {String} assistantId
 */
class Placement {
}

Placement.assign = function(customerId, assistantId) {
  var doc = {
    customerId: customerId,
    assistantId: assistantId,
    updatedAt: moment.valueOf()
  }
  Placements.upsert({customerId: customerId}, doc);
}

Placement.unassign = function(customerId) {
  Placements.remove({customerId: customerId});
}

Placement.createFromDoc = function(doc) {
  let placement = new Placement();
  _.extend(placement, doc);
  return placement;
}
