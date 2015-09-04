var filter = 500;
var activeNode;
var panel;
var data;

$( document ).ready(function() {
  panel = new Panel();
  controller.init();
});

var Controller = function Controller (){

};

Controller.prototype.init = function () {
  this.prepareData(filter);
  network.create();
};

Controller.prototype.noActiveNode = function () {
  //panel.clear();
}

Controller.prototype.changeActiveNode = function (node) {
  var id = node.index

  var sourceLinks = _.sortByOrder(_.filter(collection.links, function(link){
    return link.source.index == id
  }), 'value', 'asc');

  var targetLinks = _.sortByOrder(_.filter(collection.links, function(link){
    return link.target.index == id
  }), 'value', 'asc');

  panel.draw(node, sourceLinks, targetLinks)
}

Controller.prototype.prepareData = function (filter) {
  var links = [];
  var nodes_all = [];

  self = this;
  for (var j in data) {
    d = data[j];
    indx = this.getByValue(nodes_all, d.name)
    if(indx == -1){
      nodes_all.push({
        'name': d.name,
        'group': nodeGroups['conspi'],
        'score': 0
      });
    }
    else{
      nodes_all[indx].score += link.score;
      nodes_all[indx].group = nodeGroups['conspi'];
    }
    dLinks = d.links;

    // for (k = 0, len1 = dLinks.length; k < len1; k++) {
    for (var k in dLinks) {
      link = dLinks[k];
      indx = this.getByValue(nodes_all, link.name);
      if (indx == -1) {
        newNode = {
          'name': link.name,
          'group': self.getGroup(link.name),
          'score': Number(link.score)
        };
        nodes_all.push(newNode);

      } else {
        nodes_all[indx].score += link.score;
      }
    }
  }
  // new FILTERED nodeset
  var nodes_filterred = [];
  var links2 = [];
  for(var n in nodes_all){
    if(nodes_all[n].score >= filter || nodes_all[n].group == nodeGroups['conspi']){
      nodes_filterred.push(nodes_all[n]);
    }
  }
  // create edge set
  for(var j in data){
    for(var k in data[j].links){
      src = this.getByValue(nodes_filterred, data[j].name);
      tgt = this.getByValue(nodes_filterred, data[j].links[k].name);
      if(src != -1 && tgt != -1){
        links2.push({
          "source": src,
          "target": tgt,
          "value": data[j].links[k].score
        });
      }
    }
  }
  collection.setData(links2, nodes_filterred);
}

Controller.prototype.getByValue = function(arr, value) {
  var i, iLen;
  i = 0;
  iLen = arr.length;
  while (i < iLen) {
    if (arr[i].name === value) {
      return arr.indexOf(arr[i]);
    }
    i++;
  }
  return -1
};

Controller.prototype.getGroupByNumber = function(numb) {
  return _.findKey(nodeGroups, numb)  || 'undefined'
};

Controller.prototype.getGroup = function (url) {
  if (_.indexOf(groups.conspi, url) > -1) {
    return nodeGroups['conspi'];
  } else if (_.indexOf(groups.commercial, url) > -1) {
    return nodeGroups['commercial'];
  } else if (_.indexOf(groups.social, url) > -1) {
    return nodeGroups['social'];
  } else {
    return nodeGroups['others'];
  }
};

var colors = [
  '#f0027f',
  '#fdc086',
  '#beaed4',
  '#386cb0',
  '#7fc97f'
];

var nodeGroups = {
  'conspi': 0,
  'others': 1,
  'official': 2,
  'commercial': 3,
  'social': 4
};

var collection = new Collection();

var network = new Network();

var controller = new Controller();
