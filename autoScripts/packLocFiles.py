import os
from config import LANGUAGE_LIST, LOC_IMG_INPUT_DIR, LOC_OUTPUT_DIR, LOC_IMG_OUTPUT_FILENAME
from validateLocFiles import validateLocFiles, colors

def runCommand(cmd_str):
    os.system(cmd_str)


os.system('color')
is_valid = validateLocFiles(LOC_IMG_INPUT_DIR, LANGUAGE_LIST)
if is_valid:
    # pack files using TexturePacker
    for idx, subFolder in enumerate(os.listdir(LOC_IMG_INPUT_DIR)):
        abs_folder_path = os.path.abspath(
            LOC_IMG_INPUT_DIR + "/" + subFolder)
        abs_output_file = os.path.abspath(
            LOC_OUTPUT_DIR) + "/" + subFolder + "/" + LOC_IMG_OUTPUT_FILENAME
        print("Pack folder " + abs_folder_path)
        cmd_str = "TexturePacker --data " + abs_output_file + ".plist --sheet " + \
            abs_output_file + ".png --format cocos2d-x " + abs_folder_path
        print("command = " + cmd_str)
        os.system(cmd_str)
    print(colors.GREEN + "Pack localization files finished successfully" + colors.ENDC)
else:
    print(colors.RED + "Pack localization files failed" + colors.ENDC)
