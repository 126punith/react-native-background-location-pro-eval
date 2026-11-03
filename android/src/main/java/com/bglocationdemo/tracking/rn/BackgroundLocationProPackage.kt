package com.bglocationdemo.tracking.rn

import com.bglocationdemo.tracking.bridge.LocationBridgePackage
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider

/**
 * Autolinking only discovers packages declared in source, so this delegates to the precompiled
 * [LocationBridgePackage] inside bgtrackkit.aar.
 */
class BackgroundLocationProPackage : BaseReactPackage() {
  private val delegate = LocationBridgePackage()

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    delegate.getModule(name, reactContext)

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = delegate.getReactModuleInfoProvider()
}
