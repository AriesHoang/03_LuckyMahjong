
import os
import unicodedata
import argparse
import pandas as pd
import os.path
from pathlib import Path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Set up command line arguments
parser = argparse.ArgumentParser(description='Concatenate two columns from an Excel file and save as text files')
args = parser.parse_args()
from config import  LOC_TEXT_INPUT_DIR, LOC_TEXT_INPUT_FILENAME, LOC_SAMPLE_SPREADSHEET_ID,LOC_SAMPLE_RANGE_NAME,LOC_CREDENTIAL_FILE_PATH,LOC_TEXT_TEMP_DIR


class Colors:
    RED = '\033[31m'
    ENDC = '\033[m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'

def has_manual_newline(string):
    return len(string.splitlines()) > 1

def download_google_sheet():
    """Download data from Google Sheets."""
    SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    SAMPLE_SPREADSHEET_ID = LOC_SAMPLE_SPREADSHEET_ID
    SAMPLE_RANGE_NAME = LOC_SAMPLE_RANGE_NAME

    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Check if the file exists
            if not os.path.exists(LOC_CREDENTIAL_FILE_PATH):
                print("Credentials file not found at the specified path:", LOC_CREDENTIAL_FILE_PATH)
                exit()

            # Use the specified path to load the credentials file
            flow = InstalledAppFlow.from_client_secrets_file(LOC_CREDENTIAL_FILE_PATH, SCOPES)
            creds = flow.run_local_server(port=0)

        with open("token.json", "w") as token:
            token.write(creds.to_json())

    try:
        service = build("sheets", "v4", credentials=creds)
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=SAMPLE_SPREADSHEET_ID, range=SAMPLE_RANGE_NAME).execute()
        values = result.get("values", [])
        if not values:
            print("No data found.")
            return None
        return pd.DataFrame(values[1:], columns=values[0])
    except HttpError as err:
        print(err)
        return None

def save_to_text_files(df):
    """Save data from DataFrame to text files."""
    id_column = "ID"
    empty_cell_dict = {}
    has_new_line_dict = {}

    for col in df.columns[1:]:
        concatenated = ""
        for i, (val1, val2) in df[[id_column, col]].iterrows():
            val1 = str(val1) if pd.notnull(val1) else ""
            val2 = str(val2) if pd.notnull(val2) else ""

            if val1 != "" and val2 == "":
                empty_cell_dict.setdefault(val1, []).append(col)
            
            if val1 != "" and has_manual_newline(val2):
                has_new_line_dict.setdefault(val1, []).append(col)
                
            if val1 == "" and val2 == "":
                concatenated += '\n'
                continue

            val2 = val2.replace('"', '\\"')
            val2 = unicodedata.normalize('NFC', val2)
            concatenated += f'\n     "{val1}": "{val2}"'

            if i < len(df) - 1:
                concatenated += ","

        output_folder = Path(os.path.join(LOC_TEXT_INPUT_DIR, col.strip().lower().replace("-", "_")))
        if not output_folder.exists():
            output_folder.mkdir(parents=True)

        output_file = output_folder / LOC_TEXT_INPUT_FILENAME
        with open(output_file, 'w', encoding='UTF-8') as f:
            f.write("{" + concatenated + "\n}")

    if empty_cell_dict:
        print(Colors.RED + "There are empty cells!")
        for key, value in empty_cell_dict.items():
            print(f"{key}: {', '.join(str(element) for element in value)}")
        print(Colors.ENDC)

    if has_new_line_dict:
        print(Colors.RED + "There are manual new lines!")
        for key, value in has_new_line_dict.items():
            print(f"{key}: {', '.join(str(element) for element in value)}")
        print(Colors.ENDC)

def main():
    df = download_google_sheet()
    if df is not None:
        output_excel_path = LOC_TEXT_TEMP_DIR + "/localisation.xlsx"  # Specify the desired output path

        # Save DataFrame as Excel file at the specified path
        df.to_excel(output_excel_path, index=False)

        save_to_text_files(df)

if __name__ == "__main__":
    main()

