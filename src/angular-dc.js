'use strict';

angular.module('angularDc', [])

/* The main directive in angularDc, responsible creating Dc.js charts.

   The goal of this directive is to provide a AngularJs interface to
   the existing features of Dc.js.  */
.directive('dcChart', function() {

    /* Whitelisted options to be read from a chart's html attributes. */
    var directiveOptions = ['onFiltered',
                            'onPostRedraw',
                            'onPostRender',
                            'onPreRedraw',
                            'onPreRender',
                            'onZoomed',
                            'postSetupChart'];


    /* Called during the directive's linking phase, this function creates
       a Dc.js chart. The chart is configured based on settings read from
       the $scope and the html element.
     */
    function setupChart(scope, iElement, iAttrs, options) {

        // Get the element this directive blongs to, the root of chart
        var chartElement = iElement[0],

        // Get the chart type to create
        // Rather than creating a directive for each type of chart
        // we take in a parameter, and use that to call the correct Dc.js
        // chart constructor
        chartType = iAttrs.dcChart,

        // Get the Dc.js 'Chart Group', if any, for this chart.
        // Charts within a group are tied together
        chartGroupName = iAttrs.dcChartGroup || undefined;

        // Get the chart creation function for the chartType
        var chartFactory = dc[chartType];

        // Create an unconfigured instance of the chart
        var chart = chartFactory(chartElement, chartGroupName);

        // Get the potential set of options for this chart
        // Used for mapping chartElement's html attributes to chart options
        var validOptions = getValidOptionsForChart(chart);
        // Get options from chartElement's html attributes.
        var options = getOptionsFromAttrs(scope, iAttrs, validOptions);

        // Configure the chart based on options
        chart.options(options);

        // Get event handlers, if any, from options
        var eventHandlers = _({
            'preRender': options.onPreRender,
            'postRender': options.onPostRender,
            'preRedraw': options.onPreRedraw,
            'postRedraw': options.onPostRedraw,
            'filtered': options.onFiltered,
            'zoomed': options.onZoomed,
        }).omit(_.isUndefined)

        // Register the eventHandlers with the chart (Dc.js)
        eventHandlers.each(function(handler, evt) {
            chart.on(evt, handler);
        }).value();

        // Run the postSetupChart callback, if provided
        if (_.isFunction(options.postSetupChart)) {
            options.postSetupChart(chart, options);
        }

        return chart;
    }

    function getValidOptionsForChart(chart) {

        // all chart options are exposed via a function
        return _(chart).functions()
        .extend(directiveOptions)
        .map(function(s){ return "dc" + s.charAt(0).toUpperCase() + s.substring(1)})
        .value();
    }

    function getOptionsFromAttrs(scope, iAttrs, validOptions) {
        return _(iAttrs.$attr)
            .keys()
            .intersection(validOptions)
            .map(function(key) {
                var value = scope.$eval(iAttrs[key]);
                if (key.substring(0,2) === "dc") {
                    key = key.charAt(2).toLowerCase() + key.substring(3);
                }
                return [key, value];
            })
            .zipObject()
            .value();
    }
    return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
            // add dc and d3 to the scope to allow snippets to be configured in
            // the templates
            scope.dc = dc
            scope.d3 = d3

            // watch for the scope to settle until all the attributes are defined
            var unwatch = scope.$watch(function() {
                var options = _(iAttrs.$attr)
                .keys()
                .filter(function(s) {
                    return s.substring(0, 2) === "dc"
                           && s !== "dcChart"
                           && s !== "dcChartGroup"
                })
                .map(function(key) {
                    try {
                        return scope.$eval(iAttrs[key]);
                    } catch (e) {
                        return undefined
                    }
                });
                return options.value()
            }, function(options) {
                if (!_(options).any(_.isUndefined) ){
                    var chart = setupChart(scope, iElement, iAttrs);
                    chart.render();

                    // watching the attributes is costly, so we stop after first rendering
                    unwatch()
                }
            });
        }
    };

});
