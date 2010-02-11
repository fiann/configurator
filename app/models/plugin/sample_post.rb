class Plugin::SamplePost < Plugin

  def name
    "Sample POST plugin"
  end
  
  def modules
    [ TagModule.new('samples/samples-post-transport', :data_transport),
      TagModule.new('form-transport/form-transport', :core_support), 
      TagModule.new('lib/json2', :core_support) 
    ]
  end

  def plugin_type
    :data_transport
  end
end
