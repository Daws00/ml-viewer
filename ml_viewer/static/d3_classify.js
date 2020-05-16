function ClassifyPlot(id, container, setColors) {
    ClickPlot.call(this,id,container, setColors);
    var self = this;

    this.data = [];
    this.alpha = 0.25;
    this.iterations = 2500;
    this.poly = 1;
    this.theta = [];

    this.points = d3.select('#'+id+' chart-area')
            .selectAll('circle').data(self.data)
                .enter().append('circle')
                    .style('fill', function(d) {
                        if(d.value == 0) return "red";
                        else return "blue";
                    })
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
    $('input[type=radio][name=set]')
        .change(function(d) {
            self.activeSet = Number(this.value);
        });
}

ClassifyPlot.prototype = Object.create(ClickPlot.prototype);

Object.defineProperty(ClassifyPlot.prototype, 'constructor', {
    value: ClassifyPlot,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
});

ClassifyPlot.prototype.computeHypothesis = function() {
    var self = this;
    var x = [[],[]];
    var y = [];
    self.data.forEach(function(d) {
        x[0].push(d.x);
        x[1].push(d.y);
        y.push(d.value);
    });

    self.theta = new Array(this.poly+1).fill(1);
    var data_out = {"theta":self.theta,"X": x,"Y": y, "alpha": self.alpha, "num_iter": self.iterations, "poly": self.poly};
    url = $SCRIPT_ROOT + '/_log_regression';
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
            // self.populateHypothesis(theta, mu, sigma);
        });
    });
};

ClassifyPlot.prototype.populateHypothesis = function(theta, mu, sigma) {
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
