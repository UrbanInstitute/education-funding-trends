    var pageSize = "huge"
  var mapSizes = {
    "huge": { "width": 1200, "height": 1570, "scale": 4300, "translate": [410,240], "chartWidth": 96, "chartMargin": 11},
    "large": { "width": 750, "height": 600, "scale": 3100, "translate": [300,200], "chartWidth": 62, "chartMargin": 5},
    "medium": { "width": 900, "height": 1270, "scale": 3800, "translate": [380,220], "chartWidth": 76, "chartMargin": 8},
    "small": { "width": 900, "height": 1270, "scale": 3800, "translate": [380,220], "chartWidth": 76, "chartMargin": 8}
  }

  var mapMargin = {top: 30, right: 20, bottom: 30, left: 50},
    mapWidth = mapSizes[pageSize]["width"] - mapMargin.left - mapMargin.right,
    mapHeight = mapSizes[pageSize]["height"] - mapMargin.top - mapMargin.bottom;




function  renderMap(trendsData, startYear, endYear) {

    generateButtons(trendsData, startYear, endYear)

      mapSvg = d3.select("#vis")
      .data([trendsData])
        .append("svg")
            .attr("width", mapWidth + mapMargin.left + mapMargin.right)
            .attr("height", mapHeight + mapMargin.top + mapMargin.bottom)
        .append("g")
            .attr("transform", 
                  "translate(" + mapMargin.left + "," + mapMargin.top + ")");
      // mapSvg.data([trendsData])

    trendsData = trendsData.filter(function(o){
    return +o.Year >= startYear
    })
    trendsData.forEach(function(d) {
      keys = Object.keys(d);
      for(var i = 0; i<keys.length; i++){
        var key = keys[i]
        if(key == "State" || key == "Year"){
          continue;
        }else{
          d[key] = +d[key]
        }
      }
    });


  var trendsDataNest = d3.nest()
    .key(function(d) {return d.State;})
    .entries(trendsData);

  var tmpKeys = []
  for(var i = 0; i < trendsDataNest.length; i++){
    var obj = trendsDataNest[i]
    if(obj.hasOwnProperty("key")){
      tmpKeys.push(obj.key)
    }
  }





  var blankStateData = stateData.features.filter(function(o) { return tmpKeys.indexOf(o.properties.abbr) == -1})



        var projection = d3.geoEquirectangular()
        .scale(mapSizes[pageSize]["scale"])
        .center([-96.03542,41.69553])
        .translate(mapSizes[pageSize]["translate"]);

      var geoPath = d3.geoPath()
        .projection(projection);
  var chartWidth = mapSizes[pageSize]["chartWidth"]
  var chartMargin = mapSizes[pageSize]["chartMargin"]
  var map = mapSvg
    .selectAll(".state")
    .data(trendsDataNest)
    .enter()
    .append("g")
    .attr("class","state")
        .attr("transform", function(d,i){
            var tmp = stateData.features.filter(function(o) { return o.properties.abbr == d.key} )
            return "translate(" + geoPath.centroid(tmp[0]) + ")"

        })

    var blank = mapSvg
    .selectAll(".blank")
    .data(blankStateData)
    .enter()
    .append("g")
    .attr("class","blank")
        .attr("transform", function(d,i){
            // var tmp = stateData.features.filter(function(o) { return o.properties.abbr == d.key} )
            return "translate(" + geoPath.centroid(d) + ")"

        })

    blank.append("rect")
      .attr("width",chartWidth-2*chartMargin + 8)
      .attr("height",chartWidth-2*chartMargin + 8)
      .attr("x",chartMargin - 4)
      .attr("y",chartMargin - 4)
      .style("fill","#b3b3b3") 

    map.append("rect")
      .attr("width",chartWidth-2*chartMargin + 8)
      .attr("height",chartWidth-2*chartMargin + 8)
      .attr("x",chartMargin - 4)
      .attr("y",chartMargin - 4)
      .style("fill","#1696d2") 

 


    var mapX = d3.scaleLinear().range([chartMargin, chartWidth-chartMargin]);
    var mapY = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]);

