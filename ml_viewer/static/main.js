$(document).ready(function() {
    var classifyLegendClickHandler = function(e, legendItem) {
        var index = legendItem.datasetIndex;

        classify.activeSet = index;
    };

    var classify_canvas = $("#classify-plot");
    var classify_config = {
        type: 'line',
        data: {
            datasets: [
                {
                    data: [],
                    label: 'Set 1',
                    type: 'scatter',
                    pointStyle: 'circle',
                },
                {
                    data: [],
                    label: 'Set 2',
                    type: 'scatter',
                    pointStyle: 'cross',
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
                display: true,
                onClick: classifyLegendClickHandler
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
    var regress = new RegressPlot('regress-plot', 'regress-container');
    var colors = ["red", "blue"];
    var classify = new ClassifyPlot('classify-plot', 'classify-container', colors);
    // var classify = new ClassifyPlot("classify",classify_config,classify_canvas);

    $('input[type=radio][name=polynomial]').change(function() {
        regress.poly = Number(this.value);
        // regress.computeHypothesis();
    });

    $('#alpha').change(function() {
        regress.alpha = Number(this.value) / 100;
        // regress.computeHypothesis();
    });

    $('#iters').change(function() {
        regress.iterations = Number(this.value);
        // regress.computeHypothesis();
    });
});
