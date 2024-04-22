/**
 * 
 * @param {string} title 
 * @param {string} subtitle 
 * @param {Node} body 
 * @param {Node} footer 
 * @returns 
 */
const emailTemplate = (title, subtitle = "", body, footer = "") => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title>${title}</title>
      <style>
        * { font-family: Arial, Helvetica, sans-serif; }
        body { background-color: #f0f0f0; }
        h1, h3 { margin: 10px 0; }
        p { margin: 5px 0; }
        hr {
          margin: 20px 0;
          border: 0;
          border-top: 1px solid #00000022;
        }
        .card {
          margin: 20px auto;
          padding: 20px;
          max-width: 720px;
          background-color: #ffffff;
          border: 1px solid #00000022;
          border-radius: 15px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }
        .card-footer {
          font-size: small;
          opacity: 0.5;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="card-header">
          <h1>${title}</h1>
          </div>
          <hr>
        <h3>${subtitle}</h3><br>
        <div class="card-body">
          ${body}
        </div>
        ${footer ? `
        <hr>
        <div class="card-footer">
          ${footer}
        </div>
        ` : ""}
      </div>
    </body>
    </html>
  `;
}

module.exports = emailTemplate;