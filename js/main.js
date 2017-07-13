
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
var startYear = 1995;
var endYear = 2015;

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

var RATIO_FORMAT = d3.format(".2f")

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
      d.adj_revratio_ = 1;
      d.revratio_ = 1;
      d.adj_revpp_ = 0;
      d.revpp_ = 0;
    });
    //FILTERING DATA FOR MAP TO NOT INCLUDE USA
    var trendsData = trendsDataFull.filter(function(d) { 
      return d.State !== "USA"
    })

    var trendsDataFiltered = trendsDataFull.filter(function(d) { 
      if (selectedCategory.includes("revratio")) {
        return d.State !== "AK" && d.State !== "HI" && d.State !== "DC"
      }else {
        return d.State;
      }
    })

    var trendsDataAK = trendsDataFull.filter(function(d) { 
      if (selectedCategory.includes("revratio")) {
        return d.State == "AK"
      }else {
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
      //ADD GRIDLINES
      graphSvg.append("g")     
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-graphWidth)
            .tickFormat("")
        )
      
      function make_y_gridlines() {   
          return d3.axisLeft(graphY)
              .ticks(5)
      }


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
        .ticks(20)
        //.ticks(5)
        .tickFormat(d3.format('')))
      //ADD MAJOR AND MINOR TICKS ON X-AXIS
      d3.selectAll('.x.graphAxis .tick').each(function(d, i) {  
         // every 4th is 'major' without .minor class
         d3.select(this).classed('minor', (i % 5 !== 0));
      });
      d3.selectAll('.x.graphAxis .tick.minor text').each(function(d, i) {  
         // every 4th is 'major' without .minor class
         d3.select(this).classed('minor', (i % 5 !== 0));
      });

      // Add the Y Axis
      graphSvg.append("g")
        .attr("class", "y graphAxis")
        .call(d3.axisLeft(graphY)
        .ticks(5)
        .tickFormat(d3.format('.2f')))


      drawVoronoi(trendsDataNest, selectedCategory, graphY);

      var threshold = graphSvg.append("line")
        .attr("x1", 0)
        .attr("y1", graphY(1))
        .attr("x2", graphWidth)
        .attr("y2", graphY(1))
        .style("stroke-dasharray", 5)
        .attr("stroke", "#5c5859")
        .attr("class", "threshold")

    }


    function drawVoronoi(data, variable, yScale) {
      // console.log('voronoi', variable, data)
      var voronoi = d3.voronoi()
        .x(function(d) { return graphX(d.Year); })
        .y(function(d) { return yScale(d[variable]); })
        .extent([[-graphMargin.left, -graphMargin.top], [graphWidth + graphMargin.right, graphHeight + graphMargin.bottom]]);


      // graphSvg.classed("voronoi--show", true)
      voronoiGroup = graphSvg.selectAll(".voronoi")
        .data(voronoi.polygons(d3.merge(data.map(function(d) { 
          return d.values; 
        }))))

      voronoiGroup.exit().remove()

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
      d3.select(".line-" + d.data.State).classed("line-hover", true);
    }

    function mouseout(d) {
      d3.select(".line-" + d.data.State).classed("line-hover", false);
    }

    //CREATE INITIAL MAP ON LOAD
    function  renderMap() {
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
          var tmp = stateData.features.filter(function(o) { return o.properties.abbr == d.key} )
          return "translate(" + geoPath.centroid(tmp[0]) + ")"
        })
      map
        .on("click", function() { 
          adjusted = (d3.select('#adjusted-checkbox').property('checked') == true) ? "adj_" : ""
          var newCategory = adjusted + d3.select(".current").attr("id") + selectedToggles;
          var clickedState = d3.select(this).attr("class").split(" ")[1]
          d3.select(".nonblank-rect." + clickedState)
            .classed("selected-state", function(){
              if (d3.select(".nonblank-rect." + clickedState).classed("selected-state") == true) {
                // console.log('hi')
                removeStateList(clickedState);
                return false
              }else { 
                addStateList(clickedState);
                return true;            
              }
            })
          d3.select(".mapLabel.standard." + clickedState)
            .classed("selected-text", function(){
              if (d3.select(".mapLabel.standard." + clickedState).classed("selected-text") == true) {
                // console.log('hi')
                return false
              }else { 
                return true;            
              }
            })
          updateStateLine(clickedState, clickedState)
          updateLineGraph(newCategory, newCategory, "click", clickedState)
          // console.log(selectedCategory)
        })
        .on("mouseover", function() {
          var newCategory = adjusted + d3.select(".current").attr("id") + selectedToggles;
          var hoveredState = d3.select(this).attr("class").split(" ")[1]
          var hoveredStateName = trendsDataFull.filter(function(d) { 
            return d.State == hoveredState
          })
          d3.select(".nonblank-rect." + hoveredState)
            .classed("hovered-state", true)
          d3.select(".mapLabel.standard." + hoveredState)
            .classed("hovered-text", true)
          updateStateLine(hoveredState)
          updateLineGraph(newCategory, newCategory, "hover", hoveredState)

        })
        .on("mouseout", function() {
          var newCategory = adjusted + d3.select(".current").attr("id") + selectedToggles;
          var hoveredState = d3.select(this).attr("class").split(" ")[1]
          d3.select(".nonblank-rect." + hoveredState)
            .classed("hovered-state", false)
          d3.select(".nonblank-rect." + hoveredState)
            .style("fill", function(){
              if (d3.select("#revratio_").classed("current") == true){
                if (d3.select(".nonblank-rect." + hoveredState).classed("selected-state") == true)  {
                  return "#353535"
                } return "#a2d3eb"
              }else if (d3.select("#revpp_").classed("current") == true){
                if (d3.select(".nonblank-rect." + hoveredState).classed("selected-state") == true)  {
                 return "#fbbe15"
                } return "#094c6a"
              }
            })
          d3.select(".mapLabel.standard." + hoveredState)
            .style("fill", function(){
              if (d3.select("#revratio_").classed("current") == true){
                if (d3.select(".mapLabel.standard." + hoveredState).classed("selected-text") == true)  {
                  return "#ffffff"
                } return "#353535"
              }else if (d3.select("#revpp_").classed("current") == true){
                if (d3.select(".mapLabel.standard." + hoveredState).classed("selected-text") == true)  {
                 return "#353535"
                } return "#ffffff"
              }
            })
          // d3.selectAll(".state-name")
          //   .html("")
          //IF LINE IS ADDED THEN REMOVE
          if (d3.select(".nonblank-rect." + hoveredState).classed("selected-state") == false) {
            // console.log('remove')
            for (var i= stateLinesArray.length-1; i>=0; i--) { //DELETE EXISTING STATE IN ARRAY
              if (stateLinesArray[i] === hoveredState) { 
                stateLinesArray.splice(i, 1);
              }
            }
            graphSvg.select("path.line-" + hoveredState) 
              .remove()
          }
          d3.select(".mapLabel.standard." + hoveredState)
            .classed("hovered-text", false)
          updateLineGraph(newCategory, newCategory, "remove", hoveredState)
        })

      // console.log(trendsDataNestBlank)

      // //draw greyed out blank states for HI and DC
      var blank = mapSvg
        .selectAll(".blank")
        .data(trendsDataNestBlank)
        .enter()
        .append("g")
        .attr("class","blank")
        .attr("transform", function(d,i){
          //grab the element in statesData corresponding to the correct trendsData state, and position accordingly
          var tmp = stateData.features.filter(function(o) { return o.properties.abbr == d.key} )
          return "translate(" + geoPath.centroid(tmp[0]) + ")"
        })


      //blank sate background
      blank.append("rect")
        .attr("width",chartWidth-2*chartMargin + 8)
        .attr("height",chartWidth-2*chartMargin + 8)
        .attr("x",chartMargin - 4)
        .attr("y",chartMargin - 4)
        .style("fill","#b3b3b3") 
      blank.append("text")
        .text(function(d){ return d.key })
        .attr("class", function(d) {
          return "mapLabel standard " + d.key
        })
        .attr("text-anchor", "end")
        .attr("x",chartWidth+chartMargin - 25)
        .attr("y",chartWidth+chartMargin - 25)

      //chart background
      map
        .append("rect")
        .attr("width",chartWidth-2*chartMargin + 8)
        .attr("height",chartWidth-2*chartMargin + 8)
        .attr("x",chartMargin - 4)
        .attr("y",chartMargin - 4)
        .style("fill","#a2d3eb") 
        .attr("class", function(d) { 
          return "nonblank-rect " + d.key
        })

      //set up scales for charts. THe code here assumes all states are on the same x/y scale. Alaska and the US avg will prob need to have special scales written for them, since they will be on a separate scale (I think). Also note currently there is no US average chart/tile.
      var mapX = d3.scaleLinear().range([chartMargin, chartWidth-chartMargin]);
      var mapY = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]);
      var mapY2 = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]);


      //this is just for the file uploader, setting the key onload to whatever column is first in the data file, other than State/Year. In the real feature, firstKey will just be a constant
      var firstKey = "adj_revratio_all"
      var keys = Object.keys(trendsData[0])

      mapX.domain([startYear,endYear]);
      // console.log(startYear+ endYear)
      //NEED TWO Y-AXES:
      //ALL STATES EXCEPT AK
      mapY.domain([d3.min(trendsDataFiltered, function(d) { return d[firstKey]; }), d3.max(trendsDataFiltered, function(d) { return d[firstKey]; })]); 
      //AK ONLY
      var min2 = d3.min([1, d3.min(trendsDataAK, function(d) {return d[firstKey]; })]);
      var max2 = d3.max(trendsDataAK, function(d) { return d[firstKey]; })
      mapY2.domain([min2, max2]); 


      //line chart axes
      var mapXAxis = d3.axisBottom(mapX)
      var mapYAxis = d3.axisLeft(mapY)

      //for each map chart line
      var mapline = d3.line()
        .x(function(d) { return mapX(d.Year); })
        .y(function(d) { return mapY(d[firstKey]); });
      var mapline2 = d3.line()
        .x(function(d) { return mapX(d.Year); })
        .y(function(d) { return mapY2(d[firstKey]); });

     // A white line at y=1. This is just a placeholder. In the final feature, we want some sort of distinction of y=1 for the ratio graphs, but not the level graphs. Will likely be two rects (above and below y=1) instead of a line, but TBD
      //DRAWING THE RATIO LINE FOR ALL STATES BUT AK
      d3.selectAll(".state:not(.AK)").append("line")
        .attr("x1",chartMargin)
        .attr("x2",chartWidth-chartMargin)
        .attr("y1",mapY(1))
        .attr("y2",mapY(1))
        .attr("class", function(d) {
          return "ratioOneLine ratioOneLine-" + d.key
        })
      //DRAWING THE RATIO LINE FOR AK
      d3.select(".state.AK").append("line")
        .attr("x1",chartMargin)
        .attr("x2",chartWidth-chartMargin)
        .attr("y1",mapY2(1))
        .attr("y2",mapY2(1))
        .attr("class", function(d) {
          return "ratioOneLine ratioOneLine-" + d.key
        })

      //DRAWING THE GRAPH LINE FOR ALL STATES BUT AKK
      d3.selectAll(".state:not(.AK)").append("path")
        .attr("class", function(d){ return "standard line " + d.key })
        .attr("d", function(d){  return mapline(d.values)})
      //DRAWING THE GRAPH LINE FOR AK
      d3.select(".state.AK").append("path")
        .attr("class", function(d){ return "standard line " + d.key })
        .attr("d", function(d){  return mapline2(d.values)})
      //NEED TO HIDE THE GRAPH LINE FOR DC AND HI FOR THE RATIO TAB
      map.selectAll(".standard.line.DC, .standard.line.HI")
        .style("opacity", function() {
          return (d3.select("#revpp_").classed("current") == true) ?  1 : 0;
        })


    //  see drawBackMapCurtain for explanation--draw a "curtain" on top of the line, which can be animated away to simulate the line animating left to right
      map.append("rect")
        .attr("class", function(d) {
          return "mapCurtain " + d.key 
        })
        .attr("width",0)
        .attr("height",chartWidth-2*chartMargin)
        .attr("x",0)
        .attr("y",chartMargin)
        .style("fill", "#a2d3eb")

      //draw the state name on the tile
      map.append("text")
        .text(function(d){ return d.key })
        .attr("class", function(d) {
          return "mapLabel standard " + d.key
        })        
        .attr("text-anchor", "end")
        .attr("x",chartWidth+chartMargin - 25)
        .attr("y",chartWidth+chartMargin - 25)

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

      d3.select("#vis")
        .append("div")
        .attr("id", "ak-disclaimer")
        .html("Alaska data are displayed on a separate y axis scale (from <span id =\"ak-min\">" + RATIO_FORMAT(min2)+ "</span> to <span id =\"ak-max\">" + RATIO_FORMAT(max2) + "</span>) from the other 49 states.")

    }

    /*IF ADJUSTED IS CHECKED*/
    var adjusted = "adj_"

    function checkAdjusted() {
      adjusted = (d3.select('#adjusted-checkbox').property('checked') == true) ? "adj_" : ""
      var newCategory = adjusted + d3.select(".current").attr("id") + selectedToggles;
      updateLineGraph(newCategory, selectedCategory, "toggle", null)
      updateMapLine(newCategory, selectedCategory)
    }


    d3.select("#adjusted-checkbox").on("change", checkAdjusted)



    // /*SWITCHING BETWEEN TABS*/


    d3.selectAll(".top-tab")
      .on("click", function(d){  
        d3.selectAll(".top-tab").classed('current', false)
        d3.select(this).classed('current', true)
        var currentTab = d3.select(this).attr("id")
        d3.select(".switch-main-text")
          .text(function() { 
            return toggleText[0][d3.select(".current").attr("id") + selectedToggles];
          })
        checkAdjusted();
        drawBackMapCurtain(0, currentTab)
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

        }else {
           // console.log('hi')
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
    //WHEN CLICKING ON STATE, ADD TAG TO BOTTOM OF LINE GRAPH
    function addStateList(state) { 
      d3.selectAll(".lineChart-details, .lineChart-notes-under")
        .classed("show", true)
      d3.select(".lineChart-notes-above")
        .classed("show", false)
      var stateItem = d3.select("#state-list")
        .datum(state)
        .append("li")
        .html(state)
        .attr("class", "state-item item-" + state);
      stateItem.append("div")
        .attr("class", "close-sign close-sign-" + state)
        // .on('click', function(d) {
        //   removeStateList(d)
        // })
        .on("click", function(d) { 
          removeStateList(d)
          adjusted = (d3.select('#adjusted-checkbox').property('checked') == true) ? "adj_" : ""
          var newCategory = adjusted + d3.select(".current").attr("id") + selectedToggles;
          updateLineGraph(newCategory, newCategory, "remove", d)
        })
    }

    function removeStateList(state) {
      d3.select(".item-" + state)
        .remove();
      d3.select(".line-state.line-" + state)
        .remove()
      d3.selectAll("g.state." + state + " .selected-state")
        .classed("selected-state", false)
      if (d3.select(".state-item").size() == 0) {
        d3.selectAll(".lineChart-details, .lineChart-notes-under")
          .classed("show", false)
        d3.select(".lineChart-notes-above")
          .classed("show", true)
      }
    }


    function updateScales(variable, oldVariable){ 
      var domainController;
      if(variable != "adj_revratio_" && variable != "revratio_" && variable != "revpp_" && variable != "adj_revpp_"){
        domainController = variable;
        selectedCategory = variable;
      }else{
        if(variable != oldVariable){
          //blank variable, from changing toggles
          domainController = oldVariable;
        }else{
          //blank variable, from clicking on state
          domainController = selectedCategory;
        }
      }
      var trendsDataMinMax = trendsDataFull.filter(function(d) { 
        if (selectedCategory.includes("revratio")) {
          if (d3.select(".standard.line.AK.selected-state").node() !== null) { 
            // console.log('AK')
            return d.State !== "HI" && d.State !== "DC"
          }else{
            // console.log('no AK')
            return d.State !== "AK" && d.State !== "HI" && d.State !== "DC"
          }
        }else {
          return d.State;
        }
      })

      var trendsDataAK = trendsDataFull.filter(function(d){
        return d.State ==  "AK"
      })


      var graphDataSelected = trendsDataFull.filter(function(d) {           
        if ((stateLinesArray.includes(d.State)) || (d.State == "USA")) {         
          return d;              
        }         
      })


      var graphDataNest = d3.nest()
        .key(function(d) {return d.State;})
        .entries(graphDataSelected);

      var akNest = d3.nest()
        .key(function(d) {return d.State;})
        .entries(trendsDataAK);


      var graphWidth =  graphSizes[pageSize]["width"]- graphMargin.left - graphMargin.right,
      graphHeight = graphSizes[pageSize]["height"] - graphMargin.top - graphMargin.bottom;

      d3.select("#lineChart svg")
        .select("g")
        .data(trendsDataFiltered)

      var graphY = d3.scaleLinear().range([graphHeight, 0]);
      var graphY2 = d3.scaleLinear().range([graphHeight, 0]);

      var max = d3.max(trendsDataMinMax, function(d) { return d[domainController]; })
      var min = (domainController.search("ratio") != -1) ? d3.min(trendsDataMinMax, function(d) {return d[domainController]; }) : 0;


      var max2 = d3.max(trendsDataAK, function(d) { return d[domainController]; })
      var min2 = (domainController.search("ratio") != -1) ? d3.min([1, d3.min(trendsDataAK, function(d) {return d[domainController]; })]) : 0;

      if(max > max2){
        max2 = max;
        min2 = min;
      }
      if(min < min2){
        min2 = min;
      }



      graphY.domain([min, max]);
      graphY2.domain([min2, max2])

      var graphLine = d3.line()
        .x(function(d) { return graphX(d.Year); })
        .y(function(d) { return graphY(d[variable]); });

      var graphLine2 = d3.line()
        .x(function(d) { return graphX(d.Year); })
        .y(function(d) { return graphY2(d[variable]); });

      return {"graphY": graphY, "graphY2": graphY2, "graphLine": graphLine, "graphLine2":graphLine2, "graphDataNest": graphDataNest, "akNest": akNest}

    }


    //ADJUSTS LINE GRAPH TO ACCOMMODATE CHANGING Y-AXIS DUE TO ADDITION OR REMOVAL OF STATE LINES
    function updateLineGraph(variable, oldVariable, action, state) {
      var scales = updateScales(variable, oldVariable)
      var graphY = ( (state == "AK" && action != "remove") || d3.select("rect.AK").classed("selected-state")) ? scales.graphY2 : scales.graphY;
      var graphLine = ( (state == "AK" && action != "remove") || d3.select("rect.AK").classed("selected-state")) ? scales.graphLine2 : scales.graphLine
      var graphDataNest = ( (state == "AK" && action != "remove") || d3.select("rect.AK").classed("selected-state")) ? scales.akNest : scales.graphDataNest
      //IF ALL TOGGLES WERE TURNED OFF BEFORE, THIS ENSURES THAT OPACITY IS RESET TO 1
      if (d3.selectAll(".line-USA, .line-state").attr("opacity") == 0) {
        // console.log('zero')
        graphSvg.selectAll(".line-USA, .line-state, .threshold")
        // .transition()
        // .duration(1200)
        .attr("opacity", 1)
      }

      d3.selectAll("#lineChart .y.graphAxis")
        .transition().duration(1200).ease(d3.easeSinInOut)
        .call(d3.axisLeft(graphY)
        .ticks(5)
        .tickFormat(d3.format('.2f')));


      var duration = (action == "toggle" || state == "AK") ? 1200 : 0
      d3.selectAll(".line-USA, .line-state")
        .transition()
        .duration(duration)
        // .attr("d", graphLine)
        .attr("d", function(d) {
        // console.log(graphLine(d[0].values))
          return (graphLine(d[0].values));
        });

      var threshold = d3.select(".threshold")
        .transition()
        .duration(1200)
        .attr("y1", graphY(1))
        .attr("y2", graphY(1))

      threshold.node().parentNode.appendChild(threshold.node())
      d3.selectAll(".grid").node().parentNode.appendChild(d3.selectAll(".grid").node())

      if(action == "click"){
        drawVoronoi(graphDataNest, variable, graphY)
      }

   }
    function updateMapLine(variable, oldVariable){
      var domainController = (variable != "adj_revratio_" && variable != "revratio_" && variable != "revpp_" && variable != "adj_revpp_") ? variable : oldVariable;

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
      var mapY2 = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]);

      mapX.domain([startYear,endYear]);


      //min and max value for scales determined by min/max values in all data (so they're the same for all states)
      var max = d3.max(trendsDataFiltered, function(d) { return d[domainController]; })
      var min = (domainController.search("ratio") != -1) ? d3.min(trendsDataFiltered, function(d) {return d[domainController]; }) : 0;
      //FOR AK ONLY:
      var max2 = d3.max(trendsDataAK, function(d) { return d[domainController]; })
      var min2 = (domainController.search("ratio") != -1) ? d3.min([1, d3.min(trendsDataAK, function(d) {return d[domainController]; })]) : 0;

      if(max > max2){
        max2 = max;
        min2 = min;
        d3.select("#ak-disclaimer")
          .transition()
          .duration(1200)
          .style("opacity",0)
      }else{
        d3.select("#ak-min")
          .html(RATIO_FORMAT(min2))
        d3.select("#ak-max")
          .html(RATIO_FORMAT(max2))
        d3.select("#ak-disclaimer")
          .transition()
          .duration(1200)
          .style("opacity",1)
      }
      console.log(min, max)
      console.log(min2, max2)

      mapY.domain([min, max]); 
      mapY2.domain([min2, max2]);      

      //udpdate line function
      var mapline = d3.line()
        .x(function(d) { return mapX(d.Year); })
        .y(function(d) { return mapY(d[variable]); });
      var mapline2 = d3.line()
        .x(function(d) { return mapX(d.Year); })
        .y(function(d) { return mapY2(d[variable]); });

      var mapYAxis = d3.axisLeft(mapY)

      //animate y axis change. Note most y axes are hidden, but axis in key will change
      //note it's assumed that startyear/endyear don't change when variables are changed, so no need to animate x axis update
      d3.selectAll("#vis .y.axis")
        .transition()
        .call(mapYAxis)

      //update the line. In some cases may need to drawBackMapCurtain here (see below)
      map.selectAll("#vis svg .line:not(.AK)")
        .transition()
        .duration(1200)
        .attr("d", function(d){
          return mapline(d.values)
        })
      d3.select(".line.AK")
        .transition()
        .duration(1200)
        .attr("d", function(d){
          return mapline2(d.values)
        })

      //move y=1 line. Note this will need to be hidden (or whatever comparable elements exist will be hidden) for the levels graphs
      d3.selectAll(".ratioOneLine")
        .style("opacity", function() {
          return (d3.select("#revpp_").classed("current") == true) ?  0 : 1;
        })
        .transition()
        .duration(1200)
        .attr("y1",function(d){
          if(d3.select(this).classed("ratioOneLine-AK")){
            return mapY2(1)
          }else{
            return mapY(1)            
          }
        })
        .attr("y2",function(d){
          if(d3.select(this).classed("ratioOneLine-AK")){
            return mapY2(1)
          }else{
            return mapY(1)            
          }
        })

      //REMOVE BLANK BOXES AND MAKES LINES APPEAR FOR HI AND DC ON LEVELS TAB
      d3.selectAll(".blank")
        .style("opacity", function() {
          return (d3.select("#revpp_").classed("current") == true) ?  0 : 1;
        })
        .transition()
        .duration(1200)
        .attr("y1",mapY(1))
        .attr("y2",mapY(1))
      d3.selectAll(".standard.line.DC, .standard.line.HI")
        .style("opacity", function() {
          return (d3.select("#revpp_").classed("current") == true) ?  1 : 0;
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
    }





    function drawBackMapCurtain(delay, tab){
      //To create the illusion of the lines in the chart animating across the chart area (left to right, small to large X values), I created a "curtain" which is a rect covering the line chart. Then, by animating it's width to 0, the animation effect is simulated. I would imagine that when the user switches between different units, on the graphs, e.g. when they switch from dollars to ratios, the curtain should draw back. On the other hand, if a user switches between combinations of state/local/federal, or toggles the adjustment on/off, the curtain should not draw back. Does that sound right to you?
      d3.selectAll(".nonblank-rect")
        .style("fill", function() {
          if (tab == "revpp_") {
            return "#094c6a"
          } else {
            return "#a2d3eb"
          }
        })
      d3.selectAll(".nonblank-rect.selected-state")
        .style("fill", function() {
          if (tab == "revpp_") {
            return "#fbbe15" 
          } else {
            return "#353535"
          }
        })

      d3.selectAll(".mapLabel.standard")
        .style("fill", function() {
          if (tab == "revpp_") {
            return "#fff"
          } else {
            return "#353535"
          }
        })
      d3.selectAll(".mapLabel.standard.selected-text")
        .style("fill", function() {
          if (tab == "revpp_") {
            return "#353535"
          } else {
            return "#fff"
          }
        })
      var chartWidth = mapSizes[pageSize]["chartWidth"]
      var chartMargin = mapSizes[pageSize]["chartMargin"]

      d3.selectAll(".mapCurtain")
        .style("fill", function() {
          if (tab == "revpp_") {
            return "#094c6a"
          } else {
            return "#a2d3eb"
          }
        })
        .transition()
        .duration(0)
        .attr("width",chartWidth-2*chartMargin+4)
        .attr("x",chartMargin-2)
        .transition()
        .delay(delay + 200)
        .duration(1200)
        .attr("width",0)
        .attr("x", chartWidth - chartMargin + 4)
    }


    function removeMapAttributes() { 
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
      d3.select(".nonblank-rect." + state)
        .style("fill", function(){
          if (d3.select("#revratio_").classed("current") == true){
            if (d3.select(".nonblank-rect." + state).classed("selected-state") == true || d3.select(".nonblank-rect." + state).classed("hovered-state") == true )  {
              return "#353535"
            } return "#a2d3eb"
          }else if (d3.select("#revpp_").classed("current") == true){
            if (d3.select(".nonblank-rect." + state).classed("selected-state") == true || d3.select(".nonblank-rect." + state).classed("hovered-state") == true)  {
             return "#fbbe15"
            } return "#094c6a"
          }
        })
      d3.select(".mapLabel.standard." + state)
        .style("fill", function(){
          if (d3.select("#revratio_").classed("current") == true){
            if (d3.select(".mapLabel.standard." + state).classed("selected-text") == true || d3.select(".mapLabel.standard." + state).classed("hovered-text") == true)  {
              return "#ffffff"
            } return "#353535"
          }else if (d3.select("#revpp_").classed("current") == true){
            if (d3.select(".mapLabel.standard." + state).classed("selected-text") == true || d3.select(".mapLabel.standard." + state).classed("hovered-text") == true)  {
             return "#353535"
            } return "#ffffff"
          }
        })
      var adjusted = (d3.select('#adjusted-checkbox').property('checked') == true) ? "adj_" : ""
      var newCategory = adjusted + d3.select(".current").attr("id") + selectedToggles;

      var scales = updateScales(newCategory, newCategory)
      var graphLine = scales.graphLine
      // console.log(state)
      var graphDataState = trendsDataFull.filter(function(d) { 
        return d.State == state
      })

      var graphDataStateNest = d3.nest()
        .key(function(d) {return d.State;})
        .entries(graphDataState);

      //IF LINE HASN'T BEEN ADDED YET TO THE GRAPH:
      if ($(".line-" + state).length == 0) {
        // console.log('push')
        stateLinesArray.push(state); // ADD NEW STATE TO ARRAY 
        graphSvg.append("path")
          .data([graphDataStateNest])
          .attr("class", "line-state line-" + state)
          // .attr("d", graphLine);
          .attr("d", function(d) { 
        d.graphLine = this;               
          return (graphLine(d[0].values));
        });
      } 

    } 


    renderGraph();
    renderMap();

  })
})

