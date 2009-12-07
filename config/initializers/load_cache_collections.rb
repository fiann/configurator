# Register one or more javascript/stylesheet files to be included when :symbol is passed to javascript_include_tag.

# Shared by all application views
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :jshub => [
  "jshub.css"] 

# Configurator-specific assets
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :configurator => [
  "jquery/jquery", 
  "configurator/skin"]
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :configurator => [
  "configurator/screen"]

# YUI is used by unit tests
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :yui3 => [
  "yui3/reset-context", 
  "yui3/fonts-context", 
  "yui3/grids-context", 
  "yui3/base-context"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :yui3 => [
  "yui-3.0.0pr2/build/yui/yui.js",
  "yui-3.0.0pr2/build/oop/oop.js", 
  "yui-3.0.0pr2/build/event/event.js"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :yuitest => [
  "yui-3.0.0pr2/build/dump/dump.js", 
  "yui-3.0.0pr2/build/substitute/substitute.js", 
  "yui-3.0.0pr2/build/dom/dom.js", 
  "yui-3.0.0pr2/build/node/node.js", 
  "yui-3.0.0pr2/build/json/json.js", 
  "yui-3.0.0pr2/build/yuitest/yuitest.js"]

# jQuery is used by the jsHub tag code
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :jquery => [
  "jquery/jquery.js"]

# Unit test assets
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :javascript_unit_test => [
  "javascript_unit_test.js"]
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :javascript_unit_test => [
  "javascript_unit_test.css"]

  