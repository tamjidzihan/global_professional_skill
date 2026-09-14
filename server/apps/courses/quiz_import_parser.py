"""
Parser and validator for Bulk Quiz Question imports from Excel (.xlsx) and CSV files.
"""

import io
import csv
import re
from typing import List, Dict, Any, Tuple
import openpyxl


def _normalize_header(header: str) -> str:
    """Normalize a header string for fuzzy matching."""
    if not header:
        return ""
    # Convert to lowercase and remove special characters
    cleaned = re.sub(r"[^a-z0-9]", "", str(header).strip().lower())
    
    # Matching rules
    if cleaned in ["questiontype", "type", "qtype", "format", "questionformat"]:
        return "question_type"
    if cleaned in ["questiontext", "question", "title", "prompt", "qtext", "questiontitle"]:
        return "question_text"
    if cleaned in ["optiona", "opta", "a", "choicea", "choice1", "option1"]:
        return "option_a"
    if cleaned in ["optionb", "optb", "b", "choiceb", "choice2", "option2"]:
        return "option_b"
    if cleaned in ["optionc", "optc", "c", "choicec", "choice3", "option3"]:
        return "option_c"
    if cleaned in ["optiond", "optd", "d", "choiced", "choice4", "option4"]:
        return "option_d"
    if cleaned in ["correctoption", "correct", "answer", "correctanswer", "rightanswer", "ans"]:
        return "correct_option"
    if cleaned in ["explanation", "explain", "notes", "note", "rationale"]:
        return "explanation"
    
    return cleaned


def _read_csv_content(file_bytes: bytes) -> List[List[str]]:
    """Reads raw CSV bytes trying multiple standard encodings."""
    encodings = ["utf-8-sig", "utf-8", "latin-1", "cp1252"]
    for enc in encodings:
        try:
            text = file_bytes.decode(enc)
            # Detect delimiter (comma, semicolon, tab)
            sample = text[:2048]
            delimiter = ","
            if "\t" in sample and sample.count("\t") > sample.count(","):
                delimiter = "\t"
            elif ";" in sample and sample.count(";") > sample.count(","):
                delimiter = ";"
            
            reader = csv.reader(io.StringIO(text), delimiter=delimiter)
            rows = [[str(cell).strip() for cell in row] for row in reader]
            return rows
        except (UnicodeDecodeError, csv.Error):
            continue
    raise ValueError("Unable to decode the CSV file. Please ensure it is saved as UTF-8.")


def _read_excel_content(file_bytes: bytes) -> List[List[str]]:
    """Reads .xlsx file bytes using openpyxl."""
    try:
        workbook = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
        sheet = workbook.active
        rows = []
        for row in sheet.iter_rows(values_only=True):
            rows.append([str(cell).strip() if cell is not None else "" for cell in row])
        return rows
    except Exception as e:
        raise ValueError(f"Unable to read Excel file: {str(e)}")


