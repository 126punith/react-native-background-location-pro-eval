require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name                = 'react-native-background-location-pro-eval'
  s.version             = package['version']
  s.summary             = package['description']
  s.homepage            = package['homepage']
  s.license             = { :type => 'Commercial', :file => 'LICENSE' }
  s.authors             = package['author']

  s.platform            = :ios, '15.1'
  s.source              = { :git => 'https://github.com/126punith/react-native-background-location-pro-eval.git', :tag => "v#{s.version}" }

  # Only the thin bridge glue ships as source; the tracking engine ships as a precompiled binary.
  s.source_files        = 'ios/*.{h,m,mm}'
  s.vendored_frameworks = 'ios/BgTrackKit.xcframework'
  s.requires_arc        = true

  s.libraries           = 'sqlite3'

  # New Architecture: wires up React-Core, ReactCodegen and the generated spec base.
  install_modules_dependencies(s)
end
