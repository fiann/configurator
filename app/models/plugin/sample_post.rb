class Plugin::SamplePost < Plugin

  def name
    "Sample POST plugin"
  end
  
  def modules
    [ TagModule.new('samples/samples-post-transport.js', :data_transport) ]
  end

  def plugin_type
    :data_transport
  end
end
