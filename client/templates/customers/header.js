Template.customer_header.helpers({
    numberOfTasks : function numberOfTasks() {
       return this.tasks ? this.tasks.length : 0;
    }
});