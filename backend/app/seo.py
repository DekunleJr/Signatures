"""Server-side SEO: per-route <head> tags, robots.txt, sitemap.xml and real 404s.

The frontend is a single-page app, so crawlers and link-preview bots (WhatsApp,
Facebook, X, LinkedIn) never run its JavaScript. We therefore rewrite the SEO tags
in the built index.html on the server for every request.
"""
import html
import json
import os
import re
from datetime import timezone
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse, PlainTextResponse, Response
from sqlalchemy.orm import Session

from . import models
from .config import settings
from .database import get_db

router = APIRouter(include_in_schema=False)

SITE_NAME = "2125 Signature"
INDEX_PATH = os.path.join("static", "index.html")

DEFAULT_TITLE = f"{SITE_NAME} | Interior Design & Execution in Abuja, Nigeria"
DEFAULT_DESC = (
    "2125 Signature designs and delivers timeless, elegant interiors for homes and "
    "offices in Abuja, Nigeria, from concept to completion."
)

# path -> (title, description, priority)
PUBLIC_PAGES = {
    "/": (DEFAULT_TITLE, DEFAULT_DESC, "1.0"),
    "/about": (
        f"About Us | {SITE_NAME}",
        "Meet 2125 Signature, an Abuja interior design and execution studio focused on "
        "refined kitchens, living rooms, dining rooms and bedrooms.",
        "0.7",
    ),
    "/services": (
        f"Interior Design Services | {SITE_NAME}",
        "Residential and commercial interior design, consultation and full project "
        "execution by 2125 Signature in Abuja, Nigeria.",
        "0.8",
    ),
    "/portfolio": (
        f"Portfolio of Interior Projects | {SITE_NAME}",
        "Browse recent interior design projects by 2125 Signature, each designed with "
        "precision, creativity and elegance.",
        "0.9",
    ),
    "/contact": (
        f"Book a Consultation | {SITE_NAME}",
        "Book a personalised interior design consultation with 2125 Signature in "
        "Wuse II, Abuja.",
        "0.6",
    ),
}

# Pages that exist in the app but must not be indexed (forms, accounts, admin)
PRIVATE_PAGES = {
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
}
PRIVATE_PATTERNS = [
    re.compile(r"^/portfolio/edit/\d+$"),
    re.compile(r"^/services/edit/\d+$"),
    re.compile(r"^/admin/edit-user/\d+$"),
    re.compile(r"^/category/edit/\d+$"),
]
WORK_PATTERN = re.compile(r"^/portfolio/(\d+)$")

_template_cache = {"mtime": None, "html": None}


def site_url() -> str:
    return settings.frontend_url.rstrip("/")


def _read_index() -> Optional[str]:
    try:
        mtime = os.path.getmtime(INDEX_PATH)
    except OSError:
        return None
    if _template_cache["mtime"] != mtime:
        with open(INDEX_PATH, encoding="utf-8") as f:
            _template_cache.update(mtime=mtime, html=f.read())
    return _template_cache["html"]


def _set_meta(doc: str, tag_id: str, value: str, attr: str = "content") -> str:
    """Replace the attribute of the tag carrying id=tag_id."""
    pattern = re.compile(
        rf'(<(?:meta|link)[^>]*\bid="{tag_id}"[^>]*\b{attr}=")[^"]*(")', re.S
    )
    return pattern.sub(lambda m: m.group(1) + html.escape(value, quote=True) + m.group(2), doc, count=1)


def _og_image_for(url: Optional[str]) -> str:
    """Cloudinary originals can be huge; ask for a 1200px JPEG (accepted by every scraper)."""
    if url and "/image/upload/" in url:
        return url.replace("/image/upload/", "/image/upload/f_jpg,q_auto,w_1200/", 1)
    return url or f"{site_url()}/static/og-default.jpg"


def _jsonld(extra: list) -> str:
    graph = [
        {
            "@type": ["LocalBusiness", "ProfessionalService"],
            "@id": f"{site_url()}/#business",
            "name": SITE_NAME,
            "url": site_url(),
            "logo": f"{site_url()}/static/logo.png",
            "image": f"{site_url()}/static/og-default.jpg",
            "description": DEFAULT_DESC,
            "email": "info@2125signature.com",
            "telephone": "+234 701 777 7571",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Suite 7, His Glory Plaza, Back of H-Medix, Ademola Adetokumbo Crescent, Wuse II",
                "addressLocality": "Abuja",
                "addressCountry": "NG",
            },
            "areaServed": "Abuja, Nigeria",
        },
        {"@type": "WebSite", "@id": f"{site_url()}/#website", "url": site_url(), "name": SITE_NAME},
        *extra,
    ]
    # "</" can't appear in JSON-LD inside <script>
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False).replace("</", "<\\/")


