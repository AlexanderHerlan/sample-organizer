
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Functions that can be called from Python:
eel.expose(set_directory);
function set_directory(working_dir) {
    console.log("Working Directory set to: '" + working_dir + "'");
    $("#main-working_dir").value = working_dir;
}

eel.expose(set_setting_value);
function set_setting_value(element_id, value) {
    let element =  document.getElementById(element_id);
    if (typeof(element) != 'undefined' && element != null) {
        if(element.type == 'checkbox') {
            element.value = /^true$/i.test(value);
            element.checked = /^true$/i.test(value);
        } else if (element.type == 'select-multiple') {
            for (let directories of value.split(',')) {
                if(directories.trim() != "") {
                    element.add(new Option(directories, directories))
                }
            }
        } else {
            element.value = value;
        }
        console.log(element_id + " has been set to: '" + value + "'");
    }
}

eel.expose(javascript_log);
function javascript_log(msg) {
    console.log("Python: " + msg);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Functions that are calling Python Functions
function select_directory() {
    eel.set_working_directory();
}

function save_setting(section, key, value) {
    console.log('settings.ini: [' + section + '] "' + key + '" value updated to "' + value + '"');
    eel.save_config_setting(section, key, value);
}

// 'readable' will output a human-readable string with "and" before the last value
function values_to_string(object_id, selected = 0, readable = 0) {
    let values;
    let value_list = [];
    let settings_value_string;

    if(typeof object_id === 'string') {
        if(object_id.substring(0, 1) != '#') {
            object_id = '#' + object_id
        }

        if(selected == 1) {
            values = $(object_id + ' :selected');
        } else {
            values = $(object_id).children();
        }
    }

    if(values.length > 0) {
        let i = 0;
        values.each(function (key, value) {
            value_list[i] = values[i].innerText;
            i++;
        });

        if(readable == 1) {
            settings_value_string = value_list.join(", ").replace(/, ([^,]*)$/, ' and $1');
        } else {
            settings_value_string = value_list.join(",");
        }

        return settings_value_string;
    } else {
        console.log('No object values to convert to string.');
        return '';
    }
}

function add_ignored_directory() {
    let directory_name = prompt("Type the name of a directory you would like to ignore:","");

    if(directory_name != null && directory_name != "") {
        $("#ignore_settings-dir_ignore_list").append(new Option(directory_name, directory_name));

        save_setting('IGNORE_SETTINGS', 'dir_ignore_list',
                     values_to_string('#ignore_settings-dir_ignore_list'));
    }
}

function delete_ignored_directory() {
    let del_confirm = false;
    let ignored_directories_list = $('#ignore_settings-dir_ignore_list :selected');
    let remaining_folder_list = [];

    if(ignored_directories_list.length > 0) {
        let folder_string = values_to_string('#ignore_settings-dir_ignore_list', 1, 1)

        if(ignored_directories_list.length > 1) {
            del_confirm = confirm("Are you sure you want to remove the following directories: \n"
                                + folder_string + "\nfrom your ignore list?");
        } else {
            del_confirm = confirm("Are you sure you want to remove the '"+folder_string+"' directory from your ignore "
                                + "list?");
        }

        if(del_confirm === true) {
            $("#ignore_settings-dir_ignore_list").find("option:selected").remove();
            save_setting('IGNORE_SETTINGS', 'dir_ignore_list',
                         values_to_string('#ignore_settings-dir_ignore_list'));
        }
    } else {
        alert("Please select at least one directory to delete.");
    }
}

function add_ignored_file_ext() {
    let file_ext_name = prompt("Type the name of a file extension you would like to ignore:","");

    if(file_ext_name.substring(0,1) != ".") {
        file_ext_name = "." + file_ext_name;
    }

    if(file_ext_name != null && file_ext_name != "") {
        $("#ignore_settings-file_ext_ignore_list").append(new Option(file_ext_name, file_ext_name));

        save_setting('IGNORE_SETTINGS', 'file_ext_ignore_list',
                     values_to_string('#ignore_settings-file_ext_ignore_list'));
    }
}

function delete_ignored_file_ext () {
    let del_confirm = false;
    let file_ext_ignore_list_id = '#ignore_settings-file_ext_ignore_list';
    let ignored_file_ext_list = $(file_ext_ignore_list_id).children();
    let ignored_file_ext_list_selected = $(file_ext_ignore_list_id + ' :selected');
    let selected_ext_list_readable = values_to_string(file_ext_ignore_list_id, 1, 1);

    if(ignored_file_ext_list_selected.length > 0) {
        if(ignored_file_ext_list_selected.length > 1) {
            del_confirm = confirm("Are you sure you want to remove the following " + ignored_file_ext_list_selected.length
                                + " file extensions: \n"+  selected_ext_list_readable + "\nfrom your ignore list?");
        } else {
            del_confirm = confirm("Are you sure you want to remove the '"+selected_ext_list_readable+"' file extension "
                                + "from your ignore list?");
        }

        if(del_confirm === true) {
            $(file_ext_ignore_list_id).find("option:selected").remove();
            save_setting('IGNORE_SETTINGS', 'file_ext_ignore_list', values_to_string(file_ext_ignore_list_id));
        }
    } else {
        alert("Please select at least one item to delete.");
    }
}

function add_ignored_file_name() {
    let file_name = prompt("Type the full file name, including the extension, of a file you would like to ignore:","");

    if(file_name != null && file_name != "") {
        $("#ignore_settings-file_ignore_list").append(new Option(file_name, file_name));

        save_setting('IGNORE_SETTINGS', 'file_ignore_list',
                     values_to_string('#ignore_settings-file_ignore_list'));
    }
}

function delete_ignored_file_name () {
    let del_confirm = false;
    let file_name_ignore_list_id = '#ignore_settings-file_ignore_list';
    let ignored_file_name_list = $(file_name_ignore_list_id).children();
    let ignored_file_name_list_selected = $(file_name_ignore_list_id + ' :selected');
    let selected_name_list_readable = values_to_string(file_name_ignore_list_id, 1, 1);

    if(ignored_file_name_list_selected.length > 0) {
        if(ignored_file_name_list_selected.length > 1) {
            del_confirm = confirm("Are you sure you want to remove the following " + ignored_file_name_list_selected.length
                                + " file names: \n"+  selected_name_list_readable + "\nfrom your ignore list?");
        } else {
            del_confirm = confirm("Are you sure you want to remove the '"+selected_name_list_readable+"' file name "
                                + "from your ignore list?");
        }

        if(del_confirm === true) {
            $(file_name_ignore_list_id).find("option:selected").remove();
            save_setting('IGNORE_SETTINGS', 'file_ignore_list', values_to_string(file_name_ignore_list_id));
        }
    } else {
        alert("Please select at least one item to delete.");
    }
}

function add_unwanted_dirs() {
    let dir_name = prompt("Type the full name of directories you would like to be deleted:","");

    if(dir_name != null && dir_name != "") {
        $("#delete_settings-unwanted_dirs_list").append(new Option(dir_name, dir_name));

        save_setting('DELETE_SETTINGS', 'unwanted_dirs_list',
                     values_to_string('#delete_settings-unwanted_dirs_list'));
    }
}

function delete_unwanted_dirs () {
    let del_confirm = false;
    let dir_name_ignore_list_id = '#delete_settings-unwanted_dirs_list';
    let ignored_dir_name_list = $(dir_name_ignore_list_id).children();
    let ignored_dir_name_list_selected = $(dir_name_ignore_list_id + ' :selected');
    let selected_name_list_readable = values_to_string(dir_name_ignore_list_id, 1, 1);

    if(ignored_dir_name_list_selected.length > 0) {
        if(ignored_dir_name_list_selected.length > 1) {
            del_confirm = confirm("Are you sure you want to remove the following " + ignored_dir_name_list_selected.length
                                + " directory names: \n"+  selected_name_list_readable + "\nfrom your delete list?");
        } else {
            del_confirm = confirm("Are you sure you want to remove the '"+selected_name_list_readable+"' directory name"
                                + " from your delete list?");
        }

        if(del_confirm === true) {
            $(dir_name_ignore_list_id).find("option:selected").remove();
            save_setting('DELETE_SETTINGS', 'unwanted_dirs_list', values_to_string(dir_name_ignore_list_id));
        }
    } else {
        alert("Please select at least one item to delete.");
    }
}

function add_unwanted_file_ext() {
    let file_ext_name = prompt("Type the name of a file extension you would like to delete:","");

    if(file_ext_name.substring(0,1) != ".") {
        file_ext_name = "." + file_ext_name;
    }

    if(file_ext_name != null && file_ext_name != "") {
        $("#delete_settings-unwanted_file_ext_list").append(new Option(file_ext_name, file_ext_name));

        save_setting('DELETE_SETTINGS', 'unwanted_file_ext_list',
                     values_to_string('#delete_settings-unwanted_file_ext_list'));
    }
}

function delete_unwanted_file_ext() {
    let del_confirm = false;
    let file_ext_delete_list_id = '#delete_settings-unwanted_file_ext_list';
    let delete_file_ext_list = $(file_ext_delete_list_id).children();
    let delete_file_ext_list_selected = $(file_ext_delete_list_id + ' :selected');
    let selected_ext_list_readable = values_to_string(file_ext_delete_list_id, 1, 1);

    if(delete_file_ext_list_selected.length > 0) {
        if(delete_file_ext_list_selected.length > 1) {
            del_confirm = confirm("Are you sure you want to remove the following " + delete_file_ext_list_selected.length
                                + " file extensions: \n"+  selected_ext_list_readable + "\nfrom your delete list?");
        } else {
            del_confirm = confirm("Are you sure you want to remove the '"+selected_ext_list_readable+"' file extension "
                                + "from your delete list?");
        }

        if(del_confirm === true) {
            $(file_ext_delete_list_id).find("option:selected").remove();
            save_setting('DELETE_SETTINGS', 'unwanted_file_ext_list', values_to_string(file_ext_delete_list_id));
        }
    } else {
        alert("Please select at least one item to delete.");
    }
}

function add_unwanted_files() {
    let file_name = prompt("Type the full file name, including the extension, of a file you would like to delete:","");

    if(file_name != null && file_name != "") {
        $("#delete_settings-unwanted_files_list").append(new Option(file_name, file_name));

        save_setting('DELETE_SETTINGS', 'unwanted_files_list',
                     values_to_string('#delete_settings-unwanted_files_list'));
    }
}

function delete_unwanted_files_list() {
    let del_confirm = false;
    let file_name_delete_list_id = '#delete_settings-unwanted_files_list';
    let delete_file_name_list = $(file_name_delete_list_id).children();
    let delete_file_name_list_selected = $(file_name_delete_list_id + ' :selected');
    let selected_name_list_readable = values_to_string(file_name_delete_list_id, 1, 1);

    if(delete_file_name_list_selected.length > 0) {
        if(delete_file_name_list_selected.length > 1) {
            del_confirm = confirm("Are you sure you want to remove the following " + delete_file_name_list_selected.length
                                + " file names: \n"+  selected_name_list_readable + "\nfrom your delete list?");
        } else {
            del_confirm = confirm("Are you sure you want to remove the '"+selected_name_list_readable+"' file name "
                                + "from your delete list?");
        }

        if(del_confirm === true) {
            $(file_name_delete_list_id).find("option:selected").remove();
            save_setting('DELETE_SETTINGS', 'unwanted_files_list', values_to_string(file_name_delete_list_id));
        }
    } else {
        alert("Please select at least one item to delete.");
    }
}

function load_configuration(config_file) {
    eel.load_configuration(config_file);
}
load_configuration("settings.ini")