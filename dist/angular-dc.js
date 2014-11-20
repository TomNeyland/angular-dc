(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['angular', 'dc', 'lodash', 'd3'], function(angular, dc, _, d3) {
            return (root.returnExportsGlobal = factory(angular, dc, _, d3));
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        root['angularDc'] = factory(root.angular, root.dc, root._, root.d3);
    }
}(this, function(angular, dc, _, d3) {

    'use strict';
    var angularDc = angular.module('angularDc', []);
    angularDc.directive('dcChart', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            scope: {
                dcChart: '=',
                dcChartGroup: '=',
                dcOptions: '='
            },
            link: function(scope, element, attrs) {
                scope.alreadyRendered = false;

                scope.$watch('dcOptions', function(options) {
                    if (attrs.dcChart !== undefined && scope.dcOptions !== undefined) {
                        if (scope.alreadyRendered) {
                            scope.chart.options(scope.dcOptions);
                            scope.chart.redraw();
                        } else {
                            scope.chart = dc[attrs.dcChart](element[0], scope.dcChartGroup || undefined);
                            scope.chart.options(scope.dcOptions);
                            scope.chart.render();
                            scope.alreadyRendered = true;
                        }
                    }
                });
            }
        };
    }]);

    return angularDc;
}));
