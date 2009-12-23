class TagModule
  
  attr_reader :name, :module_name, :submodule_name, :type
  
  LIBRARY_PRECEDENCE = {
    :yui => 0,
    :library => 1,
    :core => 2,
    :data_capture => 3,
    :data_transport => 4
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
      return 1
    else
      return LIBRARY_PRECEDENCE[type] - LIBRARY_PRECEDENCE[other.type]
    end
  end
end