AssistantTasksDetailTags = ReactMeteor.createClass({
  templateName : "assistantTasksDetailTags",
  startMeteorSubscriptions() {
    Meteor.subscribe('tags');
  },
  getMeteorState() {
    return {
      task: Tasks.findOne(this.props.taskId),
      tags: Tags.find().fetch()
    };
  },
  getTags(query, cb) {
    var tags = this.state.tags;
    var searcher = new Bloodhound({
      local: tags,
      identify : function(tag) { return tag._id; },
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
      queryTokenizer: Bloodhound.tokenizers.whitespace
    });
    searcher.initialize();
    var filtered = [];
    console.log(searcher);
    searcher.search(query, function(d) { filtered = d });
    return cb(filtered);
  },
  componentDidMount() {
    var tags = this.state.tags;
    console.log(tags);
    var searcher = new Bloodhound({
      local: [{ _id : 1, name : 'Research'}, { _id : 2, name: 'Admin'}],
      identify : function(tag) { return tag._id; },
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
      queryTokenizer: Bloodhound.tokenizers.whitespace
    });
    searcher.initialize();
    $('input[data-role="tagsinput"]').tagsinput({
      typeaheadjs : {
        name : 'tags',
        displayKey : 'name',
        valueKey : '_id',
        source : searcher.ttAdapter()
      }
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