// The MIT License (MIT)

// Copyright (c) 2017 Zalando SE

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function random_between(min, max) {
  return min + random() * (max - min);
}

function normal_between(min, max) {
  return min + (random() + random()) * 0.5 * (max - min);
}
function polar(cartesian) {
  var x = cartesian.x;
  var y = cartesian.y;
  return {
    t: Math.atan2(y, x),
    r: Math.sqrt(x * x + y * y)
  }
}

function cartesian(polar) {
  return {
    x: polar.r * Math.cos(polar.t),
    y: polar.r * Math.sin(polar.t)
  }
}

function bounded_interval(value, min, max) {
  var low = Math.min(min, max);
  var high = Math.max(min, max);
  return Math.min(Math.max(value, low), high);
}

function bounded_ring(polar, r_min, r_max) {
  return {
    t: polar.t,
    r: bounded_interval(polar.r, r_min, r_max)
  }
}

function bounded_box(point, min, max) {
  return {
    x: bounded_interval(point.x, min.x, max.x),
    y: bounded_interval(point.y, min.y, max.y)
  }
}

function segment(quadrant, ring) {
  var polar_min = {
    t: quadrants[quadrant].radial_min * Math.PI,
    r: ring === 0 ? 30 : rings[ring - 1].radius
  };
  var polar_max = {
    t: quadrants[quadrant].radial_max * Math.PI,
    r: rings[ring].radius
  };
  var cartesian_min = {
    x: 15 * quadrants[quadrant].factor_x,
    y: 15 * quadrants[quadrant].factor_y
  };
  var cartesian_max = {
    x: rings[3].radius * quadrants[quadrant].factor_x,
    y: rings[3].radius * quadrants[quadrant].factor_y
  };
  return {
    clipx: function (d) {
      var c = bounded_box(d, cartesian_min, cartesian_max);
      var p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
      d.x = cartesian(p).x; // adjust data too!
      return d.x;
    },
    clipy: function (d) {
      var c = bounded_box(d, cartesian_min, cartesian_max);
      var p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
      d.y = cartesian(p).y; // adjust data too!
      return d.y;
    },
    random: function () {
      return cartesian({
        t: random_between(polar_min.t, polar_max.t),
        r: normal_between(polar_min.r, polar_max.r)
      });
    }
  }
}

function translate(x, y) {
  return "translate(" + x + "," + y + ")";
}

function viewbox(quadrant) {
  switch (quadrant) {
    case 0:
      return [
        -920,
        -500,
        config.width / 2,
        config.height / 2
      ].join(" ");
    case 1:
      return [
        0,
        -500,
        config.width / 2,
        config.height / 2
      ].join(" ");
    case 2:
      return [
        0,
        0,
        config.width / 2,
        config.height / 2
      ].join(" ");
    case 3:
      return [
        -920,
        0,
        config.width / 2,
        config.height / 2
      ].join(" ");


    default:
      break;
  }

}
function getQuadrantIndex(x, y) {
  const verticalLine = document.getElementById('verticalGridLine');
  const horizontalLine = document.getElementById('horizontalGridLine');

  var rectV = verticalLine.getBoundingClientRect();
  console.log(rectV.top, rectV.right, rectV.bottom, rectV.left);
  var rectH = horizontalLine.getBoundingClientRect();
  console.log(rectH.top, rectH.right, rectH.bottom, rectH.left);

  const isTop = y < rectH.y;
  const isLeft = x < rectV.x;

  if (isTop && isLeft) return 0; // Top Left
  if (isTop && !isLeft) return 1; // Top Right
  if (!isTop && !isLeft) return 2; // Bottom Right
  if (!isTop && isLeft) return 3; // Bottom Left
}
function onDocumentClick(event) {
  event.stopPropagation();
  const x = event.clientX; // X coordinate of the click
  const y = event.clientY; // Y coordinate of the click
  const width = window.innerWidth; // Width of the viewport
  const height = window.innerHeight; // Height of the viewport

  const quadrantIndex = getQuadrantIndex(x, y, width, height);
  console.log(`Quadrant Index: ${quadrantIndex}`);
  onQuadrantClick(quadrantIndex)
}
function onQuadrantClick(quadrantIndex) {
  console.log("Quadrant clicked:", quadrantIndex);
  if ("zoomed_quadrant" in config) {
    if (config.zoomed_quadrant_set) {
      config.zoomed_quadrant = null;
      config.zoomed_quadrant_set = false
      radar_visualization(config)

    } else if (config.zoomed_quadrant === null) {
      config.zoomed_quadrant = quadrantIndex;
      config.zoomed_quadrant_set = true
      radar_visualization(config)
    }

  }
}
function showBubble(d) {
  if (d.active || config.print_layout) {
    var tooltip = d3.select("#bubble text")
      .text(d.label);
    var bbox = tooltip.node().getBBox();
    d3.select("#bubble")
      .attr("transform", translate(d.x - bbox.width / 2, d.y - 16))
      .style("opacity", 0.8);
    d3.select("#bubble rect")
      .attr("x", -5)
      .attr("y", -bbox.height)
      .attr("width", bbox.width + 10)
      .attr("height", bbox.height + 4);
    d3.select("#bubble path")
      .attr("transform", translate(bbox.width / 2 - 5, 3));
  }
}

