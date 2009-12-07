# A user who can authenticate to retrieve stored configurations in the tag
# configurator.
# Uses authlogic code
class User < ActiveRecord::Base 
  
  acts_as_authentic do |config|
    config.login_field = :email
    config.validate_login_field = :false
  end
  
  has_many :tag_configurations
  has_many :tag_configuration_revisions
  
end 
