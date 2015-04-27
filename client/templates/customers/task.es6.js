Template.task.helpers(_.extend({
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
        if (this.getLatestStatus()) {
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
}, TemplateHelper.Task.Message));

Template.customerTaskSubItem.helpers(TemplateHelper.Task.SubItem);
