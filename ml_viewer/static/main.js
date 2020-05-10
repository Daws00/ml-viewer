$(document).ready(function() {
    var regress_canvas = $("#regress-plot");
    var regress_config = {
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
                },
            ]
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
    var regress = new RegressPlot("regress",regress_config,regress_canvas);

    $('input[type=radio][name=polynomial]').change(function() {
        regress.poly = Number(this.value);
        regress.computeHypothesis();
    });

    $('#alpha').change(function() {
        regress.alpha = Number(this.value) / 100;
        regress.computeHypothesis();
    });

    $('#iters').change(function() {
        regress.iterations = Number(this.value);
        regress.computeHypothesis();
    });
});
