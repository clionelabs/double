Template.task.helpers(_.extend({
  getLatestStatus() {
    return this.getLatestStatus(Meteor.userId());
  },
  showRecurringCriteriaComponent : function() {
    if (this.recurringId) {
      return "taskRecurringCriteria";
    } else {
      return null;
    }
  },
  showDeadlineComponent : function() {
    if (this.deadline) {
      return "taskDeadline";
    } else {
      return null;
    }
  },
  showStatusComponent : function() {
    if (this.getLatestStatus(Meteor.userId())) {
      return "taskStatus";
    } else {
      return null;
    }
  },
  showReferencesComponent : function() {
    if (this.references) {
      return "taskReferences";
    } else {
      return null;
    }
  },
  showCompletedComponent : function() {
    if (this.timesheets) {
      return "taskCompleted";
    } else {
      return null;
    }
  }
}, TemplateHelpers.Task.Message));

Template.customerTaskSubItem.helpers(TemplateHelpers.Task.SubItem);
