/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

// canvas and chart sizes
const svgWidth = 600,
      svgHeight = 400;

const  margin = {left:100, bottom:100, top:20,  right:20}

const chartWidth = svgWidth - margin.left - margin.right,
      chartHeight = svgHeight - margin.top - margin.bottom;


// svg for chart
var svgCanvas = d3.select("#chart-area")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate("+margin.left+","+margin.top+")");


// add tool tip to viz area
var tip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(d){  // html method will pass the information of the shape we are looking at
	// console.log(d.country)
	var text = "<strong>Country:</strong> <span style='color:red'>" + d.country + "</span><br>";
	text += "<strong>Continent: </strong> <span style='color:red; text-transform:capitalize'>" + d.continent + "</span><br>";
	text += "<strong>Life Expectancy: </strong> <span style='color:red'>" + d3.format(".2f")(d.life_exp) + "</span><br>";
	text += "<strong>GDP Per Capita: </strong> <span style='color:red'>" + d3.format("$,.0f")(d.income) + "</span><br>";
	text += "<strong>Population: </strong> <span style='color:red'>" + d3.format(",.0f")(d.population) + "</span><br>";
	return text;
    });


svgCanvas.call(tip) // --> sets context for tooltip


// x & y scales
var xScale = d3.scaleLog()
    .base(10)
    .domain([142, 150000])
    .range([0, chartWidth]);
var yScale = d3.scaleLinear()
    .domain([0,90])
    .range([chartHeight, 0]);

// scales for continent color and circle radius
var continentColorScale = d3.scaleOrdinal(d3.schemeCategory10);
var areaScale = d3.scaleLinear()
    .domain([2000, 1400000000])
    .range([25*Math.PI, 1500*Math.PI]);


// x & y labels
var xLabel = svgCanvas.append("text")
    .attr("x", chartWidth/2)
    .attr("y", chartHeight +margin.bottom*0.5)
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");

var yLabel = svgCanvas.append("text")
    .attr("x", -chartHeight*0.5)
    .attr("y", -margin.left*0.5)
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Life Expectancy (Years)");
var timeLabel = svgCanvas.append("text")
    .attr("x", chartWidth*0.9)
    .attr("y", chartHeight*0.95)
    .attr("font-size", "40px")
    .attr("text-anchor", "middle")
    .attr("opacity", "0.3")
    .text("1800");


// variable for time
var time = 0;

// variable for interval loop
var interval;

// variable for data (to access outside data loading)
var formattedData;

// x & y axis calls
var xAxisCall = d3.axisBottom(xScale)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format("$"));
var yAxisCall = d3.axisLeft(yScale)
    .tickFormat(function(d){ return +d; });

// add axes to canvas
svgCanvas.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,"+chartHeight+")")
    .call(xAxisCall);
svgCanvas.append("g")
    .attr("class", "y-axis")
    .call(yAxisCall);


// add legend
const continents = ["africa", "americas", "asia", "europe"];
var legend = svgCanvas.append("g")
    // .attr("class", "legend")
    .attr("transform", "translate("+(chartWidth-10)+","+(chartHeight-130)+")");

// add legend-row groups (one for each continent)
continents.forEach(function(continent, i){

    var legendRow = legend.append("g")
	.attr("transform", "translate(0,"+(i*20)+")");

    legendRow.append("rect")
	.attr("width", 10)
	.attr("height", 10)
	.attr("fill", continentColorScale(continent));

    legendRow.append("text")
	.attr("x", -10)
	.attr("y", 10)
	.attr("text-anchor", "end")
	.text(continent)
	.style("text-transform", "capitalize");
});

