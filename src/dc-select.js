
/* Another directive, responsible of integration angular's select directive with dc.

    <dc-select dc-dimension="fooDimension", all-label="All foos"/>

   This directive helps to filter by arbitrary dimensions without need for another graph.

   Note that if there is a graph on the same dimension as the select, changing the select value
   will not update the graph's own selection. This is also the case if you make 2 graphs
   with same dimension. This is a limitation of the underlying lib dc.js
*/
angular.module('angularDc')
    .directive('dcSelect', [
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
