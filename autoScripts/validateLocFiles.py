from ast import Constant
import os


class colors:  # You may need to change color settings
    RED = '\033[31m'
    ENDC = '\033[m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'


def validateFolders(dirPath, folderList):
    folders = os.listdir(dirPath)
    if (folders.sort() != folderList.sort()):
        print(colors.RED + "Invalid folders:")
        max_length = max(len(folders), len(folderList))
        i = 0
        while i < max_length:
            if (i < len(folders) and folders[i] not in folderList):
                print("Invalid folder: " + folders[i])
            if (i < len(folderList) and folderList[i] not in folders):
                print("No folder: " + folderList[i])
            i += 1
        print(colors.ENDC)
        return False
    else:
        print("Folders' name are valid")
        return True


def validateFiles(folderPathList):
    # use first folder as the standard, compare the rest to this folder
    is_valid = True
    folder_num = len(folderPathList)
    if (folder_num <= 1):
        is_valid = False
        print(colors.RED + "Invalid number of folders " + str(folder_num) + colors.ENDC)
    standard_file_list = os.listdir(folderPathList[0])
    i = 1
    while i < folder_num:
        folder_path = folderPathList[i]
        print("Checking folder " + os.path.basename(folder_path))
        file_list = os.listdir(folder_path)
        if (file_list.sort() != standard_file_list.sort()):
            is_valid = False
            print(colors.RED + "Invalid files:")
            max_length = max(len(file_list), len(standard_file_list))
            j = 0
            while j < max_length:
                if (j < len(file_list) and file_list[j] not in standard_file_list):
                    print("Invalid file: " + file_list[j])
                if (j < len(standard_file_list) and standard_file_list[j] not in file_list):
                    print("No file: " + standard_file_list[j])
                j += 1            
            print(colors.ENDC)
        i += 1
    return is_valid


def validateLocFiles(folderPath, languageList):
    is_valid = True
    is_valid = is_valid and validateFolders(folderPath, languageList)
    if is_valid:
        subpath_list = [p.path for p in os.scandir(folderPath) if p.is_dir()]
        is_valid = is_valid and validateFiles(subpath_list)
    if is_valid:
        print(colors.GREEN + "Validation completed successfully!" + colors.ENDC)
    else:
        print(colors.RED + "Invalid localization files, please check and fix all issues" + colors.ENDC)
    return is_valid