d3.json("data/data.json").then(function(data){

    // clean data
    const dataYearValues = data.map(function(d){ return +d.year});
    
    formattedData = data.map(function(d){
	return d["countries"].filter(function(country){
	    return (country.income && country.life_exp);
	}).map(function(country){
	    country.income = +country.income;
	    country.life_exp = +country.life_exp;
	    country.population = +country.population;
	    return  country
	})
    });

    // // get all values for income
    // const dataIncomeValues = formattedData.map(function(d){
    // 	return d.map(function(country){
    // 	    return country.income;
    // 	})
    // });
    // // flatten array of arrays
    // dataIncomeValuesFlat = [];
    // for (var i=0; i<dataIncomeValues.length; i++){
    // 	for (var j=0; j<dataIncomeValues[i].length; j++){
    // 	    dataIncomeValuesFlat.push(dataIncomeValues[i][j]);
    // 	}
    // }

    // // get all values for population
    // const dataPopulationValues = formattedData.map(function(d){
    // 	return d.map(function(country){
    // 	    return country.population;
    // 	})
    // });
    // // flatten array of arrays
    // dataPopulationValuesFlat = [];
    // for (var i=0; i<dataPopulationValues.length; i++){
    // 	for (var j=0; j<dataPopulationValues[i].length; j++){
    // 	    dataPopulationValuesFlat.push(dataPopulationValues[i][j]);
    // 	}
    // }
    // console.log(dataIncomeValuesFlat);
    

    // // x & y scales
    // var xScale = d3.scaleLog() //scaleLinear()
    // 	// .base(10)
    // 	.domain([d3.min(dataIncomeValuesFlat), d3.max(dataIncomeValuesFlat)])
    // 	.range([0, chartWidth]);
    // var yScale = d3.scaleLinear()
    // 	.domain([0,100])
    // 	.range([chartHeight, 0]);

    // // scales for continent color and circle radius
    // var continentColorScale = d3.scaleOrdinal(d3.schemeCategory10);
    // var areaScale = d3.scaleLinear()
    // 	.domain([d3.min(dataPopulationValuesFlat), d3.max(dataPopulationValuesFlat)])
    // 	.range([25*Math.PI, 1500*Math.PI]);



    // d3.interval(function(){
	// time = (time < 214) ? time+1 : 0;
	// update(formattedData[time]);
    // }, 100);
    // Update graph on first run of visualization
    update(formattedData[0]);
    
})

$("#play-button")
    .on("click", function(){
	var button = $(this);
	if (button.text() == "Play"){
	    button.text("Pause");
	    interval = setInterval(step, 100);	    
	}
	else {
	    button.text("Play");
	    clearInterval(interval);
	}
    })

$("#reset-button")
    .on("click", function(){
	time = 0;
	update(formattedData[0]);
    })

$("#continent-select")
    .on("change", function(){
	update(formattedData[time]);
    })

// initialize slider on slider-div
$("#date-slider").slider({
    max: 2014,
    min: 1800,
    step: 1,
    slide: function(event, ui){
	time = ui.value - 1800;
	update(formattedData[time]);
    }
});


function step(){
    // console.log("Hi!")
    // Loop back when at the end
    time = (time < 214) ? time+1 : 0;
    update(formattedData[time]);
}

function update(data){

    // transition
    var t = d3.transition()
	.duration(100);

    // get continent value
    var continent = $("#continent-select").val();
    // console.log(data)
    
    // filter data by continent
    var data = data.filter(function(d){
	if (continent == "all") { return true; }
	else{ return d.continent == continent; }
    })
    
    // JOIN
    var circles = svgCanvas.selectAll("circle")
	.data(data, function(d){
	    return d.country;
	});
    
    // EXIT
    circles.exit()
	.attr("class", "exit")
	.remove();

    // // UPDATE
    // circles
    // 	.transition(t)
    // 	.attr("cx", function(d){ return xScale(d.income); })
    // 	.attr("cy", function(d){ return yScale(d.life_exp); })
    // 	.attr("r", function(d){ return Math.sqrt(areaScale(d.population)/Math.PI); });

    // ENTER
    circles.enter()
	.append("circle")
	.attr("class", "enter")
    	.attr("fill", function(d){ return continentColorScale(d.continent); })
	.on("mouseover", tip.show)   // --> add mouse-over event-handler (tip.show relays information of svg element to above html function whenever mouse-over event is triggered)
	.on("mouseout", tip.hide)   // --> add mouse-out event-handler
    // event-handlers are added before merging UPDATE-existing-circles with ENTER-new-circles because we only
    // want to add these event-handlers once to each circle... the circles that are still on the screen and
    // waiting to be updated already have these event-handlers added to them.
	.merge(circles)
	.transition(t)
	.attr("cx", function(d){ return xScale(d.income); })
	.attr("cy", function(d){ return yScale(d.life_exp); })
	.attr("r", function(d){ return Math.sqrt(areaScale(d.population)/Math.PI); });

    // update time label
    // console.log("Time: "+time);
    timeLabel.text(+(1800+time));
    $("#year")[0].innerHTML = +(time+1800);
    $("#date-slider").slider("value", +(time+1800));

}
