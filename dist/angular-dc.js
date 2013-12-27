'use strict';
angular.module('angularDc', []).directive('dcChart', function () {
  var defaultOptions = {
      width: 200,
      height: 200
    };
  function setupChart(scope, iElement, iAttrs) {
    var chartElement = iElement[0], chartTypeName = iAttrs.dcChart || iAttrs.chartType, chartGroupName = iAttrs.chartGroup || undefined;
    var chartFactory = dc[chartTypeName];
    var chart = chartFactory(chartElement, chartGroupName);
    var validOptions = _(chart).functions().value();
    console.log(validOptions);
    var objOptions = getOptionsFromObject(scope, validOptions);
    var attrOptions = getOptionsFromAttrs(scope, iAttrs, validOptions);
    var scopeOptions = getOptionsFromScope(scope, validOptions);
    var options = _({}).extend(defaultOptions, objOptions, attrOptions, scopeOptions).value();
    console.log(_.keys(options), options);
    chart.options(options);
    return chart;
  }
  function getOptionsFromObject(scope, validOptions) {
    var config = scope.config();
    if (!_.isObject(config)) {
      config = {};
    }
    return config;
  }
  function getOptionsFromAttrs(scope, iAttrs, validOptions) {
    return _(iAttrs.$attr).keys().intersection(validOptions).map(function (key) {
      var value;
      try {
        value = scope.$parent.$eval(iAttrs[key]);
      } catch (e) {
        value = iAttrs[key];
      }
      return [
        key,
        value
      ];
    }).zipObject().value();
  }
  function getOptionsFromScope(scope, validOptions) {
    return _(scope).keys().intersection(validOptions).map(function (key) {
      return [
        key,
        _.result(scope, key)
      ];
    }).zipObject().value();
  }
  return {
    restrict: 'EAC',
    scope: {
      group: '&',
      dimension: '&',
      width: '=',
      height: '=',
      config: '&'
    },
    template: '<svg></svg>',
    link: function (scope, iElement, iAttrs) {
      var chart = setupChart(scope, iElement, iAttrs);
      scope.$watch('options', function (oldValue, newValue) {
        if (oldValue === newValue) {
          return;
        }
        chart.options(newValue);
      });
      chart.render();
    }
  };
});