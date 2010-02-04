class TagModule
  
  attr_reader :name, :module_name, :submodule_name, :type
  
  LIBRARY_PRECEDENCE = {
    :library => 1,
    :core => 2,
    :core_support => 3,
    :data_capture => 4,
    :data_transport => 5,
    :triggers => 6
  }
  
  def initialize(src, type)
    @name = src
    @module_name, @submodule_name = @name.split('/')
    @type = type
  end
  
  def ==(other)
    module_name == other.module_name && 
      submodule_name == other.submodule_name && 
      type == other.type
  end
  
  def <=>(other)
    if LIBRARY_PRECEDENCE[type] == LIBRARY_PRECEDENCE[other.type]
      if module_name != other.module_name
        return module_name <=> other.module_name
      else
        return submodule_name <=> other.submodule_name
      end
    else
      return LIBRARY_PRECEDENCE[type] - LIBRARY_PRECEDENCE[other.type]
    end
  end
  
  def to_s
    @name
  end
end