// console.log(Object.keys(trendsData[0]))
    var firstKey;
    var keys = Object.keys(trendsData[0])
    for(var i = 0; i < keys.length; i++){
      if(keys[i] == "State" || keys[i] == "Year"){
        continue
      }else{
        firstKey = keys[i]
        break;
      }
    }
    mapX.domain([startYear,endYear]);
    mapY.domain([0, d3.max(trendsData, function(d) { return d[firstKey]; })]); 




    var mapXAxis = d3.axisBottom(mapX)
            // .outerTickSize(0);

    var mapYAxis = d3.axisLeft(mapY)
        // .outerTickSize(0);

    var mapline = d3.line()
        .x(function(d) { return mapX(d.Year); })
        .y(function(d) { return mapY(d[firstKey]); });

    map.append("path")
      .attr("class", function(d){ return "standard line " + d.key })
          .attr("d", function(d){  return mapline(d.values)})
    map.append("path")
      .attr("class", "alt line")
          .attr("d", function(d){  return mapline(d.values)})
          .style("opacity",0)


      map.append("rect")
       .attr("class","mapCurtain")
       .attr("width",chartWidth-2*chartMargin)
       .attr("height",chartWidth-2*chartMargin)
       .attr("x",chartMargin)
       .attr("y",chartMargin)
       .style("fill","#1696d2")

    map.append("text")
      .text(function(d){ return d.key })
      .attr("class", "mapLable standard")
      .attr("text-anchor", "end")
      .attr("x",chartWidth+chartMargin - 25)
      .attr("y",chartWidth+chartMargin - 25)
    
    blank.append("text")
      .text(function(d){ return d.properties.abbr })
      .attr("class", "mapLable blank")
      .attr("text-anchor", "end")
      .attr("x",chartWidth+chartMargin - 25)
      .attr("y",chartWidth+chartMargin - 25)

    map.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (chartWidth-chartMargin) + ")")
        .call(mapXAxis);

    // Add the Y Axis
    map.append("g")
        .attr("class", function(d){ return "y axis " + d.key})
      .attr("transform", "translate(" + chartMargin + ",0)")
        .call(mapYAxis);


    // drawMapLine()
    drawBackMapCurtain(0)


  }

  function drawMapLine(variable, startYear, endYear){
    var trendsData = d3.select("#vis").datum()
    var trendsDataNest = d3.nest()
      .key(function(d) {return d.State;})
      .entries(trendsData);

    var chartWidth = mapSizes[pageSize]["chartWidth"]
    var chartMargin = mapSizes[pageSize]["chartMargin"]

    d3.select("#vis svg")
      .selectAll(".state")
      .data(trendsDataNest)

    var mapX = d3.scaleLinear().range([chartMargin, chartWidth-chartMargin]);

    var mapY = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]);

    mapX.domain([startYear,endYear]);
    // var mapYs = {}
    var mlines = {}
    var yaxes = {}
    var mapY;
    var mapline;
    var mapYAxis

      mapY = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin])
        // .domain(d3.extent(trendsData, function(d){ return d[variable]}))
      var max = d3.max(trendsData, function(d) { return d[variable]; })
      mapY.domain([0, max]); 
      mapline = d3.line()
          .x(function(d) { return mapX(d.Year); })
          .y(function(d) { return mapY(d[variable]); });

      mapYAxis = d3.axisLeft(mapY)
        // .tickValues([0, max])
        // .outerTickSize(0);

      d3.selectAll("#vis .y.axis")
        .transition()
        .call(mapYAxis)

      d3.selectAll("#vis svg .line")
          // .data(trendsData)
          .transition()
          .duration(1200)
          .attr("d", function(d){ return mapline(d.values)})

    var mapXAxis = d3.axisBottom(mapX)
        // .outerTickSize(0);

  }





  function drawBackMapCurtain(delay){
    var chartWidth = mapSizes[pageSize]["chartWidth"]
    var chartMargin = mapSizes[pageSize]["chartMargin"]

    d3.selectAll(".mapCurtain")
      .transition()
      .duration(0)
      .attr("width",chartWidth-2*chartMargin)
      .attr("x",chartMargin)
      .transition()
      .delay(delay + 200)
      .duration(1200)
      .attr("width",0)
      .attr("x", chartWidth - chartMargin)
       //    map.append("rect")
       // .attr("class","mapCurtain")
       // .attr("width",chartWidth-2*chartMargin)
       // .attr("height",chartWidth-2*chartMargin)
       // .attr("x",chartMargin)
       // .attr("y",chartMargin)
       // .style("fill","#ffffff")
  }





function generateButtons(trendsData, startYear, endYear){
  var keys = Object.keys(trendsData[0])
  for (var i = 0; i< keys.length; i++){
    var key = keys[i]
    if(key == "State" || key == "Year"){
      continue;
    }else{
      d3.select("#buttons")
        .append("div")
        .attr("class", "button")
        .text(key)
        .datum(key)
        .on("click", function(d){
          // console.log(key)
          drawMapLine(d, startYear, endYear)
    // drawMapLine(key, "alt", "hide")
    // drawBackMapCurtain(i-2);
        })
    }
  }
}

