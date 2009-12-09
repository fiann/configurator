class TagModule
  
  attr_accessor :src, :type
  
  LIBRARY_PRECEDENCE = {
    :core => 0,
    :library => 1,
    :data_capture => 2,
    :data_transport => 3
  }
  
  def initialize(src, type)
    @src = src
    @type = type
  end
  
  def ==(other)
    src == other.src && type == other.type
  end
  
  def <=>(other)
    if LIBRARY_PRECEDENCE[self.type] == LIBRARY_PRECEDENCE[other.type]
      return self.src <=> other.src
    else
      return LIBRARY_PRECEDENCE[self.type] - LIBRARY_PRECEDENCE[other.type]
    end
  end
end