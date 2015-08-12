filter = 20;


$( document ).ready(function() {
  controller.init();
});

var Controller = function Controller (){
  
};

Controller.prototype.init = function () {
  this.prepareData();
  network.create();
};

Controller.prototype.prepareData = function () {
  var d, getGroup, grp, indx, j, k, l, len, len1, len2, len3, link, m, newNode, ref1, ref2, ref3, self, src, tgt;
  var links = [];
  var nodes = [];

  self = this;

  for (j = 0, len = data.length; j < len; j++) {
    d = data[j];
    grp = 1;
    nodes.push({
      'name': d.name,
      'group': self.getGroup(d.name, {
        'score': 0
      })
    });
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
          links.push({
            'source': 0,
            'target': 0,
            'value': 0
          });
        } else {
          nodes[indx].score = Number(nodes[indx].score) + link.score;
        }
      }
    }
  }

  for (l = 0, len2 = data.length; l < len2; l++) {
    d = data[l];
    dLinks = d.links;
    
    for (m = 0, len3 = dLinks.length; m < len3; m++) {
      link = dLinks[m];
      if (link.score > filter) {

        src = this.getByValue(nodes, d.name);
        tgt = this.getByValue(nodes, link.name);
        links.push({
          "source": src,
          "target": tgt,
          "value": 1 + link.score / 20
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
var panel = new Panel();
var network = new Network();


var controller = new Controller();