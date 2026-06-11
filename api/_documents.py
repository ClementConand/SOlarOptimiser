"""PDF document generator — shared by api/documents.py"""
from __future__ import annotations
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

SOLAR_LIME = colors.HexColor("#d4f000")
DARK       = colors.HexColor("#090D08")
MUTED      = colors.HexColor("#6b7280")


def _doc(buf, title):
    return SimpleDocTemplate(buf, pagesize=A4,
        leftMargin=2.5*cm, rightMargin=2.5*cm,
        topMargin=2*cm, bottomMargin=2*cm,
        title=title, author="Solar Optimizer")


def _styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle("ST", fontSize=20, fontName="Helvetica-Bold", spaceAfter=6, textColor=DARK))
    s.add(ParagraphStyle("SS", fontSize=11, textColor=MUTED, spaceAfter=12))
    s.add(ParagraphStyle("SH", fontSize=13, fontName="Helvetica-Bold", spaceBefore=16, spaceAfter=6, textColor=DARK))
    s.add(ParagraphStyle("SB", fontSize=10, leading=15, textColor=DARK))
    s.add(ParagraphStyle("SM", fontSize=8, textColor=MUTED))
    return s


def _header(story, title, subtitle, s):
    story.append(Paragraph("☀ Solar Optimizer", s["SM"]))
    story.append(Spacer(1, 0.3*cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=SOLAR_LIME))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph(title, s["ST"]))
    story.append(Paragraph(subtitle, s["SS"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    story.append(Spacer(1, 0.5*cm))


def _table(data):
    t = Table(data, colWidths=[7*cm, 9*cm])
    t.setStyle(TableStyle([
        ("FONTNAME",  (0,0),(-1,-1),"Helvetica"),
        ("FONTSIZE",  (0,0),(-1,-1), 9),
        ("GRID",      (0,0),(-1,-1), 0.5, colors.lightgrey),
        ("BACKGROUND",(0,0),(0,-1), colors.HexColor("#f3f4f6")),
        ("PADDING",   (0,0),(-1,-1), 6),
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[colors.white, colors.HexColor("#fafafa")]),
    ]))
    return t


def declaration_mairie(proj: dict, res: dict) -> bytes:
    buf = io.BytesIO()
    s = _styles(); story = []
    _header(story, "Déclaration préalable de travaux",
            f"Installation photovoltaïque — {proj.get('address','')}", s)
    story.append(Paragraph("FORMULAIRE CERFA N° 13703*10 — extrait pré-rempli", s["SH"]))
    story.append(_table([
        ["Adresse des travaux",    proj.get("address","À compléter")],
        ["Type de construction",   proj.get("houseType","maison").capitalize()],
        ["Surface hors œuvre",     f"{proj.get('surface','')} m²"],
        ["Puissance installée",    f"{res.get('totalPowerKwp','')} kWc"],
        ["Nombre de panneaux",     str(res.get('panelCount',''))],
        ["Date de dépôt",          datetime.today().strftime("%d/%m/%Y")],
    ]))
    story.append(Spacer(1, 0.8*cm))
    story.append(Paragraph("PIÈCES À JOINDRE", s["SH"]))
    for p in ["• Plan de situation (Géoportail)",
              "• Plan de masse avec emprise panneau",
              "• Plan en coupe (profil toiture)",
              "• Photo de la situation existante",
              "• Document graphique d'insertion"]:
        story.append(Paragraph(p, s["SB"]))
    story.append(Spacer(1,0.8*cm))
    story.append(Paragraph("<i>Document indicatif — vérifiez les exigences de votre commune.</i>", s["SM"]))
    _doc(buf,"Déclaration préalable").build(story)
    return buf.getvalue()


def courrier_assurance(proj: dict, res: dict) -> bytes:
    buf = io.BytesIO(); s = _styles(); story = []
    _header(story,"Courrier Assurance Habitation","À envoyer en recommandé avec AR",s)
    addr = proj.get("address","Votre adresse")
    story.append(Paragraph(
        f"<b>Objet :</b> Déclaration installation photovoltaïque — {addr}<br/><br/>"
        "Madame, Monsieur,<br/><br/>"
        f"Je vous informe de l'installation de panneaux photovoltaïques au <b>{addr}</b>.<br/><br/>"
        f"<b>Installation :</b> {res.get('totalPowerKwp','')} kWc — "
        f"{res.get('panelCount','')} panneaux — "
        f"{res.get('annualProductionKwh','')} kWh/an — professionnel RGE.<br/><br/>"
        "Merci de confirmer que ma couverture reste adaptée.<br/><br/>"
        f"Cordialement,<br/>___________________________<br/>{datetime.today().strftime('%d/%m/%Y')}",
        s["SB"]))
    _doc(buf,"Courrier Assurance").build(story)
    return buf.getvalue()


def checklist_installation(res: dict) -> bytes:
    buf = io.BytesIO(); s = _styles(); story = []
    _header(story,"Checklist Installation Complète",
            f"Système {res.get('totalPowerKwp','')} kWc — {res.get('panelCount','')} panneaux",s)
    sections = [
        ("AVANT L'INSTALLATION", [
            "Vérifier solidité et étanchéité de la toiture",
            "Obtenir la déclaration préalable validée",
            "Souscrire une assurance dommages-ouvrage",
            "Obtenir le devis définitif d'un installateur RGE",
            "Vérifier éligibilité aux aides (MaPrimeRénov, TVA 10%)",
            "Informer ENEDIS du projet",
        ]),
        ("PENDANT L'INSTALLATION", [
            "Vérifier certifications équipements (IEC, CE)",
            "Contrôler sens et inclinaison de pose",
            "Vérifier étanchéité des traversées de toiture",
            "S'assurer de la mise à la terre",
            "Tester continuité câbles DC avant branchement",
            "Documenter chaque étape (photos datées)",
        ]),
        ("MISE EN SERVICE", [
            "Vérifier tension en circuit ouvert de chaque string",
            "Paramétrer l'onduleur (pays, fréquence, protections)",
            "Tester la coupure d'urgence AC/DC",
            "Valider le monitoring en temps réel",
            "Signer le PV de réception de travaux",
            "Envoyer dossier de raccordement à ENEDIS",
        ]),
        ("APRÈS", [
            "Conserver factures et DOE",
            "Premier relevé de production à J+30",
            "Maintenance annuelle (nettoyage, thermographie)",
            "Déclarer revenus de vente de surplus",
        ]),
    ]
    for title, items in sections:
        story.append(Paragraph(title, s["SH"]))
        for item in items:
            story.append(Paragraph(f"☐  {item}", s["SB"]))
            story.append(Spacer(1, 0.2*cm))
    _doc(buf,"Checklist Installation").build(story)
    return buf.getvalue()


def guide_administratif(proj: dict, res: dict) -> bytes:
    buf = io.BytesIO(); s = _styles(); story = []
    _header(story,"Guide Administratif — Étape par Étape",
            "Toutes les démarches pour votre installation solaire en France",s)
    steps = [
        ("1 — Déclaration préalable de travaux",
         "Obligatoire dans la plupart des communes (Cerfa 13703*10). Délai : 1 mois "
         "(2 mois si ABF). L'absence de réponse vaut accord tacite."),
        ("2 — Convention de raccordement ENEDIS",
         "Déposer le dossier sur raccordement.enedis.fr. Délai : 3 à 6 semaines. "
         "Coût moyen : ~1 200 € pour ≤ 36 kVA."),
        ("3 — Aides disponibles",
         "• Prime à l'investissement EDF OA (contrat 20 ans)\n"
         "• TVA à 10% (logement > 2 ans)\n"
         "• MaPrimeRénov' selon ressources\n"
         "• Éco-prêt à taux zéro jusqu'à 30 000 €"),
        ("4 — Choisir un installateur RGE",
         "Obligatoire pour les aides. Vérifiez sur france-renov.gouv.fr. "
         "Demandez 3 devis min. Vérifiez : garantie décennale, certifications produits."),
        ("5 — Mise en service et contrat de rachat",
         "ENEDIS installe un compteur Linky bidirectionnel. "
         "Option vente de surplus : contrat EDF OA, prix garanti 20 ans."),
    ]
    for title, body in steps:
        story.append(Paragraph(title, s["SH"]))
        story.append(Paragraph(body, s["SB"]))
        story.append(Spacer(1, 0.3*cm))
    _doc(buf,"Guide Administratif").build(story)
    return buf.getvalue()


def notice_enedis(res: dict) -> bytes:
    buf = io.BytesIO(); s = _styles(); story = []
    _header(story,"Notice Raccordement ENEDIS","Autoconsommation avec injection du surplus",s)
    kwp = res.get("totalPowerKwp", 0)
    story.append(Paragraph("CARACTÉRISTIQUES TECHNIQUES", s["SH"]))
    story.append(_table([
        ["Puissance crête",     f"{kwp} kWc"],
        ["Nombre de panneaux",  str(res.get("panelCount",""))],
        ["Mode d'exploitation", "Autoconsommation + injection surplus"],
        ["Tension réseau",      "230 V monophasé"],
        ["Disjoncteur",         "32A" if kwp <= 6 else "63A"],
    ]))
    story.append(Spacer(1, 0.6*cm))
    story.append(Paragraph("DÉMARCHES EN LIGNE", s["SH"]))
    story.append(Paragraph(
        "1. raccordement.enedis.fr → « Producteur ≤ 36 kVA »<br/>"
        "2. Renseigner puissance + schéma unifilaire<br/>"
        "3. Payer la convention en ligne<br/>"
        "4. RDV ENEDIS sous 3 semaines", s["SB"]))
    _doc(buf,"Notice ENEDIS").build(story)
    return buf.getvalue()


def email_devis(proj: dict, res: dict) -> bytes:
    buf = io.BytesIO(); s = _styles(); story = []
    _header(story,"Modèle Email — Demande de Devis","À envoyer à 3 installateurs RGE minimum",s)
    addr = proj.get("address","")
    story.append(Paragraph(
        f"<b>Objet :</b> Demande de devis — Installation PV {res.get('totalPowerKwp','')} kWc — {addr}<br/><br/>"
        "Madame, Monsieur,<br/><br/>"
        f"Je souhaite réaliser une installation photovoltaïque au <b>{addr}</b>.<br/><br/>"
        f"<b>Configuration :</b> {res.get('totalPowerKwp','')} kWc — "
        f"{res.get('panelCount','')} panneaux — autoconsommation avec vente surplus.<br/><br/>"
        "Je souhaite recevoir un devis incluant : marque et caractéristiques du matériel, "
        "montant HT/TTC avec TVA 10%, aides déductibles (MaPrimeRénov, Prime EDF OA), "
        "délai d'installation, garanties et certification RGE.<br/><br/>"
        "Cordialement,<br/>[Votre nom — Téléphone — Email]", s["SB"]))
    _doc(buf,"Email Devis").build(story)
    return buf.getvalue()


def dossier_complet(proj: dict, res: dict) -> bytes:
    buf = io.BytesIO(); s = _styles(); story = []
    _header(story,"Dossier Complet Solar Optimizer",
            f"{proj.get('address','')} — {datetime.today().strftime('%d/%m/%Y')}",s)
    story.append(Paragraph("RÉCAPITULATIF", s["SH"]))
    story.append(_table([
        ["Puissance installée",   f"{res.get('totalPowerKwp','')} kWc"],
        ["Nombre de panneaux",    str(res.get("panelCount",""))],
        ["Production annuelle",   f"{res.get('annualProductionKwh','')} kWh"],
        ["Économies annuelles",   f"{res.get('annualSavingsEur','')} €"],
        ["CO₂ évité / an",        f"{res.get('co2AvoidedKg','')} kg"],
        ["Score d'autonomie",     f"{res.get('energyScore','')} / 100"],
    ]))
    story.append(Spacer(1, 0.8*cm))
    story.append(Paragraph(
        "Ce dossier contient : Déclaration préalable · Courrier assurance · "
        "Checklist installation · Email devis · Guide administratif · Notice ENEDIS", s["SB"]))
    story.append(Spacer(1, 0.8*cm))
    story.append(Paragraph(
        "<i>Généré par Solar Optimizer — Document indicatif, non contractuel.</i>", s["SM"]))
    _doc(buf,"Dossier Complet").build(story)
    return buf.getvalue()


GENERATORS = {
    "declaration_mairie":  lambda p, r: declaration_mairie(p, r),
    "courrier_assurance":  lambda p, r: courrier_assurance(p, r),
    "checklist":           lambda p, r: checklist_installation(r),
    "guide_administratif": lambda p, r: guide_administratif(p, r),
    "notice_enedis":       lambda p, r: notice_enedis(r),
    "email_devis":         lambda p, r: email_devis(p, r),
    "dossier_complet":     lambda p, r: dossier_complet(p, r),
}
