// Client-side counterpart of backend/app/seo.py. The server already renders the
// right tags for every first page load (what crawlers and link previews read);
// this keeps them correct while a visitor navigates inside the app.
const BRAND = "2125 Signature";

const set = (id, value, attr = "content") =>
  document.getElementById(id)?.setAttribute(attr, value);

export function setSeo({ title, description, image, path, noindex = false }) {
  const fullTitle = title ? `${title} | ${BRAND}` : `${BRAND} | Interior Design & Execution in Abuja, Nigeria`;
  document.title = fullTitle;

  const url = window.location.origin + (path ?? window.location.pathname);
  set("seo-canonical", url, "href");
  set("seo-robots", noindex ? "noindex, nofollow" : "index, follow");
  set("seo-og-title", fullTitle);
  set("seo-tw-title", fullTitle);
  set("seo-og-url", url);
  if (description) {
    set("seo-description", description);
    set("seo-og-description", description);
    set("seo-tw-description", description);
  }
  if (image) {
    set("seo-og-image", image);
    set("seo-tw-image", image);
  }
}

// Mirrors PUBLIC_PAGES / PRIVATE_PAGES in the backend
export const PAGE_META = {
  "/": {
    title: null,
    description:
      "2125 Signature designs and delivers timeless, elegant interiors for homes and offices in Abuja, Nigeria, from concept to completion.",
  },
  "/about": {
    title: "About Us",
    description:
      "Meet 2125 Signature, an Abuja interior design and execution studio focused on refined kitchens, living rooms, dining rooms and bedrooms.",
  },
  "/services": {
    title: "Interior Design Services",
    description:
      "Residential and commercial interior design, consultation and full project execution by 2125 Signature in Abuja, Nigeria.",
  },
  "/portfolio": {
    title: "Portfolio of Interior Projects",
    description:
      "Browse recent interior design projects by 2125 Signature, each designed with precision, creativity and elegance.",
  },
  "/contact": {
    title: "Book a Consultation",
    description:
      "Book a personalised interior design consultation with 2125 Signature in Wuse II, Abuja.",
  },
};

export const PRIVATE_TITLES = {
  "/login": "Login",
  "/signup": "Sign Up",
  "/forgot-password": "Reset Password",
  "/verify-email": "Verify Email",
  "/dashboard": "Dashboard",
  "/edit-profile": "Edit Profile",
  "/admin": "Admin",
  "/portfolio/add": "Add Work",
  "/services/add": "Add Service",
  "/category": "Add Category",
};
