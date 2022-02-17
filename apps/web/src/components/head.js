import NextHead from 'next/head';

export const Head = ({ title, showNotification }) => {
  return (
    <NextHead>
      <title>
        {showNotification ? '❗️ ' : ''}
        {title}
      </title>
      <meta name={title} content="Own your digital life." />

      {/* <!--  Essential META Tags --> */}
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://i.imgur.com/hNJp1R1.png" />
      {/* <meta property="og:url" content="https://stackup.sh" /> */}
      <meta name="twitter:card" content="summary_large_image" />

      {/* <!--  Non-Essential, But Recommended --> */}
      <meta property="og:description" content="Own your digital life." />
      <meta property="og:site_name" content="Stackup" />
      <meta name="twitter:image:alt" content="Stackup logotype" />

      {/* <!--  Non-Essential, But Required for Analytics --> */}
      {/* <meta property="fb:app_id" content="" /> */}
      <meta name="twitter:site" content="@stackup_fi" />

      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </NextHead>
  );
};
