# Deploy to Azure Static Web Apps (from GitHub)

No build step. The site is plain HTML/CSS/JS plus one Azure Function (`/api/contact`).

## 1. Put this folder in a GitHub repo
Use a NEW repo (e.g. `tehillah-digital-azure`) so it doesn't clash with the GitHub Pages repo.
Upload everything in this folder to the `main` branch root (`api/`, `assets/`, `staticwebapp.config.json`, all `.html` files).

## 2. Create the Static Web App
Azure portal > Static Web Apps > Create:
- Plan: Free (or Standard later); Region: UK South
- Source: GitHub > pick the repo and `main`
- Build preset: Custom. App location: `/`. Api location: `api`. Output location: blank
- Review + create. Azure adds its own GitHub Actions workflow and secret to the repo automatically.
Your site goes live at `https://<random-name>.azurestaticapps.net` within a few minutes.

## 3. Add the custom domain
First remove `www.tehillahdigital.co.uk` from GitHub Pages (Settings > Pages) if it is set there.
Static Web App > Custom domains > Add > `www.tehillahdigital.co.uk` (CNAME).
At your DNS host (Azure DNS or registrar): CNAME `www` -> `<random-name>.azurestaticapps.net`.
Click Validate. Azure issues free HTTPS automatically.
For the bare domain, use an ALIAS/ANAME record or a registrar redirect to `www`.

## 4. Make the contact form send email
Static Web App > Configuration > Application settings:
`SENDGRID_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (a sender verified in SendGrid).
Until set, the form opens the visitor's email app instead (nothing is lost).

## 5. Updating later
Push changes to `main`; the workflow redeploys automatically.

Notes: company no. 17417070 and registered office are set in the footer and terms. Privacy and terms are final text dated 21 October 2026; have them reviewed when convenient.
