class Plugin::SampleGet < Plugin

  def name
    "Sample GET plugin"
  end
  
  def modules
    [ TagModule.new('samples/samples-get-transport', :data_transport) ]
  end
  
  def plugin_type
    :data_transport
  end
end

