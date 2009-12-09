class Plugin::SamplePost < Plugin

  def name
    "Sample POST plugin"
  end
  
  def modules
    [ TagModule.new('data-transport/sample-post-plugin.js', :data_transport) ]
  end

  def plugin_type
    :data_transport
  end
end