function hideBubble(d) {
  var bubble = d3.select("#bubble")
    .attr("transform", translate(0, 0))
    .style("opacity", 0);
}

function highlightLegendItem(d) {
  var legendItem = document.getElementById("legendItem" + d.id);
  legendItem.setAttribute("filter", "url(#solid)");
  legendItem.setAttribute("fill", "white");
}

function unhighlightLegendItem(d) {
  var legendItem = document.getElementById("legendItem" + d.id);
  legendItem.removeAttribute("filter");
  legendItem.removeAttribute("fill");
}
// custom random number generator, to make random sequence reproducible
// source: https://stackoverflow.com/questions/521295
var seed = 42;

// radial_min / radial_max are multiples of PI
const quadrants = [
  { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
  { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
  { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
  { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 }
];

const rings = [
  { radius: 130 },
  { radius: 220 },
  { radius: 310 },
  { radius: 400 }
];

const title_offset =
  { x: -915, y: -420 };

const footer_offset =
  { x: -875, y: 420 };

const legend_offset = [
  { x: 450, y: 90 },
  { x: -875, y: 90 },
  { x: -875, y: -310 },
  { x: 450, y: -310 }
];
let config = null

function radar_visualization(configuration) {

  function legend_transform(quadrant, ring, index = null, offsetX = 0, offsetY = 0) {
    var dx = ring < 2 ? 0 : 140;
    var dy = (index == null ? -16 : index * 12);
    if (ring % 2 === 1) {
      dy = dy + 36 + segmented[quadrant][ring - 1].length * 12;
    }
    return translate(
      legend_offset[quadrant].x + dx + offsetX,
      legend_offset[quadrant].y + dy + offsetY
    );
  }
  config = configuration

  document.addEventListener('click', onDocumentClick);
  // position each entry randomly in its segment
  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];
    entry.segment = segment(entry.quadrant, entry.ring);
    var point = entry.segment.random();
    entry.x = point.x;
    entry.y = point.y;
    entry.color = entry.active || config.print_layout ?
      config.rings[entry.ring].color : config.colors.inactive;
  }

  // partition entries according to segments
  var segmented = new Array(4);
  for (var quadrant = 0; quadrant < 4; quadrant++) {
    segmented[quadrant] = new Array(4);
    for (var ring = 0; ring < 4; ring++) {
      segmented[quadrant][ring] = [];
    }
  }
  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];
    segmented[entry.quadrant][entry.ring].push(entry);
  }

  // assign unique sequential id to each entry
  var id = 1;
  for (var quadrant of [2, 3, 1, 0]) {
    for (var ring = 0; ring < 4; ring++) {
      var entries = segmented[quadrant][ring];
      entries.sort(function (a, b) { return a.label.localeCompare(b.label); })
      for (var i = 0; i < entries.length; i++) {
        entries[i].id = "" + id++;
      }
    }
  }

  var svg = d3.select("svg#" + config.svg_id)
  svg.selectAll("*").remove();
  svg.style("background-color", config.colors.background)
    .attr("width", config.width)
    .attr("height", config.height);


  var radar = svg.append("g");
  if ("zoomed_quadrant" in config && config.zoomed_quadrant !== null) {
    svg.attr("viewBox", viewbox(config.zoomed_quadrant));

  } else {
    svg.attr("viewBox", null);
    radar.attr("transform", translate(config.width / 2, config.height / 2));
  }

  var grid = radar.append("g");

  // draw grid lines
  grid.append("line")
    .attr("x1", 0).attr("y1", -400)
    .attr("x2", 0).attr("y2", 400)
    .style("stroke", config.colors.grid)
    .style("stroke-width", 3)
    .attr("id", "verticalGridLine");
  grid.append("line")
    .attr("x1", -400).attr("y1", 0)
    .attr("x2", 400).attr("y2", 0)
    .style("stroke", config.colors.grid)
    .style("stroke-width", 3)
    .attr("id", "horizontalGridLine");

  // background color. Usage `.attr("filter", "url(#solid)")`
  // SOURCE: https://stackoverflow.com/a/31013492/2609980
  var defs = grid.append("defs");
  var filter = defs.append("filter")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1)
    .attr("height", 1)
    .attr("id", "solid");
  filter.append("feFlood")
    .attr("flood-color", "rgb(0, 0, 0, 0.8)");
  filter.append("feComposite")
    .attr("in", "SourceGraphic");

  // draw rings
  for (var i = 0; i < rings.length; i++) {
    grid.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", rings[i].radius)
      .style("fill", "none")
      .style("stroke", config.colors.grid)
      .style("stroke-width", 3);
    if (config.print_layout) {
      grid.append("text")
        .text(config.rings[i].name)
        .attr("y", -rings[i].radius + 62)
        .attr("text-anchor", "middle")
        .style("fill", config.rings[i].color)
        .style("opacity", 0.35)
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "42px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  }


  // draw title and legend (only in print layout)
  if (config.print_layout) {

    // title

    radar.append("path")
      .attr("transform", `scale(0.5)`)

    radar.append("text")
      .attr("transform", translate(title_offset.x, title_offset.y))
      .text(config.title)
      .style("font-family", "Arial, Helvetica")
      .style("font-size", "30")
      .style("font-weight", "bold")

    // date
    radar
      .append("text")
      .attr("transform", translate(title_offset.x, title_offset.y + 20))
      .text(config.date || "")
      .style("font-family", "Arial, Helvetica")
      .style("font-size", "14")
      .style("fill", "#999")

    // footer
    radar.append("text")
      .attr("transform", translate(footer_offset.x, footer_offset.y))
      .text("▲ moved up     ▼ moved down")
      .attr("xml:space", "preserve")
      .style("font-family", "Arial, Helvetica")
      .style("font-size", "10px");

    // legend
    var legend = radar.append("g");
    for (var quadrant = 0; quadrant < 4; quadrant++) {

      legend.append("text")
        .attr("transform", translate(
          legend_offset[quadrant].x - 40,
          legend_offset[quadrant].y - 45
        ))
        .text(config.quadrants[quadrant].name)
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "18px")
        .style("cursor", "18px")
        .style("font-weight", "bold")

      for (var ring = 0; ring < 4; ring++) {
        // offset labels and legend items for the first and third ring
        var offsetX = ring == 0 || ring == 1 ? -40 : 0
        offsetX = ring == 2 || ring == 3 ? 100 : offsetX

        legend.append("text")
          .attr("transform", legend_transform(quadrant, ring, null, offsetX))
          .text(config.rings[ring].name)
          .style("font-family", "Arial, Helvetica")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("fill", config.rings[ring].color);
        legend.selectAll(".legend" + quadrant + ring)
          .data(segmented[quadrant][ring])
          .enter()
          .append("a")
          .attr("href", function (d, i) {
            return d.link ? d.link : "#"; // stay on same page if no link was provided
          })
          // Add a target if (and only if) there is a link and we want new tabs
          .attr("target", function (d, i) {
            return (d.link && config.links_in_new_tabs) ? "_blank" : null;
          })
          .append("text")
          .attr("transform", function (d, i) { return legend_transform(quadrant, ring, i, offsetX); })
          .attr("class", "legend" + quadrant + ring)
          .attr("id", function (d, i) { return "legendItem" + d.id; })
          .text(function (d, i) {
            var maxLength = 53;
            var label = d.id + ". " + d.label;
            return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
          })
          .style("font-family", "Arial, Helvetica")
          .style("font-size", "11px")
          .on("mouseover", function (d) { showBubble(d); highlightLegendItem(d); })
          .on("mouseout", function (d) { hideBubble(d); unhighlightLegendItem(d); });
      }

    }
  }

  // layer for entries
  var rink = radar.append("g")
    .attr("id", "rink");

  // rollover bubble (on top of everything else)
  var bubble = radar.append("g")
    .attr("id", "bubble")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("user-select", "none");
  bubble.append("rect")
    .attr("rx", 4)
    .attr("ry", 4)
    .style("fill", "#333");
  bubble.append("text")
    .style("font-family", "sans-serif")
    .style("font-size", "10px")
    .style("fill", "#fff");
  bubble.append("path")
    .attr("d", "M 0,0 10,0 5,8 z")
    .style("fill", "#333");



  // draw blips on radar
  var blips = rink.selectAll(".blip")
    .data(config.entries)
    .enter()
    .append("g")
    .attr("class", "blip")
    .attr("transform", function (d, i) { return legend_transform(d.quadrant, d.ring, i); })
    .on("mouseover", function (d) { showBubble(d); highlightLegendItem(d); })
    .on("mouseout", function (d) { hideBubble(d); unhighlightLegendItem(d); });

  // configure each blip
  blips.each(function (d) {
    var blip = d3.select(this);

    // blip link
    if (d.active && Object.prototype.hasOwnProperty.call(d, "link") && d.link) {
      blip = blip.append("a")
        .attr("xlink:href", d.link);

      if (config.links_in_new_tabs) {
        blip.attr("target", "_blank");
      }
    }

    // blip shape
    if (d.moved > 0) {
      blip.append("path")
        .attr("d", "M -15,7 15,7 0,-18 z")
        .style("fill", d.color);
    } else if (d.moved < 0) {
      blip.append("path")
        .attr("d", "M -13,-7 13,-7 0,18 z")
        .style("fill", d.color);
    } else {
      blip.append("circle")
        .attr("r", 13)
        .attr("fill", d.color);
    }

    // blip text
    if (d.active || config.print_layout) {
      var blip_text = config.print_layout ? d.label.indexOf('ARC') > -1 ? "A" + d.label.substring(0, d.label.indexOf(' ')).split('-')[1] : d.id : d.label.match(/[a-z]/i);
      blip.append("text")
        .text(blip_text)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", function(d) { return blip_text.length > 2 ? "10px" : "12px"; })
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  });

  // make sure that blips stay inside their segment
  function ticked() {
    blips.attr("transform", function (d) {
      return translate(d.segment.clipx(d), d.segment.clipy(d));
    })
  }

  // distribute blips, while avoiding collisions
  d3.forceSimulation()
    .nodes(config.entries)
    .velocityDecay(0.19) // magic number (found by experimentation)
    .force("collision", d3.forceCollide().radius(12).strength(0.85))
    .on("tick", ticked);
}
