'use strict';

angular.module('angularDc', [])

/* The main directive in angularDc, responsible creating Dc.js charts.

   The goal of this directive is to provide a AngularJs interface to
   the existing features of Dc.js.  */
.directive('dcChart', function() {

    // At one point there were default options
    // If this stays empty, remove it
    var defaultOptions = {};

    /* Whitelisted options to be read from a chart's html attributes. */
    var directiveOptions = ['config',
                            'onFiltered',
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
    function setupChart(scope, iElement, iAttrs) {

        // Get the element this directive blongs to, the root of chart
        var chartElement = iElement[0],

        // Get the chart type to create
        // Rather than creating a directive for each type of chart
        // we take in a parameter, and use that to call the correct Dc.js
        // chart constructor
        chartType = iAttrs.dcChart || iAttrs.chartType,

        // Get the Dc.js 'Chart Group', if any, for this chart.
        // Charts within a group are tied together
        chartGroupName = iAttrs.chartGroup || undefined;

        // Get the chart creation function for the chartType
        var chartFactory = dc[chartType];

        // Create an unconfigured instance of the chart
        var chart = chartFactory(chartElement, chartGroupName);

        // Get the potential set of options for this chart
        // Used for mapping chartElement's html attributes to chart options
        var validOptions = getValidOptionsForChart(chart);

        // Get options from the 'config' object if it exists
        var objOptions = getOptionsFromConfig(scope, validOptions);

        // Get options from chartElement's html attributes.
        var attrOptions = getOptionsFromAttrs(scope, iAttrs, validOptions);

        // Get options explicitly mapped in this directive's scope
        var scopeOptions = getOptionsFromScope(scope, validOptions);

        // Merge the above options.
        // Option precedence is: scope > attribute > config object
        var options = _({})
            .merge(defaultOptions,
                objOptions,
                attrOptions,
                scopeOptions)
            .value();

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
        var exposedFunctions = _(chart).functions().value();

        // A few custom options are whitelisted in the directiveOptions array
        var validOptions = _(exposedFunctions).extend(directiveOptions).value();

        return validOptions;
    }

    function getOptionsFromConfig(scope, validOptions) {
        var config = scope.config();
        if (!_.isObject(config)) {
            config = {};
        }
        return config;
    }

    function getOptionsFromAttrs(scope, iAttrs, validOptions) {
        return _(iAttrs.$attr)
            .keys()
            .intersection(validOptions)
            .map(function(key) {
                var value;
                try {
                    value = scope.$parent.$eval(iAttrs[key]);
                } catch (e) {
                    value = iAttrs[key];
                }
                return [key, value];
            })
            .zipObject()
            .value();
    }

    function getOptionsFromScope(scope, validOptions) {
        return _(scope).keys()
            .intersection(validOptions)
            .map(function(key) {
                return [key, _.result(scope, key)]
            })
            .zipObject()
            .value();
    }

    return {
        restrict: 'EAC',
        // TODO: Decide if this directive even needs its own scope
        scope: {
            group: '&',
            dimension: '&',
            width: '=',
            height: '=',
            config: '&',
            onPreRender: '&',
            onPostRender: '&',
            onPreRedraw: '&',
            onPostRedraw: '&',
            onFiltered: '&',
            onZoomed: '&',
        },
        // TODO: Forcing this default template isn't user friendly
        template: '<svg></svg>',
        link: function(scope, iElement, iAttrs) {

            // Well gee, now that all of the setup logic is
            // encapsulated in setupChart this link function
            // looks pretty empty
            var chart = setupChart(scope, iElement, iAttrs);
            chart.render();

        }
    };

});
