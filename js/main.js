
//Prob easiest to have a few set sizes for the map, which change at broswer size breakpoints. So `pageSize` will be determined by some function which tests browser size (e.g. IS_MOBILE() functions in past projects). I don't think it's as straightforward to have a continuously resizing graphic. Note that these values are just placeholders, they'll need to be tested/updated, and potentially more or fewer sizes are needed
var stateLinesArray = [];

/*MAP VARIABLES*/
var pageSize = "full"
var mapSizes = {
"full": { "width": 800, "height": 555, "scale": 3150, "translate": [720,180], "chartWidth": 74, "chartMargin": 13},
"large": { "width": 750, "height": 600, "scale": 3100, "translate": [300,200], "chartWidth": 62, "chartMargin": 5},
"medium": { "width": 900, "height": 1270, "scale": 3800, "translate": [380,220], "chartWidth": 76, "chartMargin": 8},
"small": { "width": 900, "height": 1270, "scale": 3800, "translate": [380,220], "chartWidth": 76, "chartMargin": 8}
}


var category = "revratio";
var startYear = 1994;
var endYear = 2014;

var mapMargin = {top: 30, right: 20, bottom: 30, left: 50},
mapWidth = mapSizes[pageSize]["width"] - mapMargin.left - mapMargin.right,
mapHeight = mapSizes[pageSize]["height"] - mapMargin.top - mapMargin.bottom;

/*LINE GRAPH VARIABLES*/

var graphSizes = {
"full": { "width": 400, "height": 300, "translate": [720,180]},
"large": { "width": 750, "height": 600, "translate": [300,200]},
"medium": { "width": 900, "height": 1270, "translate": [380,220]},
"small": { "width": 900, "height": 1270, "translate": [380,220]}
}

var selectedCategory = "adj_revratio_all";
var graphMargin = {top: 30, right: 20, bottom: 30, left: 50},
  graphWidth =  graphSizes[pageSize]["width"]- graphMargin.left - graphMargin.right,
  graphHeight = graphSizes[pageSize]["height"] - graphMargin.top - graphMargin.bottom;

var graphX = d3.scaleTime().range([0, graphWidth]);
var graphY = d3.scaleLinear().range([graphHeight, 0]);

var graphLine = d3.line()
  .x(function(d) { return graphX(d.Year); })
  .y(function(d) { return graphY(d[selectedCategory]); });

var graphSvg = d3.select("#lineChart")
  .append("svg")
    .attr("width", graphWidth + graphMargin.left + graphMargin.right)
    .attr("height", graphHeight + graphMargin.top + graphMargin.bottom)
  .append("g")
    .attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top + ")");

var voronoi = d3.voronoi()
    .x(function(d) { return graphX(d.Year); })
    .y(function(d) { return graphY(d[selectedCategory]); })
    .extent([[-graphMargin.left, -graphMargin.top], [graphWidth + graphMargin.right, graphHeight + graphMargin.bottom]]);


