/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/

const svgWidth = 600;
const svgHeight = 400;
var margin = {left:100, right:10, top:10, bottom:150};

// width & height of viz area
var chartWidth = svgWidth - margin.left - margin.right,
    chartHeight = svgHeight - margin.top - margin.bottom;

// group element
var svg = d3.select("#chart-area")
    .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate("+margin.left+","+margin.top+")");


// x label
svg.append("text")
    .attr("class", "x-axis label")
    .attr("x", chartWidth/2)
    .attr("y", chartHeight+margin.bottom*0.3)
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .text("Month");

// y label
svg.append("text")
    .attr("class", "y-axis label")
    .attr("x", -(chartHeight/2))
    .attr("y", -margin.left*0.6)
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Revenue (USD)");

// var chartAreaBorderPath = svg.append("rect")
//     .attr("x", 0)
//     .attr("y", 0)
//     .attr("height", chartHeight)
//     .attr("width", chartWidth)
//     .style("stroke", "orange")
//     .style("fill", "none")
//     .style("stroke-width", 1);

// load data (starts from root directory where index.html is located)
d3.json("data/revenues.json").then(function(data){
    // console.log(data);

    // convert revenue from string to int
    data.forEach( function(d){
	d.revenue = +d.revenue;
    });

    // define band-scale for x (items in a list)
    var xScaleBand = d3.scaleBand()
    	.domain(data.map(function(d){ return d.month }))
    	.range([0,chartWidth])
	.padding(0.2);
    	// .paddingInner(0.1)
    	// .paddingOuter(0.1);
    
    // define linear-scale for y (continuous values)
    var yScaleLinear = d3.scaleLinear()
    	.domain([0, d3.max(data, function(d){ return d.revenue})])
	.range([chartHeight, 0])
    	// .range([0, chartHeight]);

    
    // produce x axis
    var xAxisCall = d3.axisBottom(xScaleBand);
    svg.append("g")
    	.attr("class", "x axis")
    	.attr("transform", "translate(0,"+chartHeight+")")
    	.call(xAxisCall);
    // .selectAll("")

    // produce y axis
    var yAxisCall = d3.axisLeft(yScaleLinear)
    	.ticks(5)
    	.tickFormat(function(d){return "$"+d; });
    svg.append("g")
    	.attr("class", "y axis")
    	.call(yAxisCall);

    // bars
    var rects = svg.selectAll("rect")
	.data(data)

    rects.enter()
	.append("rect")
    // .attr("y", 0)
	.attr("y", function(d){ return yScaleLinear(d.revenue); })
	.attr("x", function(d){ return xScaleBand(d.month) })
    // .attr("y", function(d){ return yScaleLinear(d.revenue); })
	.attr("height", function(d){ return chartHeight - yScaleLinear(d.revenue); })
	.attr("width", xScaleBand.bandwidth)
	.attr("fill", "grey");
    
    

    
    
})

