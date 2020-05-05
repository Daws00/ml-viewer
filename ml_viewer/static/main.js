var canvas = $("#plotter");
var ctx = canvas[0].getContext("2d");

var config = {
    type: 'line',
    data: {
        datasets: [
            {
                data: [],
                fill: false,
            },
            {
                data: [],
                type: 'scatter'
            }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        scales: {
            xAxes: [{
                gridLines: {
                    drawBorder: false,
                },
                type: 'linear',
                ticks: {
                    min: 0,
                    max: 1000
                }
            }],
            yAxes: [{
                gridLines: {
                    drawBorder: false,
                },
                ticks: {
                    min: 0,
                    max: 1000
                }
            }]
        }
    }
};

var x_coords = [];
var y_coords = [];
var theta = [];

var alpha = 0.15;
var num_iter = 10000;
var poly = 3;

$(document).ready(function(e) {
    window.chart = new Chart(ctx, config);
    window.chart.update();
    canvas.click(function(e) {
        mousePoint = Chart.helpers.getRelativePosition(e, chart);
        var x_loc = chart.scales['x-axis-0'].getValueForPixel(mousePoint.x);
        var y_loc = chart.scales['y-axis-0'].getValueForPixel(mousePoint.y);
        loc = {x: x_loc, y: y_loc};
        push_location(loc);
        if(x_coords.length <= 1) return;
        window.chart.update();

        theta = new Array(poly+1).fill(1);
        var data = {"theta":theta,"X":x_coords,"Y":y_coords, "alpha":alpha, "num_iter":num_iter, "poly": poly};
        if(x_coords.length > 1){
            $.ajax({
                type: 'POST',
                url: $SCRIPT_ROOT + '/_gradient_descent',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(data),
                cache: false,
                success: function(result) {
                    var h = [];
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
                    populate_hypothesis(h, theta, mu, sigma);
                    config.data.datasets[0].data = h;
                    window.chart.update();
                }
            });
        }
    });
});

function gradient_descent(X, y, theta, alpha, num_iter){
    m = y.size;
    for (var i = 0; i < num_iter; i++){
        var h = X.dot(theta);
        var loss = h.sub(y);
        var gradient = (X.transpose().dot(loss)).div(m);
        theta = tf.sub(theta, tf.mul(alpha, gradient));
    }
    return theta;
}

function feature_normalize(X){
    var X_norm = X;

    var moments = tf.moments(X_norm);
    mu = moments.mean;
    sigma = moments.variance.sqrt();
    X_norm = X_norm.sub(mu);
    X_norm = X_norm.sub(mu).div(sigma);
    return {normal: X_norm,mu: mu,sigma: sigma};
}

function push_location(loc){
    x_coords.push(loc.x);
    y_coords.push(loc.y);
    config.data.datasets[1].data.push(loc);

    window.chart.update();
}

function populate_hypothesis(h, theta, mu, sigma){
    for(i = 0; i < 100; i++) {
        var x = (10*i);
        var y = theta[0];
        for (j = 1; j < theta.length; j++) {
            y += (Math.pow(x,j)-mu[j-1])*theta[j] / sigma[j-1];
        }
        h.push({x: x, y: y});
    }
    console.log(h);
    return h;
}
