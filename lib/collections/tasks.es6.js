Tasks = new Meteor.Collection("tasks", function(doc) {
    return new Task(doc);
});

class Task {
    constructor (doc) {
        this.status = [];
        this.references = [];
        this.timeSheets = [];
        _.extend(this, doc);
    };

    isExpired() {};
    isCompleted() {};
    setCompleted() {};
    changeStatus(newStatus) {};
    addReference(ref) {};
    isRecurring() {};
    getReurringCriteria() {};
};

Task.assignTo = function(task, assistantId){};
Task.create = function(customerId, data){};

TaskMetric = {};
TaskMetric.getTotalTimeSpent = function(task) {};

class Comment {
    constructor(doc) {
        this.userId = null;
        this.message = "";
        _.extend(this, doc);
    }
}

class Reference {
    constructor(doc) {
        this.userId = null;
        this.url = "";
        _.extend(this, doc);
    };
}

class TimeSheet {
    constructor(doc) {
        this.assistantId = null;
        this.startTimestamp = new Date();
        this.endTimestamp = null;
        _.extend(this, doc);
    }
}
