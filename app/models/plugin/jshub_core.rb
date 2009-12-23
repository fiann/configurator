class Plugin::JshubCore < Plugin

  def modules
    [
      TagModule.new('debug/debug', :library),
      TagModule.new('hub/hub', :core),
      TagModule.new('logger/logger', :core),
      TagModule.new('domready/domready', :core),
      TagModule.new('jshub/jshub', :core),
      TagModule.new('jshub/jshub-technographics', :data_capture),
    ]
  end
  
  def plugin_type
    :core
  end
end

