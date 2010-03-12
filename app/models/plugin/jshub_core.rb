class Plugin::JshubCore < Plugin

  def modules
    [
      TagModule.new('debug/debug', :library),
      TagModule.new('hub/hub', :core),
      TagModule.new('logger/logger', :core_support),
      TagModule.new('hub/utils', :core_support),
      TagModule.new('hub/technographics', :data_capture),
      TagModule.new('hub/load-triggers', :triggers)
    ]
  end
  
  def plugin_type
    :core
  end
end

