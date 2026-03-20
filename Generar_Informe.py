"""
SonarCloud Report Generator - Sistema_LecturasIA
Genera un PDF con todos los issues del proyecto.

Requisitos:
    pip install requests reportlab

Uso:
    python sonarcloud_report.py
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
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from datetime import datetime
import sys

# ── Configuración ──────────────────────────────────────────────────────────────
TOKEN      = "160ea904cc22574a160cc083d6bb57adbf49e140"
PROJECT    = "DylanTapiaVargas999_Sistema_LecturasIA"
BASE_URL   = "https://sonarcloud.io/api"
OUTPUT_PDF = "SonarCloud_Reporte_LecturasIA.pdf"
# ───────────────────────────────────────────────────────────────────────────────

SEVERITY_COLORS = {
    "BLOCKER":  colors.HexColor("#d32f2f"),
    "CRITICAL": colors.HexColor("#e64a19"),
    "HIGH":     colors.HexColor("#f57c00"),
    "MEDIUM":   colors.HexColor("#fbc02d"),
    "LOW":      colors.HexColor("#388e3c"),
    "INFO":     colors.HexColor("#0288d1"),
}

TYPE_LABELS = {
    "BUG":           "Bug",
    "VULNERABILITY":  "Vulnerabilidad",
    "CODE_SMELL":    "Code Smell",
}

def fetch_all_issues():
    """Descarga todos los issues paginando la API."""
    issues = []
    page = 1
    page_size = 100
    session = requests.Session()
    session.auth = (TOKEN, "")

    print("Descargando issues de SonarCloud...")
    while True:
        resp = session.get(
            f"{BASE_URL}/issues/search",
            params={
                "projectKeys": PROJECT,
                "ps": page_size,
                "p": page,
                "statuses": "OPEN,CONFIRMED,REOPENED",
                "additionalFields": "comments",
            },
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"Error {resp.status_code}: {resp.text}")
            sys.exit(1)

        data = resp.json()
        batch = data.get("issues", [])
        issues.extend(batch)
        total = data.get("total", 0)
        print(f"  Página {page}: {len(issues)}/{total} issues descargados")

        if len(issues) >= total or not batch:
            break
        page += 1

    return issues, total


def fetch_project_info():
    """Obtiene métricas generales del proyecto."""
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


def build_pdf(issues, total, metrics):
    """Construye el PDF con reportlab."""
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("Title2", parent=styles["Title"], fontSize=20, spaceAfter=6)
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=14, spaceAfter=4, spaceBefore=12)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=11, spaceAfter=4, spaceBefore=8)
    normal = ParagraphStyle("N", parent=styles["Normal"], fontSize=8, leading=11)
    small  = ParagraphStyle("S", parent=styles["Normal"], fontSize=7, leading=10, textColor=colors.grey)
    code   = ParagraphStyle("C", parent=styles["Normal"], fontSize=7, leading=10,
                             fontName="Courier", textColor=colors.HexColor("#333333"))

    story = []

    # ── Portada ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("SonarCloud — Reporte de Issues", title_style))
    story.append(Paragraph(f"Proyecto: <b>{PROJECT}</b>", styles["Normal"]))
    story.append(Paragraph(f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles["Normal"]))
    story.append(Spacer(1, 0.5*cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    story.append(Spacer(1, 0.5*cm))

    # ── Métricas generales ─────────────────────────────────────────────────────
    story.append(Paragraph("Resumen del Proyecto", h1))
    summary_data = [
        ["Métrica", "Valor"],
        ["Total de Issues", str(total)],
        ["Bugs (Reliability)", metrics.get("bugs", "N/A")],
        ["Vulnerabilidades (Security)", metrics.get("vulnerabilities", "N/A")],
        ["Code Smells (Maintainability)", metrics.get("code_smells", "N/A")],
        ["Líneas de código", metrics.get("ncloc", "N/A")],
        ["Cobertura", metrics.get("coverage", "N/A") + "%" if metrics.get("coverage") not in (None, "N/A") else "N/A"],
        ["Duplicaciones", metrics.get("duplicated_lines_density", "N/A") + "%" if metrics.get("duplicated_lines_density") not in (None, "N/A") else "N/A"],
    ]
    t = Table(summary_data, colWidths=[9*cm, 6*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING",   (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.5*cm))

    # ── Distribución por severidad ─────────────────────────────────────────────
    story.append(Paragraph("Distribución por Severidad", h1))
    sev_count = {}
    for issue in issues:
        sev = issue.get("severity", "UNKNOWN")
        sev_count[sev] = sev_count.get(sev, 0) + 1

    sev_order = ["BLOCKER", "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]
    sev_data = [["Severidad", "Cantidad", "% del total"]]
    for sev in sev_order:
        cnt = sev_count.get(sev, 0)
        pct = f"{cnt/total*100:.1f}%" if total > 0 else "0%"
        sev_data.append([sev, str(cnt), pct])

    t2 = Table(sev_data, colWidths=[7*cm, 4*cm, 4*cm])
    sev_style = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
        ("TOPPADDING",   (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 4),
    ]
    for i, sev in enumerate(sev_order, start=1):
        color = SEVERITY_COLORS.get(sev, colors.grey)
        sev_style.append(("TEXTCOLOR", (0, i), (0, i), color))
        sev_style.append(("FONTNAME",  (0, i), (0, i), "Helvetica-Bold"))
    t2.setStyle(TableStyle(sev_style))
    story.append(t2)

    # ── Detalle de issues por tipo ─────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("Detalle de Issues", h1))

    # Agrupar por tipo
    by_type = {}
    for issue in issues:
        t_key = issue.get("type", "UNKNOWN")
        by_type.setdefault(t_key, []).append(issue)

    for issue_type, type_issues in by_type.items():
        label = TYPE_LABELS.get(issue_type, issue_type)
        story.append(Paragraph(f"{label} ({len(type_issues)})", h2))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
        story.append(Spacer(1, 0.2*cm))

        # Agrupar por severidad dentro del tipo
        by_sev = {}
        for issue in type_issues:
            sev = issue.get("severity", "UNKNOWN")
            by_sev.setdefault(sev, []).append(issue)

        for sev in sev_order:
            if sev not in by_sev:
                continue
            sev_issues = by_sev[sev]
            sev_color = SEVERITY_COLORS.get(sev, colors.grey)

            sev_label = ParagraphStyle(
                f"Sev_{sev}", parent=styles["Normal"],
                fontSize=9, textColor=sev_color, fontName="Helvetica-Bold",
                spaceAfter=3, spaceBefore=6,
            )
            story.append(Paragraph(f"▶ {sev} ({len(sev_issues)})", sev_label))

            tbl_data = [["#", "Mensaje", "Archivo", "Línea", "Esfuerzo"]]
            for idx, issue in enumerate(sev_issues, 1):
                msg = issue.get("message", "")[:90] + ("..." if len(issue.get("message","")) > 90 else "")
                component = issue.get("component", "").split(":")[-1]
                if len(component) > 45:
                    component = "..." + component[-42:]
                line = str(issue.get("line", "—"))
                effort = issue.get("effort", "—")
                tbl_data.append([
                    str(idx),
                    Paragraph(msg, normal),
                    Paragraph(component, code),
                    line,
                    effort,
                ])

            col_widths = [0.7*cm, 7.5*cm, 5.5*cm, 1.2*cm, 1.6*cm]
            tbl = Table(tbl_data, colWidths=col_widths, repeatRows=1)
            tbl.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, 0), colors.HexColor("#37474f")),
                ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
                ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE",      (0, 0), (-1, -1), 7),
                ("GRID",          (0, 0), (-1, -1), 0.3, colors.lightgrey),
                ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
                ("VALIGN",        (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING",   (0, 0), (-1, -1), 4),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
                ("TOPPADDING",    (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]))
            story.append(tbl)
            story.append(Spacer(1, 0.3*cm))

        story.append(Spacer(1, 0.3*cm))

    # ── Pie de página en build ─────────────────────────────────────────────────
    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.grey)
        canvas.drawString(1.5*cm, 1*cm, f"SonarCloud — {PROJECT}")
        canvas.drawRightString(A4[0] - 1.5*cm, 1*cm, f"Página {doc.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(f"\n✅ PDF generado: {OUTPUT_PDF}")


def main():
    issues, total = fetch_all_issues()
    metrics = fetch_project_info()
    print(f"\nTotal descargado: {len(issues)} issues")
    print("Generando PDF...")
    build_pdf(issues, total, metrics)


if __name__ == "__main__":
    main()