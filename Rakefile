# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require(File.join(File.dirname(__FILE__), 'config', 'boot'))

require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

require 'tasks/rails'

# convert test output to XML for Hudson
# ref: http://blog.huikau.com/2008/01/09/jruby-ruby-continuous-integration-with-hudson/
require 'rubygems'
gem 'ci_reporter'
require 'ci/reporter/rake/test_unit'