Feedbacks = new Meteor.Collection('feedbacks', {
  transform(doc) {
    return _.extend(doc, Feedback.ProtoType);
  }
});

Feedbacks.Permission = {
  insert(userId, doc) {
    return Users.isAdmin(userId);
  }
};

Feedbacks.allow(Feedbacks.Permission);

/**
 * @param {String} taskId
 * @param {String} customerId
 * @param {Boolean} isSent
 * @type {{ProtoType: {getUser, getTask}}}
 */
Feedback = {
  ProtoType : {
    getUser() {
      return Users.findOneCustomer(this.customerId);
    },
    getTask() {
      return Tasks.findOne(this.taskId);
    }
  }
};