d3.csv("data/toggle_text.csv", function(error, toggleText) {
  d3.csv("data/data.csv", function(error, trendsDataFull) {
      trendsDataFull.forEach(function(d) {
        keys = Object.keys(d);
        for(var i = 0; i<keys.length; i++){
          var key = keys[i]
          if(key == "State" || key == "Year" || key == "state_full"){
            continue;
          }else{
            d[key] = +d[key]
          }
        }
      });
    //FILTERING DATA FOR MAP TO NOT INCLUDE USA
    var trendsData = trendsDataFull.filter(function(d) { 
      return d.State !== "USA"
    })

    var trendsDataFiltered = trendsDataFull.filter(function(d) { 
      if (selectedCategory.includes("revratio")) {
        return d.State !== "AK" && d.State !== "HI" && d.State !== "DC"
      }
      else {
        return d.State;
      }
    })

    var trendsDataAK = trendsDataFull.filter(function(d) { 
      if (selectedCategory.includes("revratio")) {
        return d.State !== "AK" && d.State !== "HI" && d.State !== "DC"
      }
      else {
        return d.State;
      }
    })
    //FILTERING DATA TO HI AND DC TO DRAW BOXES OVER TILES
    var blankStateData = trendsDataFull.filter(function(d) { 
      if (selectedCategory.includes("revratio")) {
        return d.State == "HI" || d.State == "DC"
      }
    })

  //CREATE INITIAL LINE GRAPH ON LOAD
    function renderGraph() {


      var graphDataSelected = trendsDataFull.filter(function(d) {           
       if ((stateLinesArray.includes(d.State)) || (d.State == "USA")) {         
         return d;              
       }         
      })

      var trendsDataNest = d3.nest()
        .key(function(d) {return d.State })
        .entries(graphDataSelected);

    

      graphX.domain(d3.extent(trendsDataFiltered, function(d) { return d.Year; }));
      graphY.domain([d3.min(trendsDataFiltered, function(d) {return d[selectedCategory]; }), d3.max(trendsDataFiltered, function(d) {return d[selectedCategory]; })]);
    
      var threshold = graphSvg.append("line")
       .attr("x1", 0)
       .attr("y1", graphY(1))
       .attr("x2", graphWidth)
       .attr("y2", graphY(1))
       .style("stroke-dasharray", 5)
       .attr("stroke", "#5c5859")
       .attr("class", "threshold")

      graphSvg.append("path")
        .data([trendsDataNest])
        .attr("class", "line-USA")
       // .attr("d", graphLine);
        .attr("d", function(d) { d.graphLine = this;
          // console.log(graphLine(d[0].values))
            return (graphLine(d[0].values));
          });


      graphSvg.append("g")
          .attr("transform", "translate(0," + graphHeight + ")")
          .attr("class", "x graphAxis")
          .call(d3.axisBottom(graphX)
            .ticks(5)
            .tickFormat(d3.format('')))
          

      // Add the Y Axis
      graphSvg.append("g")
          .attr("class", "y graphAxis")
          .call(d3.axisLeft(graphY)
            .ticks(5)
            .tickFormat(d3.format('.2f')));

      drawVoronoi(trendsDataNest);

    }


    function drawVoronoi(data) { console.log('voronoi')
      var voronoi = d3.voronoi()
          .x(function(d) { return graphX(d.Year); })
          .y(function(d) { return graphY(d[selectedCategory]); })
          .extent([[-graphMargin.left, -graphMargin.top], [graphWidth + graphMargin.right, graphHeight + graphMargin.bottom]]);


      voronoiGroup = graphSvg.selectAll(".voronoi")
        .data(voronoi.polygons(d3.merge(data.map(function(d) { 
          return d.values; 
        }))))

     voronoiGroup.exit().remove()

      // voronoiGroup.transition()
      //   .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
      //   .style("fill", "#3a403d")
      

      voronoiGroup.enter().append("path")
            .attr("class", function() { return "voronoi"})
            .merge(voronoiGroup)
            .attr("d", function(d) {
              return d ? "M" + d.join("L") + "Z" : null;
            })
           // .style("fill", "#45b29d")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

    }


   function mouseover(d) {
    // console.log(d.data)
          d3.select(".line-" + d.data.State).classed("line-hover", true);
    }

   function mouseout(d) {
    // console.log(d.data)
          d3.select(".line-" + d.data.State).classed("line-hover", false);
    }

    //CREATE INITIAL MAP ON LOAD
    function  renderMap(startYear, endYear) {


    // console.log(startYear+ endYear)


    //function called on load to create the svg and draw an initial set of line charts. trendsData is passed in from a csv, and startYear/endYear are just for the file uploader (will be constants in final features)

      // generateButtons(trendsData, startYear, endYear) //just for the file uploader


      mapSvg = d3.select("#vis")
        .data([trendsData])
        .append("svg")
          .attr("width", mapWidth + mapMargin.left + mapMargin.right)
          .attr("height", mapHeight + mapMargin.top + mapMargin.bottom)
          .append("g")
            .attr("transform", "translate(" + -330 + "," + mapMargin.top + ")");


      //reshape data, nesting by State 
      var trendsDataNest = d3.nest()
        .key(function(d) {return d.State})
        .entries(trendsData);

      var trendsDataNestBlank = d3.nest()
        .key(function(d) { return d.State})
        .entries(blankStateData);


      //generate a list of states in the dataset. For any states not in the dataset (stored temporarily in tmpKeys) but in the `stateData` object (which is in the global scope, stored in `stateData.js`, create a new data set, just for the blank states (not in data csv), which wil be greyed out
      var tmpKeys = []
      for(var i = 0; i < trendsDataNest.length; i++){
        var obj = trendsDataNest[i]
        if(obj.hasOwnProperty("key")){ 
          tmpKeys.push(obj.key)
        }
      }


      //tile grid map projection and geo path
      var projection = d3.geoEquirectangular()
        .scale(mapSizes[pageSize]["scale"])
        .center([-96.03542,41.69553])
        .translate(mapSizes[pageSize]["translate"]);

      var geoPath = d3.geoPath()
        .projection(projection);

      //for each non blank state, create a group which will hold the line chart
      var chartWidth = mapSizes[pageSize]["chartWidth"]
      var chartMargin = mapSizes[pageSize]["chartMargin"]
      var map = mapSvg
        .selectAll(".state")
        .data(trendsDataNest)
        .enter()
        .append("g")
        .attr("class", function(d){ return "state " + d.key })
        .attr("transform", function(d,i){
          //grab the element in statesData corresponding to the correct trendsData state, and position accordingly
          var tmp = stateData.features.filter(function(o) {  return o.properties.abbr == d.key} )
          return "translate(" + geoPath.centroid(tmp[0]) + ")"
        })
      map
        .on("click", function() { 
          var clickedState = d3.select(this).attr("class").split(" ")[1]
          updateStateLine(clickedState)
          updateLineGraph(selectedCategory)
            // console.log(selectedCategory)
        })
        .on("mouseover", function() {
          // console.log('hover')
          var hoveredState = d3.select(this).attr("class").split(" ")[1]
          var hoveredStateName = trendsDataFull.filter(function(d) { 
            return d.State == hoveredState
          })
          // console.log(hoveredStateName)
          d3.select(".standard.line." + hoveredState)
            // .data(hoveredStateName)
            .classed("hovered-state", true)
        })
        .on("mouseout", function() {
          // console.log('hover')
          var hoveredState = d3.select(this).attr("class").split(" ")[1]
          d3.select(".standard.line." + hoveredState)
            .classed("hovered-state", false)
          // d3.selectAll(".state-name")
          //   .html("")
        })

console.log(trendsDataNestBlank)

      //draw greyed out blank states for HI and DC
        var blank = mapSvg
          .selectAll(".blank")
          .data(trendsDataNestBlank)
          .enter()
          .append("g")
          .attr("class","blank")
          .attr("transform", function(d,i){ 
            var tmp = stateData.features.filter(function(o) { console.log( d.key); return o.properties.abbr == d.key} )
            return "translate(" + geoPath.centroid(tmp[0]) + ")"
          })
          // .attr("transform", function(d,i){
          //   return "translate(" + geoPath.centroid(d) + ")"
          // })

      //blank sate background
      blank.append("rect")
        .attr("width",chartWidth-2*chartMargin + 8)
        .attr("height",chartWidth-2*chartMargin + 8)
        .attr("x",chartMargin - 4)
        .attr("y",chartMargin - 4)
        .style("fill","#b3b3b3") 

      //chart background
      map.append("rect")
        .attr("width",chartWidth-2*chartMargin + 8)
        .attr("height",chartWidth-2*chartMargin + 8)
        .attr("x",chartMargin - 4)
        .attr("y",chartMargin - 4)
        .style("fill","#9d9d9d") 
        .attr("class", "nonblank-rect")



      //set up scales for charts. THe code here assumes all states are on the same x/y scale. Alaska and the US avg will prob need to have special scales written for them, since they will be on a separate scale (I think). Also note currently there is no US average chart/tile.
      var mapX = d3.scaleLinear().range([chartMargin, chartWidth-chartMargin]);
      var mapY = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]);

//       var rectWidth = d3.select(".state").attr("width")
// console.log(rectWidth)
//       map.append("rect")
//           .attr("width",chartWidth-2*chartMargin + 8)
//        //   .attr("height",(chartWidth-2*chartMargin + 8)/2)
//           .attr("height", function() {
//             // console.log(mapY(1));
//             return (rectWidth - mapY(1) - chartMargin/2)
//             //return (mapY(1) - rectWidth + chartMargin/2)
//           })
//           .attr("x",chartMargin - 4)
//           .attr("y",chartMargin - 4)
//           .attr("class", "positive-area")
      //this is just for the file uploader, setting the key onload to whatever column is first in the data file, other than State/Year. In the real feature, firstKey will just be a constant
      var firstKey = "adj_revratio_all"
      var keys = Object.keys(trendsData[0])

      mapX.domain([startYear,endYear]);
      // console.log(startYear+ endYear)

      mapY.domain([d3.min(trendsDataFiltered, function(d) { return d[firstKey]; }), d3.max(trendsDataFiltered, function(d) { return d[firstKey]; })]); 



      //line chart axes
      var mapXAxis = d3.axisBottom(mapX)
      var mapYAxis = d3.axisLeft(mapY)

      //line chart line
      var mapline = d3.line()
        .x(function(d) { return mapX(d.Year); })
        .y(function(d) { return mapY(d[firstKey]); });

      //A white line at y=1. This is just a placeholder. In the final feature, we want some sort of distinction of y=1 for the ratio graphs, but not the level graphs. Will likely be two rects (above and below y=1) instead of a line, but TBD
      map.append("line")
        .attr("x1",chartMargin)
        .attr("x2",chartWidth-chartMargin)
        .attr("y1",mapY(1))
        .attr("y2",mapY(1))
        .attr("class", function(d) {
          return "ratioOneLine ratioOneLine-" + d.State
        })

      //draw the line on the chart!
      map.append("path")
        .attr("class", function(d){ return "standard line " + d.key })
        .attr("d", function(d){  return mapline(d.values)})

      //see drawBackMapCurtain for explanation--draw a "curtain" on top of the line, which can be animated away to simulate the line animating left to right
      map.append("rect")
        .attr("class","mapCurtain")
        .attr("width",chartWidth-2*chartMargin)
        .attr("height",chartWidth-2*chartMargin)
        .attr("x",chartMargin)
        .attr("y",chartMargin)
        .style("fill","#9d9d9d")

      //draw the state name on the tile
      map.append("text")
        .text(function(d){ return d.key })
        .attr("class", "mapLabel standard")
        .attr("text-anchor", "end")
        .attr("x",chartWidth+chartMargin - 25)
        .attr("y",chartWidth+chartMargin - 25)

      //draw state names, with a different class, on blank tiles
      // blank.append("text")
      //   .text(function(d){ return d.properties.abbr })
      //   .attr("class", "mapLable blank")
      //   .attr("text-anchor", "end")
      //   .attr("x",chartWidth+chartMargin - 25)
      //   .attr("y",chartWidth+chartMargin - 25)

      //add the X axis 
      map.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (chartWidth-chartMargin) + ")")
        .call(mapXAxis);

      //add the Y Axis
      map.append("g")
      .attr("class", function(d){ return "y axis " + d.key})
      .attr("transform", "translate(" + chartMargin + ",0)")
      .call(mapYAxis);

      //draw back the curtain, animating the line on load
      drawBackMapCurtain(0)
    }

    /*IF ADJUSTED IS CHECKED*/
    var adjusted = "adj_"

    function checkAdjusted() {
      if (d3.select('#adjusted-checkbox').property('checked') == true) { console.log('adj')
        adjusted = "adj_";
        selectedCategory = adjusted + d3.select(".current").attr("id") + selectedToggles;
        // console.log(selectedCategory)
        selectedToggles == "" ? removeGraphLine() :  updateLineGraph(selectedCategory)
        selectedToggles == "" ? removeMapAttributes() : updateMapLine(selectedCategory, startYear, endYear) 
        

      } else {
        // console.log("not adjusted")
          adjusted = ""
          selectedCategory = adjusted + d3.select(".current").attr("id") + selectedToggles;
          // console.log(selectedCategory)
          updateLineGraph(selectedCategory)
          updateMapLine(selectedCategory, startYear, endYear)
        }
    }


    d3.select("#adjusted-checkbox").on("change", checkAdjusted)



    /*SWITCHING BETWEEN TABS*/

   
      d3.selectAll(".top-tab")
        .on("click", function(d){  
          d3.selectAll(".top-tab").classed('current', false)
          d3.select(this).classed('current', true)
          d3.select(".switch-main-text")
            .text(function() { 
            return toggleText[0][d3.select(".current").attr("id") + selectedToggles];
          })
          checkAdjusted();
          //selectedCategory = adjusted + d3.select(this).attr('id') + selectedToggles;
        //  updateLineGraph(selectedCategory)
        //  updateMapLine(selectedCategory, startYear, endYear)
        })

    /*TOGGLE BUTTONS*/
    var selectedToggles = "all";

    var combinedClassesArray = []

  //ADD CLASS OF EACH TOGGLE THAT IS ON TO COMBINEDCLASSESARRAY ABOVE
    function getCombinedClasses() {
      combinedClassesArray.length = 0;
       d3.selectAll(".button_toggle.on")
              .each(function(d, i) { //get class of each toggle that is still turned on and add it to the combinedClasses array
                var toggleClass = d3.select(this).attr('class').split(" ")[0];
                // console.log(combinedClassesArray)
                combinedClassesArray.push(toggleClass);
              })
      var initialSelectedToggles = combinedClassesArray.join('')
      initialSelectedToggles == "lostfe" ? selectedToggles = "all" : selectedToggles = initialSelectedToggles
      var selectedText = combinedClassesArray.join('')
      // console.log(selectedToggles)
    }

  // WHEN CLICKING ON EACH TOGGLE:
    d3.selectAll(".button_toggle")
      .on('click', function() {
      //FOR ADJUSTED VALUES
        if(d3.select(this).classed("on")){ 
          d3.select(this).classed("on", false)
          d3.select(this).classed("off", true)
          getCombinedClasses();
          d3.select(".switch-main-text")
            .text(function() { 
            return toggleText[0][d3.select(".current").attr("id") + selectedToggles];
          })
          checkAdjusted();

        }
        else { console.log('hi')
          d3.select(this).classed("on", true)
          d3.select(this).classed("off", false)
          getCombinedClasses();
          d3.select(".switch-main-text")
            .text(function() { 
            return toggleText[0][d3.select(".current").attr("id") + selectedToggles];
          })
          checkAdjusted();
        }

      }) 
  //WHEN CLICKING ON CLOSE SIGN UNDER SELECTED STATE LIST
    d3.selectAll(".close-sign")
      .on('click', function() { console.log('hi')
        console.log(d3.select(this).attr('class'))
      })

  //WHEN CLICKING ON CLEAR ALL UNDER SELECTED STATE LIST
    d3.select(".state-clear")
      .on('click', function() {
        d3.selectAll(".state-item")
        .remove();
        d3.selectAll(".lineChart-details, .lineChart-notes-under")
          .classed("show", false)
        d3.select(".lineChart-notes-above")
          .classed("show", true)
        d3.selectAll(".selected-state")
          .classed("selected-state", false)
        d3.selectAll(".line-state")
          .remove()
      })

    function addStateList(state) { 
      d3.selectAll(".lineChart-details, .lineChart-notes-under")
        .classed("show", true)
      d3.select(".lineChart-notes-above")
        .classed("show", false)
      var stateItem = d3.select("#state-list")
        .append("li")
          .html(state)
        .attr("class", "state-item item-" + state);
      stateItem.append("div")
        .attr("class", "close-sign close-sign-" + state)

    }

    function removeStateList(state) {
      d3.select(".item-" + state)
        .remove();
        console.log(d3.select(".state-item").size())
      if (d3.select(".state-item").size() == 0) {
        d3.selectAll(".lineChart-details, .lineChart-notes-under")
          .classed("show", false)
        d3.select(".lineChart-notes-above")
          .classed("show", true)
      }
    }
    

    //ADJUSTS LINE GRAPH TO ACCOMMODATE CHANGING Y-AXIS DUE TO ADDITION OR REMOVAL OF STATE LINES
    function updateLineGraph(variable) {
      //IF ALL TOGGLES WERE TURNED OFF BEFORE, THIS ENSURES THAT OPACITY IS RESET TO 1
      if (d3.selectAll(".line-USA, .line-state").attr("opacity") == 0) {
        // console.log('zero')
      graphSvg.selectAll(".line-USA, .line-state, .threshold")
            // .transition()
            // .duration(1200)
            .attr("opacity", 1)
      }

      var graphDataSelected = trendsDataFull.filter(function(d) {           
       if ((stateLinesArray.includes(d.State)) || (d.State == "USA")) {         
         return d;              
       }         
      })


     var graphDataNest = d3.nest()
      .key(function(d) {return d.State;})
      .entries(graphDataSelected);


      var graphWidth =  graphSizes[pageSize]["width"]- graphMargin.left - graphMargin.right,
          graphHeight = graphSizes[pageSize]["height"] - graphMargin.top - graphMargin.bottom;

      d3.select("#lineChart svg")
        .select("g")
        .data(trendsDataFiltered)

      var graphX = d3.scaleTime().range([0, graphWidth]);
      var graphY = d3.scaleLinear().range([graphHeight, 0]);
      var max = d3.max(trendsDataFiltered, function(d) { return d[variable]; })
      var min = d3.min(trendsDataFiltered, function(d) { return d[variable]; })

      graphX.domain(d3.extent(trendsDataFiltered, function(d) { return d.Year; }));
      graphY.domain([d3.min(trendsDataFiltered, function(d) {return d[variable]; }), d3.max(trendsDataFiltered, function(d) {return d[variable]; })]);

      var graphLine = d3.line()
        .x(function(d) { return graphX(d.Year); })
        .y(function(d) { return graphY(d[variable]); });

      d3.selectAll("#lineChart .y.graphAxis")
          .transition().duration(1200).ease(d3.easeSinInOut)
          .call(d3.axisLeft(graphY)
            .ticks(5)
            .tickFormat(d3.format('.2f')));

      d3.selectAll(".line-USA, .line-state")
        .transition()
        .duration(1200)
          // .attr("d", graphLine)
        .attr("d", function(d) { d.graphLine = this;
          // console.log(graphLine(d[0].values))
            return (graphLine(d[0].values));
          });

    
      
      var threshold = d3.select(".threshold")
       .attr("x1", 0)
       .attr("y1", graphY(1))
       .attr("x2", graphWidth)
       .attr("y2", graphY(1))
       // .attr("stroke", "#5c5859");
       // .attr("class", "threshold")
       d3.select(".threshold")
        // .transition()
        // .delay(200)
        // .duration(1200)
          .attr("d", threshold)

      drawVoronoi(graphDataNest)

    }
    function updateMapLine(variable, startYear, endYear){
  // console.log(variable)

      //reshape the data
      var trendsData = d3.select("#vis").datum()
      var trendsDataNest = d3.nest()
        .key(function(d) {return d.State;})
        .entries(trendsData);

      var chartWidth = mapSizes[pageSize]["chartWidth"]
      var chartMargin = mapSizes[pageSize]["chartMargin"]
  // console.log(trendsDataNest)
      //update data binding
      map = d3.select("#vis svg")
        .selectAll(".state")
        .data(trendsDataNest)

      //update scales
      var mapX = d3.scaleLinear().range([chartMargin, chartWidth-chartMargin]);
      var mapY = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]);

      mapX.domain([startYear,endYear]);

      //min and max value for scales determined by min/max values in all data (so they're the same for all states)
      var mapY = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin])
      var max = d3.max(trendsDataFiltered, function(d) { return d[variable]; })
      var min = d3.min(trendsDataFiltered, function(d) {return d[variable]; })

      mapY.domain([min, max]); 

      //udpdate line function
      var mapline = d3.line()
        .x(function(d) { return mapX(d.Year); })
        .y(function(d) { return mapY(d[variable]); });

      var mapYAxis = d3.axisLeft(mapY)

      //animate y axis change. Note most y axes are hidden, but axis in key will change
      //note it's assumed that startyear/endyear don't change when variables are changed, so no need to animate x axis update
      d3.selectAll("#vis .y.axis")
        .transition()
          .call(mapYAxis)

      //update the line. In some cases may need to drawBackMapCurtain here (see below)
      map.selectAll("#vis svg .line")
        // .transition()
        // .duration(1200)
          .attr("d", function(d){
            return mapline(d.values)
          })


      //move y=1 line. Note this will need to be hidden (or whatever comparable elements exist will be hidden) for the levels graphs
      d3.selectAll(".ratioOneLine")
          .style("opacity", function() {
          return (d3.select("#revpp_").classed("current") == true) ?  0 : 1;

        })
        .transition()
        .duration(1200)
          .attr("y1",mapY(1))
          .attr("y2",mapY(1))

      var rectWidth = d3.select("rect.nonblank-rect").attr("width")
      var chartWidth = mapSizes[pageSize]["chartWidth"]
      var chartMargin = mapSizes[pageSize]["chartMargin"]

  



      //pretty sure this line can be remove, since x axis/scales aren't changing (as can all other references to x scale in this function), but keeping here in case it turns out the scales will change with different variabels (in which case you'll need to add some more code to animate the x axes etc)
      var mapXAxis = d3.axisBottom(mapX)

      drawBackMapCurtain(0)

    }





    function drawBackMapCurtain(delay){
    //To create the illusion of the lines in the chart animating across the chart area (left to right, small to large X values), I created a "curtain" which is a rect covering the line chart. Then, by animating it's width to 0, the animation effect is simulated. I would imagine that when the user switches between different units, on the graphs, e.g. when they switch from dollars to ratios, the curtain should draw back. On the other hand, if a user switches between combinations of state/local/federal, or toggles the adjustment on/off, the curtain should not draw back. Does that sound right to you?

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
    }


    function removeMapAttributes() { 
    //To create the illusion of the lines in the chart animating across the chart area (left to right, small to large X values), I created a "curtain" which is a rect covering the line chart. Then, by animating it's width to 0, the animation effect is simulated. I would imagine that when the user switches between different units, on the graphs, e.g. when they switch from dollars to ratios, the curtain should draw back. On the other hand, if a user switches between combinations of state/local/federal, or toggles the adjustment on/off, the curtain should not draw back. Does that sound right to you?

      d3.selectAll(".standard.line, .positive-area")
       .transition()
       .duration(0)
       .attr("opacity", 1)
        .transition()
        .delay( 200)
        .duration(1200)
        .attr("opacity", 0)

  // console.log('remove')
       d3.selectAll(".ratioOneLine")
        .classed("hidden", true)
     
    }


    function removeGraphLine() {
      // console.log('remove')

      d3.selectAll(".line-USA, .line-state")
       .transition()
       .duration(0)
       .attr("opacity", 1)
        .transition()
        .delay( 200)
        .duration(1200)
        .attr("opacity", 0)
      

    }

  //ADDS NEW STATE LINE AND UPDATES STATE ARRAY
    function updateStateLine(state) {
      // console.log(state)
      var graphDataState = trendsDataFull.filter(function(d) { 
        return d.State == state
      })

     var graphDataStateNest = d3.nest()
      .key(function(d) {return d.State;})
      .entries(graphDataState);
  // console.log(graphDataStateNest)
      //IF LINE HASN'T BEEN ADDED YET TO THE GRAPH:
      if ($(".line-" + state).length == 0) {
        // console.log(state)
        stateLinesArray.push(state); // ADD NEW STATE TO ARRAY 
          // console.log(stateLinesArray)

        graphSvg.append("path")
          .data([graphDataStateNest])
          .attr("class", "line-state line-" + state)
         // .attr("d", graphLine);
          .attr("d", function(d) {
            d.graphLine = this;
            // console.log(graphLine(d[0].values))
              return (graphLine(d[0].values));
            });
        // graphSvg.append("path")
        //       .data([graphDataState])
        //       .attr("class", "line-state line-" + state)
        //       .attr("d", graphLine)
      } else {
        // console.log(state)
          for (var i= stateLinesArray.length-1; i>=0; i--) { //DELETE EXISTING STATE IN ARRAY
              if (stateLinesArray[i] === state) {
                  stateLinesArray.splice(i, 1);
              }
          }
          // console.log(stateLinesArray)

        graphSvg.select("path.line-" + state) 
          .remove()
      }
      
      d3.select(".standard.line." + state)
        .classed("selected-state", function(){
          if (d3.select(".standard.line." + state).classed("selected-state") == true) {
            // console.log('hi')
            removeStateList(state);
            return false
          } else {
            addStateList(state);
            return true;            
          }
         })
    }

    

      renderGraph();
      renderMap(1995, 2014);

  })
})

