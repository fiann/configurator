# add our classes from lib/
require 'rhinojs'

# invoke with optional [src] flag or list of files, e.g. files=src/hub.js,src/api.js
# TODO: generate list of files from dir only
namespace :jshub do 
  
  desc "Validate JavaScript source files with JsLint"
  task :lint, :files do |task, args|
    # see also 'test_lint_js_files' unit test
    
    # by default lint the src js files
    if (args.files == nil || args.files=='src')
      files = Dir["#{RAILS_ROOT}/app/javascripts/**/*.js"]
      # or the src js files
    elsif (args.files=='dist')
      files = Dir["#{RAILS_ROOT}/dist/**/*.js"]
      # or specifically named files
    else
      files = args.files.split(",")
    end
    
    # lint the files in Rhino
    rhinojs = RhinoJS.new
    allok = rhinojs.lint(files)
    
    if !allok
      fail "Lint validation errors"
    end
  end
  
end
