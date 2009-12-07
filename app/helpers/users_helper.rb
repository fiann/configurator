module UsersHelper
  
  def saved_configurations
    return @saved_configurations if defined?(@saved_configurations)
    if current_user
      @saved_configurations = TagConfiguration.find_all_by_user_id current_user.id
    else
      @saved_configurations = []
    end
  end
  
end
