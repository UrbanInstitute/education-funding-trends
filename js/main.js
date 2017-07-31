
//Prob easiest to have a few set sizes for the map, which change at broswer size breakpoints. So `pageSize` will be determined by some function which tests browser size (e.g. IS_MOBILE() functions in past projects). I don't think it's as straightforward to have a continuously resizing graphic. Note that these values are just placeholders, they'll need to be tested/updated, and potentially more or fewer sizes are needed
var vizContent = function() {
  var stateLinesArray = [];
  var blankNote_1 = "<strong>Note:</strong> Washington, DC, and Hawaii are included in the national average calculations, however, we cannot calculate progressivity at the state level for either because both are single districts. All statistics exclude charter-only districts and other districts not tied to geography.";
  var blankNote_2= "<strong>Note:</strong> All statistics exclude charter-only districts and other districts not tied to geography.";
  var IS_1400 = d3.select("#is1400").style("display") == "block";
  var IS_MOBILE_900 = d3.select("#isMobile900").style("display") == "block";
  var IS_MOBILE_768 = d3.select("#isMobile768").style("display") == "block";
  var IS_PHONE_500 = d3.select("#isPhone500").style("display") == "block";
  var IS_PHONE_320 = d3.select("#isPhone320").style("display") == "block";
  var IS_VERTICAL_LAYOUT = d3.select("#isVerticalLayout").style("display") == "block";


  (IS_VERTICAL_LAYOUT) ? $('#vis').insertBefore('.lineChart-div'): $('#vis').insertAfter('.lineChart-div');
  /*MAP VARIABLES*/
  var pageSizeFunction =  function() {
    if (IS_PHONE_320){ 
      return "extraSmall"
    } 
    else if (IS_PHONE_500){ 
      return "small"
    }else if (IS_MOBILE_768){
        return "medium"
    }else if (IS_MOBILE_900) {
        return "full"
    }else if (IS_1400) {
        return "extraLarge"
      }
    else {
        return "large"
    }
  }

  var pageSize = pageSizeFunction();
  var vizWidth = $(".viz-content").width();
  var mapMargin = {top: 30, right: 20, bottom: 30, left: 50};
  var mapSizes = {
    /*screen width 1300*/"extraLarge": { "width": vizWidth/1.6, "height": vizWidth/2.3, "scale": vizWidth*2.625, "translate": [vizWidth/3.9,vizWidth/6.67], "chartWidth": vizWidth*.07266, "chartMargin": vizWidth*.0163, "mapTranslateX": 10, "mapTranslateY": 5},
    /*screen width 1200*/"large": { "width": vizWidth/1.68, "height": vizWidth/2.3, "scale": vizWidth*2.625, "translate": [vizWidth/3.9,vizWidth/6.67], "chartWidth": vizWidth*.06966, "chartMargin": vizWidth*.0153, "mapTranslateX": 0, "mapTranslateY": 5},
     /*screen width 900*/"full": { "width": vizWidth*.92, "height": vizWidth/1.4, "scale":vizWidth*4.055, "translate": [vizWidth/2.5,vizWidth/5], "chartWidth": vizWidth*.091, "chartMargin": vizWidth*.0144,  "mapTranslateX": 0, "mapTranslateY": mapMargin.top *2.5},
    /*screen width 768*/"medium": { "width": vizWidth*.92, "height": vizWidth/1.28, "scale":vizWidth*4.15, "translate": [vizWidth/2.5,vizWidth/4.2], "chartWidth": vizWidth*.104, "chartMargin": vizWidth*.022,  "mapTranslateX": 0, "mapTranslateY": mapMargin.top *2},
    /*screen width 502*/"small": { "width": vizWidth*.92, "height": vizWidth/1.2, "scale":vizWidth*3.9, "translate": [vizWidth/2.6,vizWidth/4.2], "chartWidth": vizWidth*.12, "chartMargin": vizWidth*.034,  "mapTranslateX": 0, "mapTranslateY": mapMargin.top *2},
    /*screen width 320*/"extraSmall": { "width": vizWidth*.92, "height": vizWidth/1.15, "scale":vizWidth*3.9, "translate": [vizWidth/2.6,vizWidth/4.2], "chartWidth": vizWidth*.095, "chartMargin": vizWidth*.027,  "mapTranslateX": 0, "mapTranslateY": mapMargin.top *2}
  }

  var category = "revratio";
  var startYear = 1995;
  var endYear = 2015;
  var mapWidth = mapSizes[pageSize]["width"] - mapMargin.left - mapMargin.right,
  mapHeight = mapSizes[pageSize]["height"] - mapMargin.top - mapMargin.bottom,
  mapTranslateX = mapSizes[pageSize]["mapTranslateX"];
  mapTranslateY = mapSizes[pageSize]["mapTranslateY"];
  /*LINE GRAPH VARIABLES*/
  var graphSize =  (IS_MOBILE_768) || (IS_MOBILE_900) ? "full" : "large";

  var graphSizes = {
   /*screen width 1200*/ "extraLarge": { "width": vizWidth/3.32, "height": vizWidth/3.8, "translate": [720,180]},
   /*screen width 1200*/ "large": { "width": vizWidth/3.32, "height": vizWidth/3.8, "translate": [720,180]},
   /*screen width 900*/ "full": { "width": vizWidth/2.4, "height": vizWidth/2.4, "translate": [300,200]},
  /*screen width 768*/"medium": { "width": vizWidth/1.1, "height": vizWidth/1.4, "translate": [300,200]},
  /*screen width 502*/"small": { "width": vizWidth/1.08, "height": vizWidth/1.4, "translate": [300,200]},
  /*screen width 320*/"extraSmall": { "width": vizWidth/1.25, "height": vizWidth/1.4, "translate": [300,200]}

  }


  //INITIAL CATEGORY
  var initialCategory = "adj_revratio_all";
  var selectedCategory = getCurrentCategory();
  initialCategory = selectedCategory;
  var graphMargin = {top: 30, right: 30, bottom: 40, left: 28},
  graphWidth =  graphSizes[pageSize]["width"]- graphMargin.left - graphMargin.right,
  graphHeight = graphSizes[pageSize]["height"] - graphMargin.top - graphMargin.bottom;
  var graphX = d3.scaleTime().range([0, graphWidth]);
  var graphY = d3.scaleLinear().range([graphHeight, 0]).nice();
  var graphLine = d3.line()
    .x(function(d) { return graphX(d.Year); })
    .y(function(d) { return graphY(d[selectedCategory]); });
  

  $("#lineChart").empty();
  if (d3.select("#revratio_").classed("current") == true) {
          d3.selectAll(".lineChart-notes-above")
            .classed("show", true)
          d3.selectAll(".lineChart-details, .lineChart-notes-under")
            .classed("show", false)
  } else {
       d3.selectAll(".lineChart-details")
            .classed("show", false)
  }

  var graphSvg = d3.select("#lineChart")
    .append("svg")
    .attr("width", graphWidth + graphMargin.left + graphMargin.right)
    .attr("height", graphHeight + graphMargin.top + graphMargin.bottom )
    .append("g")
    .attr("transform", "translate(" + graphMargin.left +", "+ graphMargin.top+")");
  var labelG = d3.select("#lineChart svg")
    .append("g")
    .attr("transform", "translate(" + graphMargin.left +", "+ graphMargin.top+")")
  var voronoi = d3.voronoi()
    .x(function(d) { return graphX(d.Year); })
    .y(function(d) { return graphY(d[selectedCategory]); })
    .extent([[-graphMargin.left, -graphMargin.top], [graphWidth + graphMargin.right, graphHeight + graphMargin.bottom]]);

  var RATIO_FORMAT = d3.format(".2f")
  var DOLLAR_FORMAT = d3.format("$,.0f")

  function roundUp(value, step) {
      step || (step = 1.0);
      var inv = 1.0 / step;
      return Math.ceil(value * inv) / inv.toFixed(2);
  }


  function round(value, step) {
      step || (step = 1.0);
      var inv = 1.0 / step; 
      return Math.round(value * inv) / inv.toFixed(2);
  }

  function roundDown(value, step) {
      step || (step = 1.0);
      var inv = 1.0 / step;
      return Math.floor(value * inv) / inv.toFixed(2);
  }

  function getTickValues(y, variable){
    var domain = y.domain() 
    var step;
    if(variable.search("ratio") != -1){
      var step = (domain[1] - domain[0]) < .35 ? .05 : .1
    }else{
      step = (domain[1] - domain[0])/4
    }
    var numberOfSteps = ((domain[1] - domain[0]) / step)
    var stepArray = [];
    for (var i=0; i<numberOfSteps; i++) {
      var newStep = domain[0] + (i*step), step; 
      stepArray.push(newStep);
    }
    //return stepArray;
    stepArray.splice(numberOfSteps + 1, 0, domain[1]);
    return stepArray;
  }

  function getMaxY(variable, data){

    var maxY = d3.max(data, function(d) {return d[variable]; })
    var minY = d3.min(data, function(d) {return d[variable]; })
    var maxYRounded = roundUp(maxY, .05)
    var minYRounded = roundDown(minY, .05)
    var step = (maxYRounded - minYRounded) < .35 ? .05 : .1
    var numberOfSteps = ((maxYRounded-minYRounded) / step)
    return roundUp(minYRounded + step*numberOfSteps, step);
  }

  function getMinY(variable, data){

    var maxY = d3.max(data, function(d) {return d[variable]; })
    var minY = d3.min(data, function(d) {return d[variable]; })
    var maxYRounded = roundUp(maxY, .05)
    var minYRounded = roundDown(minY, .05)
    var step = (maxYRounded - minYRounded) < .35 ? .05 : .1
    return roundDown(minYRounded, step)

  }

  function getCurrentCategory(){
    var adjusted = (d3.select('.checkbox-image').classed('checked') == true) ? "adj_" : ""


    var combinedClassesArray = []
    d3.selectAll(".button_toggle.on")
      .each(function(d, i) { //get class of each toggle that is still turned on and add it to the combinedClasses array
        var toggleClass = d3.select(this).attr('class').split(" ")[0];
        combinedClassesArray.push(toggleClass);
      })
    var initialSelectedToggles = combinedClassesArray.join('')
    var selectedText = combinedClassesArray.join('')
    if(selectedText == "lostfe") { selectedText = "all"}
    
    return adjusted + d3.select(".current").attr("id") + selectedText;
  }
  d3.csv("data/toggle_text.csv", function(error, toggleText) {
    d3.csv("data/data.csv", function(error, trendsDataFull) {

      var trendsDataMinMax = trendsDataFull.filter(function(d) { 
       if (selectedCategory.indexOf("revratio") >= 0) {
       // if (selectedCategory.includes("revratio")) {
          if (d3.select(".standard.line.AK.selected-state").node() !== null) { 
            return d.State !== "HI" && d.State !== "DC"
          }else{
            return d.State !== "AK" && d.State !== "HI" && d.State !== "DC"
          }
        }else { console.log(d.State)
          return d.State;
        }
      })

      var trendsDataAK = trendsDataFull.filter(function(d){
        return d.State ==  "AK"
      })
      
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

      var trendsDataUSA = trendsDataFull.filter(function(d) { 
        return d.State == "USA"
      })
      var trendsDataFiltered = trendsDataFull.filter(function(d) { 
        if (selectedCategory.indexOf("revratio") >= 0) {
          return d.State !== "AK" && d.State !== "HI" && d.State !== "DC"
        }else {
          return d.State;
        }
      })

      var trendsDataAK = trendsDataFull.filter(function(d) { 
        if (selectedCategory.indexOf("revratio") >= 0) {
        //if (selectedCategory.includes("revratio")) {
          return d.State == "AK"
        }else {
          return d.State;
        }
      })
      //FILTERING DATA TO HI AND DC TO DRAW BOXES OVER TILES
      var blankStateData = trendsDataFull.filter(function(d) { 
        if (selectedCategory.indexOf("revratio") >= 0) {
        //if (selectedCategory.includes("revratio")) {
          return d.State == "HI" || d.State == "DC"
        }
      })
      
      //CREATE INITIAL LINE GRAPH ON LOAD
      function renderGraph() {

        $(".state-list").empty()
        var graphDataSelected = trendsDataFull.filter(function(d) {           
          if ((stateLinesArray.indexOf(d.State) >= 0) || (d.State == "USA")) {         
            return d;              
          }         
        })

        var trendsDataNest = d3.nest()
          .key(function(d) {return d.State })
          .entries(graphDataSelected);

        graphX.domain(d3.extent(trendsDataFiltered, function(d) { return d.Year; }));

        graphY.domain([ getMinY(selectedCategory, trendsDataFiltered), getMaxY(selectedCategory, trendsDataFiltered)]);
        // Add the Y Axis
        graphSvg.append("g")
          .attr("class", "y graphAxis")
          .call(d3.axisLeft(graphY)
          //  .ticks(6)
            .tickSize(-graphWidth)
            .tickFormat((d3.select("#revpp_").classed("current") == true) ? d3.format('.2s') : d3.format('.2f'))
            .tickValues(getTickValues(graphY, selectedCategory))
          )
        //Add the X axis
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


        graphSvg.append("text")
          .text("PROGRESSIVE")
          .attr("class", "largeChartLabel progressiveLabel")
          .attr("transform", function() {
          	var textWidth = (this.getBBox().width)
              return "translate("+ (graphWidth-textWidth)/2 +", "+ graphY(1.05)+")"
          }) 
        graphSvg.append("text")
          .text("REGRESSIVE")
          .attr("class", "largeChartLabel regressiveLabel")
          .attr("transform", function() {
          	var textWidth = (this.getBBox().width)
              return "translate("+ (graphWidth-textWidth)/2 +", "+ graphY(.95)+")"
          }) 
        graphSvg.append("text")
          .attr("text-anchor", "middle") 
          .text(function() {
            if (d3.select("#revpp_").classed("current") == true) { 
            return "Funding levels per student"
            } else {
              return "Progressivity"
            }
          })          
          .attr("transform", function() {
            if (d3.select("#revpp_").classed("current") == true) {
              return "translate(52,-18)"
            } else {
              return "translate(10, -18)"
            }
          })            
          .attr("class", "y-label axis-label")

        graphSvg.append("path")
          .data([trendsDataNest])
          .attr("class", "line-USA")
          .attr("id", "usa-line")
          // .attr("d", graphLine);
          .attr("d", function(d) {d.graphLine = this; 
            return (graphLine(d[0].values));
          });

        var usaG = labelG.append("g")
          .attr("class", "g-usa")
          .attr("transform", "translate("+(graphWidth + 3)+","+ graphY((trendsDataNest[0]).values[20][selectedCategory])+")")

        usaG.append("rect")
          .attr("transform", "translate(0,"+ (-10)+")")
          .style("fill", "#fff")
          .attr("width", "22px")
          .attr("height", "15px")
          .attr("g-rect-usa")
        usaG.append("text")
          .attr("transform", "translate(0,"+ 3+")")
          .text("US")
          .attr("class", "usaLabel")

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
          .on("mouseover", function(d){ mouseover(d, this, yScale)})
          .on("mouseout", mouseout);
      }


      function mouseover(d, obj, yScale) {
        var newCategory = getCurrentCategory();

        d3.select("#tooltip")
          .style("display","block")
          .style("margin-left", graphX(d.data.Year) - 6 + "px")
          .style("margin-top", yScale(d.data[newCategory]) - 40 + "px")
        
        d3.select("#tt-year").text(d.data.Year)
        if(newCategory.search("ratio") != -1){
          d3.select("#tt-val").text(RATIO_FORMAT(d.data[newCategory]))
        }else{
          d3.select("#tt-val").text(DOLLAR_FORMAT(d.data[newCategory]))
        }
        hoverState(d.data.State)

      }

      function mouseout(d) {
        d3.select("#tooltip")
          .style("display","none")
          .style("margin-left", "0px")
          .style("margin-top", "0px")
        dehoverState(d.data.State)
      }

      //CREATE INITIAL MAP ON LOAD
      function  renderMap() {
        //function called on load to create the svg and draw an initial set of line charts. trendsData is passed in from a csv, and startYear/endYear are just for the file uploader (will be constants in final features)

        // generateButtons(trendsData, startYear, endYear) //just for the file uploader
        $("#vis").empty();
        mapSvg = d3.select("#vis")
          .data([trendsData])
          .append("svg")
          .attr("width", mapWidth + mapMargin.left + mapMargin.right)
          .attr("height", mapHeight + mapMargin.top + mapMargin.bottom)
          .append("g")
          .attr("transform", "translate(" + mapTranslateX + "," + mapTranslateY+ ")");


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
          .on("click", function(d) { 
            var newCategory = getCurrentCategory();
            var stateName = d.values[0]["state_full"]
            var clickedState = d3.select(this).attr("class").split(" ")[1]
            if (clickedState == "AK") {
              d3.select("#ak-disclaimer")
                .classed("show", true)
            } 
            d3.select(".nonblank-rect." + clickedState)
              .classed("hovered-state", false)
              .classed("selected-state", function(){
                if (d3.select(".nonblank-rect." + clickedState).classed("selected-state") == true) { 
                  if (clickedState == "AK") {
                    d3.select("#ak-disclaimer")
                      .classed("show", false)
                    //AT WIDTHS < 500PX, REMOVE STATE LABEL WHEN UNCLICKING STATE
                    d3.select(".mapLabel." + clickedState)
                      .classed("show", false)
                      .classed("selected-text", false)

                  }else { 
                    //AT WIDTHS < 500PX, REMOVE STATE LABEL WHEN UNCLICKING STATE
                    d3.select(".mapLabel." + clickedState)
                      .classed("show", false)
                      .classed("selected-text", false)
                    labelG.select(".g-" + clickedState)
                      .remove();
                    removeStateList(clickedState);
                    return false
                  }
                }else { 
                  addStateList(clickedState, stateName);
                  return true;            
                }

              })

            updateStateLine(clickedState, clickedState)
            updateLineGraph(newCategory, newCategory, "click", clickedState)
          })
          .on("mouseover", function() {
            var newCategory = getCurrentCategory();
            var hoveredState = d3.select(this).attr("class").split(" ")[1]
            var hoveredStateName = trendsDataFull.filter(function(d) { 
              return d.State == hoveredState
            })
            d3.select(".nonblank-rect." + hoveredState)
              .classed("hovered-state", true)
            d3.select(".mapLabel.standard." + hoveredState)
              .classed("hovered-text", true)
            hoverState(hoveredState)
            updateStateLine(hoveredState)
            updateLineGraph(newCategory, newCategory, "hover", hoveredState)

          })
          .on("mouseout", function() {

            var newCategory = getCurrentCategory();
            var hoveredState = d3.select(this).attr("class").split(" ")[1]

            d3.select(".nonblank-rect." + hoveredState)
              .classed("hovered-state", false)
            d3.select(".nonblank-rect." + hoveredState)
              .style("fill", function(){
                if (d3.select("#revratio_").classed("current") == true){
                  if (d3.select(".nonblank-rect." + hoveredState).classed("selected-state") == true)  {
                    return "#000"
                  }else {
                    return "#a2d3eb"
                  }
                }else if (d3.select("#revpp_").classed("current") == true){
                  if (d3.select(".nonblank-rect." + hoveredState).classed("selected-state") == true)  {
                   return "#fbbe15"
                  }else {
                    return "#094c6a"
                  }
                }
              })
            d3.select(".mapLabel.standard." + hoveredState)
              .style("fill", function(){
                if (d3.select("#revratio_").classed("current") == true){
                  if (d3.select(".mapLabel.standard." + hoveredState).classed("selected-text") == true)  {
                    return "#ffffff"
                  }else {
                    return "#000"
                  }
                }else if (d3.select("#revpp_").classed("current") == true){ 
                  if (d3.select(".mapLabel.standard." + hoveredState).classed("selected-text") == true)  {
                   return "#000"
                  }else {
                    return "#ffffff"
                  }
                }
              })
            // d3.selectAll(".state-name")
            //   .html("")
            //IF LINE IS ADDED THEN REMOVE
            if (d3.select(".nonblank-rect." + hoveredState).classed("selected-state") == false) {
              for (var i= stateLinesArray.length-1; i>=0; i--) { //DELETE EXISTING STATE IN ARRAY
                if (stateLinesArray[i] === hoveredState) { 
                  stateLinesArray.splice(i, 1);
                }
              }
              graphSvg.select("path.line-" + hoveredState) 
                .remove()
              labelG.select(".g-" + hoveredState)
                .remove();
            }
            d3.select(".mapLabel.standard." + hoveredState)
              .classed("hovered-text", false)
            if(d3.select(".nonblank-rect." + hoveredState).classed("selected-state") == false){
              updateLineGraph(newCategory, newCategory, "remove", hoveredState)
            }
            dehoverState(hoveredState)
          })
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
          .attr("x", function() {
            if (IS_PHONE_500) {
              return chartWidth+chartMargin - chartWidth/2.2
            }
            else if (IS_MOBILE_768) {
              return chartWidth+chartMargin - chartWidth/2.4
            }else {
              return chartWidth+chartMargin - chartWidth/2.4              
            }
          })
          .attr("y", function() {
            if (IS_PHONE_500) {
              return chartWidth+chartMargin - chartWidth/2.2
            }else if (IS_MOBILE_768) {
              return chartWidth+chartMargin - chartWidth/2.4
            }else {
              return chartWidth+chartMargin - chartWidth/2.4           
            }
          })

        //chart background
        map
          .append("rect")
          .attr("width", chartWidth-2*chartMargin + 8)
          .attr("height", chartWidth-2*chartMargin + 8)
          .attr("x",chartMargin - 4)
          .attr("y",chartMargin - 4)
          .style("fill", function(){
            if (d3.select("#revratio_").classed("current") == true){
              return "#a2d3eb"
            }else {
              return "#094c6a"
            }
          })          
          .attr("class", function(d) { 
            return "nonblank-rect " + d.key
          })

        //set up scales for charts. THe code here assumes all states are on the same x/y scale. Alaska and the US avg will prob need to have special scales written for them, since they will be on a separate scale (I think). Also note currently there is no US average chart/tile.
        var mapX = (IS_PHONE_500) ? d3.scaleLinear().range([chartMargin-4, chartWidth-chartMargin+4]).nice() : d3.scaleLinear().range([chartMargin, chartWidth-chartMargin]).nice();
        var mapY = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]).nice();
        var mapY2 = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]).nice();


        //this is just for the file uploader, setting the key onload to whatever column is first in the data file, other than State/Year. In the real feature, firstKey will just be a constant
        // var firstKey = "adj_revratio_all"
        var keys = Object.keys(trendsData[0])

        mapX.domain([startYear,endYear]);
        //NEED TWO Y-AXES:
        //ALL STATES EXCEPT AK
        mapY.domain([d3.min(trendsDataFiltered, function(d) {return d[selectedCategory]; }), d3.max(trendsDataFiltered, function(d) { return d[selectedCategory]; })]); 
        //AK ONLY
        var min2 = d3.min([1, d3.min(trendsDataAK, function(d) {return d[selectedCategory]; })]);
        var max2 = d3.max(trendsDataAK, function(d) { return d[selectedCategory]; })
        mapY2.domain([min2, max2]); 


        //line chart axes
        var mapXAxis = d3.axisBottom(mapX)
        var mapYAxis = d3.axisLeft(mapY)

        //for each map chart line
        var mapline = d3.line()
          .x(function(d) { return mapX(d.Year); })
          .y(function(d) { return mapY(d[selectedCategory]); });
        var mapline2 = d3.line()
          .x(function(d) { return mapX(d.Year); })
          .y(function(d) { return mapY2(d[selectedCategory]); });

       // A white line at y=1. This is just a placeholder. In the final feature, we want some sort of distinction of y=1 for the ratio graphs, but not the level graphs. Will likely be two rects (above and below y=1) instead of a line, but TBD
        //DRAWING THE RATIO LINE FOR ALL STATES BUT AK
        d3.selectAll(".state:not(.AK)").append("line")
          .attr("x1", function() {
            return (IS_PHONE_500) ? chartMargin - 4 : chartMargin
          })
          .attr("x2", function() {
            return (IS_PHONE_500) ? chartWidth-chartMargin+4 : chartWidth-chartMargin
          })
          .attr("y1",mapY(1))
          .attr("y2",mapY(1))
          .attr("class", function(d) {
            return "ratioOneLine ratioOneLine-" + d.key
          })

        //DRAWING THE RATIO LINE FOR AK
        d3.select(".state.AK").append("line")
          .attr("x1",chartMargin-4)
          .attr("x2",chartWidth-chartMargin-4)
          .attr("y1",mapY2(1))
          .attr("y2",mapY2(1))
          .attr("class", function(d) {
            return "ratioOneLine ratioOneLine-" + d.key
          })
        d3.selectAll(".ratioOneLine")
          .style("opacity", function() {
            return (d3.select("#revpp_").classed("current") == true) ?  0 : 1;
          })
        //DRAWING THE GRAPH LINE FOR ALL STATES BUT AKK
        d3.selectAll(".state:not(.AK)").append("path")
          .attr("class", function(d){ return "standard line " + d.key })
          .attr("d", function(d){  return mapline(d.values)})
          .classed("progressivity", function() {
            return (d3.select("#revpp_").classed("current") == true) ?  false : true;
          })
        //DRAWING THE GRAPH LINE FOR AK
        d3.select(".state.AK").append("path")
          .attr("class", function(d){ return "standard line " + d.key })
          .attr("d", function(d){  return mapline2(d.values)})
          .classed("progressivity", function() {
            return (d3.select("#revpp_").classed("current") == true) ?  false : true;
          })
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

        var chartWidth = mapSizes[pageSize]["chartWidth"]
        var chartMargin = mapSizes[pageSize]["chartMargin"]
        var tileWidth = chartWidth-2*chartMargin+8

        //draw the state name on the tile
        map.append("text")
          .text(function(d){ return d.key })
          .attr("class", function(d) {
            return "mapLabel standard " + d.key
          })        
          .attr("text-anchor", "end")
          .attr("x", function() {
            if (IS_PHONE_500) {
            return 0;
            }else if (IS_MOBILE_768) {
              return chartWidth+chartMargin - chartWidth/2.4
            }else {
              return chartWidth+chartMargin - chartWidth/2.4              
            }
          })
          .attr("y", function() {
            if (IS_PHONE_500) {
              return chartWidth+chartMargin - chartWidth/1.45
            }else if (IS_MOBILE_768) {
              return chartWidth+chartMargin - chartWidth/2.4
            }else {
              return chartWidth+chartMargin - chartWidth/2.4             
            }
          })
          .style("fill", function(){
            if (d3.select("#revratio_").classed("current") == true){
              return "#353535"
            }else if (d3.select("#revpp_").classed("current") == true){
              return "#ffffff"
            }
          })
        //add the X axis 

        //add the Y Axis
        map.append("g")
          .attr("class", function(d){ return "y axis " + d.key})
          .attr("transform", "translate(" + chartMargin + ",0)")
          .call(mapYAxis);
        map.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (chartWidth-chartMargin) + ")")
          .call(mapXAxis);

        d3.select("#vis")
          .append("div")
          .attr("id", "ak-disclaimer")
          .html("Alaska data are displayed on a separate y-axis scale (from <span id =\"ak-min\">" + RATIO_FORMAT(min2)+ "</span> to <span id =\"ak-max\">" + RATIO_FORMAT(max2) + "</span>) from the other 49 states.")


       d3.select("#vis")
          .append("div")
          .attr("id", "note-blank")
          .html(function() {
            return (d3.select("#revratio_").classed("current") == true) ? blankNote_1 : blankNote_2
          })
      }

      d3.select(".checkbox-div")
        .on("click", function() { 
          if (d3.select(".checkbox-image").classed('checked') == true){
          d3.select(".checkbox-image")
            .classed("checked", false)
          d3.select(".empty-checkbox-image")
            .classed("checked", true)
          checkAdjusted()
          }else {
            d3.select(".empty-checkbox-image")
              .classed("checked", false)
            d3.select(".checkbox-image")
              .classed("checked", true)
            checkAdjusted();
          }
        })
      $(".tooltip").remove()
      var div = d3.select(".help-div")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      d3.select(".help-div")
        .on("mouseover", function() {
          d3.select(".help-button")
            .classed("hide", true)
          d3.select(".help-button-hover")
            .classed("hide", false)
          div.transition()
            .duration(200)
            .style("opacity", 1);
          div.html("Cost-adjusted numbers account for cost differences among districts.")
            .style("left", "-54px")
            .style("top", "40px")
        })
        .on("mouseout", function(d) {
          d3.select(".help-button")
            .classed("hide", false)
          d3.select(".help-button-hover")
            .classed("hide", true)
          div
            .transition()
            .duration(500)
            .style("opacity", 0);
        });

      /*IF ADJUSTED IS CHECKED*/
      var adjusted = "adj_"

      function checkAdjusted() {
        // adjusted = (d3.select('#adjusted-checkbox').property('checked') == true) ? "adj_" : ""
        var newCategory = getCurrentCategory();
        updateLineGraph(newCategory, selectedCategory, "toggle", null)
        updateMapLine(newCategory, selectedCategory)
        d3.select(".switch-main-text")
          .html(function() { 
            return toggleText[0][getCurrentCategory()];
          })
      }


      d3.select("#adjusted-checkbox").on("change", checkAdjusted)



      // /*SWITCHING BETWEEN TABS*/


      d3.selectAll(".top-tab")
        .on("click", function(d){  
          d3.selectAll(".top-tab").classed('current', false)
          d3.select(this).classed('current', true)
          var currentTab = d3.select(this).attr("id")
          d3.select(".switch-main-text")
            .html(function() { 
              return toggleText[0][getCurrentCategory()];
            })
          checkAdjusted();
          drawBackMapCurtain(300, currentTab)
        })

      /*TOGGLE BUTTONS*/
      var selectedToggles = "all";

    



      // WHEN CLICKING ON EACH TOGGLE:
      d3.selectAll(".button_toggle")
        .on('click', function() {
          if(d3.select(this).classed("on")){ 
            d3.select(this).classed("on", false)
            d3.select(this).classed("off", true)
            d3.select(".switch-main-text")
              .html(function() { 
                return toggleText[0][getCurrentCategory()];
              })
          }else {
            checkAdjusted();
            d3.select(this).classed("on", true)
            d3.select(this).classed("off", false)
            d3.select(".switch-main-text")
              .html(function() { 
                return toggleText[0][getCurrentCategory()];
              })
          }
         checkAdjusted();

        }) 


      //WHEN CLICKING ON CLEAR ALL UNDER SELECTED STATE LIST
      d3.selectAll(".state-clear")
        .on('click', function() {
          for (var i= stateLinesArray.length-1; i>=0; i--) { //DELETE EXISTING STATE IN ARRAY
            removeStateList(stateLinesArray[i])
          }
        })

      //WHEN CLICKING ON STATE, ADD TAG TO BOTTOM OF LINE GRAPH
      function addStateList(state, stateName) { 
        d3.selectAll(".lineChart-notes-under")
          .classed("show", function() {
            (d3.select("#revratio_").classed("current") == true) ? true : false
          })
        d3.selectAll(".lineChart-details")
          .classed("show", true)
        d3.selectAll(".lineChart-notes-above")
          .classed("show", function() {
            (d3.select("#revratio_").classed("current") == true) ? true : false
          })        
        var stateItem = d3.selectAll(".state-list")
          .datum(state)
          .append("li")
          .html(stateName)
          .attr("class", function() {
            return "state-item item-" + state + " state-nonmobile";
            //return (IS_MOBILE_768) || (IS_MOBILE_900) ? "state-item item-" + state + " state-mobile" :  "state-item item-" + state + " state-nonmobile";
          })
          .on("mouseover", function(){ hoverState(state)})
          .on("mouseout", function(){ dehoverState(state)})
        stateItem.append("div")
          .attr("class", "close-sign close-sign-" + state)
          .on("click", function(d) {
            removeStateList(d)
          })
        d3.select(".mapLabel.standard." + state)
          .classed("selected-text", true)

      }

      function removeStateList(state) {
        var newCategory = getCurrentCategory();
        updateLineGraph(newCategory, newCategory, "remove", state)
        d3.select(".nonblank-rect." + state)
          .classed("selected-state", false)
          .style("fill", function(){
            if (d3.select("#revratio_").classed("current") == true){
              return "#a2d3eb"
            }else if (d3.select("#revpp_").classed("current") == true){
              return "#094c6a"
            }
          })
        d3.select(".mapLabel.standard." + state)
          .style("fill", function(){
            if (d3.select("#revratio_").classed("current") == true){
              return "#353535"
            }else if (d3.select("#revpp_").classed("current") == true){
              return "#ffffff"
            }
          })


        d3.selectAll(".item-" + state)
          .remove();
        d3.selectAll(".line-state.line-" + state)
          .remove()
        d3.select(".g-" + state)
          .remove()
        d3.selectAll("g.state." + state + " .selected-state")
          .classed("selected-state", false)
        if (d3.select(".state-item").size() == 0) {
          d3.selectAll(".lineChart-details, .lineChart-notes-under")
            .classed("show", false)
          d3.selectAll(".lineChart-notes-above")
            .classed("show", true)
        }
        d3.select(".mapLabel.standard." + state)
          .classed("selected-text", false)
          .classed("show", false)
        for (var i= stateLinesArray.length-1; i>=0; i--) { //DELETE EXISTING STATE IN ARRAY
          if (stateLinesArray[i] === state) { 
            stateLinesArray.splice(i, 1);
          }
        }
      }


      function updateScales(variable, oldVariable){ 
        var trendsDataMinMax = trendsDataFull.filter(function(d) { 
         if (selectedCategory.indexOf("revratio") >= 0) {
         // if (selectedCategory.includes("revratio")) {
            if (d3.select(".standard.line.AK.selected-state").node() !== null) { 
              return d.State !== "HI" && d.State !== "DC"
            }else{
              return d.State !== "AK" && d.State !== "HI" && d.State !== "DC"
            }
          }else {
            return d.State;
          }
        })
        var domainController;
        if(variable != "adj_revratio_" && variable != "revratio_" && variable != "revpp_" && variable != "adj_revpp_"){ 
          domainController = variable;
          selectedCategory = variable;
        }else{ 
          if(variable != oldVariable){
            if (d3.select("#revpp_").classed("current")) {
              //blank variable, from changing tabs
              domainController = "adj_revpp_lo";
              selectedCategory = "adj_revpp_lo"
            //blank variable, from changing toggles
            } else if (d3.select("#revratio_").classed("current")) {
              //blank variable, from changing tabs
              domainController = "adj_revratio_lo";
              selectedCategory = "adj_revratio_lo"
            //blank variable, from changing toggles
            }
          }else{          
            //blank variable, from clicking on state
            domainController = selectedCategory;
          }
        }

        var graphDataSelected = trendsDataFull.filter(function(d) {           
          if ((stateLinesArray.indexOf(d.State) >= 0) || (d.State == "USA")) {        
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

        var graphY = d3.scaleLinear().range([graphHeight, 0]).nice();
        var graphY2 = d3.scaleLinear().range([graphHeight, 0]).nice();

       // var max = d3.max(trendsDataMinMax, function(d) { return d[domainController]; })
        var max = getMaxY(domainController, trendsDataMinMax)
        var min = (domainController.search("ratio") != -1) ? getMinY(domainController, trendsDataMinMax) : 0;
        var max2 = getMaxY(domainController, trendsDataAK)
        //var max2 = d3.max(trendsDataAK, function(d) { return d[domainController]; })
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

        if (d3.select("#revratio_").classed("current") == true) { 
          if(d3.selectAll(".selected-state").node() != null) { 
            d3.selectAll(".lineChart-notes-under").classed("show", true)
            d3.selectAll(".lineChart-notes-above").classed("show", false)
          }else {
            d3.selectAll(".lineChart-notes-above").classed("show", true)
            d3.selectAll(".lineChart-notes-under").classed("show", false); 
          }
        }else {
          d3.selectAll(".lineChart-notes-above, .lineChart-notes-under").classed("show", false)
        }

        // var graphDataState = trendsDataFull.filter(function(d) { 
        //   return d.State == state
        // })
        // var graphDataStateNest = d3.nest()
        //   .key(function(d) {return d.State;})
        //   .entries(graphDataState);
        var scales = updateScales(variable, oldVariable)
        var graphY = ( (state == "AK" && action != "remove") || d3.select("rect.AK").classed("selected-state") || variable.indexOf("revpp_fe") >= 0) ? scales.graphY2 : scales.graphY;
        var graphLine = ( (state == "AK" && action != "remove") || d3.select("rect.AK").classed("selected-state")) ? scales.graphLine2 : scales.graphLine
        var graphDataNest = ( (state == "AK" && action != "remove") ) ? scales.akNest : scales.graphDataNest
        var graphDataNest2 = scales.graphDataNest

        var trendsDataNestUSA = d3.nest()
          .key(function(d) {return d.State;})
          .entries(trendsDataUSA);
        if(variable == "adj_revratio_" || variable == "revratio_" || variable == "revpp_" || variable == "adj_revpp_"){
          d3.selectAll(".usaLabel, .stateLabel").attr("opacity", 0)
         } else {
          d3.selectAll(".usaLabel, .stateLabel").attr("opacity", 1)
         }
        graphSvg.select(".progressiveLabel")
          .transition().duration(1200)
          .attr("transform", function() {
          	var textWidth = (this.getBBox().width)
              return "translate("+ (graphWidth-textWidth)/2 +", "+ graphY(1.05)+")"
          }) 
          .style("opacity", function() { 
            if (d3.select("#revratio_").classed("current")==true) {
               return 1
            }else if (d3.select("#revpp_").classed("current") ==true) {
              } return 0
          })
        graphSvg.select(".regressiveLabel")
          .transition().duration(1200)
          .attr("transform", function() {
          	var textWidth = (this.getBBox().width)
              return "translate("+ (graphWidth-textWidth)/2 +", "+ graphY(.95)+")"
          })          
          .style("opacity", function() { 
            var domain = graphY.domain() 
            if (d3.select("#revratio_").classed("current")==true) {
              if (domain[0] >= .9) { 
                return 0
              }else { 
                return 1
              }
            }else if (d3.select("#revpp_").classed("current") ==true) {
              } return 0
          })


        d3.selectAll("#lineChart .y.graphAxis")
          .transition().duration(1200)
          .call(d3.axisLeft(graphY)
            .tickSize(-graphWidth)
            .tickFormat((d3.select("#revpp_").classed("current") == true) ? d3.format('.2s') : d3.format('.2f'))
            .tickValues(getTickValues(graphY, variable))
          );

        var duration = (action == "toggle" || state == "AK") ? 1200 : 0
        d3.selectAll(".line-USA, .line-state")
          .transition()
          .duration(duration)
          // .attr("d", graphLine)
          .attr("d", function(d) {
            return (graphLine(d[0].values));
          });

        labelG.selectAll(".g-usa")
          .transition()
          .duration(duration)
          .attr("transform", "translate("+(graphWidth + 3)+","+ graphY((trendsDataNestUSA[0]).values[20][selectedCategory])+")")
        //   .attr("dy", ".35em")
        //   .attr("text-anchor", "start")

        labelG.selectAll(".g-state").each(function(d,i) {
          d3.select(this)
          // .transition()
          // .duration(duration)
          .attr("transform", function() { 
            var className = d3.select(this).attr("class").split(' ')[1];
            var stateName = className.split('-')[1];
            var stateDataNest = graphDataNest2.filter(function(d) {
              return d.key == stateName
            });
            return "translate("+(graphWidth + 3)+","+ graphY((stateDataNest[0]).values[20][selectedCategory])+")"
          })
        })

        var threshold = d3.select(".threshold")
          .transition()
          .duration(1200)
          .attr("y1", graphY(1))
          .attr("y2", graphY(1))
          .style("opacity", function() {
            return (d3.select("#revpp_").classed("current") == true) ? 0 : 1
          })

        threshold.node().parentNode.appendChild(threshold.node())

        if(action == "remove"){
          graphDataNest = graphDataNest.filter(function(d){ return d.key != state})
        }
        else if(action == "removeAll"){
         graphDataNest = graphDataNest.filter(function(d){ return d.key == "USA"}) 
        }
        if(typeof(graphDataNest) != "undefined"){
          drawVoronoi(graphDataNest, variable, graphY)
        }

      }

      function updateMapLine(variable, oldVariable){
        d3.select("#note-blank")
          .html(function() {
            return (d3.select("#revratio_").classed("current") == true) ? blankNote_1 : blankNote_2
          })

        var trendsDataFiltered = trendsDataFull.filter(function(d) { 
          if (selectedCategory.indexOf("revratio") >= 0) {
          // if (selectedCategory.includes("revratio")) {
            return d.State !== "AK" && d.State !== "HI" && d.State !== "DC"
          }else {
            return d.State;
          }
        })
        //var domainController = (variable != "adj_revratio_" && variable != "revratio_" && variable != "revpp_" && variable != "adj_revpp_") ? variable : oldVariable;
        if(variable != "adj_revratio_" && variable != "revratio_" && variable != "revpp_" && variable != "adj_revpp_"){ 
          domainController = variable;
        }else{ 
          if(variable != oldVariable){
            if (d3.select("#revpp_").classed("current")) {
              //blank variable, from changing tabs
              domainController = "adj_revpp_lo";
              selectedCategory = "adj_revpp_lo";
            //blank variable, from changing toggles
            } else if (d3.select("#revratio_").classed("current")) {
              //blank variable, from changing tabs
              domainController = "adj_revratio_lo";
              selectedCategory = "adj_revratio_lo";
            //blank variable, from changing toggles
            }
          }else{          
            //blank variable, from clicking on state
            domainController = oldVariable
          }
        }

        //reshape the data
        graphSvg.select(".y-label")
          .text(function() {
            if (d3.select("#revpp_").classed("current") == true) { 
            return "Funding levels per student"
            } else {
              return "Progressivity"
            }
          })
          .attr("transform", function() {
            if (d3.select("#revpp_").classed("current") == true) {
              return "translate(52,-18)"
            } else {
              return "translate(10, -18)"
            }
          })  
 
        var trendsData = d3.select("#vis").datum()
        var trendsDataNest = d3.nest()
          .key(function(d) {return d.State;})
          .entries(trendsData);

        var chartWidth = mapSizes[pageSize]["chartWidth"]
        var chartMargin = mapSizes[pageSize]["chartMargin"]
        //update data binding
        map = d3.select("#vis svg")
          .selectAll(".state")
          .data(trendsDataNest)

        //update scales
        var mapX = (IS_PHONE_500) ? d3.scaleLinear().range([chartMargin-4, chartWidth-chartMargin+4]).nice() : d3.scaleLinear().range([chartMargin, chartWidth-chartMargin]).nice();
        var mapY = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]).nice();
        var mapY2 = d3.scaleLinear().range([chartWidth-chartMargin, chartMargin]).nice();

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
        }else if (domainController.indexOf("revpp_fe") >= 0){ 
          max = max2;
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
        map.selectAll("path.standard.line")
          .classed("progressivity", function() {
            return (d3.select("#revpp_").classed("current") == true) ?  false : true;
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
        if(d3.select("#revpp_").classed('current') == true){
          d3.selectAll(".blank").each(function() {
            this.parentNode.insertBefore(this, this.parentNode.firstChild)
          })
        }else{
          d3.selectAll(".blank").each(function() {
            this.parentNode.appendChild(this)
          })
        }
          //.transition()
          //.duration(1200)
          // .attr("y1",mapY(1))
          // .attr("y2",mapY(1))

        var rectWidth = d3.select("rect.nonblank-rect").attr("width")
        var chartWidth = mapSizes[pageSize]["chartWidth"]
        var chartMargin = mapSizes[pageSize]["chartMargin"]

        //pretty sure this line can be remove, since x axis/scales aren't changing (as can all other references to x scale in this function), but keeping here in case it turns out the scales will change with different variabels (in which case you'll need to add some more code to animate the x axes etc)
        var mapXAxis = d3.axisBottom(mapX)
      }





      function drawBackMapCurtain(delay, tab){
        //To create the illusion of the lines in the chart animating across the chart area (left to right, small to large X values), I created a "curtain" which is a rect covering the line chart. Then, by animating it's width to 0, the animation effect is simulated. I would imagine that when the user switches between different units, on the graphs, e.g. when they switch from dollars to ratios, the curtain should draw back. On the other hand, if a user switches between combinations of state/local/federal, or toggles the adjustment on/off, the curtain should not draw back. Does that sound right to you?
        d3.selectAll(".nonblank-rect")
          .transition()
          .style("fill", function() {
            if (tab == "revpp_") {
              return "#094c6a"
            } else {
              return "#a2d3eb"
            }
          })
        d3.selectAll(".nonblank-rect.selected-state")
          .transition()
          .style("fill", function() {
            if (tab == "revpp_") {
              return "#fbbe15" 
            } else {
              return "#000"
            }
          })

        d3.selectAll(".mapLabel.standard")
          .transition()
          .style("fill", function() {
            if (tab == "revpp_") {
              return "#fff"
            } else {
              return "#353535"
            }
          })
        d3.selectAll(".mapLabel.standard.selected-text")
          .transition()
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
          .transition()
          .style("fill", function(d) {
            if (tab == "revpp_") {
              if(d3.select(".nonblank-rect." + d.key).classed("selected-state")){
                return "#fbbe15"
              }else{
                return "#094c6a"
              }
            }else {
              if(d3.select(".nonblank-rect." + d.key).classed("selected-state")){
                return "#000"
              }else{
                return "#a2d3eb"
              }
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
        d3.selectAll(".ratioOneLine")
          .classed("hidden", true)
      }


      function removeGraphLine() {
        d3.selectAll(".line-USA, .line-state")
          .transition()
          .duration(0)
          .attr("opacity", 1)
          .transition()
          .delay( 200)
          .duration(1200)
          .attr("opacity", 0)

      }


      function hoverState(state){
        var chartWidth = mapSizes[pageSize]["chartWidth"]
        var chartMargin = mapSizes[pageSize]["chartMargin"]
        var tileWidth = chartWidth-2*chartMargin+8
        if(d3.select(".state." + state).select(".selected-state").node() != null){
          d3.select(".state." + state).select(".selected-state").style("opacity", ".8")
        }
        d3.select(".mapLabel." + state)
          .classed("show", function() {
            if (IS_PHONE_500) {
              return true;
            }else {
              return false;
            }
          })
          .attr("transform", function() {
            if (IS_PHONE_500) {
            var textWidth = (this.getBoundingClientRect().width)
            //return "translate("+ (tileWidth - textWidth)/2 +", "+ 0 +")"
              return "translate("+ (chartMargin-4 + textWidth + (tileWidth-textWidth)*.5) +", "+ 0 +")"
            }

          }) 
        d3.select(".state-item.item-" + state)
          .style("background-color","#000")
          .style("color","#ffffff")
        d3.select(".line-" + state)
          .classed("line-hover", true)

        if( d3.select(".line-" + state).node() != null && (state != "USA")){ 
          d3.select(".g-" + state).node().parentNode.appendChild(d3.select(".g-" + state).node())
        	d3.select(".line-" + state).node().parentNode.appendChild(d3.select(".line-" + state).node())
        	d3.select("text.stateLabel." + state)
          	.classed("selected", true)
        }else if(state == "USA"){
          d3.select(".g-usa").node().parentNode.appendChild(d3.select(".g-usa").node())
          d3.select("text.usaLabel").classed("selected", true)
		      d3.select(".line-USA").node().parentNode.appendChild(d3.select(".line-USA").node())
        }
      


      }
      function dehoverState(state){
        if (d3.select(".nonblank-rect.selected-state." + state).node() != null) {
          d3.select(".mapLabel.selected-state" + state)
            .classed("show", true)
        }else {
          d3.select(".mapLabel." + state)
            .classed("show", false)
        }
        d3.select(".state." + state).selectAll("rect").style("opacity", "1")
        d3.select(".state-item.item-" + state)
          .style("background-color","#ececec")
          .style("color","#353535")
        d3.select(".line-" + state).classed("line-hover", false);
        if(state == "USA"){
          d3.select("text.usaLabel").classed("selected", false)
        }else {
          d3.select("text.stateLabel."+ state).classed("selected", false)
        }
      }
      //ADDS NEW STATE LINE AND UPDATES STATE ARRAY
      function updateStateLine(state) { 
        d3.select(".nonblank-rect." + state)
          .style("fill", function(){
            if (d3.select("#revratio_").classed("current") == true){
              if (d3.select(".nonblank-rect." + state).classed("selected-state") == true || d3.select(".nonblank-rect." + state).classed("hovered-state") == true )  {
                return "#000"
              }else{
                return "#a2d3eb"
              }
            }else if (d3.select("#revpp_").classed("current") == true){
              if (d3.select(".nonblank-rect." + state).classed("selected-state") == true || d3.select(".nonblank-rect." + state).classed("hovered-state") == true)  {
               return "#fbbe15"
              }else{
                return "#094c6a"
              }
            }
          })
        d3.select(".mapLabel.standard." + state)
          .style("fill", function(){
            if (d3.select("#revratio_").classed("current") == true){
              if (d3.select(".mapLabel.standard." + state).classed("selected-text") == true || d3.select(".mapLabel.standard." + state).classed("hovered-text") == true)  {
                return "#ffffff"
              }else{
                return "#353535"
              } 
            }else if (d3.select("#revpp_").classed("current") == true){
              if (d3.select(".mapLabel.standard." + state).classed("selected-text") == true || d3.select(".mapLabel.standard." + state).classed("hovered-text") == true)  {
               return "#353535"
              }else {
                return "#ffffff"
              }
            }
          })
        var newCategory = getCurrentCategory();

        var scales = updateScales(newCategory, newCategory)
        var graphLine = scales.graphLine
        var graphDataState = trendsDataFull.filter(function(d) { 
          return d.State == state
        })
        var graphDataStateNest = d3.nest()
          .key(function(d) {return d.State;})
          .entries(graphDataState);


        //IF LINE HASN'T BEEN ADDED YET TO THE GRAPH:
        if ($(".line-" + state).length == 0) {
          stateLinesArray.push(state); // ADD NEW STATE TO ARRAY 
          graphSvg.append("path")
            .data([graphDataStateNest])
            .attr("class", "line-state line-" + state)
            .classed("line-hover", true)
            .attr("d", function(d) { 
          d.graphLine = this;               
            return (graphLine(d[0].values));
            });

          stateG = labelG.append("g")
            .attr("class", "g-state g-" + state)
            .attr("transform", "translate("+(graphWidth + 3)+","+ graphY((graphDataStateNest[0]).values[20][selectedCategory])+")")

          stateG.append("rect")
            .attr("transform", "translate(0,"+ (-12) +")")
            .style("fill", "#fff")
            .attr("width", "22px")
            .attr("height", "15px")
            .attr("class", "g-rect-" + state)
          stateG.append("text")
            .text(state)
            .attr("class", "stateLabel " + state)
            .classed("selected", true)


          //CHANGE OPACITY IF OVERLAPPING:
          //var usaTop = ($(".g-usa")[0].getBoundingClientRect().top);
        checkLabels(state)
        
        }
      } 

      function checkLabels(state) { 
      	for (var i= stateLinesArray.length-1; i>=0; i--) { //DELETE EXISTING STATE IN ARRAY
            var usaTop = ($(".g-usa")[0].getBoundingClientRect().top);
            var selectedState = $(".g-" + stateLinesArray[i] + ":not(." + state + ")")
            var stateTop = ($(".g-" + state)[0].getBoundingClientRect().top);
            var selectedStateTop = (selectedState[0].getBoundingClientRect().top);
            var overlapUsa = (stateTop-usaTop) //STATE IS ABOVE USA IF VALUE IS BELOW 0
            var overlapState = (stateTop-selectedStateTop) //NEW STATE IS ABOVE EXISTING STATE LABEL IF VALUE IS BELOW 0

            //CHECK IF STATE OVERLAPS WITH USA
            if (Math.abs(overlapUsa) <12.5) {  
                d3.select(".g-rect-usa")
                  .classed("makeTransparent", true)
                d3.select(".g-rect-" + state)
                  .classed("makeTransparent", true)
            }else {

              
            }
            //CHECK IF STATE OVERLAPS WITH ANOTHER STATE
            if (stateLinesArray[i] == state) {
            }else {
              if (stateLinesArray.length > 1) { 
                if (Math.abs(overlapState) <12.5) { 
                  d3.selectAll(".g-rect-" + state + ", .g-rect-" + stateLinesArray[i])
                    .classed("makeTransparent", true)
                }else { 
                  d3.select(".g-rect-" + state)
                    .classed("makeTransparent", false)
                }
              }
            }
          }
      }
      renderGraph();
      renderMap();
    })
  })

}

vizContent();

window.onresize = vizContent;
