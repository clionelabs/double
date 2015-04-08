Template.customerHeader.helpers({
    numberOfTasks : function numberOfTasks() {
        //TODO integration
       return this.tasks ? this.tasks.length : 0;
    }
});