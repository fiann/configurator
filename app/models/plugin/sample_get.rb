class Plugin::SampleGet < Plugin

  def name
    "Sample GET plugin"
  end
  
  def modules
    [ TagModule.new('data-transport/sample-get-plugin.js', :data_transport) ]
  end
  
  def plugin_type
    :data_transport
  end
end

