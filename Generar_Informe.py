"""
SonarCloud Report Generator - Sistema_LecturasIA
Genera un PDF y un HTML con todos los issues del proyecto.

Requisitos:
    pip install requests reportlab

Uso:
    python sonarcloud_report_v3.py
"""

import requests
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from datetime import datetime
import sys
import html as html_module

# ── Configuración ──────────────────────────────────────────────────────────────
TOKEN       = "160ea904cc22574a160cc083d6bb57adbf49e140"
PROJECT     = "DylanTapiaVargas999_Sistema_LecturasIA"
BASE_URL    = "https://sonarcloud.io/api"
OUTPUT_PDF  = "SonarCloud_Reporte_LecturasIA.pdf"
OUTPUT_HTML = "SonarCloud_Reporte_LecturasIA.html"
# ───────────────────────────────────────────────────────────────────────────────

SEVERITY_COLORS_HEX = {
    "BLOCKER":  "#d32f2f",
    "CRITICAL": "#e64a19",
    "HIGH":     "#f57c00",
    "MEDIUM":   "#f9a825",
    "LOW":      "#388e3c",
    "INFO":     "#0288d1",
}

SEVERITY_COLORS_RL = {k: colors.HexColor(v) for k, v in SEVERITY_COLORS_HEX.items()}

TYPE_LABELS = {
    "BUG":            "Bug (Fiabilidad)",
    "VULNERABILITY":  "Vulnerabilidad (Seguridad)",
    "CODE_SMELL":     "Code Smell (Mantenibilidad)",
}

TYPE_ICONS = {
    "BUG":           "🐛",
    "VULNERABILITY":  "🔒",
    "CODE_SMELL":    "🌿",
}

