class Plugin::Microformat < Plugin

  def modules
    [
      TagModule.new('microformats/microformats-api', :core_support),
      TagModule.new('microformats/hauthentication-capture', :data_capture),
      TagModule.new('microformats/hpage-capture', :data_capture),
      TagModule.new('microformats/hproduct-capture', :data_capture),
      TagModule.new('microformats/hpurchase-capture', :data_capture)
    ]
  end
  
  def plugin_type
    :data_capture
  end
end

