function Plot(name, config, canvas) {
    this.config = config;
    this.coordinates = {x: [], y:[], value: []};
    this.theta = [];
    this.canvas = canvas;
    this.activeSet = 0;
    var ctx = canvas[0].getContext("2d");
    this.chart = new Chart(ctx, config);
    
    window[name] = Plot.chart;
}

Plot.prototype.pushCoords = function(loc, set) {
    this.coordinates.x.push(loc.x);
    this.coordinates.y.push(loc.y);
    this.coordinates.value.push(set);
    this.config.data.datasets[set].data.push(loc);
    this.chart.update();
};

function ClickPlot(name,config,canvas,onclick) {
    Plot.call(this, name, config, canvas);

    if(onclick) {
        this.onclick = onclick;
    }

    var self = this;
    this.canvas.click(function(e) {
        mousePoint = Chart.helpers.getRelativePosition(e, self.chart);
        var x_loc = self.chart.scales['x-axis-0'].getValueForPixel(mousePoint.x);
        var y_loc = self.chart.scales['y-axis-0'].getValueForPixel(mousePoint.y);
        if(x_loc > 1000 || y_loc > 1000) return;
        loc = {x: x_loc, y: y_loc};
        self.pushCoords(loc, self.activeSet);
        self.chart.update();

        if(self.onclick) {
            self.onclick();
        }
    });
}

ClickPlot.prototype = Object.create(Plot.prototype);

Object.defineProperty(ClickPlot.prototype, 'constructor', {
    value: ClickPlot,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
});
