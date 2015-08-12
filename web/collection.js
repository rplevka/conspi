var Collection = function Collection (){
  this.data = data;
  this.groups = groups;
}
Collection.prototype.setData = function (links, nodes) {
  this.links = links;
  this.nodes = nodes;

  this.linkValueMax = _.max(this.links, function(link) {
    return link.value;
  });
  this.linkValueMin = _.min(this.links, function(link) {
    return link.value;
  });
  this.nodeWeightMax = _.max(this.nodes, function(node) {
    return node.score;
  });
  this.nodeWeightMin = _.min(this.nodes, function(node) {
    return node.score;
  });
}

Collection.prototype.init = function () {
  var self = this;
};