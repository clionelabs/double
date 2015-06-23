if (!(typeof MochaWeb === 'undefined')) {
  MochaWeb.testOnly(function() {
    describe("tasks steps", function() {
      var taskId = 'a';
      var task;
      var demoStep = {
        text : "This is a test"
      };
      beforeEach(function() {
        Tasks.insert({ _id : taskId });
      });
      afterEach(function() {
        Tasks.remove({ _id : taskId });
      });
      it('should add checklist', function() {
        var stepId = Tasks.Steps.add(demoStep.text, taskId);

        task = Tasks.findOne({ _id : taskId });
        var step = _.filter(task.steps, function(step) { return _.isEqual(step._id, stepId); })[0];
        chai.assert.deepEqual(step.text, demoStep.text);
        chai.assert.deepEqual(step.isCompleted, false);

      });
      it('should complete checklist', function() {
        var stepId = Random.id();
        _.extend(demoStep, { _id : stepId });
        Tasks.update({ _id : taskId }, { $push : { steps : demoStep }});

        Tasks.Steps.complete(stepId, taskId);

        task = Tasks.findOne({ _id : taskId });
        var step = _.filter(task.steps, function(step) { return _.isEqual(step._id, stepId); })[0];
        chai.assert.deepEqual(step.isCompleted, true);
      });

    });
  });
}
