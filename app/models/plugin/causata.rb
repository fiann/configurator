class Plugin::Causata < Plugin

  def name
    "Causata transport plugin"
  end
  
  def modules
    [ TagModule.new('vendor-causata/causata-transport', :data_transport),
      TagModule.new('form-transport/form-transport', :core_support),
      TagModule.new('lib/json2', :library) 
    ]
  end

  def plugin_type
    :data_transport
  end
end
