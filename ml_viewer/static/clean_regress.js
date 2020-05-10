function RegressPlot(name, config, canvas) {
    ClickPlot.call(this, name, config, canvas, this.computeHypothesis);

    this.alpha = 0.25;
    this.iterations = 2500;
    this.poly = 1;
}

RegressPlot.prototype = Object.create(ClickPlot.prototype);

RegressPlot.prototype.computeHypothesis = function() {
    var self = this;
    var x = this.coordinates[0].x;
    var y = this.coordinates[0].y;
    if(x.length <= 1) return;
    theta = new Array(this.poly+1).fill(1);
    var data = {"theta":theta,"X": x,"Y": y, "alpha": this.alpha, "num_iter": this.iterations, "poly": this.poly};
    $.ajax({
        type: 'POST',
        url: $SCRIPT_ROOT + '/_gradient_descent',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(data),
        cache: false,
        success: function(result) {
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
            console.log(theta);

            self.populateHypothesis(theta, mu, sigma);
        }
    });
};

RegressPlot.prototype.populateHypothesis = function(theta, mu, sigma) {
    var h = [];
    for(i = 0; i < 100; i++) {
        var x = (10*i);
        var y = theta[0];
        for (j = 1; j < theta.length; j++) {
            y += (Math.pow(x,j)-mu[j-1])*theta[j] / sigma[j-1];
        }
        h.push({x: x, y: y});
    }

    this.config.data.datasets[1].data = h;
    this.chart.update();
};

RegressPlot.prototype.x = function() {
    return this.coordinates[0].x;
};

RegressPlot.prototype.y = function() {
    return this.coordinates[0].y;
};
