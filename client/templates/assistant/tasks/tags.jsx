AssistantTasksDetailTags = ReactMeteor.createClass({
  templateName : "assistantTasksDetailTags",
  startMeteorSubscriptions() {
    Meteor.subscribe('tags');
  },
  getMeteorState() {
    return {
      task: Tasks.findOne(this.props.taskId.get()),
      tags: Tags.find().fetch()
    };
  },
  getTags(query, cb) {
    var tags = _.pluck(this.state.tags, 'name');
    var searcher = new Bloodhound({
      local: tags,
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace
    });
    searcher.initialize();
    var filtered = [];
    searcher.search(query, function(d) { filtered = d });
    return cb(filtered);
  },
  componentWillUpdate(nextProps, nextState) {
    var tagInputUi = $('input[data-role="tagsinput"]');
    _.each(nextState.task.tags, function(tag){
      tagInputUi.tagsinput('add', tag.name);
    });
    tagInputUi.tagsinput('refresh');
  },
  componentDidMount() {
    var ui = this;
    var tags = this.getTags;
    var tagInputUi = $('input[data-role="tagsinput"]');
    var realInput = $('.tags .twitter-typeahead input[type="text"]');
    tagInputUi.tagsinput({
      typeaheadjs : {
        name : 'tags',
        source : tags,
        limit: 10
      }
    });

    tagInputUi.on('itemAdded', function(e) {
      var item = e.item;
      var availableTags = Tags.find({ name : e.item.toLowerCase() }).count();
      if (!availableTags) {
        Tags.insert({ name : item });
      }
      item = Tags.findOne({ name : e.item.toLowerCase() });
      Tasks.Tags.add(item, ui.state.task._id);
    });
    tagInputUi.on('itemRemoved', function(e) {
      var item = Tags.findOne({ name : e.item.toLowerCase() });
      Tasks.Tags.delete(item, ui.state.task._id);
    });


  },
  render() {
    return (
        <div className="tags">
          <label htmlFor='tags'>Tags</label><input name='tags' id='tags' type='text' data-role="tagsinput" />
        </div>
    );
  }
});