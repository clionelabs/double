Messages = _.extend({}, D.Messages);

_.extend(Messages, {
  /*
   * @param {String[]} messageIds list of message ids
   * @param {String} taskId
   */
  tagTask(messageIds, taskId) {
    return Messages.update({_id: {$in: messageIds}}, {$addToSet: {taggedTaskIds: taskId}}, {multi: true});
  },

  removeTask(messageId, taskId) {
    return Messages.update(messageId, {$pull: {taggedTaskIds: taskId}});
  }
});
