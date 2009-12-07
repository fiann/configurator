class TagConfigurationRevisionMessage < ActiveRecord::Base
  belongs_to :tag_configuration_revision
  validates_presence_of :tag_configuration_revision
  acts_as_list :scope => :tag_configuration_revision
  
  validates_presence_of :message
  
end
