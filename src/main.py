import os
import platform
import sys
from loguru import logger
import configparser
from screeninfo import get_monitors
import eel
import tkinter
import tkinter.filedialog as filedialog
import logging

# GLOBAL VARIABLES
PRIMARY_DISPLAY = ""
for m in get_monitors():
    if m.is_primary:
        SCREEN_SIZE = (m.width, m.height)
MAIN_WINDOW_SIZE = (800, 600)
MAIN_WINDOW_POSITION = (0,0)
WORKING_DIRECTORY = ""
CONFIG_FILE = "settings.ini"

logger.add("debug_1.log", rotation="500 MB")
logger.info("Initializing application...")
# Set web files folder for eel.expose() to serve
eel.init('gui', allowed_extensions=['.js', '.html', '.css'])


def javascript_logging(msg):
    eel.javascript_log(msg)


logger.add(javascript_logging, format="{message}")


def init_window_position():
    # Center the window
    h_window_center = (SCREEN_SIZE[0] / 2) - (MAIN_WINDOW_SIZE[0] / 2)
    v_window_center = (SCREEN_SIZE[1] / 2) - (MAIN_WINDOW_SIZE[1] / 2)
    return h_window_center, v_window_center


def create_configuration(config_file):
    config = configparser.ConfigParser()
    # Create a default settings file
    logger.info("Creating config file.")

    # Main Settings
    config['MAIN'] = {}
    config['MAIN']['debug_mode'] = 'True'
    config['MAIN']['dry_run'] = 'True'
    config['MAIN']['working_dir'] = r'F:\Music\Samples'
    config['MAIN']['recursive'] = 'True'
    config['MAIN']['capitalize_words_in_files'] = 'True'
    config['MAIN']['capitalize_words_in_dirs'] = 'True'

    # Ignore Settings
    config['IGNORE_SETTINGS'] = {}
    config['IGNORE_SETTINGS']['ignore_dir_list'] = 'True'
    config['IGNORE_SETTINGS']['dir_ignore_list'] = 'Imported,Ableton Pack'
    config['IGNORE_SETTINGS']['ignore_file_ext_list'] = 'False'
    config['IGNORE_SETTINGS']['file_ext_ignore_list'] = '.rar,.r00,.r01,.r02,.r03,.r04,.r05,.r06,.r07,.r08,.r09,' \
                                                        '.r10,.r11,.r12,.r13,.r14,.r15,.r16,.r17,.r18,.r19,.r20,' \
                                                        '.r21,.r22,.r23,.r24,.r25,.r26,.r27,.r28,.r29,.r30'
    config['IGNORE_SETTINGS']['ignore_file_list'] = 'True'
    config['IGNORE_SETTINGS']['file_ignore_list'] = 'desktop.ini'

    # Delete Settings
    config['DELETE_SETTINGS'] = {}
    config['DELETE_SETTINGS']['delete_unwanted_dirs'] = 'False'
    config['DELETE_SETTINGS']['unwanted_dirs_list'] = ''
    config['DELETE_SETTINGS']['delete_unwanted_files'] = 'False'
    config['DELETE_SETTINGS']['unwanted_files_list'] = ''
    config['DELETE_SETTINGS']['delete_unwanted_file_ext'] = 'True'
    config['DELETE_SETTINGS']['unwanted_file_ext_list'] = '.doc,.docx,.rtf,.mp3,.pdf'

    # Replace Settings
    config['REPLACE_SETTINGS'] = {}
    config['REPLACE_SETTINGS']['file_word_replace_list'] = "{'':''}"
    config['REPLACE_SETTINGS']['dir_word_replace_list'] = "{'Midi':'MIDI','_':' '}"
    config['REPLACE_SETTINGS']['after_clean_fixes'] = "{'___':' ','Fx':'FX'}"

    with open(config_file, 'w') as configfile:
        config.write(configfile)
        logger.info('... default "' + config_file + '" has been created.')


@eel.expose
def load_configuration(config_file):
    config = configparser.ConfigParser()
    if os.path.isfile('./' + config_file):
        config.read(config_file)
        # Load existing settings file
        logger.info('Loading config file "' + config_file + '"...')
        for each_section in config.sections():
            for (each_key, each_val) in config.items(each_section):
                eel.set_setting_value(each_section.lower() + "-" + each_key, each_val)
                logger.info("loading config setting: " + each_key + ": " + each_val)
        logger.info('... Done loading existing "' + config_file + '" file.')
    else:
        logger.warning("No config file found")
        create_configuration(config_file)
        load_configuration(config_file)


@eel.expose
def save_config_setting(section, key, value):
    global CONFIG_FILE
    section = str(section)
    key = str(key)
    value = str(value)
    config = configparser.ConfigParser()
    config.read(CONFIG_FILE)
    config.set(section, key, value)
    with open(CONFIG_FILE, 'w') as configfile:
        config.write(configfile)
        logger.info(CONFIG_FILE + ': [' + section + '] "' + key + '" value updated to "' + value + '"')


@eel.expose
def set_working_directory():
    global WORKING_DIRECTORY
    root = tkinter.Tk()
    root.attributes("-topmost", True)
    root.withdraw()
    WORKING_DIRECTORY = filedialog.askdirectory()
    if WORKING_DIRECTORY.strip() != "":
        save_config_setting('MAIN', 'working_dir', WORKING_DIRECTORY)
        eel.set_setting_value('main-working_dir', WORKING_DIRECTORY)


# Launch example in Microsoft Edge only on Windows 10 and above
if sys.platform in ['win32', 'win64'] and int(platform.release()) >= 10:
    eel.start('index.html', mode='chrome', size=MAIN_WINDOW_SIZE, position=init_window_position())
else:
    raise EnvironmentError('Error: System is not Windows 10 or above')