def parse_and_validate_quiz_file(file_obj, filename: str) -> Dict[str, Any]:
    """
    Parses and validates an uploaded Quiz Question file (CSV or Excel).
    Returns detailed diagnostics including row-by-row validation errors.
    """
    file_bytes = file_obj.read() if hasattr(file_obj, "read") else file_obj
    lower_filename = filename.lower()

    if lower_filename.endswith(".xlsx") or lower_filename.endswith(".xlsm") or lower_filename.endswith(".xltx"):
        raw_rows = _read_excel_content(file_bytes)
    elif lower_filename.endswith(".csv") or lower_filename.endswith(".tsv") or lower_filename.endswith(".txt"):
        raw_rows = _read_csv_content(file_bytes)
    else:
        # Try excel first, then fallback to csv
        try:
            raw_rows = _read_excel_content(file_bytes)
        except Exception:
            raw_rows = _read_csv_content(file_bytes)

    if not raw_rows:
        return {
            "success": False,
            "filename": filename,
            "message": "The uploaded file is completely empty.",
            "total_rows": 0,
            "valid_count": 0,
            "error_count": 0,
            "has_errors": True,
            "errors": [{"row": 1, "question_text": "", "errors": ["File contains no rows."]}],
            "valid_questions": [],
        }

    # Find the header row
    header_row_idx = -1
    col_map: Dict[str, int] = {}

    for idx, row in enumerate(raw_rows):
        normalized = [_normalize_header(c) for c in row]
        if "question_text" in normalized and ("option_a" in normalized or "correct_option" in normalized):
            header_row_idx = idx
            for col_idx, col_name in enumerate(normalized):
                if col_name and col_name not in col_map:
                    col_map[col_name] = col_idx
            break

    # If standard headers not found in first few rows, assume standard default column layout
    if header_row_idx == -1:
        # Try assuming row 0 is header with standard order:
        # Type, Text, Option A, Option B, Option C, Option D, Correct
        col_map = {
            "question_type": 0,
            "question_text": 1,
            "option_a": 2,
            "option_b": 3,
            "option_c": 4,
            "option_d": 5,
            "correct_option": 6,
        }
        header_row_idx = 0

    data_rows = raw_rows[header_row_idx + 1 :]

    valid_questions: List[Dict[str, Any]] = []
    row_errors: List[Dict[str, Any]] = []

    for index, row in enumerate(data_rows):
        excel_row_num = header_row_idx + 2 + index  # 1-indexed Excel row number

        # Skip completely empty rows
        if not any(str(cell).strip() for cell in row):
            continue

        def get_val(key: str, default: str = "") -> str:
            if key in col_map and col_map[key] < len(row):
                val = row[col_map[key]]
                return str(val).strip() if val is not None else default
            return default

        raw_type = get_val("question_type", "").upper()
        raw_text = get_val("question_text", "")
        raw_opt_a = get_val("option_a", "")
        raw_opt_b = get_val("option_b", "")
        raw_opt_c = get_val("option_c", "")
        raw_opt_d = get_val("option_d", "")
        raw_correct = get_val("correct_option", "").upper()

        current_errors: List[str] = []

        # 1. Validate Question Text
        if not raw_text:
            current_errors.append("Question text is required.")
        elif len(raw_text) > 3000:
            current_errors.append("Question text is too long (maximum 3000 characters).")

        # 2. Determine Question Type
        q_type = "MCQ"
        if raw_type in ["TRUE_FALSE", "TRUE/FALSE", "TRUE FALSE", "TF", "T/F", "BOOLEAN"]:
            q_type = "TRUE_FALSE"
        elif raw_type in ["MCQ", "MULTIPLE CHOICE", "MULTIPLE_CHOICE", "M", "CHOICE"]:
            q_type = "MCQ"
        elif not raw_type:
            # Auto-infer: if C or D are provided, it's MCQ; if options are True/False, it's TRUE_FALSE
            if raw_opt_c or raw_opt_d:
                q_type = "MCQ"
            elif raw_opt_a.lower() in ["true", "false"] or raw_opt_b.lower() in ["true", "false"]:
                q_type = "TRUE_FALSE"
            else:
                q_type = "MCQ"
        else:
            current_errors.append(f"Invalid question type '{raw_type}'. Must be 'MCQ' or 'TRUE_FALSE'.")

        # 3. Validate Options & Correct Option based on Question Type
        final_opt_a = raw_opt_a
        final_opt_b = raw_opt_b
        final_opt_c = raw_opt_c
        final_opt_d = raw_opt_d
        final_correct = raw_correct

        if q_type == "TRUE_FALSE":
            if not final_opt_a:
                final_opt_a = "True"
            if not final_opt_b:
                final_opt_b = "False"
            final_opt_c = ""
            final_opt_d = ""

            # Normalize correct option for True/False
            if raw_correct in ["A", "TRUE", "T", "1"]:
                final_correct = "A"
            elif raw_correct in ["B", "FALSE", "F", "0", "2"]:
                final_correct = "B"
            else:
                current_errors.append(
                    f"Invalid correct option '{raw_correct}' for True/False question. Must be 'A' (True) or 'B' (False)."
                )
        else:
            # MCQ requires all 4 options
            missing_options = []
            if not final_opt_a:
                missing_options.append("Option A")
            if not final_opt_b:
                missing_options.append("Option B")
            if not final_opt_c:
                missing_options.append("Option C")
            if not final_opt_d:
                missing_options.append("Option D")

            if missing_options:
                current_errors.append(
                    f"MCQ questions require all 4 choices. Missing: {', '.join(missing_options)}."
                )

            # Validate Correct Option for MCQ
            if raw_correct in ["A", "OPTION A", "OPTIONA", "1"]:
                final_correct = "A"
            elif raw_correct in ["B", "OPTION B", "OPTIONB", "2"]:
                final_correct = "B"
            elif raw_correct in ["C", "OPTION C", "OPTIONC", "3"]:
                final_correct = "C"
            elif raw_correct in ["D", "OPTION D", "OPTIOND", "4"]:
                final_correct = "D"
            else:
                current_errors.append(
                    f"Invalid correct option '{raw_correct}'. Must be 'A', 'B', 'C', or 'D'."
                )

        if current_errors:
            row_errors.append({
                "row": excel_row_num,
                "question_text": raw_text or f"Row {excel_row_num}",
                "errors": current_errors,
                "question_type": q_type,
            })
        else:
            valid_questions.append({
                "row": excel_row_num,
                "question_type": q_type,
                "question_text": raw_text,
                "option_a": final_opt_a,
                "option_b": final_opt_b,
                "option_c": final_opt_c,
                "option_d": final_opt_d,
                "correct_option": final_correct,
            })

    total_detected = len(valid_questions) + len(row_errors)

    return {
        "success": True,
        "filename": filename,
        "total_rows": total_detected,
        "valid_count": len(valid_questions),
        "error_count": len(row_errors),
        "has_errors": len(row_errors) > 0,
        "errors": row_errors,
        "valid_questions": valid_questions,
    }
