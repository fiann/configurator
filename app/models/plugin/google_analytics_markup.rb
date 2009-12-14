class Plugin::GoogleAnalyticsMarkup < Plugin

  def name
    "Google Analytics markup"
  end
  
  def modules
    [ TagModule.new('samples/samples-google-analytics-markup', :data_capture) ]
  end
  
  def plugin_type
    :data_capture
  end
end