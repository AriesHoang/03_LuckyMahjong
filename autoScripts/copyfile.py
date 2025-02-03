import os
import shutil
NAME_PROJECT ="Kungfu Warrior"
source_dir = r"../assets"
destination_dirtiny = r"../data/"+NAME_PROJECT+"/assetstiny"
destination_dirbase = r"../data/"+NAME_PROJECT+"/assetsbase"
if os.path.exists(destination_dirtiny):
   shutil.rmtree(destination_dirtiny)
shutil.copytree(source_dir, destination_dirtiny)


folder_path = (r"../data/"+NAME_PROJECT+"/assetstiny")


for root, dirs, files in os.walk(folder_path):
    for file in files:
        if file.endswith(".png") == False:
            os.remove(os.path.join(root, file))


if os.path.exists(destination_dirbase):
   shutil.rmtree(destination_dirbase)
shutil.copytree(folder_path, destination_dirbase)

cmd_str: str = "cd "+folder_path+" && "+"tinypng -r -k FmZxpQ6ty1dlB6gj7lGHztw3Z4Dnh8ZG"
os.system(cmd_str)
