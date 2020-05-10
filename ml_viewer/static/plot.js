function Plot(name, config, canvas) {
    this.config = config;
    this.coordinates = [{x: [], y:[]}];
    this.theta = [];
    this.canvas = canvas;
    var ctx = canvas[0].getContext("2d");
    this.chart = new Chart(ctx, config);

    window[name] = Plot.chart;
}

Plot.prototype.pushCoords = function(loc, set) {
    this.coordinates[set].x.push(loc.x);
    this.coordinates[set].y.push(loc.y);
    this.config.data.datasets[set].data.push(loc);
    this.chart.update();
};

function ClickPlot(name,config,canvas,onclick) {
    Plot.call(this, name, config, canvas);

    console.log(this);
    var self=this;

    if(onclick) {
        this.onclick = onclick;
    }

    this.canvas.click(function(e) {
        mousePoint = Chart.helpers.getRelativePosition(e, self.chart);
        var x_loc = self.chart.scales['x-axis-0'].getValueForPixel(mousePoint.x);
        var y_loc = self.chart.scales['y-axis-0'].getValueForPixel(mousePoint.y);
        loc = {x: x_loc, y: y_loc};
        self.pushCoords(loc, 0);
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
    writable: true });
