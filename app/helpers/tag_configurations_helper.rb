module TagConfigurationsHelper
  
  def tag_versions
    TagConfiguration::VERSIONS
  end
  
  def link_tracker_plugin
    Plugin::LinkTracker.instance
  end
  
  def jquery_plugin
    Plugin::Jquery.instance
  end
  
  def mf_plugin
    Plugin::Microformat.instance
  end
  
  def ga_markup_plugin
    Plugin::GoogleAnalyticsMarkup.instance
  end
  
  def sample_get_plugin
    Plugin::SampleGet.instance
  end
  
  def causata_plugin
    Plugin::Causata.instance
  end
  
  def google_analytics_plugin
    Plugin::GoogleAnalytics.instance
  end
  
  def sample_post_plugin
    Plugin::SamplePost.instance
  end
  
  # used by _form.html.erb to render plugin configuration
  def label_for_plugin_param(plugin, param_name)
    plugin = Plugin.instance(plugin)
    "tag_configuration[plugin_config][#{plugin.id}][#{param_name}]"
  end
  
  # used by _form.html.erb to render plugin configuration
  def value_for_plugin_param(plugin, param_name)
    plugin = Plugin.instance(plugin)
    @tag_configuration.parameters_for_plugin(plugin) [param_name.to_s]
  end
  
  def src_folder
    Plugin::SRC_FOLDER
  end
  
  def revision_string
    if @tag_configuration.new_record?
      "unsaved configuration"
    else
      "revision #{@tag_configuration.current_revision_number}"
    end
  end
  
  def generator_url
    if @tag_configuration.new_record? 
      new_tag_configuration_url(:only_path => false)
    else
      tag_configuration_url(@tag_configuration)
    end
  end
  
  # Used to generate the tag file
  def generate_content
    content = ""
    for filename in @tag_configuration.files
      file = "#{src_folder}/#{filename}-#{@tag_type}.js"
      if File.exists?(file)
        content += File.read(file) + "\n"
      else
        content += "// skip #{filename}.js\n"
      end
    end
    content
  end
  
  # Get the configuration from the model
  def configuration
    @configuration ||= @tag_configuration.configuration
  end
  
end
