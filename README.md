# angular-dc

AngularJS directives for dc.js

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/TomNeyland/angular-dc/master/dist/angular-dc.min.js
[max]: https://raw.github.com/TomNeyland/angular-dc/master/dist/angular-dc.js

If you use bower, you can install this via: `bower install angular-dc`

### Dependencies
See the bower.json file for dependencies: [bower.json][bower.json]

[bower.json]: https://github.com/TomNeyland/angular-dc/blob/master/bower.json

### 30 second look

```html
<script src="angular.js"></script>
<script src="dist/angular-dc.min.js"></script>
<!--don't forget to include all dependencies-->
<script>
//load the angular-dc module in your app
angular.module("myApp", ['angularDc']);
// some angularjs controller code...
</script>

<!--Setup a simple pie chart. DC.js options are exposed as html attributes-->
<div dc-chart="pieChart" dc-width="180" dc-height="180" dc-radius="80" dc-dimension="gainOrLoss" dc-group="gainOrLossGroup" class="dc-chart"></div>
```

## Examples
- [Simple pie chart][pie]
- [Nasdaq charts][nasqad]
- [Contribute][help-examples]

[pie]: https://tomneyland.github.io/angular-dc/example/stocks/pie.html
[nasqad]: https://tomneyland.github.io/angular-dc/example/stocks/nasdaq.html
[help-examples]: https://github.com/TomNeyland/angular-dc/issues/2


## Documentation
- [Contribute][help-docs]

[help-docs]: https://github.com/TomNeyland/angular-dc/issues/1

