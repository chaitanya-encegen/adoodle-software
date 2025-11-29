import os
import pandas as pd
import json
import xlrd
from datetime import datetime
from bs4 import BeautifulSoup

# =========================================================
# COLUMN MAP (canonical column names for DB)
# =========================================================
COLUMN_MAP = {
    'srocode': 'sr_code',
    'sr_code': 'sr_code',

    'sroname': 'sroname',
    'sro name': 'sroname',
    'sub registrar office': 'sroname',

    'areaname': 'areaname',
    'area name': 'areaname',

    'consideration_amt': 'consideration_amt',
    'consideration amount': 'consideration_amt',
    'consideration': 'consideration_amt',

    'marketvalue': 'marketvalue',
    'market value': 'marketvalue',

    'internaldocumentnumber': 'internal_document_number',
    'internal document number': 'internal_document_number',
    'internal doc no': 'internal_document_number',

    'docno': 'docno',
    'document no': 'docno',
    'documentno': 'docno',
    'doc no': 'docno',

    'docname': 'docname',
    'document name': 'docname',
    'documentname': 'docname',

    'registrationdate': 'registrationdate',
    'registration date': 'registrationdate',

    'purchasername': 'purchasername',
    'purchaser name': 'purchasername',
    'purchaserparty': 'purchasername',
    'purchaser party': 'purchasername',
    'purchaser': 'purchasername',

    'sellername': 'sellername',
    'seller name': 'sellername',
    'sellerparty': 'sellername',
    'seller party': 'sellername',
    'seller': 'sellername',

    'propertydescription': 'propertydescription',
    'property description': 'propertydescription',

    'dateofexecution': 'dateofexecution',
    'date of execution': 'dateofexecution',
    'executiondate': 'dateofexecution',
}


# =========================================================
# COLUMN NORMALIZER
# =========================================================
def normalize_colname(name: str):
    if not isinstance(name, str):
        return ''
    n = name.strip().lower().replace('\n', ' ').replace('\r', ' ')
    return " ".join(n.split())


def map_dataframe_columns(df: pd.DataFrame):
    col_map = {}
    for c in df.columns:
        nc = normalize_colname(c)
        if nc in COLUMN_MAP:
            col_map[c] = COLUMN_MAP[nc]
        else:
            clean = nc.replace(" ", "").replace("_", "")
            col_map[c] = COLUMN_MAP.get(clean)
    return col_map


# =========================================================
# DATE NORMALIZATION
# All dates stored as YYYY-MM-DD for DB
# =========================================================
def normalize_date(val):
    if not val:
        return None

    val = str(val).strip()

    # Try excel numeric date
    try:
        if val.replace(".", "").isdigit():
            d = datetime.fromordinal(datetime(1899, 12, 30).toordinal() + int(float(val)))
            return d.strftime("%Y-%m-%d")
    except:
        pass

    # Try many formats
    formats = ["%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d-%m-%y"]
    for f in formats:
        try:
            return datetime.strptime(val, f).strftime("%Y-%m-%d")
        except:
            pass

    return val


# =========================================================
# DETECT HTML DISGUISED XLS
# =========================================================
def is_html_disguised_xls(path):
    with open(path, "rb") as f:
        start = f.read(200).lstrip()

    return (
        start.startswith(b"<")
        or start.startswith(b"\xff\xfe<")
        or b"<table" in start.lower()
    )


# =========================================================
# PARSE HTML TABLES (UTF-16 or UTF-8)
# =========================================================
def parse_html_xls(path):
    # Most government files are UTF-16
    try:
        with open(path, "r", encoding="utf-16") as f:
            html = f.read()
    except:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            html = f.read()

    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []

    rows = []
    trs = table.find_all("tr")

    # Header
    header_cells = trs[0].find_all(["td", "th"])
    headers = [normalize_colname(th.get_text(strip=True)) for th in header_cells]

    col_map = {}
    for idx, h in enumerate(headers):
        if h in COLUMN_MAP:
            col_map[idx] = COLUMN_MAP[h]
        else:
            clean = h.replace(" ", "").replace("_", "")
            col_map[idx] = COLUMN_MAP.get(clean)

    # Body rows
    for tr in trs[1:]:
        tds = tr.find_all(["td", "th"])
        rec, raw = {}, {}

        for i, td in enumerate(tds):
            value = td.get_text(strip=True)
            key = headers[i] if i < len(headers) else f"col{i}"

            raw[key] = value

            canon = col_map.get(i)
            if canon:
                rec[canon] = value

        rec["registrationdate"] = normalize_date(rec.get("registrationdate"))
        rec["dateofexecution"] = normalize_date(rec.get("dateofexecution"))
        rec["raw_json"] = json.dumps(raw, ensure_ascii=False)

        rows.append(rec)

    return rows


# =========================================================
# PARSE REAL .XLS (xlrd)
# =========================================================
def parse_xls_manual(path):
    book = xlrd.open_workbook(path)
    all_rows = []

    for sheet in book.sheets():
        header = [normalize_colname(str(c)) for c in sheet.row_values(0)]
        raw_header = sheet.row_values(0)

        col_map = {}
        for idx, h in enumerate(header):
            if h in COLUMN_MAP:
                col_map[idx] = COLUMN_MAP[h]
            else:
                clean = h.replace(" ", "").replace("_", "")
                col_map[idx] = COLUMN_MAP.get(clean)

        for r in range(1, sheet.nrows):
            row = sheet.row_values(r)
            rec, raw_row = {}, {}

            for col_index, value in enumerate(row):
                val = str(value).strip()
                raw_row[str(raw_header[col_index])] = val
                canon = col_map.get(col_index)
                if canon:
                    rec[canon] = val

            rec["registrationdate"] = normalize_date(rec.get("registrationdate"))
            rec["dateofexecution"] = normalize_date(rec.get("dateofexecution"))
            rec["raw_json"] = json.dumps(raw_row, ensure_ascii=False)

            all_rows.append(rec)

    return all_rows


# =========================================================
# PARSE .XLSX (pandas)
# =========================================================
def parse_xlsx(path):
    xls = pd.ExcelFile(path, engine="openpyxl")
    all_rows = []

    for sheet in xls.sheet_names:
        df = xls.parse(sheet, dtype=str).fillna('')
        col_map = map_dataframe_columns(df)

        for _, row in df.iterrows():
            rec, raw_row = {}, {}

            for col in df.columns:
                val = str(row[col]).strip()
                raw_row[col] = val

                canon = col_map.get(col)
                if canon:
                    rec[canon] = val

            rec["registrationdate"] = normalize_date(rec.get("registrationdate"))
            rec["dateofexecution"] = normalize_date(rec.get("dateofexecution"))
            rec["raw_json"] = json.dumps(raw_row, ensure_ascii=False)

            all_rows.append(rec)

    return all_rows


# =========================================================
# MAIN ENTRY
# =========================================================
def extract_rows_from_excel(path):
    ext = os.path.splitext(path)[1].lower()

    if ext == ".xls":
        if is_html_disguised_xls(path):
            print("⚠ Detected HTML-based XLS → Parsing as HTML")
            return parse_html_xls(path)

        print("⚠ Using manual xlrd parser for real .xls")
        return parse_xls_manual(path)

    if ext == ".xlsx":
        return parse_xlsx(path)

    raise ValueError("Unsupported file format. Upload .xls or .xlsx")
