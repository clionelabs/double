/**
 * @property {String} customerId (unique)
 * @property {String} assistantId
 */

Placements = new Meteor.Collection("placements", {
  transform: (doc) => {
    return _.extend(doc, Placement);
  }
});

Placements.allow({
  insert(userId) {
    return Users.isAdmin(userId);
  },
  update(userId) {
    return Users.isAdmin(userId);
  },
  remove(userId) {
    return Users.isAdmin(userId);
  }
});

Placements.unassign = (customerId, callback) => {
  var placement = Placements.findOne( { customerId: customerId } );
  Placements.remove(placement._id, callback);
};

Placements.assign = (customerId, assistantId, callback) => {
  var placement = Placements.findOne( { customerId: customerId } );
  if (placement) {
    Placements.update(placement._id, { $set: { assistantId: assistantId }}, callback);
  } else {
    Placements.insert( { customerId: customerId, assistantId: assistantId }, callback);
  }
};

Placement = {
  assistantDisplayName() {
    var assistant = Users.findOne(this.assistantId);
    return assistant.displayName();
  }
};

EmptyPlacement = {
  assistantDisplayName: () => {
    return "--";
  }
};
