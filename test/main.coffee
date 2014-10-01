unless __karma__?
    window.describe = ->

# define sample application logic

m = angular.module("app", ["angularDc"])
m.controller "myController", ($scope) ->
    s = $scope
    data = []
    for t in [1..400]
        data.push
            x: Math.cos(t / 10.0)
            y: Math.sin(t / 10.0)
            z: t
    ndx = s.ndx = crossfilter(data)
    all = s.all = ndx.groupAll()
    s.xDimension = ndx.dimension((d) -> d.x)
    s.yDimension = ndx.dimension((d) -> d.y)
    s.zDimension = ndx.dimension((d) -> d.z)
    s.xGroup = s.zDimension.group().reduceSum((d) -> d.x)
    s.yGroup = s.zDimension.group().reduceSum((d) -> d.y)
    s.xValue = (d) -> d.x
    s.yValue = (d) -> d.y
    s.zScale = d3.scale.linear().domain([0, 400])