def render_page(
    path: str,
    *,
    title: str,
    description: str,
    robots: str = "index, follow",
    image: Optional[str] = None,
    og_type: str = "website",
    jsonld_extra: Optional[list] = None,
    status_code: int = 200,
) -> Response:
    doc = _read_index()
    if doc is None:
        return PlainTextResponse("index.html not found", status_code=503)

    url = site_url() + ("" if path == "/" else path)
    if path == "/":
        url += "/"
    img = _og_image_for(image)

    doc = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title)}</title>", doc, count=1, flags=re.S)
    doc = _set_meta(doc, "seo-description", description)
    doc = _set_meta(doc, "seo-robots", robots)
    doc = _set_meta(doc, "seo-canonical", url, attr="href")
    doc = _set_meta(doc, "seo-og-title", title)
    doc = _set_meta(doc, "seo-og-description", description)
    doc = _set_meta(doc, "seo-og-url", url)
    doc = _set_meta(doc, "seo-og-image", img)
    doc = _set_meta(doc, "seo-og-type", og_type)
    doc = _set_meta(doc, "seo-tw-title", title)
    doc = _set_meta(doc, "seo-tw-description", description)
    doc = _set_meta(doc, "seo-tw-image", img)
    doc = re.sub(
        r'(<script[^>]*\bid="seo-jsonld"[^>]*>).*?(</script>)',
        lambda m: m.group(1) + _jsonld(jsonld_extra or []) + m.group(2),
        doc,
        count=1,
        flags=re.S,
    )
    headers = {"Cache-Control": "no-cache"}
    if robots.startswith("noindex"):
        headers["X-Robots-Tag"] = robots
    return HTMLResponse(doc, status_code=status_code, headers=headers)


def page_for(path: str, db: Session) -> Response:
    """Pick the right <head> and HTTP status for a frontend URL."""
    path = path if path == "/" else path.rstrip("/")

    if path in PUBLIC_PAGES:
        title, desc, _ = PUBLIC_PAGES[path]
        return render_page(path, title=title, description=desc)

    m = WORK_PATTERN.match(path)
    if m:
        work = db.query(models.Work).filter(models.Work.id == int(m.group(1))).first()
        if work:
            desc = (work.description or DEFAULT_DESC).strip()
            desc = desc if len(desc) <= 160 else desc[:157].rstrip() + "…"
            image = _og_image_for(work.img_url)
            extra = [
                {
                    "@type": "CreativeWork",
                    "name": work.title,
                    "description": work.description,
                    "image": [image] + [_og_image_for(u) for u in (work.other_image_urls or [])],
                    "url": site_url() + path,
                    "dateCreated": work.created_at.astimezone(timezone.utc).isoformat() if work.created_at else None,
                    "creator": {"@id": f"{site_url()}/#business"},
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": site_url() + "/"},
                        {"@type": "ListItem", "position": 2, "name": "Portfolio", "item": site_url() + "/portfolio"},
                        {"@type": "ListItem", "position": 3, "name": work.title, "item": site_url() + path},
                    ],
                },
            ]
            return render_page(
                path,
                title=f"{work.title} | Portfolio | {SITE_NAME}",
                description=desc,
                image=work.img_url,
                og_type="article",
                jsonld_extra=extra,
            )
        return render_page(
            path, title=f"Project not found | {SITE_NAME}", description=DEFAULT_DESC,
            robots="noindex, nofollow", status_code=404,
        )

    if path in PRIVATE_PAGES or any(p.match(path) for p in PRIVATE_PATTERNS):
        label = PRIVATE_PAGES.get(path, "Manage")
        return render_page(
            path, title=f"{label} | {SITE_NAME}", description=DEFAULT_DESC, robots="noindex, nofollow"
        )

    # Unknown URL: serve the app (it shows its own 404 screen) but with a real 404 status
    return render_page(
        path, title=f"Page not found | {SITE_NAME}", description=DEFAULT_DESC,
        robots="noindex, nofollow", status_code=404,
    )


# ---------------------------------------------------------------- robots / sitemap
@router.api_route("/robots.txt", methods=["GET", "HEAD"])
def robots_txt():
    disallow = [
        "/api/", "/admin", "/dashboard", "/login", "/signup", "/forgot-password",
        "/verify-email", "/edit-profile", "/portfolio/add", "/portfolio/edit/",
        "/services/add", "/services/edit/", "/category",
    ]
    lines = ["User-agent: *", "Allow: /"] + [f"Disallow: {p}" for p in disallow]
    lines += ["", f"Sitemap: {site_url()}/sitemap.xml", ""]
    return PlainTextResponse("\n".join(lines), headers={"Cache-Control": "public, max-age=86400"})


@router.api_route("/sitemap.xml", methods=["GET", "HEAD"])
def sitemap_xml(db: Session = Depends(get_db)):
    base = site_url()
    urls = []
    for path, (_, _, priority) in PUBLIC_PAGES.items():
        loc = base + ("/" if path == "/" else path)
        urls.append(f"<url><loc>{html.escape(loc)}</loc><priority>{priority}</priority></url>")

    for work_id, created_at in (
        db.query(models.Work.id, models.Work.created_at).order_by(models.Work.created_at.desc()).all()
    ):
        lastmod = f"<lastmod>{created_at.date().isoformat()}</lastmod>" if created_at else ""
        urls.append(
            f"<url><loc>{base}/portfolio/{work_id}</loc>{lastmod}<priority>0.7</priority></url>"
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    return Response(xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=3600"})
