/**
 * @property {String} customerId (unique)
 * @property {String} assistantId
 */
Placements = new Meteor.Collection("placements");

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

Placements.findByAssistantId = function(assistantId) {
  return Placements.find({assistantId: assistantId});
}
