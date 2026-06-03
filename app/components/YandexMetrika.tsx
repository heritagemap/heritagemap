'use client';

import Script from 'next/script';

const COUNTER_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID ?? '60367102';

export default function YandexMetrika() {
  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");ym(${COUNTER_ID}, "init", {clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true,trackHash:true});`}
      </Script>
      <noscript>
        <div
          dangerouslySetInnerHTML={{
            __html: `<img src="https://mc.yandex.ru/watch/${COUNTER_ID}" style="position:absolute;left:-9999px" alt="" />`,
          }}
        />
      </noscript>
    </>
  );
}