SEV_ORDER = ["BLOCKER", "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]


# ══════════════════════════════════════════════════════════════════════════════
# API
# ══════════════════════════════════════════════════════════════════════════════

def fetch_issues_by_type(session, issue_type):
    issues = []
    page = 1
    page_size = 100
    while True:
        resp = session.get(
            f"{BASE_URL}/issues/search",
            params={"projectKeys": PROJECT, "ps": page_size, "p": page, "types": issue_type},
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"  Error {resp.status_code}: {resp.text[:200]}")
            break
        data = resp.json()
        batch = data.get("issues", [])
        issues.extend(batch)
        total = data.get("total", 0)
        print(f"  [{issue_type}] Pagina {page}: {len(issues)}/{total}")
        if len(issues) >= total or not batch or page * page_size >= 10000:
            break
        page += 1
    return issues


def fetch_all_issues():
    session = requests.Session()
    session.auth = (TOKEN, "")
    all_issues = []
    for itype in ["BUG", "VULNERABILITY", "CODE_SMELL"]:
        print(f"\nDescargando {itype}...")
        issues = fetch_issues_by_type(session, itype)
        all_issues.extend(issues)
        print(f"  -> {len(issues)} issues")
    return all_issues


def fetch_project_metrics():
    session = requests.Session()
    session.auth = (TOKEN, "")
    resp = session.get(
        f"{BASE_URL}/measures/component",
        params={
            "component": PROJECT,
            "metricKeys": "bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc",
        },
        timeout=30,
    )
    if resp.status_code == 200:
        measures = resp.json().get("component", {}).get("measures", [])
        return {m["metric"]: m.get("value", "N/A") for m in measures}
    return {}


def get_severity(issue):
    impacts = issue.get("impacts", [])
    if impacts:
        sev_map = {"BLOCKER": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "INFO": 4}
        best = min(impacts, key=lambda x: sev_map.get(x.get("severity", "INFO"), 99))
        return best.get("severity", "INFO")
    return issue.get("severity", "INFO")


# ══════════════════════════════════════════════════════════════════════════════
# PDF
# ══════════════════════════════════════════════════════════════════════════════

def build_pdf(issues, metrics):
    total = len(issues)
    doc = SimpleDocTemplate(
        OUTPUT_PDF, pagesize=A4,
        rightMargin=1.5*cm, leftMargin=1.5*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("T2", parent=styles["Title"], fontSize=20, spaceAfter=6)
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=14, spaceAfter=4, spaceBefore=12)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=11, spaceAfter=4, spaceBefore=8)
    normal = ParagraphStyle("N",  parent=styles["Normal"], fontSize=8, leading=11)
    code   = ParagraphStyle("CD", parent=styles["Normal"], fontSize=7, leading=10,
                             fontName="Courier", textColor=colors.HexColor("#333333"))
    story = []

    # Portada
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("SonarCloud - Reporte de Issues", title_style))
    story.append(Paragraph(f"Proyecto: <b>{PROJECT}</b>", styles["Normal"]))
    story.append(Paragraph(f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles["Normal"]))
    story.append(Spacer(1, 0.5*cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    story.append(Spacer(1, 0.5*cm))

    # Metricas
    story.append(Paragraph("Resumen del Proyecto", h1))
    cov = metrics.get("coverage", "N/A")
    dup = metrics.get("duplicated_lines_density", "N/A")
    summary_data = [
        ["Metrica", "Valor"],
        ["Total Issues", str(total)],
        ["Bugs (Fiabilidad)", metrics.get("bugs", "N/A")],
        ["Vulnerabilidades (Seguridad)", metrics.get("vulnerabilities", "N/A")],
        ["Code Smells (Mantenibilidad)", metrics.get("code_smells", "N/A")],
        ["Lineas de codigo", metrics.get("ncloc", "N/A")],
        ["Cobertura", f"{cov}%" if cov != "N/A" else "N/A"],
        ["Duplicaciones", f"{dup}%" if dup != "N/A" else "N/A"],
    ]
    t = Table(summary_data, colWidths=[10*cm, 6*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0),(-1,0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR",  (0,0),(-1,0), colors.white),
        ("FONTNAME",   (0,0),(-1,0), "Helvetica-Bold"),
        ("FONTSIZE",   (0,0),(-1,-1), 9),
        ("GRID",       (0,0),(-1,-1), 0.5, colors.lightgrey),
        ("ROWBACKGROUNDS",(0,1),(-1,-1), [colors.white, colors.HexColor("#f5f5f5")]),
        ("LEFTPADDING",(0,0),(-1,-1), 8),
        ("TOPPADDING", (0,0),(-1,-1), 5),
        ("BOTTOMPADDING",(0,0),(-1,-1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.5*cm))

    # Severidad
    story.append(Paragraph("Distribucion por Severidad", h1))
    sev_count = {}
    for issue in issues:
        sev = get_severity(issue)
        sev_count[sev] = sev_count.get(sev, 0) + 1

    sev_data = [["Severidad", "Cantidad", "% del total"]]
    for sev in SEV_ORDER:
        cnt = sev_count.get(sev, 0)
        sev_data.append([sev, str(cnt), f"{cnt/total*100:.1f}%" if total else "0%"])

    t2 = Table(sev_data, colWidths=[7*cm, 4*cm, 5*cm])
    sev_style = [
        ("BACKGROUND",(0,0),(-1,0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR", (0,0),(-1,0), colors.white),
        ("FONTNAME",  (0,0),(-1,0), "Helvetica-Bold"),
        ("FONTSIZE",  (0,0),(-1,-1), 9),
        ("GRID",      (0,0),(-1,-1), 0.5, colors.lightgrey),
        ("ROWBACKGROUNDS",(0,1),(-1,-1), [colors.white, colors.HexColor("#f5f5f5")]),
        ("LEFTPADDING",(0,0),(-1,-1), 8),
        ("TOPPADDING",(0,0),(-1,-1), 4),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
    ]
    for i, sev in enumerate(SEV_ORDER, 1):
        sev_style += [
            ("TEXTCOLOR",(0,i),(0,i), SEVERITY_COLORS_RL.get(sev, colors.grey)),
            ("FONTNAME", (0,i),(0,i), "Helvetica-Bold"),
        ]
    t2.setStyle(TableStyle(sev_style))
    story.append(t2)
    story.append(Spacer(1, 0.5*cm))

    # Tipo
    story.append(Paragraph("Distribucion por Tipo", h1))
    type_count = {}
    for issue in issues:
        tp = issue.get("type","UNKNOWN")
        type_count[tp] = type_count.get(tp, 0) + 1

    type_data = [["Tipo", "Cantidad", "% del total"]]
    for tp in ["BUG","VULNERABILITY","CODE_SMELL"]:
        cnt = type_count.get(tp, 0)
        type_data.append([TYPE_LABELS.get(tp,tp), str(cnt), f"{cnt/total*100:.1f}%" if total else "0%"])

    t3 = Table(type_data, colWidths=[10*cm,3*cm,3*cm])
    t3.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR", (0,0),(-1,0), colors.white),
        ("FONTNAME",  (0,0),(-1,0), "Helvetica-Bold"),
        ("FONTSIZE",  (0,0),(-1,-1), 9),
        ("GRID",      (0,0),(-1,-1), 0.5, colors.lightgrey),
        ("ROWBACKGROUNDS",(0,1),(-1,-1), [colors.white, colors.HexColor("#f5f5f5")]),
        ("LEFTPADDING",(0,0),(-1,-1), 8),
        ("TOPPADDING",(0,0),(-1,-1), 4),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
    ]))
    story.append(t3)

    # Detalle
    story.append(PageBreak())
    story.append(Paragraph("Detalle Completo de Issues", h1))

    by_type = {}
    for issue in issues:
        tp = issue.get("type","UNKNOWN")
        by_type.setdefault(tp, []).append(issue)

    for itype in ["BUG","VULNERABILITY","CODE_SMELL"]:
        type_issues = by_type.get(itype, [])
        if not type_issues:
            continue
        label = TYPE_LABELS.get(itype, itype)
        story.append(Paragraph(f"{label} - {len(type_issues)} issues", h2))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
        story.append(Spacer(1, 0.2*cm))

        by_sev = {}
        for issue in type_issues:
            sev = get_severity(issue)
            by_sev.setdefault(sev, []).append(issue)

        for sev in SEV_ORDER:
            sev_issues = by_sev.get(sev, [])
            if not sev_issues:
                continue
            sev_color = SEVERITY_COLORS_RL.get(sev, colors.grey)
            sev_style2 = ParagraphStyle(
                f"SL_{sev}_{itype}", parent=styles["Normal"],
                fontSize=9, textColor=sev_color, fontName="Helvetica-Bold",
                spaceAfter=3, spaceBefore=6,
            )
            story.append(Paragraph(f">> {sev} ({len(sev_issues)})", sev_style2))

            tbl_data = [["#", "Mensaje", "Archivo", "Linea", "Esfuerzo"]]
            for idx, issue in enumerate(sev_issues, 1):
                msg = issue.get("message","")
                if len(msg) > 100: msg = msg[:97]+"..."
                component = issue.get("component","").split(":")[-1]
                if len(component) > 48: component = "..."+component[-45:]
                tbl_data.append([
                    str(idx),
                    Paragraph(msg, normal),
                    Paragraph(component, code),
                    str(issue.get("line","-")),
                    issue.get("effort","-"),
                ])

            tbl = Table(tbl_data, colWidths=[0.7*cm,7.8*cm,5.5*cm,1.1*cm,1.4*cm], repeatRows=1)
            tbl.setStyle(TableStyle([
                ("BACKGROUND",(0,0),(-1,0), colors.HexColor("#37474f")),
                ("TEXTCOLOR", (0,0),(-1,0), colors.white),
                ("FONTNAME",  (0,0),(-1,0), "Helvetica-Bold"),
                ("FONTSIZE",  (0,0),(-1,-1), 7),
                ("GRID",      (0,0),(-1,-1), 0.3, colors.lightgrey),
                ("ROWBACKGROUNDS",(0,1),(-1,-1), [colors.white, colors.HexColor("#fafafa")]),
                ("VALIGN",    (0,0),(-1,-1), "TOP"),
                ("LEFTPADDING",(0,0),(-1,-1), 4),
                ("RIGHTPADDING",(0,0),(-1,-1), 4),
                ("TOPPADDING",(0,0),(-1,-1), 3),
                ("BOTTOMPADDING",(0,0),(-1,-1), 3),
            ]))
            story.append(tbl)
            story.append(Spacer(1, 0.3*cm))
        story.append(Spacer(1, 0.4*cm))

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.grey)
        canvas.drawString(1.5*cm, 1*cm, f"SonarCloud - {PROJECT}")
        canvas.drawRightString(A4[0]-1.5*cm, 1*cm, f"Pagina {doc.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(f"  PDF generado: {OUTPUT_PDF}")


# ══════════════════════════════════════════════════════════════════════════════
# HTML
# ══════════════════════════════════════════════════════════════════════════════

def build_html(issues, metrics):
    total = len(issues)
    now = datetime.now().strftime("%d/%m/%Y %H:%M")

    sev_count = {}
    type_count = {}
    for issue in issues:
        sev = get_severity(issue)
        sev_count[sev] = sev_count.get(sev, 0) + 1
        tp = issue.get("type", "UNKNOWN")
        type_count[tp] = type_count.get(tp, 0) + 1

    by_type = {}
    for issue in issues:
        tp = issue.get("type", "UNKNOWN")
        by_type.setdefault(tp, []).append(issue)

    def e(s):
        return html_module.escape(str(s))

    # ── Tarjetas de resumen ─────────────────────────────────────────────────
    cov = metrics.get("coverage", "N/A")
    dup = metrics.get("duplicated_lines_density", "N/A")
    metric_cards = f"""
    <div class="cards">
      <div class="card card-blue"><div class="card-val">{e(total)}</div><div class="card-lbl">Total Issues</div></div>
      <div class="card card-red"><div class="card-val">{e(metrics.get('bugs','N/A'))}</div><div class="card-lbl">🐛 Bugs</div></div>
      <div class="card card-orange"><div class="card-val">{e(metrics.get('vulnerabilities','N/A'))}</div><div class="card-lbl">🔒 Vulnerabilidades</div></div>
      <div class="card card-green"><div class="card-val">{e(metrics.get('code_smells','N/A'))}</div><div class="card-lbl">🌿 Code Smells</div></div>
      <div class="card card-grey"><div class="card-val">{e(metrics.get('ncloc','N/A'))}</div><div class="card-lbl">📄 Lineas de codigo</div></div>
      <div class="card card-grey"><div class="card-val">{f"{cov}%" if cov != "N/A" else "N/A"}</div><div class="card-lbl">✅ Cobertura</div></div>
      <div class="card card-grey"><div class="card-val">{f"{dup}%" if dup != "N/A" else "N/A"}</div><div class="card-lbl">📋 Duplicaciones</div></div>
    </div>"""

    # ── Tabla de severidad ──────────────────────────────────────────────────
    sev_rows = ""
    for sev in SEV_ORDER:
        cnt = sev_count.get(sev, 0)
        pct = f"{cnt/total*100:.1f}%" if total else "0%"
        bar_w = f"{cnt/total*100:.1f}" if total else "0"
        color = SEVERITY_COLORS_HEX.get(sev, "#999")
        sev_rows += f"""
        <tr>
          <td><span class="badge" style="background:{color}">{e(sev)}</span></td>
          <td class="num">{cnt}</td>
          <td>{pct}</td>
          <td><div class="bar-wrap"><div class="bar" style="width:{bar_w}%;background:{color}"></div></div></td>
        </tr>"""

    # ── Detalle de issues ───────────────────────────────────────────────────
    detail_sections = ""
    for itype in ["BUG", "VULNERABILITY", "CODE_SMELL"]:
        type_issues = by_type.get(itype, [])
        if not type_issues:
            continue
        label = TYPE_LABELS.get(itype, itype)
        icon  = TYPE_ICONS.get(itype, "")
        section_id = itype.lower()

        by_sev = {}
        for issue in type_issues:
            sev = get_severity(issue)
            by_sev.setdefault(sev, []).append(issue)

        sev_blocks = ""
        for sev in SEV_ORDER:
            sev_issues = by_sev.get(sev, [])
            if not sev_issues:
                continue
            color = SEVERITY_COLORS_HEX.get(sev, "#999")
            rows = ""
            for idx, issue in enumerate(sev_issues, 1):
                msg       = e(issue.get("message", ""))
                component = issue.get("component", "").split(":")[-1]
                line      = e(issue.get("line", "-"))
                effort    = e(issue.get("effort", "-"))
                rows += f"""
                <tr>
                  <td class="num">{idx}</td>
                  <td>{msg}</td>
                  <td class="mono">{e(component)}</td>
                  <td class="num">{line}</td>
                  <td class="num">{effort}</td>
                </tr>"""

            sev_blocks += f"""
            <div class="sev-group">
              <div class="sev-header" style="color:{color}">
                ▶ {e(sev)} <span class="sev-count">({len(sev_issues)})</span>
              </div>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Mensaje</th><th>Archivo</th><th>Linea</th><th>Esfuerzo</th></tr></thead>
                  <tbody>{rows}</tbody>
                </table>
              </div>
            </div>"""

        detail_sections += f"""
        <section class="type-section" id="{section_id}">
          <h2>{icon} {e(label)} <span class="type-count">{len(type_issues)}</span></h2>
          {sev_blocks}
        </section>"""

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SonarCloud Reporte - {e(PROJECT)}</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      font-size: 13px;
      line-height: 1.5;
    }}
    a {{ color: #58a6ff; }}

    /* Header */
    .header {{
      background: linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%);
      padding: 32px 40px 24px;
      border-bottom: 2px solid #30363d;
    }}
    .header h1 {{ font-size: 24px; color: #fff; margin-bottom: 4px; }}
    .header .meta {{ color: #8b949e; font-size: 12px; }}

    /* Nav */
    .nav {{
      background: #161b22;
      border-bottom: 1px solid #30363d;
      padding: 0 40px;
      display: flex;
      gap: 4px;
      position: sticky;
      top: 0;
      z-index: 100;
    }}
    .nav a {{
      display: inline-block;
      padding: 10px 16px;
      color: #8b949e;
      text-decoration: none;
      border-bottom: 2px solid transparent;
      font-size: 13px;
      transition: color .2s, border-color .2s;
    }}
    .nav a:hover {{ color: #c9d1d9; border-color: #58a6ff; }}

    /* Content */
    .content {{ max-width: 1400px; margin: 0 auto; padding: 32px 40px; }}

    /* Section titles */
    h2 {{
      font-size: 18px;
      color: #e6edf3;
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #30363d;
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    h3 {{ font-size: 15px; color: #e6edf3; margin: 24px 0 10px; }}

    /* Cards */
    .cards {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }}
    .card {{
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 20px 16px;
      text-align: center;
      transition: transform .2s, box-shadow .2s;
    }}
    .card:hover {{ transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }}
    .card-val {{ font-size: 28px; font-weight: 700; margin-bottom: 6px; }}
    .card-lbl {{ font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: .5px; }}
    .card-blue  .card-val {{ color: #58a6ff; }}
    .card-red   .card-val {{ color: #f85149; }}
    .card-orange .card-val {{ color: #f0883e; }}
    .card-green .card-val {{ color: #3fb950; }}
    .card-grey  .card-val {{ color: #8b949e; }}

    /* Tables */
    .table-wrap {{ overflow-x: auto; margin-bottom: 8px; }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }}
    thead tr {{ background: #21262d; }}
    th {{
      text-align: left;
      padding: 8px 12px;
      color: #8b949e;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .4px;
      border-bottom: 1px solid #30363d;
      white-space: nowrap;
    }}
    td {{
      padding: 7px 12px;
      border-bottom: 1px solid #21262d;
      vertical-align: top;
    }}
    tr:hover td {{ background: #1c2128; }}
    .num {{ text-align: center; white-space: nowrap; color: #8b949e; }}
    .mono {{ font-family: 'Courier New', monospace; font-size: 11px; color: #79c0ff; word-break: break-all; }}

    /* Badge */
    .badge {{
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .5px;
    }}

    /* Bar */
    .bar-wrap {{ background: #21262d; border-radius: 4px; height: 8px; min-width: 80px; }}
    .bar {{ height: 8px; border-radius: 4px; transition: width .3s; }}

    /* Severity groups */
    .sev-group {{ margin-bottom: 24px; }}
    .sev-header {{
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
      padding: 6px 0;
      letter-spacing: .3px;
    }}
    .sev-count {{ font-weight: 400; color: #8b949e; font-size: 12px; }}

    /* Type section */
    .type-section {{ margin-bottom: 48px; }}
    .type-count {{
      display: inline-block;
      background: #21262d;
      border-radius: 12px;
      padding: 1px 10px;
      font-size: 13px;
      color: #8b949e;
      font-weight: 400;
    }}

    /* Severity table row */
    .sev-table td:first-child {{ width: 140px; }}

    /* Print styles */
    @media print {{
      body {{ background: #fff; color: #000; }}
      .nav {{ display: none; }}
      .header {{ background: #1e3a5f !important; -webkit-print-color-adjust: exact; }}
      .card {{ border: 1px solid #ddd; }}
    }}
  </style>
</head>
<body>

<div class="header">
  <h1>SonarCloud — Reporte de Issues</h1>
  <div class="meta">
    Proyecto: <strong style="color:#fff">{e(PROJECT)}</strong> &nbsp;·&nbsp;
    Generado: {e(now)} &nbsp;·&nbsp;
    Total issues: <strong style="color:#fff">{total}</strong>
  </div>
</div>

<nav class="nav">
  <a href="#resumen">Resumen</a>
  <a href="#severidad">Severidad</a>
  <a href="#bug">Bugs ({type_count.get('BUG',0)})</a>
  <a href="#vulnerability">Vulnerabilidades ({type_count.get('VULNERABILITY',0)})</a>
  <a href="#code_smell">Code Smells ({type_count.get('CODE_SMELL',0)})</a>
</nav>

<div class="content">

  <section id="resumen">
    <h2>📊 Resumen del Proyecto</h2>
    {metric_cards}
  </section>

  <section id="severidad">
    <h2>⚠️ Distribucion por Severidad</h2>
    <div class="table-wrap">
      <table class="sev-table">
        <thead><tr><th>Severidad</th><th>Cantidad</th><th>%</th><th style="min-width:200px">Distribucion</th></tr></thead>
        <tbody>{sev_rows}</tbody>
      </table>
    </div>
  </section>

  <h2 id="detalle">🔍 Detalle Completo de Issues</h2>
  {detail_sections}

</div>

<script>
  // Highlight active nav link on scroll
  const sections = document.querySelectorAll('section[id], h2[id]');
  const navLinks = document.querySelectorAll('.nav a');
  window.addEventListener('scroll', () => {{
    let current = '';
    sections.forEach(s => {{
      if (window.scrollY >= s.offsetTop - 80) current = s.id;
    }});
    navLinks.forEach(a => {{
      a.style.borderColor = a.getAttribute('href') === '#'+current ? '#58a6ff' : 'transparent';
      a.style.color = a.getAttribute('href') === '#'+current ? '#e6edf3' : '';
    }});
  }});
</script>

</body>
</html>"""

    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  HTML generado: {OUTPUT_HTML}")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("SonarCloud Report Generator v3 (PDF + HTML)")
    print("=" * 60)

    issues = fetch_all_issues()
    print(f"\nTotal issues descargados: {len(issues)}")

    print("\nObteniendo metricas del proyecto...")
    metrics = fetch_project_metrics()

    print("\nGenerando PDF...")
    build_pdf(issues, metrics)

    print("Generando HTML...")
    build_html(issues, metrics)

    print("\n" + "=" * 60)
    print("Listo! Archivos generados:")
    print(f"  - {OUTPUT_PDF}")
    print(f"  - {OUTPUT_HTML}")
    print("=" * 60)


if __name__ == "__main__":
    main()