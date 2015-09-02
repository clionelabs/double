Tag = {
    ProtoType : {

    }
};

Tags = new Meteor.Collection('tags', { transform : function(doc) {
    return _.extend({}, doc, Tag.ProtoType);
  }
});

TagsPermission = {
  insert(userId) {
    return (Users.isAdmin(userId) || Users.isAssistant(userId));
  },
  update(userId) {
    return (Users.isAdmin(userId) || Users.isAssistant(userId));
  },
  remove(userId) {
    return (Users.isAdmin(userId) || Users.isAssistant(userId));
  }
};

Tags.allow(TagsPermission);