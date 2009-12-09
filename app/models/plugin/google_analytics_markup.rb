class Plugin::GoogleAnalyticsMarkup < Plugin

  def name
    "Google Analytics markup"
  end
  
  def modules
    [ TagModule.new('data-capture/google-analytics-markup-plugin.js', :data_capture) ]
  end
  
  def plugin_type
    :data_capture
  end
end