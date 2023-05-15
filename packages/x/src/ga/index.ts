const trackingId = process.env.GA_TRACKING_ID

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export function pageview(url: string) {
  window.gtag?.('config', trackingId, {
    page_path: url,
  })
}

export function setUserId(userId: string) {
  window.gtag?.('config', 'GA_MEASUREMENT_ID', {
    user_id: userId,
  })
}

interface GAEvent {
  // The value that will appear as the event action in Google Analytics Event reports.
  action: string
  // The category of the event.
  category?: string
  // The label of the event.
  label?: string
  // A non-negative integer that will appear as the event value.
  value: number
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export function event({ action, category, label, value }: GAEvent) {
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
