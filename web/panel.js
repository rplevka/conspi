var Panel = function Panel (){
  this.html = '';
  this.div = $('#panel')
}


Panel.prototype.init = function () {
  
};

Panel.prototype.draw = function (node, sources, targets) {
  var that = this;

  this.html = '<h2>' + node.name + '</h2>';

  var jsonInfo = JSON.stringify(node).split(',')

  for (var i in jsonInfo){
    this.html += '<p>' + jsonInfo[i] + '</p>';
  }
    
  this.html += '<h4>targets</h4>';

  this.html += '<ul>';
  _.forEach(targets, function(target){
    that.html += '<li>' + target.name + ' - '  + target.weight +  '</li>';
  })
  this.html += '</ul>';


  this.render()
}


Panel.prototype.clear = function () {
  var that = this;

  this.html = '<h2>no node seleced</h2>';
  
  this.render()
}

Panel.prototype.render = function () {
  this.div.html(this.html)
}