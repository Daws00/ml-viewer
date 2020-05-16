d3.json('static/forecast.json')
.then(function(d) {
    var temperatures = [],
        dates = [],
        margin = { top: 0, right: 0, bottom: 30, left: 20 },
        height = 400 - margin.top - margin.bottom,
        width = 600 - margin.left - margin.right;

    var tempColor,
        yScale,
        yAxisValues,
        yAxisTicks,
        yGuide,
        xScale,
        xAxisValues,
        xAxisTicks,
        xGuide,
        colors,
        tooltip,
        chart;

    for(var i = 0; i < d.list.length; i++) {
        temperatures.push(d.list[i].main.temp);
        dates.push(new Date(d.list[i].dt_txt));
    }
yScale = d3.scaleLinear()
    .domain([0, d3.max(temperatures)])
    .range([0, height]);

yAxisValues = d3.scaleLinear()
    .domain([0, d3.max(temperatures)])
    .range([height, 0]);

yAxisTicks = d3.axisLeft(yAxisValues)
    .ticks(10);

xScale = d3.scaleBand()
    .domain(temperatures)
    .paddingInner(0.1)
    .paddingOuter(0.1)
    .range([0, width]);

xAxisValues = d3.scaleTime()
    .domain([dates[0], dates[dates.length - 1]])
    .range([0, width]);

xAxisTicks = d3.axisBottom(xAxisValues)
    .ticks(d3.timeDay.every(1));

colors = d3.scaleLinear()
    .domain([0, 65, d3.max(temperatures)])
    .range(['#FFFFFF', '#2D8BCF', '#DA3637']);

tooltip = d3.select('body')
            .append('div')
            .style('position', 'absolute')
            .style('padding', '0 10px')
            .style('background', 'white')
            .style('opacity', 0);

chart = d3.select('#regress-container').append('svg')
    .attr('width',width + margin.left + margin.right)
    .attr('height',height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate('+ margin.left + ',' + margin.right +')')
.selectAll('rect').data(temperatures)
    .enter().append('rect')
        .style('fill', colors)
        .attr('width', function(d) {
            return xScale.bandwidth();
        })
        .attr('height', 0)
        .attr('x', function(d,i) {
            return xScale(d);
        })
        .attr('y', height)
        .on('mouseover', function(d) {
            tooltip.transition().duration(200)
                .style('opacity',0.9);
            tooltip.html(
                '<div style="font-size: 1rem; font-weight: bold">' +
                d + '&deg;</div>'
            )
                .style('left', (d3.event.pageX - 35) + 'px')
                .style('top', (d3.event.pageY - 30) + 'px');

            tempColor = this.style.fill;
            d3.select(this)
                .style('opacity', 0.5);
        })
        .on('mouseout', function(d) {
            tooltip.html('');
            d3.select(this)
                .style('opacity', 1);
        });

yGuide = d3.select('#regress-container svg').append('g')
            .attr('transform', 'translate(20,0)')
            .call(yAxisTicks);

xGuide = d3.select('#regress-container svg').append('g')
            .attr('transform', 'translate(20, '+height+')')
            .call(xAxisTicks);

chart.transition()
    .attr('height', function(d) {
        return yScale(d);
    })
    .attr('y', function(d) {
        return height - yScale(d);
    })
    .delay(function(d, i) {
        return i * 20;
    });
});
