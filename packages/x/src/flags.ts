const features = JSON.parse(process.env.FEATURE_FLAGS || '{}')

export function isFeatureEnabled(key: string) {
  return !!features[key]
}
