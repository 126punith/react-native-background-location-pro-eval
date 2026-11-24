require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name                = 'react-native-background-location-pro-eval'
  s.version             = package['version']
  s.summary             = package['description']
  s.homepage            = 'https://github.com/sponsors/126punith'
  s.license             = { :type => 'Commercial', :file => 'LICENSE' }
  s.authors             = package['author']

  s.platform            = :ios, '15.1'
  s.source              = { :git => 'https://github.com/126punith/react-native-background-location-pro-eval.git', :tag => "v#{s.version}" }

  # Only the thin bridge glue ships as source; the tracking engine ships as a precompiled binary.
  s.source_files        = 'ios/*.{h,m,mm}'
  # Only the AppDelegate helper is public. RCTLocationTracker.h pulls ReactCodegen and must
  # stay private so Swift hosts can import this module without C++ headers.
  s.public_header_files = 'ios/BgTrackKitBridge.h'
  s.vendored_frameworks = 'ios/BgTrackKit.xcframework'
  s.requires_arc        = true

  s.libraries           = 'sqlite3'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
  }

  # New Architecture: wires up React-Core, ReactCodegen and the generated spec base.
  install_modules_dependencies(s)
end
