/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/

// canvas size
const svgWidth = 800,
      svgHeight = 500;

const margin = { left:150, right:100, top:50, bottom:50 };

var chartHeight = svgHeight - margin.top - margin.bottom,
    chartWidth = svgWidth - margin.left - margin.right;

// add svg for chart
var svg = d3.select("#chart-area").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var g = svg.append("g")
    .attr("transform", "translate("+margin.left+","+margin.top+")");


// Scales
var xScale = d3.scaleTime().range([0, chartWidth]);
var yScale = d3.scaleLinear().range([chartHeight, 0]);

// Axes
var xAxisCall = d3.axisBottom()
    .ticks(8);
var xAxis = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0,"+chartHeight+")");

var yAxisCall = d3.axisLeft()
    .ticks(10);
var yAxis = g.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(0,0)");

// Axes labels
var xLabel = g.append("text")
    .attr("class", "x-axis-label")
    .attr("x", chartWidth/2)
    .attr("y", chartHeight+margin.bottom*1.0)
    .attr("font-size", "15px")
    .attr("text-anchor", "middle")
    .text("Time");

var yLabel = g.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight/2)
    .attr("y", -margin.left*0.7)
    .attr("font-size", "15px")
    .attr("text-anchor", "middle")
    .text("Price (USD)");

// Add path (line) element to the graph
g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "2px");

// Time parser for x-scale dates
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");
var dateBisector = d3.bisector( function(d){ return d.date; }).left;

// Add jQuer UI slider here (make use of filtered data to get min, max dates)
$("#date-slider").slider({
    range: true,
    min: parseTime("12/5/2013").getTime(),
    max: parseTime("31/10/2017").getTime(),
    values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
    step: 24*60*60*1000,
    slide: function(event, ui){
	$("#dateLabel1").text(formatTime(new Date(ui.values[0])));
	$("#dateLabel2").text(formatTime(new Date(ui.values[1])));
	update();
    }
});

// Event listeners for coin and variable dropdowns
$("#coin-select").on("change", update);
$("#var-select").on("change", update);

// Define a transition
var trans = function(){ return d3.transition().duration(1000) };


// Read and process data
var filteredData = {};
d3.json("data/coins.json").then(function(data) {

    // Data cleaning
    for (var coin in data){
	filteredData[coin] = data[coin].filter(function(d){
	    hasVol = !(d["24h_vol"] == null);
	    hasMarketCap = !(d["market_cap"] == null);
	    hasPrice = !(d["price_usd"] == null);
	    return hasVol && hasMarketCap && hasPrice;
	})

	// convert to numbers
	filteredData[coin].forEach(function(d){
	    d["24h_vol"] = +d["24h_vol"];
	    d["market_cap"] = +d["market_cap"];
	    d["price_usd"] = +d["price_usd"];
	    d["date"] = parseTime(d["date"]);
	})

	// console.log(filteredData[coin]);
    }

    update();

})




// update function (run whenever an event is triggered)
function update(){

    // get time values from slider
    var sliderValues = $("#date-slider").slider("values");
    var coinValue = $("#coin-select").val();
    var varValue = $("#var-select").val();
    // console.log(formatTime(new Date(sliderValues[0])),formatTime(new Date(sliderValues[1])));
    // console.log(coinValue);
    // console.log(varValue);
    // console.log(filteredData);
    
    // filter data based on time
    var dateCoinFilteredData = filteredData[coinValue].filter(function(d){
	return ( (d.date >= sliderValues[0]) && (d.date <= sliderValues[1]) )
    });


    // Fix formatting of tick labels
    var siFormat = d3.format(".2s");
    function abbreviateFormat(x){
	var xSi = siFormat(x);
	switch (xSi[xSi.length-1]){
	    case "k": return xSi.slice(0,-1) + "K";
            case "M": return xSi.slice(0,-1) + "M";
	    case "G": return xSi.slice(0,-1) + "B";
	    case "T": return xSi.slice(0,-1) + "T";
            default: return xSi;
	}
    }
    

    // Update domain of scales
    xScale.domain(d3.extent(dateCoinFilteredData, function(d){ return d.date; }));
    yScale.domain(d3.extent(dateCoinFilteredData, function(d){return d[varValue]; }));

    // Update axes with new scale
    xAxisCall.scale(xScale);
    xAxis
	.transition(trans)
	.call(xAxisCall);

    yAxisCall
	.scale(yScale);
    yAxis
	.transition(trans)
	.call(yAxisCall.tickFormat(abbreviateFormat));


    // Add tooltips
    var focus = g.append("g")
	.attr("class", "focus")
	.style("display", "none");
    focus.append("circle")
	.attr("r", 5);
    focus.append("line")
	.attr("class", "x-hover-line hover-line")
	.attr("y1", 0);
    focus.append("line")
	.attr("class", "y-hover-line hover-line")
	.attr("x1", 0);
    focus.append("text")
	.attr("x", 10)
	.attr("y", -15);

    svg.append("rect")
	.attr("class", "overlay")
	.attr("transform", "translate("+margin.left+","+margin.top+")")
    	.attr("width", chartWidth)
	.attr("height", chartHeight)
	.on("mouseover", function(){ focus.style("display", null); })
	.on("mouseout", function(){ focus.style("display", "none"); })
	.on("mousemove", mousemove);

    function mousemove(){
	var xm = xScale.invert(d3.mouse(this)[0]),
	    xmi = dateBisector(dateCoinFilteredData, xm, 1),
	    d0 = dateCoinFilteredData[xmi-1],
	    d1 = dateCoinFilteredData[xmi],
	    d = (d0 && d1) ? (xm-d0.date > d1.date - xm ? d1 : d0) : 0;
	focus.attr("transform", "translate("+xScale(d.date)+","+yScale(d[varValue])+")");
	focus.select("text").text(function(){ return d3.format("$,")(d[varValue].toFixed(2)); });
	focus.select(".x-hover-line").attr("y2", chartHeight-yScale(d[varValue]));
	focus.select(".y-hover-line").attr("x2", -xScale(d.date));
    }

    
    // Define path generator for our line
    line = d3.line()
	.x(function(d){ return xScale(d.date); })
	.y(function(d){ return yScale(d[varValue]); });

    // Update line path (using smooth transition)
    g.select(".line")
	.transition(trans)
	.attr("d", line(dateCoinFilteredData));

    // update label text for y-axis
    newYlabel = function(x){
	switch (x){
	    case "price_usd": return "Price (USD";
	    case "market_cap": return "Market Capitalization (USD)";
	    case "24h_vol": return "24 Hour Trading Volume (USD)";
	    default: return "Unknown";
	}
    }
    yLabel.text(newYlabel(varValue));

}


