import os
import re
import csv
from pathlib import Path
from config import LANGUAGE_LIST, LOC_TEXT_INPUT_DIR, LOC_TEXT_INPUT_FILENAME, LOC_TEXT_TEMP_DIR

LOC_OUTPUT_PATTERN = "\"<0>\": \"<1>\""
SPECIAL_CHARS = "\r \"|"

for lang in LANGUAGE_LIST:
    input_file_path = LOC_TEXT_TEMP_DIR + "\\" + lang + ".csv"
    output_file_path = LOC_TEXT_INPUT_DIR + "\\" + \
        lang + "\\" + LOC_TEXT_INPUT_FILENAME
    # remove old output file
    try:
        os.remove(output_file_path)
    except OSError:
        pass

    encodingType = 'UTF8'
    if (lang == 'en' or lang == 'id' or lang == 'vi'):
        encodingType = 'UTF8'
    output_file = open(output_file_path, 'w+', 1, encodingType)
    output_file.write('{')
    output_file.write('\n')

    with open(input_file_path, newline='', encoding=encodingType) as csvFile:
        csvreader = csv.reader(csvFile, quoting=csv.QUOTE_ALL, delimiter='|', quotechar='"')

        id = 0
        need_add_comma: bool = False
        for row in csvreader:
            is_first_line: bool = (id == 0)
            is_contain_data: bool = (len(row) == 2 and not any(c in SPECIAL_CHARS for c in row[0]))
            if is_contain_data:
                if need_add_comma:
                    output_file.write(',')
                    output_file.write('\n')
                    need_add_comma = False
                if (row[0] != ''):
                    result_str = LOC_OUTPUT_PATTERN.replace("<0>", row[0], 1).replace("<1>", row[1], 1)
                    output_file.write('    ')
                    output_file.write(result_str)
                    need_add_comma = True
                else:
                    output_file.write('\n')
            else:
                if need_add_comma:
                    output_file.write(',')
                    output_file.write('\n')
                    need_add_comma = False
                if not any(c in SPECIAL_CHARS for c in row[0]):
                    output_file.write(str(row))
                else:
                    output_file.write('\n')
            id += 1

    output_file.write('\n')
    output_file.write('}')
    output_file.close()
