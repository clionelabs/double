Tasks = new Meteor.Collection("tasks", function(doc) {
    return Task.createFromDoc(doc);
});

class Task {
    isExpired() {};
    isCompleted() {};
    isRecurring() {};
    getRecurringCriteria() {};
};

//Setters
Task.setCompleted = function(task) {
    //TODO impl
    return task;
};
Task.addReference = function(task, ref) {
    //TODO impl
    return task;
};
Task.changeStatus = function(task, newStatus) {
    //TODO impl
    return task;
};

Task.create = function(requestId, responderId, data){
    //TODO impl;
    let task = new Task();
    return task;
};

Task.createFromDoc = function(doc) {
    let task = new Task();
    _.extend(task, doc);

    if (this.statuses) {
        _.map(this.statuses, (status) => {
            return Status.createFromDoc(status);
        });
    }
    if (this.references) {
        _.map(this.references, (ref) => {
            return new Reference(ref);
        });
    }
    if (this.timesheets) {
        _.map(this.timesheets, (timesheet) => {
            return new Timesheet(timesheet);
        });
    }

    return task;
};

/**
 * sub-structure of task, represent a status
 * @property createdAt
 * @property message
 * @see task
 */
class Status {
    constructor() {
        if (!this.createdAt) { this.createdAt = Date.now(); }
    }
}

Status.createFromDoc = function(doc) {
    return _.extend(Status, doc);
};

/**
 * sub-structure of task, represent a reference
 * @property createdAt
 * @property url
 * @see task
 */
class Reference {
    constructor() {
        if (!this.createdAt) { this.createdAt = Date.now(); }
    }
};

Reference.createFromDoc = function(doc) {
    return _.extend(Reference, doc);
};

/**
 * sub-structure of task, represent a timesheet
 * @property createdAt
 * @property actorId
 * @property startedAt
 * @property pausedAt
 * @see task
 */
class TimeSheet {
    constructor() {
        if (!this.createdAt) { this.createdAt = Date.now(); }
    }
}

TimeSheet.createFromDoc = function(doc) {
    return _.extend(TimeSheet, doc);
}

TaskMetric = {};
TaskMetric.getTotalTimeSpent = function(task) {};

