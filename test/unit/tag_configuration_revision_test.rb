require 'test_helper'

class TagConfigurationRevisionTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "should get messages as strings" do
    rev = tag_configuration_revisions(:two_two)
    messages = rev.messages
    assert_equal 2, messages.size
    assert /Microformat data capture plugin added/ =~ messages[0]
    assert /jsHub plugin parameter updated/ =~ messages[1]
  end
  
  test "should add messages in order" do
    rev = tag_configuration_revisions(:two_two)
    rev.tag_configuration_revision_messages.create(:message => 'Made a final change')
    messages = rev.messages
    assert_equal 3, messages.size
    assert /Microformat data capture plugin added/ =~ messages[0]
    assert /jsHub plugin parameter updated/ =~ messages[1]
    assert /Made a final change/ =~ messages[2]
  end
  
  test "should add messages as string" do
    rev = tag_configuration_revisions(:two_two)
    rev.add_message 'Added a string message'
    messages = rev.messages
    assert_equal 3, messages.size
    assert /Microformat data capture plugin added/ =~ messages[0]
    assert /jsHub plugin parameter updated/ =~ messages[1]
    assert /Added a string message/ =~ messages[2]
  end
  
  test "should delete messages when destroyed" do
    rev = tag_configuration_revisions(:two_two)
    rev_id = rev.id
    assert TagConfigurationRevisionMessage.find_by_tag_configuration_revision_id(rev_id)
    rev.destroy
    assert_nil TagConfigurationRevisionMessage.find_by_tag_configuration_revision_id(rev_id)
  end
  
end
