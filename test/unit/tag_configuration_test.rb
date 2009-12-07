require 'test_helper'

class TagConfigurationTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "default plugins can be added to new object" do
    default_plugins = [Plugin::Microformat.instance, Plugin::SampleGet.instance, Plugin::Jquery.instance]
    config = TagConfiguration.new
    assert_equal [], config.plugins
    config.add_default_plugins!
    assert_equal default_plugins, config.plugins
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
