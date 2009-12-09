class Plugin::Microformat < Plugin

  def modules
    [
      TagModule.new('modules/microformats/hauthentication-capture.js', :data_capture),
      TagModule.new('modules/microformats/hpage-capture.js', :data_capture),
      TagModule.new('modules/microformats/hproduct-capture.js', :data_capture),
      TagModule.new('modules/microformats/hpurchase-capture.js', :data_capture),
      TagModule.new('modules/microformats/microformats.js', :library)
    ]
  end
  
  def plugin_type
    :data_capture
  end
end

