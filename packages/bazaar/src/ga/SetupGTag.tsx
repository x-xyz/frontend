import React from 'react'
import Script from 'next/script'

export default function SetupGTag() {
  const trackingId = process.env.GA_TRACKING_ID

  const gtagId = process.env.GTAG_ID

  return (
    <>
      {trackingId && (
        <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`} />
      )}
      {trackingId && (
        <Script
          id="ga-initialization"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${trackingId}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      )}
      {gtagId && (
        <Script
          id="gtag-initialization"
          dangerouslySetInnerHTML={{
            __html: `
            (function (w, d, s, l, i) {
              w[l] = w[l] || [];
              w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
              var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s),
                dl = l != "dataLayer" ? "&l=" + l : "";
              j.async = true;
              j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
              f.parentNode.insertBefore(j, f);
            })(window, document, "script", "dataLayer", "${gtagId}");
          `,
          }}
        />
      )}
      {gtagId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtagId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
      )}
    </>
  )
}
