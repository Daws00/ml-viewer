function Plot(id, container) {
    var self = this;

    this.id = id;

    this.parent = document.getElementById(container);
    this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
    this.activeSet = 0;

    this.yScale = d3.scaleLinear()
        .domain([0, 1000])
        .range([self.height(), 0]);

    this.yAxisValues = d3.scaleLinear()
        .domain([0, 1000])
        .range([self.height(), 0]);

    this.yAxisTicks = d3.axisLeft(self.yAxisValues)
        .ticks(10);

    this.xScale = d3.scaleLinear()
        .domain([0, 1000])
        .range([0, self.width()]);

    this.xAxisValues = d3.scaleLinear()
        .domain([0, 1000])
        .range([0, self.width()]);

    this.xAxisTicks = d3.axisBottom(self.xAxisValues)
        .ticks(10);

    this.draw = d3.select('#'+this.parent.id).append('svg')
        .attr("id", id)
        .attr('width', 800)
        // .attr('width', self.parent.clientWidth)
        .attr('height', 800)
        // .attr('height', self.parent.clientHeight)
        .append('g')
        .attr('id','chart-area')
        .attr('transform', 'translate('+ self.margin.left + ',' + self.margin.top +')');

    this.svg = d3.select('#'+ this.parent.id +' svg');

    this.yGuide = this.svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate('+self.margin.left+','+self.margin.top+')')
        .call(self.yAxisTicks);

    this.xGuide = this.svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate('+self.margin.left+', '+ (self.height()+self.margin.top) +')')
        .call(self.xAxisTicks);

    d3.select(window)
        .on('resize', function(d) {
            // TODO: responsive chart
            // https://stackoverflow.com/questions/16919280/how-to-update-axis-using-d3-js

            // d3.select('#'+id)
            //     .attr('width', self.parent.clientWidth)
            //     .attr('height', self.parent.clientWidth);
            // d3.select('#'+id+' .y-axis')
            //     .call(self.yGuide);
        });
}

Plot.prototype.width = function() {
    return 800 - this.margin.left - this.margin.right;

    // return this.parent.clientWidth - this.margin.left - this.margin.right;
};

Plot.prototype.height = function() {
    return 800 - this.margin.top - this.margin.bottom;

    // return this.parent.clientHeight - this.margin.top - this.margin.bottom;
};

function ClickPlot(id, container, setColors) {
    Plot.call(this,id,container);
    var self = this;

    this.point_radius = 5;
    this.setColors = (typeof setColors !== 'undefined') ? setColors : ["red"];
    this.chart = self.svg
        .on('click', function(d) {
            mouse = d3.mouse(this);
            console.log(self.activeSet);
            self.data.push({x: self.xScale.invert(mouse[0] - self.margin.left), y: self.yScale.invert(mouse[1]-self.margin.top), value: self.activeSet});
            point = d3.select('#chart-area')
                .append('circle')
                .style('fill', function() {
                    return self.setColors[self.activeSet];
                })
                .style('opacity', '.5')
                .attr('cx', mouse[0] - self.margin.left)
                .attr('cy', mouse[1] - self.margin.top)
                .attr('r', self.point_radius);

            if(self.data.length > 1) {
                console.log(self.data);
                self.computeHypothesis();
            }
        });

}

ClickPlot.prototype = Object.create(Plot.prototype);

Object.defineProperty(ClickPlot.prototype, 'constructor', {
    value: ClickPlot,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
});

function RegressPlot(id, container) {
    ClickPlot.call(this,id,container);
    var self = this;

    this.point_radius = 5;
    this.data = [];
    this.alpha = 0.25;
    this.iterations = 5000;
    this.poly = 1;
    this.theta = [];

    this.points = d3.select('#'+id+' chart-area')
            .selectAll('circle').data(self.data)
                .enter().append('circle')
                    .style('fill', "red")
                    .style('opacity', '.5')
                    .attr('cx', function(d,i) {
                        return xScale(d.x);
                    })
                    .attr('cy', function(d,i) {
                        return yScale(d.y);
                    })
                    .attr('r', self.point_radius);
    this.line = d3.select('#chart-area').append('path')
        .attr('id', 'hypothesis')
        .attr("stroke", "gray")
        .attr("stroke-width", 3)
        .attr("fill", "none");

    // NOTE: Bootstrap's JQuery requirement interferes with d3 select
    // console.log(d3.select('#poly-selector'));
    $('input[type=radio][name=polynomial]')
        .change(function(d) {
            self.poly = Number(this.value);
            self.computeHypothesis();
        });

    d3.select('#alpha')
        .on('change', function(d) {
            self.alpha = Number(this.value) / 100;
            self.computeHypothesis();
        });

    d3.select('#iters')
        .on('change', function(d) {
            self.iterations = Number(this.value);
            self.computeHypothesis();
        });
}

RegressPlot.prototype = Object.create(ClickPlot.prototype);

Object.defineProperty(RegressPlot.prototype, 'constructor', {
    value: RegressPlot,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
});

RegressPlot.prototype.computeHypothesis = function() {
    var self = this;
    var x = [];
    var y = [];
    self.data.forEach(function(d) {x.push(d.x); y.push(d.y);});

    self.theta = new Array(this.poly+1).fill(1);
    var data_out = {"theta":self.theta,"X": x,"Y": y, "alpha": self.alpha, "num_iter": self.iterations, "poly": self.poly};
    url = $SCRIPT_ROOT + '/_gradient_descent';
    fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data_out),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    }).then(function(response){
        response.json().then(function(result) {
            var theta = [];
            for(var t = 0; t < result.theta.length; t++) {
                theta.push(parseFloat(result.theta[t]));
            }
            var sigma = [];
            for(var s = 0; s < result.sigma.length; s++) {
                sigma.push(parseFloat(result.sigma[s]));
            }
            var mu = [];
            for(var m = 0; m < result.mu.length; m++) {
                mu.push(parseFloat(result.mu[m]));
            }
            self.populateHypothesis(theta, mu, sigma);
        });
    });
};

RegressPlot.prototype.populateHypothesis = function(theta, mu, sigma) {
    var self = this;
    var h = [];
    for(i = 0; i < 100; i++) {
        var x = (10*i);
        var y = theta[0];
        for (j = 1; j < theta.length; j++) {
            y += (Math.pow(x,j)-mu[j-1])*theta[j] / sigma[j-1];
        }
        h.push({x: x, y: y});
    }
    var line = d3.line()
        .x(function(d) {return self.xScale(d.x);})
        .y(function(d) {return self.yScale(d.y);})
        .curve(d3.curveBasis);
    d3.select('#hypothesis').transition()
        .ease(d3.easeCubicOut)
        .duration(500)
        .attr("d",line(h));
};
