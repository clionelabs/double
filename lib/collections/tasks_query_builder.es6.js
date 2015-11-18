/**
 * Helper class for building Tasks query
 * Example use: _.extend({}, TasksQueryBuilder).setRequesterdBy(xxx).getCursor();
 */
TasksQueryBuilder = class {
  constructor() {
    this.requestedBy = null;
    this.isCompleted = null;
    this.options = {};
  }

  setRequestedBy(requestorId) {
    this.requestedBy = requestorId;
    return this;
  }

  setIsCompleted(isCompleted) {
    this.isCompleted = isCompleted;
    return this;
  }

  setOptions(options) {
    this.options = options;
    return this;
  }

  getCursor() {
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
