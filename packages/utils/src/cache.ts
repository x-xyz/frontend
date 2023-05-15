export interface CacheConfig {
  ttl?: number
  size?: number
}

interface CacheData<T> {
  value: T
  createdAt: number
}

export class Cache<T, K = string> {
  public ttl: number

  public size: number

  protected data = new Map<K, CacheData<T>>()

  private timer: number | NodeJS.Timeout = 0

  constructor({ ttl, size }: CacheConfig = {}) {
    this.ttl = typeof ttl === 'number' ? ttl : 0

    this.size = typeof size === 'number' ? size : 100
  }

  set(key: K, value: T) {
    this.data.set(key, { value, createdAt: Date.now() })
    this.scheduleCheck()
  }

  get(key: K) {
    return this.data.get(key)?.value
  }

  clearOldest() {
    if (!this.size || this.data.size < this.size) return

    const values = Array.from(this.data.entries())
      .sort(([, a], [, b]) => b.createdAt - a.createdAt)
      .slice(0, this.size)

    this.data = new Map(values)
  }

  clearExpired() {
    if (!this.ttl) return

    const now = Date.now()

    for (const [k, v] of this.data) {
      if (now - v.createdAt > this.ttl) this.data.delete(k)
    }
  }

  private scheduleCheck() {
    if (this.timer) return

    this.timer = setTimeout(() => {
      this.clearExpired()
      this.clearOldest()
      this.timer = 0
    }, 1000)
  }
}
