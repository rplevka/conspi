var filter = 100;
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
  this.prepareData();
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
      src = this.getByValue(nodes2, data[j].name);
      tgt = this.getByValue(nodes2, data[j].links[k].name);
      if(src != -1 && tgt != -1){
        links2.push({
          "source": src,
          "target": tgt,
          "value": data[j].links[k].score
        });
      }
    }
  }
  collection.setData(links2, nodes_all);
}


Controller.prototype.prepareData = function () {
  var links = [];
  var nodes = [];

  self = this;

  for (j = 0, len = data.length; j < len; j++) {
    d = data[j];

    nodes.push({
      'name': d.name,
      'group': nodeGroups['conspi'],
      'score': 0

      //_.sum(d.links, function(li){
      //  return li.score;
      //})
    });
  }

  for (j = 0, len = data.length; j < len; j++) {
    d = data[j];

    dLinks = d.links;

    for (k = 0, len1 = dLinks.length; k < len1; k++) {
      link = dLinks[k];

      if (link.score > filter) {

        indx = this.getByValue(nodes, link.name);

        if (indx == -1) {
          newNode = {
            'name': link.name,
            'group': self.getGroup(link.name),
            'score': Number(link.score)
          };
          nodes.push(newNode);

        } else {
          nodes[indx].score += link.score;
        }

        src = this.getByValue(nodes, d.name);
        tgt = this.getByValue(nodes, link.name);
        links.push({
          "source": src,
          "target": tgt,
          "value": link.score
        });
      }
    }
  }
  collection.setData(links, nodes);
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
