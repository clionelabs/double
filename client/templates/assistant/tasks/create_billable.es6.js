let shorten = (str = "") => {
  let limit = 25; //hardcoded for now, done is better than perfect
  let messageChunk = str.split(' ');
  let result = "";
  for (let i = 0; i < messageChunk.length; i++) {
    if (result.length < limit) {
      result = result + messageChunk[i] + (i === messageChunk.length - 1 ? "" : " ");
    }
  }
  return _.isEqual(result,str) ? str : result + '...';
};

let compressStatuses = (sortedStatuses, fromTs, toTs, barHeight) => {
  let minHeight = 40; //hardcoded
  let timeDiffPerPixel = (toTs - fromTs) / barHeight;
  let minTimeDiff = minHeight / timeDiffPerPixel;

  let converted = _.map(sortedStatuses, function(status) {
    let displayItem = {};
    if (status.createdAt < fromTs) {
      displayItem.time = fromTs;
    } else {
      displayItem.time = status.createdAt;
    }
    displayItem.userIds = [status.userId];
    displayItem.message = status.message;
    return displayItem;
  });
  if (converted && converted.length) {
    if (converted[0].time !== fromTs) {
      converted.unshift({ time: fromTs, message: "", userIds: [] });
    }
    if (converted[converted.length - 1].time !== toTs) {
      converted.push({ time: toTs, message: "", userIds: [] });
    }
    let result = _.clone(converted);
    for (let i = 1; i < result.length; i++) {
      if (result[i].time - result[i - 1].time < minTimeDiff) {
        result[i - 1].message
            = result[i - 1].message ?
        result[i - 1].message + ' // ' + result[i].message :
            result[i].message;
        result[i - 1].userIds = _.union(result[i].userIds, result[i - 1].userIds);
        result = _.filter(result, function (r) {
          return !_.isEqual(r, result[i]);
        });
        i--;
      }
    }

    return result;
  } else {
    return [];
  }
};

Template.assistantTasksCreateBillable.onRendered(function() {
  let lastBankTaskTimestamp = Users.findOneAssistant(Meteor.userId()).lastBankTaskTimestamp(this.data._id);
  let statusesInRange = this.data.getStatusesWithinTimeRange(lastBankTaskTimestamp, moment().valueOf());
  let flattenedStatuses = _.reduce(_.keys(statusesInRange), function(memo, userId) {
    let result = _.map(statusesInRange[userId], function(status) {
      return _.extend({}, { userId : userId }, status);
    });
    return _.union(memo, result);
  }, []);
  let sortedStatuses = _.sortBy(flattenedStatuses, 'createdAt');
  let currentAssistant = Users.findOneAssistant(Meteor.userId());
  let fromTs = currentAssistant.currentTask().startedAt;
  let toTs = currentAssistant.currentTask().endedAt;
  let barHeight = 520;
  let result = compressStatuses(
      sortedStatuses,
      fromTs,
      toTs,
      barHeight);

  let height = 600;
  let width = 300;
  let thickness = 20;
  let barHeadPadding = 50;
  let chart = d3.select('svg')
      .attr('height', height)
      .attr('width', width);

  let formatter = UI._globalHelpers['formatDurationPrecise'];
  let header = chart
      .append('text')
      .text("Duration: " + formatter(moment.duration(toTs - fromTs)))
      .attr('text-anchor', 'middle')
      .attr('class', 'total-duration')
      .attr('x', 66)
      .attr('y', 35);

  let ts = d3.scale.linear()
      .domain([ fromTs, toTs ])
      .range([ 0, barHeight ])
      .clamp(true);

  let data = chart.selectAll('g').data(result).enter().append('g').attr('class', 'item');

  if (result.length) {

    let bar = data
        .append('rect')
        .attr('x', 55)
        .attr('y', function (d) {
          return ts(d.time) + barHeadPadding;
        })
        .attr('width', thickness)
        .attr('height', function (d, i) {
          if (i === result.length - 1) {
            return ts(toTs) - ts(d.time);
          } else {
            return ts(result[i + 1].time) - ts(d.time);
          }
        });

    let line = data
            .append('line')
            .attr('x1', 55)
            .attr('x2', 85)
            .attr('y1', function (d) {
              return ts(d.time) + barHeadPadding;
            })
            .attr('y2', function (d) {
              return ts(d.time) + barHeadPadding;
            })
            .attr('class', function (d) {
              return d.message ? "" : "hide";
            })
        ;

    let div = d3.select("body").append("div")
        .attr("class", "status-tooltip")
        .style("opacity", 1e-6);

    let messages = data.append('g').attr('class', 'message')
            .on('click', function (d) {
              div.transition()
                  .duration(500)
                  .style("opacity", 1)
                  .text(d.message)
                  .style('left', (d3.event.pageX) + "px")
                  .style('top', (d3.event.pageY) + "px");
            })
        ;
    messages
        .append('text')
        .text(function (d) {
          return shorten(d.message);
        })
        .attr('x', 55 + thickness * 2)
        .attr('y', function (d) {
          return ts(d.time) + barHeadPadding + 5;
        })
    ;

    let userName =
            data.append('text')
                .text(function (d) {
                  return _.reduce(d.userIds, function (memo, uId, i) {
                    return memo + Users.findOneAssistant(uId).firstName() + (i === d.userIds.length - 1 ? "" : ",");
                  }, "");
                })
                .attr('class', 'user-name')
                .attr('x', 55 + thickness * 2)
                .attr('y', function (d) {
                  return ts(d.time) + barHeadPadding + 22;
                })
        ;

    let time =
            data.append('text')
                .text(function (d) {
                  return moment(d.time).format('HH:mm');
                })
                .attr('class', 'time')
                .attr('x', 4)
                .attr('y', function (d) {
                  return ts(d.time) + barHeadPadding + 5;
                })
        ;

    let andBefore =
            chart.append('text')
                .text(' & before ')
                .attr('class', 'time')
                .attr('x', -14)
                .attr('y', barHeadPadding + 5 + 14);

  }

});
Template.assistantTasksCreateBillable.helpers({
  totalTime() {
    return this.totalTime ? this.totalTime.get() : 0;
  },
  steps() {
    let totalTime = this.totalTime;
    return _.map(this.steps, function(step) {
      return _.extend({}, { parentTotalTime : totalTime }, step);
    });
  }
});

Template.assistantTasksCreateBillable.events({
  "click .bank-time" : function(e, tmpl) {
    let updates = _.map(this.steps, function(step) {
      let result = {};
      let _id = step._id;
      let selector = `input.duration[data-id='${_id}']`;
      let timeToBeAdded = moment.duration($(selector).val()).asMilliseconds();
      return {
        stepId : step._id,
        timeToBeAdded : timeToBeAdded
      };
    });
    Tasks.Steps.bankTime(this._id, updates);
    Assistants.bankTask(Meteor.userId(), this._id);
    Modal.hide();
  },
  "click .add-step" : function() {

  },
  "keyup input.duration, focusout input.duration" : function(e, tmpl) {
    let step = this;
    let times = [];
    $('input.duration').each(function() {
      times.push(moment.duration($(this).val()));
    });
    let totalTime = _.reduce(times, function(memo,time) {
      return memo + time.asMilliseconds();
    }, 0);
    step.duration = moment.duration(tmpl.$('input.duration').val());
    step.parentTotalTime.set(totalTime);
  }
});
