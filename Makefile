TESTS = $(shell find tests/test-*.js)


vagrant-box:
	# from http://nrel.github.io/vagrant-boxes/
	vagrant box add centos http://developer.nrel.gov/downloads/vagrant-boxes/CentOS-6.4-x86_64-v20131103.box

vagrant-up:
	vagrant up

lint:
	node_modules/.bin/jshint . --exclude node_modules/

test: lint vagrant-up
	@./tests/run.sh $(TESTS)