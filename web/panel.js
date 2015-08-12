var Panel = function Panel (){
  this.html = '';
  this.div = $('#panel')
}


Panel.prototype.init = function () {
  
};

Panel.prototype.draw = function (node, sources, targets) {
  var that = this;

  this.html = '<h2>' + node.name + '</h2>';
  
  this.html += '<h4>targetLinks</h4>';

  this.html += '<ul>';
  _.forEach(targets, function(target){
    that.html += '<li>' + target.name + ' - '  + target.weight +  '</li>';
  })
  this.html += '</ul>';


  this.render()
}

Panel.prototype.render = function () {
  this.div.html(this.html)
}