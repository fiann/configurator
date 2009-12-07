require 'test_helper'

class TagConfigurationRevisionsControllerTest < ActionController::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "should show revision history" do
    get :index, :tag_configuration_id => tag_configurations(:two).id
    assert_response :success
    assert_select "fieldset#history" do
      assert_select "div#r1 p.rev_header", /Revision 1/
      assert_select "div#r1 ul.rev_messages li", "Created"
      assert_select "div#r2 p.rev_header", /Revision 2/
      assert_select "div#r2 ul.rev_messages li", "Microformat data capture plugin added"
      assert_select "div#r2 ul.rev_messages li", /jsHub plugin parameter updated/
    end
  end
  
  test "should be able to download previous revision" do
    config = tag_configurations(:two)
    rev = tag_configuration_revisions(:two_one)
    get :index, :tag_configuration_id => config.id
    assert_response :success
    assert_select "fieldset#history" do
      assert_select "div#r1 ul.rev_messages li", "Created"
      download_url = tag_configuration_show_revision_debug_path(
        :tag_configuration_id => config.id, :revision_number => rev.revision_number )
      assert_select "div#r1 .rev_debug a[href=#{ download_url }]"
    end
  end
  
  test "should show SHA1 hash of previous versions" do
    config = tag_configurations(:two)
    rev = tag_configuration_revisions(:two_one)
    get :index, :tag_configuration_id => config.id
    assert_response :success
    assert_select "fieldset#history" do
      assert_select "div#r1 ul.rev_messages li", "Created"
      assert_select "div#r1 .rev_debug code", rev.sha1_debug
    end
  end
  
  test "should find script version by SHA1 hash" do
    sha1 = tag_configuration_revisions(:two_one).sha1_debug
    get :find_by_sha1, { :sha1 => sha1 }
    assert_response :success
    assert_equal "text/javascript", @response.content_type 
    # JSON is also YAML
    status = YAML::load @response.body
    assert_not_nil status
  end
  
end
