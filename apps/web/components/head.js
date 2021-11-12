import NextHead from 'next/head';

export const Head = ({ title }) => {
  return (
    <NextHead>
      <title>{title}</title>
      <meta name={title} content="Making Web 3.0 accessible for everyone" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </NextHead>
  );
};
