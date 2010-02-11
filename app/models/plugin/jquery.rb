class Plugin::Jquery < Plugin

  def name
    "jQuery"
  end
  
  def modules
    [ TagModule.new('lib/jquery', :library) ]
  end
  
  def plugin_type
    :library
  end
end

