var Panel = function Panel (){
  this.html = '';
  this.div = $('#panel')
}


Panel.prototype.init = function () {

};

Panel.prototype.draw = function (node, sources, targets) {
  var sourceVals = this.getWidthOfBars_(_.pluck(sources, 'value'));
  values = (_.pluck(targets, 'value')).concat(_.pluck(sources, 'value'))
  barWidths = this.getWidthOfBars_(values);

  var targetVals = barWidths.slice(0, targets.length);
  var sourceVals = barWidths.slice(targets.length);

  var that = this;

  this.html = '<h3 id="node-name">' + node.name + '</h3>';

  if (targets.length){
    this.html += '<h5>sources</h5>';
    this.html += '<div class="chart targets">';
    _.forEach(targetVals, function(targetVal, index){
      if (index < 10) {
        that.html += '<div class="label">' + targets[index].source.name + '</div>'
        that.html += '<div class="bar" style="width: ' + targetVal + 'px;">' + targets[index].value + '</div>'
      }
    })
    this.html += '</div>'
  }


  if (sources.length){
    this.html += '<h5>targets</h5>';
    this.html += '<div class="chart sources">';
    _.forEach(sourceVals, function(sourceVal, index){
      if (index < 10) {
        that.html += '<div class="label">' + sources[index].target.name + '</div>'
        that.html += '<div class="bar" style="width: ' + sourceVal + 'px;">' + sources[index].value + '</div>'
      }
    });
    this.html += '</div>'
  }

  this.render();
}

Panel.prototype.getWidthOfBars_ = function (values) {
  var per = 150 / _.max(values)
  barWidths = [];

  _.forEach(values, function(value){
    barWidths.push(value * per);
  })

  return barWidths
}

Panel.prototype.clear = function () {
  var that = this;

  this.html = '<h4>no node seleced</h>';

  this.render()
}

Panel.prototype.render = function () {
  this.div.html(this.html)
}
