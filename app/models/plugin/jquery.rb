class Plugin::Jquery < Plugin

  def name
    "jQuery"
  end
  
  def js_files
    ['lib/jquery-1.3.2.min.js']
  end
  
  def plugin_type
    :library
  end
end

