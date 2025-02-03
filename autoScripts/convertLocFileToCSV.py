import os
import re
import csv
from pathlib import Path
from config import LANGUAGE_LIST, LOC_TEXT_INPUT_DIR, LOC_TEXT_INPUT_FILENAME, LOC_TEXT_TEMP_DIR

LOC_TEXT_PATTERN = '\"(.*?)\":(\\s*)?\"([^\"\\\\]*(?:\\\\.[^\"\\\\]*)*)\",?'

for lang in LANGUAGE_LIST:
    input_file_path = LOC_TEXT_INPUT_DIR + "\\" + \
        lang + "\\" + LOC_TEXT_INPUT_FILENAME
    output_file_path = LOC_TEXT_TEMP_DIR + "\\" + lang + ".csv"
    # remove old output file
    try:
        os.remove(output_file_path)
    except OSError:
        pass

    encodingType = 'UTF8'
    if (lang == 'en' or lang == 'id' or lang == 'vi'):
        encodingType = 'UTF8'
    input_file = open(input_file_path, 'r', 1, encodingType)

    with open(output_file_path, "w+", newline='', encoding=encodingType) as csvFile:
        csvwriter = csv.writer(
            csvFile, quoting=csv.QUOTE_ALL, delimiter='|', quotechar='"')
        for line in input_file:
            try:
                match = re.search(LOC_TEXT_PATTERN, line)
                if (match):
                    text_id = match.group(1)
                    text_str = match.group(3)
                    csvwriter.writerow([text_id, text_str])
                else:
                    raise AttributeError('Pattern not match')
            except AttributeError:
                if (line != '{\n' and line != '}\n' and line != '{' and line != '}'):
                    csvwriter.writerow(['', ''])
            except csv.Error:
                if (line != '{\n' and line != '}\n' and line != '{' and line != '}'):
                    csvwriter.writerow(['', ''])

    input_file.close()
