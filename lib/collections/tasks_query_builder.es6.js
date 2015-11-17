/**
 * Helper class for building Tasks query
 * Example use: _.extend({}, TasksQueryBuilder).setRequesterdBy(xxx).getQuery();
 */
TasksQueryBuilder = {
  requestedBy: null,

  isCompleted: null,

  options: {},

  setRequestedBy(requestorId) {
    this.requestedBy = requestorId;
    return this;
  },

  setIsCompleted(isCompleted) {
    this.isCompleted = isCompleted;
    return this;
  },

  setOptions(options) {
    this.options = options;
    return this;
  },

  getQuery() {
    let selector = {};
    if (this.requestedBy != null) {
      _.extend(selector, {
        requestorId: this.requestedBy
      });
    }

    if (this.isCompleted !== null) {
      if (this.isCompleted) {
        _.extend(selector, {
          completedAt: {$not: null}
        });
      } else {
        _.extend(selector, {
          completedAt: null
        });
      }
    }

    let options = this.options;

    return Tasks.find(selector, options);
  }
}
