class Plugin::GoogleAnalytics < Plugin

  def name
    "Google Analytics"
  end
  
  def modules
    [ TagModule.new('vendor-google/google-analytics', :data_transport),
      TagModule.new('lib/script-loader', :core_support) ]
  end
  
  def plugin_type
    :data_transport
  end
end