require 'test_helper'

class TagConfigurationTest < ActiveSupport::TestCase
  
  test "default plugins can be added to new object" do
    default_plugins = [Plugin::Microformat.instance, Plugin::SampleGet.instance, Plugin::Jquery.instance]
    config = TagConfiguration.new
    assert_equal [], config.plugins
    config.add_default_plugins!
    assert_equal default_plugins, config.plugins
  end
  
  test "plugin scripts are retrieved correctly" do
    default_scripts = [
      # from jquery plugin - comes first even though plugin specified last
      'modules/jquery/jquery-debug.js',
      # from microformats plugin - NB libraries are first
      'modules/microformats/microformats-debug.js',
      'modules/microformats/hauthentication-capture-debug.js', 
      'modules/microformats/hpage-capture-debug.js', 
      'modules/microformats/hproduct-capture-debug.js', 
      'modules/microformats/hpurchase-capture-debug.js',
      # from sample get plugin
      'modules/samples/samples-get-transport-debug.js'
    ]
    config = TagConfiguration.new
    assert_equal [], config.files
    config.add_default_plugins!
    assert_equal default_scripts, config.files
  end
  
  # the plugin configuration is exported in the page
  # all the YUI module names must be listed, otherwise
  # the module will never be initialized in the page
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
      "hauthentication-capture" => {},
      "hpage-capture" => {},
      "hproduct-capture" => {},
      "hpurchase-capture" => {},
      "samples-get-transport" => { "server_url"=>"http://www.jshub.org/" }
    }
    # configuration is serialized as JSON, so load it into an object
    act_config = YAML.load config.configuration
    assert_equal exp_config, act_config
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
