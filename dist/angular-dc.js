'use strict';
angular.module('angularDc', []).directive('dcChart', function () {
  var defaultOptions = {};
  var directiveOptions = [
      'config',
      'onFiltered',
      'onPostRedraw',
      'onPostRender',
      'onPreRedraw',
      'onPreRender',
      'onZoomed',
      'postSetupChart'
    ];
  function setupChart(scope, iElement, iAttrs) {
    var chartElement = iElement[0], chartType = iAttrs.dcChart || iAttrs.chartType, chartGroupName = iAttrs.chartGroup || undefined;
    var chartFactory = dc[chartType];
    var chart = chartFactory(chartElement, chartGroupName);
    var validOptions = getValidOptionsForChart(chart);
    var objOptions = getOptionsFromConfig(scope, validOptions);
    var attrOptions = getOptionsFromAttrs(scope, iAttrs, validOptions);
    var scopeOptions = getOptionsFromScope(scope, validOptions);
    var options = _({}).merge(defaultOptions, objOptions, attrOptions, scopeOptions).value();
    chart.options(options);
    var eventHandlers = _({
        'preRender': options.onPreRender,
        'postRender': options.onPostRender,
        'preRedraw': options.onPreRedraw,
        'postRedraw': options.onPostRedraw,
        'filtered': options.onFiltered,
        'zoomed': options.onZoomed
      }).omit(_.isUndefined);
    eventHandlers.each(function (handler, evt) {
      chart.on(evt, handler);
    }).value();
    if (_.isFunction(options.postSetupChart)) {
      options.postSetupChart(chart, options);
    }
    return chart;
  }
  function getValidOptionsForChart(chart) {
    var exposedFunctions = _(chart).functions().value();
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
      config: '&',
      onPreRender: '&',
      onPostRender: '&',
      onPreRedraw: '&',
      onPostRedraw: '&',
      onFiltered: '&',
      onZoomed: '&'
    },
    template: '<svg></svg>',
    link: function (scope, iElement, iAttrs) {
      var chart = setupChart(scope, iElement, iAttrs);
      chart.render();
    }
  };
});