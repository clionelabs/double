TaskSchedulers = new Meteor.Collection("taskScheduler", function(doc) {
    return new TaskScheduler(doc);
});

class TaskScheduler {
    constructor(doc) {
        _.extend(this, doc);
    }
}

class RecurringCriteria {
    constructor(doc) {
        _.extend(this, doc);
    }
    toString() {};
}
