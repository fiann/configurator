class Plugin::LinkTracker < Plugin

  def modules
    [
      TagModule.new('hub/link-tracker', :data_capture)
    ]
  end
  
  def plugin_type
    :core
  end
  
  def default?
    true
  end
  
  def default_configuration
    {
      "downloadLinkTypes" => "avi,doc,docx,exe,m4v,mov,mp3,mp4,mpg,pdf,wav,wmv,xls,xlsx,zip,zxp",
      "trackExternalLinks" => "true",
      "internalDomainNames" => ""
    }
  end
  
end

