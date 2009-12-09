class Plugin::Jquery < Plugin

  def name
    "jQuery"
  end
  
  def modules
    [ TagModule.new('modules/jquery/jquery.js', :library) ]
  end
  
  def plugin_type
    :library
  end
end

