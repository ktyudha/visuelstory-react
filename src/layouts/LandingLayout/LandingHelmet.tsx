import { Helmet } from "react-helmet-async";

export default function LandingHelmet() {
  return (
    <>
      <div className="application">
        <Helmet>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Tenor+Sans&display=swap"
            rel="stylesheet"
          />
        </Helmet>
      </div>
    </>
  );
}
