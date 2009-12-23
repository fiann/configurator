class Plugin::SamplePost < Plugin

  def name
    "Sample POST plugin"
  end
  
  def modules
    [ TagModule.new('samples/samples-post-transport', :data_transport),
      TagModule.new('form-transport/form-transport', :core), 
      TagModule.new('json/json-stringify', :library) 
    ]
  end

  def plugin_type
    :data_transport
  end
end
