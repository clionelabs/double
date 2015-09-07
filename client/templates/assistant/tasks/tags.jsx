AssistantTasksDetailTag = ReactMeteor.createClass({
  templateName : "assistantTasksDetailTag",
  handleOnCheckClick() {
    var tag = this.props.tag;
    if (tag.isSelected) {
      delete tag.isSelected;
      Tasks.Tags.delete(tag, this.props.taskId);
    } else {
      delete tag.isSelected;
      Tasks.Tags.add(tag, this.props.taskId);
    }
  },
  render() {
    var tag = this.props.tag;
    return (
        <div className="tag" onClick={ this.handleOnCheckClick }>
          <i className={ 'fa ' + (tag.isSelected ? 'fa-check-square-o' : 'fa-square-o') }
             ></i>
          { tag.name }
        </div>
    );
  }
});

AssistantTasksDetailTags = ReactMeteor.createClass({
  templateName : "assistantTasksDetailTags",
  startMeteorSubscriptions() {
    Meteor.subscribe('tags');
  },
  getInitialState() {
    return {
      isAdding: false
    };
  },
  getMeteorState() {
    return {
      task: Tasks.findOne(this.props.taskId.get()),
      tags: Tags.find().fetch()
    };
  },
  getTags(query, cb) {
    var tags = this.state.tags;
    var searcher = new Bloodhound({
      local: tags,
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
      queryTokenizer: Bloodhound.tokenizers.whitespace
    });
    searcher.initialize();
    var filtered = [];
    searcher.search(query, function(d) { filtered = d });
    return cb(filtered);
   },
  componentWillUpdate(nextProps, nextState) {
  },
  componentDidMount() {
    var ui = this;
    $('input[name="tagsInput"].typeahead').typeahead({}, {
      name : 'tag',
      display: 'name',
      source : ui.getTags
    })
  },
  handleOnAddClick(e) {
    this.toggle();
  },
  handleAddFormSubmit(e) {
    e.preventDefault();
    var name = e.target.tagsInput.value;
    var ui = this;
    var tag = Tags.findOne({ name : name.toLowerCase() });
    if (tag) {
      Tasks.Tags.add(tag, ui.state.task._id);
    } else {
      Tags.insert({ name : name }, function(err, _id) {
        if (!err) {
          Tasks.Tags.add(Tags.findOne(_id), ui.state.task._id);
          ui.toggle();
        } else {
          console.log(err);
        }
      });
    }
  },
  toggle() {
    this.setState({ isAdding : !this.state.isAdding });
  },
  render() {
    var ui = this;
    var tagsWithSelected = _.map(ui.state.tags, function(tag) {
      var isSelected = _.reduce(ui.state.task.tags, function(memo, tagInTask){
        return (tag.name === tagInTask.name) || memo;
      }, false);
      return _.extend(tag, { isSelected : isSelected });
    });
    console.log(tagsWithSelected);
    return (
        <div className="tags">
          <div className="header"><h4>Tags<i className='fa fa-plus' onClick={ this.handleOnAddClick }></i></h4></div>
          <form name='add-tag' className={ this.state.isAdding ? '' : 'hide' } onSubmit={ this.handleAddFormSubmit }>
            <label htmlFor='tags'>Tags</label>
            <input className='typeahead' name='tagsInput' id='tags-input' type='text'/>
            <button type='submit'>Add</button>
          </form>
          <div className='list'>
            {
              tagsWithSelected.map(function(tag) {
                return (<AssistantTasksDetailTag
                          key={ tag._id }
                          tag={ tag }
                          taskId={ ui.state.task._id }></AssistantTasksDetailTag>);
              })
            }
          </div>
        </div>
    );
  }
});