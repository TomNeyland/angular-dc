dependencies:
	npm --loglevel error install
	bower install

clean:
	rm -rf node_modules/
	rm -rf bower_components/

build:
	make clean
	make dependencies
	grunt build


.PHONY : build
