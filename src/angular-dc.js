'use strict';

var angularDc = angular.module('angularDc', []);

/* The main directive in angularDc, responsible creating Dc.js charts.

       The goal of this directive is to provide a AngularJs interface to
       the existing features of Dc.js.  */
angularDc.directive('dcChart', ['$timeout',
    function($timeout) {

        /* Whitelisted options to be read from a chart's html attributes. */
        var directiveOptions = ['name',
            'onRenderlet',
            'onFiltered',
            'onPostRedraw',
            'onPostRender',
            'onPreRedraw',
            'onPreRender',
            'onZoomed',
            'postSetupChart'
        ];


        /* Called during the directive's linking phase, this function creates
       a Dc.js chart. The chart is configured based on settings read from
       the $scope and the html element.
     */

        function setupChart(scope, iElement, iAttrs, options) {

            // Get the element this directive blongs to
            var rootElement = iElement[0];

            // If we have a child element with class 'chart', we use it as the chart element instead of the directive's element
            var customChartElement = rootElement.querySelector('.chart');

            // The root of chart
            var chartElement = customChartElement ? customChartElement : rootElement,

                // Get the chart type to create
                // Rather than creating a directive for each type of chart
                // we take it as our main parameter, and use that to call the correct Dc.js
                // chart constructor
                chartType = iAttrs.dcChart,

                // Get the Dc.js 'Chart Group', if any, for this chart.
                // Charts within a group are tied together
                chartGroupName = iAttrs.dcChartGroup || undefined;

            // Get the chart creation function for the chartType
            var chartFactory = dc[chartType];

            // Create an unconfigured instance of the chart
            var chart = chartFactory(chartElement, chartGroupName);

            // Override turn on/off controls so that control elements may reside outside the chart element, whilst inside the root element
            if (customChartElement) {
                chart.turnOnControls = function () {
                    console.log(iElement, d3.select(iElement[0]), d3.select(iElement));
                    d3.select(iElement[0]).selectAll('.reset').style('display', null);
                    d3.select(iElement[0]).selectAll('.filter').text(chart.filterPrinter()(chart.filters())).style('display', null);
                    return chart;
                };
                chart.turnOffControls = function () {
                    d3.select(iElement[0]).selectAll('.reset').style('display', 'none');
                    d3.select(iElement[0]).selectAll('.filter').style('display', 'none').text(chart.filter());
                    return chart;
                };
            }

            // Get the potential set of options for this chart
            // Used for mapping chartElement's html attributes to chart options
            var validOptions = getValidOptionsForChart(chart);

            // Get additional options from chartElement's html attributes.
            // All options are prepended with 'dc-'' to avoid clashing with html own meaning (e.g width)
            // All options are parsed in angular's $parse language, so beware, it is not javascript!
            options = getOptionsFromAttrs(scope, iAttrs, validOptions);

            // we may have a dc-options attribute which contain a javascript object for stuff
            // not writtable in $parse language
            if ('options' in options) {
                options = _.merge(options, options.options);
                options.options = undefined;
            }
            // If we have a dc-name attribute, we populate the scope with the chart
            // object dc-name
            if ('name' in options) {
                scope[options.name] = chart;
                options.name = undefined;
            }
            // Configure the chart based on options
            chart.options(options);

            // Get event handlers, if any, from options
            var eventHandlers = _({
                'renderlet': options.onRenderlet,
                'preRender': options.onPreRender,
                'postRender': options.onPostRender,
                'preRedraw': options.onPreRedraw,
                'postRedraw': options.onPostRedraw,
                'filtered': options.onFiltered,
                'zoomed': options.onZoomed,
            }).omit(_.isUndefined);

            // Register the eventHandlers with the chart (Dc.js)
            eventHandlers.each(function(handler, evt) {
                chart.on(evt, handler);
            });

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
                .map(function(s) {
                    return 'dc' + s.charAt(0).toUpperCase() + s.substring(1);
                })
                .value();
        }

        function getOptionsFromAttrs(scope, iAttrs, validOptions) {
            return _(iAttrs.$attr)
                .keys()
                .intersection(validOptions)
                .map(function(key) {
                    var value = scope.$eval(iAttrs[key]);
                    // remove the dc- prefix if any
                    if (key.substring(0, 2) === 'dc') {
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
                var printExceptions = false;
                // add dc, d3 and commonly used Date method to the scope to allow snippets to be configured in
                // the templates
                scope.dc = dc;
                scope.d3 = d3;
                scope.DateTime = function(a, b, c, d, e, f) {
                    return new Date(a, b, c, d, e, f);
                };
                scope.Date = function(a, b, c) {
                    return new Date(a, b, c);
                };
                // watch for the scope to settle until all the attributes are defined
                var unwatch = scope.$watch(function() {
                    var options = _(iAttrs.$attr)
                        .keys()
                        .filter(function(s) {
                            return s.substring(0, 2) === 'dc' && s !== 'dcChart' && s !== 'dcChartGroup';
                        })
                        .map(function(key) {
                            try {
                                // We ignore exception waiting for the data to be potentially loaded
                                // by the controller
                                var r = scope.$eval(iAttrs[key]);
                                if (_.isUndefined(r)) {
                                    throw new Error(iAttrs[key] + ' is undefined');
                                }
                                return r;
                            } catch (e) {
                                if (printExceptions) {
                                    console.log('unable to eval' + key + ':' + iAttrs[key]);
                                    throw e;
                                }
                                return undefined;
                            }
                        });
                    if (options.any(_.isUndefined)) {
                        // return undefined if there is at least one undefined option
                        // so that the $watch dont call us again at this $digest time
                        return undefined;
                    }
                    return options.value();
                }, function(options) {
                    if (!_.isUndefined(options)) {
                        // Stop the $watch, as we now created the charts
                        unwatch();

                        var chart = setupChart(scope, iElement, iAttrs);
                        // populate the .reset childrens with necessary reset callbacks
                        var a = angular.element(iElement[0].querySelector('a.reset'));
                        a.on('click', function() {
                            chart.filterAll();
                            dc.redrawAll();
                        });
                        a.attr('href', 'javascript:;');
                        a.css('display', 'none');
                        // watching the attributes is costly, so we stop after first rendering
                        chart.render();
                    }
                });
                // if after 4 second we still get exceptions, we should raise them
                // to help debugging. $timeout will trigger another round of check.
                $timeout(function() {
                    printExceptions = true;
                }, 2000);

            }
        };

    }
]);

/* Another directive, responsible of integration angular's select directive with dc.

    <dc-select dc-dimension="fooDimension", all-label="All foos"/>

   This directive helps to filter by arbitrary dimensions without need for another graph.

   Note that if there is a graph on the same dimension as the select, changing the select value
   will not update the graph's own selection. This is also the case if you make 2 graphs
   with same dimension. This is a limitation of the underlying lib dc.js
*/

angularDc.directive('dcSelect', [
    function() {
        return {
            restrict: 'E',
            scope: {
                dcDimension: '=',
                allLabel: '@'
            },
            template: '<select class="form-control" ng-model="selectModel" ' + 'ng-options="d.key for d in selectOptions">',
            link: function(scope, iElement, iAttrs) {
                scope.$watch('dcDimension', function(dimension) {
                    var allkeys, chart;
                    if (dimension !== null) {
                        // we make a fake chart so that the dimension is known by dc.filterAll()
                        chart = dc.baseMixin({});
                        chart.dimension(dimension);
                        chart.group(dimension);
                        chart._doRender = function() {};
                        chart._doRedraw = function() {};
                        scope.selectModel = {
                            key: scope.allLabel
                        };
                        allkeys = dimension.group().orderNatural().all();
                        scope.selectOptions = [scope.selectModel].concat(allkeys);
                    }
                });
                return scope.$watch('selectModel', function(sel) {
                    if (scope.dcDimension !== null) {
                        if (sel !== null && sel.key !== scope.allLabel) {
                            scope.dcDimension.filter(function(d) {
                                return d === sel.key;
                            });
                        } else {
                            scope.dcDimension.filter(null);
                        }
                        dc.redrawAll();
                    }
                });
            }
        };
    }
]);
