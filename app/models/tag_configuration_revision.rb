class TagConfigurationRevision < ActiveRecord::Base
  belongs_to :user
  validates_presence_of :user

  belongs_to :tag_configuration
  validates_presence_of :tag_configuration
  acts_as_list :scope => :tag_configuration, :column => :revision_number

  has_many :tag_configuration_revision_messages, :order => :position, :dependent => :destroy
  
  def messages
    tag_configuration_revision_messages.collect { |m| m.message }
  end
  
  def add_message(msg)
    tag_configuration_revision_messages << TagConfigurationRevisionMessage.new(:message => msg)
  end
  
  def self.find_by_sha1(sha1)
    self.find(:first, :conditions => ["sha1_debug = ? OR sha1_production = ?", sha1, sha1])
  end
  
  def pending_revisions
    tag_configuration.revisions.length - revision_number
  end

end
