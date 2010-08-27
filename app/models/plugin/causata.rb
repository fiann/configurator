class Plugin::Causata < Plugin

  def name
    "Causata transport plugin"
  end
  
  def modules
    [ TagModule.new('vendor-causata/causata-transport', :data_transport),
      TagModule.new('form-transport/form-transport', :core_support),
      TagModule.new('lib/json2', :core_support) 
    ]
  end

  def plugin_type
    :data_transport
  end
  
  def default?
    true
  end
  
  def default_configuration
    {
      "server" => "test.causata.com/rtw",
      "account" => ""
    }
  end

end
