# get access to Rake::FileUtils.sh
require 'rake'

class RhinoJS
  # default options can be get/set
  # mylinter = RhinoJS.new
  # mylinter.rhino_jar = '/some/other/jar'
  attr_accessor :rhino_jar, :rhino_class, :jslint_options
  
  # setup class
  def initialize
    @rhino_jar = "#{RAILS_ROOT}/lib/js.jar"
    @rhino_class = "org.mozilla.javascript.tools.shell.Main"
    @jslint_options = "#{RAILS_ROOT}/lib/jslint/jslint-jshub-options.js"
  end

  # load all javascript files into Rhino
  def run(file, args="")
    allok = true
    # turn array into string for use in a shell
    cmd_line = "cd '#{RAILS_ROOT}' && java -cp '#{rhino_jar}' #{rhino_class} '#{file}' '#{args}'"
    verbose(true) do
      sh cmd_line do |ok, res|
        if !ok
          puts "Rhino had a problem loading the file (status = #{res.exitstatus})"
          allok = false
        end    
      end
    end 
    return allok
  end
  
  # iterate over each file and JSLint it in Rhino, using the options file
  # continues to next file if there are lint errors
  # return true only if all files linted without errors
  def lint(files)
    allok = true
    files.each do |src_file|
      sh "cd '#{RAILS_ROOT}' && java -cp '#{rhino_jar}' '#{rhino_class}' '#{jslint_options}' '#{src_file}'" do |ok, res|
        if !ok
          puts "File: #{src_file} had JSLint errors (status = #{res.exitstatus})"
          allok = false
        end
      end
    end
    return allok
  end
  
end