import os
from pathlib import Path
import configparser

CONFIG_FILE = 'config.txt'
dirname = os.path.dirname(__file__)

configParser = configparser.ConfigParser()
configParser.read(CONFIG_FILE)
LOC_IMG_INPUT_DIR = os.path.join(dirname, Path(
    configParser['Config']['LOC_IMG_INPUT_DIR']))
LANGUAGE_LIST = configParser['Config']['LANGUAGE_LIST'].split(',')
LOC_OUTPUT_DIR = os.path.join(dirname, Path(
    configParser['Config']['LOC_IMG_OUTPUT_DIR']))
LOC_IMG_OUTPUT_FILENAME = configParser['Config']['LOC_IMG_OUTPUT_FILENAME']
LOC_TEXT_INPUT_DIR = os.path.join(dirname, Path(
    configParser['Config']['LOC_TEXT_INPUT_DIR']))
LOC_TEXT_INPUT_FILENAME = configParser['Config']['LOC_TEXT_INPUT_FILENAME']
LOC_TEXT_TEMP_DIR = os.path.join(dirname, Path(
    configParser['Config']['LOC_TEXT_TEMP_DIR'])) 
LOC_TEXT_COMMON_INPUT_FILENAME = configParser['Config']['LOC_TEXT_COMMON_INPUT_FILENAME']


LOC_SAMPLE_SPREADSHEET_ID = configParser['Config']['LOC_SAMPLE_SPREADSHEET_ID']
LOC_SAMPLE_RANGE_NAME = configParser['Config']['LOC_SAMPLE_RANGE_NAME']
LOC_CREDENTIAL_FILE_PATH = configParser['Config']['LOC_CREDENTIAL_FILE_PATH']