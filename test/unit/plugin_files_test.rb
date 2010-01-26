require 'test_helper'

class PluginFilesTest < ActiveSupport::TestCase
  
  ObjectSpace.each_object(Class) do |p|
    next unless p.superclass == Plugin
    test "files for #{p}" do
      missing = []
      p.instance.modules.each do |m|
        filename = "#{Plugin::SRC_FOLDER}/#{m.name}-debug.js"
        missing << filename[RAILS_ROOT.length+1 .. filename.length] unless File.exist?(filename)
      end
      assert missing.empty?, "Missing source files: #{missing.join(', ')}"
    end
  end
  
end