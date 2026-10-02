<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>XML Sitemap — Lancersstudio Engineering Solutions</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0d0f12;
            color: #d1d5db;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
          }
          h1 {
            color: #ffffff;
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          p.desc {
            color: #9ca3af;
            font-size: 14px;
            margin-top: 0;
            margin-bottom: 24px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #161a1f;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #2a3038;
          }
          th {
            background-color: #20262e;
            color: #e5e7eb;
            text-align: left;
            padding: 12px 16px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          td {
            padding: 14px 16px;
            border-top: 1px solid #242b35;
            font-size: 14px;
          }
          td a {
            color: #60a5fa;
            text-decoration: none;
            word-break: break-all;
          }
          td a:hover {
            text-decoration: underline;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            background: #2a3441;
            color: #93c5fd;
            font-size: 12px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Lancersstudio XML Sitemap</h1>
          <p class="desc">
            This XML sitemap is processed by search engines like Google and Bing.
          </p>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Frequency</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                  <td>
                    <span class="badge"><xsl:value-of select="sitemap:lastmod"/></span>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:priority"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
