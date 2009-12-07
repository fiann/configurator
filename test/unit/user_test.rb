require 'test_helper'

class UserTest < ActiveSupport::TestCase
  setup :activate_authlogic
  
  test "email address is validated" do
    user = users(:user1)
    assert user.valid?, user.errors.inspect
    [ 'valid@domainname.com', 'valid@domainname.co.uk' ].each do |adr|
      user.email = adr
      assert user.valid?, "Email address #{adr} should be valid"
    end
    [ 'noTLD@domainname', 'nodomain', 'has spaces@domainname.com' ].each do |adr|
      user.email = adr
      assert !user.valid?, "Email address #{adr} should not be valid"
      assert user.errors.invalid?(:email)
    end    
  end
  
  test "authenticates by email address and password" do
    assert_can_login_with('user1@jshub.org', 'secret')
  end
  
  test "cannot authenticate with wrong credentials" do
    assert_cannot_login_with('user1@jshub.org', 'wrong password')
    assert_cannot_login_with('user1@jshub.org', 'Secret')
    assert_cannot_login_with('wrong username', 'secret')
  end
  
  test "authenticate by email address is not case sensitive" do
    assert_can_login_with('user1@jshub.org', 'secret')
    assert_can_login_with('USER1@JSHUB.org', 'secret')
  end
  
  private
  
  def assert_can_login_with(email, password)
    unless controller.session["user_credentials"].nil?
      UserSession.find.destroy
    end
    assert_nil controller.session["user_credentials"]
    assert UserSession.create(:email => email, :password => password)
    assert_not_nil controller.session["user_credentials"]
  end

  def assert_cannot_login_with(email, password)
    assert ! UserSession.create(:email => email, :password => password)
    assert_nil controller.session["user_credentials"]
  end
end
