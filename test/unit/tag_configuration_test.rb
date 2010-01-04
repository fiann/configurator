require 'test_helper'

class TagConfigurationTest < ActiveSupport::TestCase
  
  test "default plugins can be added to new object" do
    default_plugins = [Plugin::Microformat.instance, Plugin::SampleGet.instance, Plugin::Jquery.instance]
    config = TagConfiguration.new
    assert_equal [], config.plugins
    config.add_default_plugins!
    assert_equal default_plugins, config.plugins
  end
  
  test "core files are present in configuration" do 
    core_scripts = [
      "yui/yui",
      "debug/debug",
      "logger/logger",
      "jshub/jshub",
      "hub/hub",
      "domready/domready",
      "jshub/jshub-technographics"
    ]
    config = TagConfiguration.new
    assert_equal core_scripts, config.files
    
  end
  
  test "plugin scripts are retrieved correctly" do
    default_scripts = [
      # module system base
      "yui/yui",
      # from jquery plugin - comes first even though plugin specified last
      'jquery/jquery',
      # used by logger
      "debug/debug",
      # core files
      "logger/logger",
      "hub/hub",
      "jshub/jshub",
      "domready/domready",
      # from microformats plugin - NB libraries are first, rollup is last
      'microformats/microformats-api',
      "jshub/jshub-technographics",
      'microformats/microformats',
      'microformats/hpage-capture', 
      'microformats/hauthentication-capture', 
      'microformats/hproduct-capture', 
      'microformats/hpurchase-capture',
      # from sample get plugin
      'samples/samples-get-transport'
    ]
    config = TagConfiguration.new
    config.add_default_plugins!
    assert_equal default_scripts, config.files
  end
  
  # the plugin configuration is exported in the page
  # only the YUI module name that requires configuration is listed, 
  # the other modules a will never be initialized in thre found via
  # YUI dependencies
  test "plugin configuration is generated correctly" do
    config = TagConfiguration.new
    mf = Plugin::Microformat.instance
    get = Plugin::SampleGet.instance
    config.plugin_config = {
      mf.id.to_s => { "include" => "true" }, 
      get.id.to_s => { "include"=>"true", "server_url"=>"http://www.jshub.org/" }
    }
    exp_config = {
      "microformats" => {},
      "samples-get-transport" => { "server_url"=>"http://www.jshub.org/" }
    }
    assert_equal exp_config, config.configuration
  end
  
  test "plugins are present in fixture data" do
    config = tag_configurations(:one)
    assert_not_nil config
    assert_equal 3, config.plugins.length
    config = tag_configurations(:two)
    assert_not_nil config
    assert_equal 0, config.plugins.length
  end
  
  test "validation is correct for anonymous session" do
    config = TagConfiguration.new
    config.valid?
    assert config.errors.on(:user), "User must be present to save configuration in database"
    assert_nil config.errors_for_anonymous_session.on(:user), "User should not be required in anonymous session"
    assert config.errors.on(:name), "Name must be present to save configuration in database"
    assert config.errors_for_anonymous_session.on(:name), "Name should be required in anonymous session"
  end
  
  test "configuration name is unique for a user" do
    config = TagConfiguration.new
    config.name = tag_configurations(:one).name
    config.valid?
    assert config.valid_for_anonymous_session?, "Name can be anything for anonymous session"

    config.user = tag_configurations(:one).user
    config.valid?
    assert config.errors.on(:name), "Name is unique for this user"

    config.name = tag_configurations(:one).name.upcase
    config.valid?
    assert config.errors.on(:name), "Name is unique for this user, ignoring case"

    config.user = users(:user2)
    config.valid?
    assert_nil config.errors.on(:name), "Name can be shared with another user's configuration"
  end
  
  test "last revision number is retrieved correctly" do
    rev = tag_configurations(:one).current_revision_number
    assert_equal 0, rev, "No changes for config1, revision number should be zero"
    rev = tag_configurations(:two).current_revision_number
    assert_equal 2, rev
  end
end
