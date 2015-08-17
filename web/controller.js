var filter = 50;
var activeNode;
var panel;


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
  panel.clear();
}

Controller.prototype.changeActiveNode = function (node) {
  var id = node.index

  var sourceLinks = _.sortByOrder(_.pluck(_.filter(collection.links, function(link){
    return link.source.index == id
  }), 'source'), 'weight', 'desc')

  console.log(sourceLinks.length)

  var targetLinks = _.sortByOrder(_.pluck(_.filter(collection.links, function(link){
    return link.target.index == id
  }), 'source'), 'weight', 'desc')

  console.log (targetLinks);

  panel.draw(node, sourceLinks, targetLinks)
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

        
        if (!indx) {
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

  console.log(nodes)

  console.log (_.filter(nodes, 'name', 'nwoo.org'))

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
  'rgb(240,2,127)', 
  'rgb(253,192,134)', 
  'rgb(127,201,127)',  
  'rgb(255,255,153)',
  'rgb(56,108,176)', 
  'rgb(190,174,212)'
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