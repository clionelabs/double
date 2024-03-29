if (!(typeof MochaWeb === 'undefined')) {
  MochaWeb.testOnly(function() {
    describe("tasks status", function() {
      var userId = "a";
      var userId2 = "b";

      var testTask = {
        requestorId : 1,
        responderId : 2,
        title : "test"
      };
      var testStatus = {
        message : "test",
        createdAt : 0
      };
      var testStatus2 = {
        message : "test2",
        createdAt : 5
      };
      var testStatus3 = {
        message : "test",
        createdAt : 1
      };
      var testStatus4 = {
        message : "test2",
        createdAt : 6
      };
      var taskId;

      beforeEach(function() {
        taskId = Tasks.create(testTask);
        this.clock = sinon.useFakeTimers();
      });

      afterEach(function() {
        this.clock.restore();
        Tasks.remove({});
      });

      it("test getLatestStatus", function() {
        var modifier = {};
        modifier.$push = {};
        modifier.$push['statuses.' + userId] = testStatus;
        Tasks.update({ _id : taskId }, modifier);
        chai.assert.deepEqual(Tasks.findOne({ _id : taskId }).getLatestStatus(userId), testStatus);
      });

      it("test user change statuses", function() {
        Tasks.Status.change(testStatus.message, taskId, userId);
        chai.assert.deepEqual(Tasks.findOne({ _id : taskId }).getLatestStatus(userId).message, testStatus.message);
      });

      it("test user change statuses is overriden", function() {
        Tasks.Status.change(testStatus.message, taskId, userId);
        Tasks.Status.change(testStatus2.message, taskId, userId);
        chai.assert.deepEqual(Tasks.findOne({ _id : taskId }).getLatestStatus(userId).message, testStatus2.message);
      });

      it("test multiple user change statuses", function() {
        Tasks.Status.change(testStatus.message, taskId, userId);
        Tasks.Status.change(testStatus2.message, taskId, userId2);
        chai.assert.deepEqual(Tasks.findOne({ _id : taskId }).getLatestStatus(userId).message, testStatus.message);
        chai.assert.deepEqual(Tasks.findOne({ _id : taskId }).getLatestStatus(userId2).message, testStatus2.message);
      });

      it("test grep status within time from same user", function() {
        var expectedStatuses = {};
        expectedStatuses[userId] = [ testStatus, testStatus2 ];
        var modifier = {};
        modifier.$set = {};
        modifier.$set.statuses = expectedStatuses;
        Tasks.update({ _id : taskId }, modifier);

        var resultStatuses = Tasks.findOne({ _id : taskId })
                                .getStatusesWithinTimeRange(0, 6);

        chai.assert.deepEqual(resultStatuses, expectedStatuses);
      });

      it("test grep status upper time range", function() {
        var originalStatuses = {};
        originalStatuses[userId] = [ testStatus, testStatus2 ];

        var expectedStatuses = {};
        expectedStatuses[userId] = [ testStatus ];

        var modifier = {};
        modifier.$set = {};
        modifier.$set.statuses = originalStatuses;
        Tasks.update({ _id : taskId }, modifier);

        var resultStatuses = Tasks.findOne({ _id : taskId }).getStatusesWithinTimeRange(0, 5);

        chai.assert.deepEqual(resultStatuses, expectedStatuses);
      });

      it("test grep status lower time range", function() {
        var originalStatuses = {};
        originalStatuses[userId] = [ testStatus, testStatus2 ];

        var expectedStatuses = {};
        expectedStatuses[userId] = [ testStatus2 ];

        var modifier = {};
        modifier.$set = {};
        modifier.$set.statuses = originalStatuses;
        Tasks.update({ _id : taskId }, modifier);

        var resultStatuses = Tasks.findOne({ _id : taskId }).getStatusesWithinTimeRange(1, 6);

        chai.assert.deepEqual(resultStatuses, expectedStatuses);
      });

      it("test grep statuses within time from different user", function() {
        var originalStatuses = {};
        originalStatuses[userId] = [ testStatus, testStatus2 ];
        originalStatuses[userId2] = [ testStatus3, testStatus4 ];
        var expectedStatuses = {};
        expectedStatuses[userId] = [ testStatus, testStatus2 ];
        expectedStatuses[userId2] = [ testStatus3 ];
        var modifier = {};
        modifier.$set = {};
        modifier.$set.statuses = expectedStatuses;
        Tasks.update({ _id : taskId }, modifier);

        var resultStatuses = Tasks.findOne({ _id : taskId }).getStatusesWithinTimeRange(0, 6);

        chai.assert.deepEqual(resultStatuses, expectedStatuses);
      });
    });
  });
}
