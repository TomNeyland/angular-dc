'use strict';

angular.module('angularDcjs', [])

  .directive('ncChart', function() {

    return {
      restrict: 'EAC',
      scope: true,
      link: function(scope, iElement, iAttrs) {

      },
      compile: function compile(tElement, tAttrs, transclude) {
        tElement.html('<span>hello {{name}}</span>');
        return function postLink(scope, iElement, iAttrs, controller) {
          scope.name = 'world';
        };
      }
    };

  });