// // For tooltip
// var bisectDate = d3.bisector(function(d) { return d.year; }).left;

// // Scales
// var x = d3.scaleTime().range([0, width]);
// var y = d3.scaleLinear().range([height, 0]);

// // Axis generators
// var xAxisCall = d3.axisBottom()
// var yAxisCall = d3.axisLeft()
//     .ticks(6)
//     .tickFormat(function(d) { return parseInt(d / 1000) + "k"; });

// // Axis groups
// var xAxis = g.append("g")
//     .attr("class", "x axis")
//     .attr("transform", "translate(0," + height + ")");
// var yAxis = g.append("g")
//     .attr("class", "y axis")
    
// // Y-Axis label
// yAxis.append("text")
//     .attr("class", "axis-title")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 6)
//     .attr("dy", ".71em")
//     .style("text-anchor", "end")
//     .attr("fill", "#5D6971")
//     .text("Population)");

// // Line path generator
// var line = d3.line()
//     .x(function(d) { return x(d.year); })
//     .y(function(d) { return y(d.value); });

// d3.json("data/example.json").then(function(data) {
//     // Data cleaning
//     data.forEach(function(d) {
//         d.year = parseTime(d.year);
//         d.value = +d.value;
//     });

//     // Set scale domains
//     x.domain(d3.extent(data, function(d) { return d.year; }));
//     y.domain([d3.min(data, function(d) { return d.value; }) / 1.005, 
//         d3.max(data, function(d) { return d.value; }) * 1.005]);

//     // Generate axes once scales have been set
//     xAxis.call(xAxisCall.scale(x))
//     yAxis.call(yAxisCall.scale(y))

//     // Add line to chart
//     g.append("path")
//         .attr("class", "line")
//         .attr("fill", "none")
//         .attr("stroke", "grey")
//         .attr("stroke-with", "3px")
//         .attr("d", line(data));

//     /******************************** Tooltip Code ********************************/

//     var focus = g.append("g")
//         .attr("class", "focus")
//         .style("display", "none");

//     focus.append("line")
//         .attr("class", "x-hover-line hover-line")
//         .attr("y1", 0)
//         .attr("y2", height);

//     focus.append("line")
//         .attr("class", "y-hover-line hover-line")
//         .attr("x1", 0)
//         .attr("x2", width);

//     focus.append("circle")
//         .attr("r", 7.5);

//     focus.append("text")
//         .attr("x", 15)
//         .attr("dy", ".31em");

//     g.append("rect")
//         .attr("class", "overlay")
//         .attr("width", width)
//         .attr("height", height)
//         .on("mouseover", function() { focus.style("display", null); })
//         .on("mouseout", function() { focus.style("display", "none"); })
//         .on("mousemove", mousemove);

//     function mousemove() {
//         var x0 = x.invert(d3.mouse(this)[0]),
//             i = bisectDate(data, x0, 1),
//             d0 = data[i - 1],
//             d1 = data[i],
//             d = x0 - d0.year > d1.year - x0 ? d1 : d0;
//         focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
//         focus.select("text").text(d.value);
//         focus.select(".x-hover-line").attr("y2", height - y(d.value));
//         focus.select(".y-hover-line").attr("x2", -x(d.year));
//     }


//     /******************************** Tooltip Code ********************************/

// });

