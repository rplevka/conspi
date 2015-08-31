var Network = function Network (){
  this.div = '#network';
  this.data = collection;
}

Network.prototype.create = function() {
  this.width = $(this.div).width() - 200;
  this.height = $(this.div).height();

  self = this;
  //this.div.empty();

  var svg
  svg = d3.select('#network').append('svg')
    .attr('width', self.width)
    .attr('height', self.height)

  svg.append("defs")
    .append('marker')
      .attr("viewBox", "0 -5 10 10")
      .attr("id", "arrow")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M 0,0 m -5,-5 L 5,0 L -5,5 Z");

  var link = svg.selectAll(".link").data(this.data.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("marker-end", "url(#arrow)")
      .style("stroke-width", function(d) {
        return self['scaleLineWidth'](d.value);
      })
      .style("opacity", function(d) {
        return self['scaleLineOpacity'](d.value);
      })

  var force = d3.layout.force()
    .linkDistance(function(d) {
      return self['scaleLinkDistance'](d.value);
    })
    .size([self['width'], self['height']])
    .nodes(self.data['nodes'])
    .links(self.data['links'])
    .charge(-300)
    .friction(0.7)
    .gravity(0.5)
    .start().on("tick", function() {
      link.attr("d", function(d) {
        return self['linkArc'](d);
      });
      node.attr("cx", function(d) {
        return d.x;
      }).attr("cy", function(d) {
        return d.y;
      });
    });
  var node = svg.selectAll(".node")
    .data(this.data.nodes).enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d) {
        if (d.group == 0){
          return 5;
        }
        return self['scaleRadius'](d);
      })
      .style("fill", function(d) {
        return colors[d.group];
      })
      .call(force.drag)
      .on("mouseover", function(d) {
        controller.changeActiveNode(d)
      })
      .on("mouseout", function() {
        controller.noActiveNode()
      });
};

Network.prototype.scaleRadius = function(d) {
  var scale;
  scale = d3.scale.linear()
    .domain([this.data.nodeWeightMin.score, this.data.nodeWeightMax.score])
    .range([3, 15]);
  return scale(d.score);
};

Network.prototype.scaleLineOpacity = function(value) {
  var scale;
  scale = d3.scale.log()
    .domain([this.data.linkValueMin.value, this.data.linkValueMax.value])
    .range([0.2, 0.8]);
  return scale(value);
};


Network.prototype.scaleLineWidth = function(value) {
  var scale;
  scale = d3.scale.linear()
    .domain([this.data.linkValueMin.value, this.data.linkValueMax.value])
    .range([1, 4]);
  return scale(value);
};

Network.prototype.scaleLineColor = function(value) {
  var scale;
  scale = d3.scale.linear()
    .domain([this.data.linkValueMin.value, this.data.linkValueMax.value])
    .range(['rgb(120,120,120)', 'rgb(0,0,0)']);
  return scale(value);
};

Network.prototype.scaleLinkDistance = function(value) {
  var scale;
  scale = d3.scale.linear()
    .domain([this.data.linkValueMin.value, this.data.linkValueMax.value])
    .range([30, 10]);
  return scale(value);
};

Network.prototype.linkArc = function(d) {
  var dr, dx, dy;
  dx = d.target.x - d.source.x;
  dy = d.target.y - d.source.y;
  dr = Math.sqrt(dx * dx + dy * dy);
  return "M" + d.source.x + "," + d.source.y + "," + d.target.x + "," + d.target.y;
};