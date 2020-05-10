var config = {
    type: 'line',
    data: {
        datasets: [
            {
                data: [],
                type: 'scatter'
            },
            {
                data: [],
                fill: false,
            },]
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
            },
            tooltips: {
                enabled: false,
            },
        }
};

$(document).ready(function() {
    var canvas = $("#regress-plot");
    var ctx = canvas[0].getContext("2d");
    var regress_coords = {x: [], y: []};
    var theta = [];

    var alpha = 0.15;
    var iterations = 10000;
    var poly = 1;

    window.regress = new Chart(ctx, config);
    window.regress.update();

    canvas.click(function(e) {
        mousePoint = Chart.helpers.getRelativePosition(e, regress);
        var x_loc = regress.scales['x-axis-0'].getValueForPixel(mousePoint.x);
        var y_loc = regress.scales['y-axis-0'].getValueForPixel(mousePoint.y);
        loc = {x: x_loc, y: y_loc};
        push_location(loc);
        window.regress.update();

        compute_hypothesis();
    });

    $('input[type=radio][name=polynomial]').change(function() {
        poly = Number(this.value);
        compute_hypothesis();
    });

    $('#alpha').change(function() {
        alpha = Number(this.value) / 100;
        compute_hypothesis();
    });

    $('#iters').change(function() {
        iterations = Number(this.value);
        compute_hypothesis();
    });
});

function compute_hypothesis() {
    if(regress_coords.x.length <= 1) return;
    theta = new Array(poly+1).fill(1);
    var data = {"theta":theta,"X":regress_coords.x,"Y":regress_coords.y, "alpha":alpha, "num_iter":iterations, "poly": poly};
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
            window.regress.update();
        }
    });
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
    return h;
}

function push_location(loc){
    regress_coords.x.push(loc.x);
    regress_coords.y.push(loc.y);
    config.data.datasets[1].data.push(loc);

    window.regress.update();
}
