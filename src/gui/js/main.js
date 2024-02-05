/*=====================================================================================================================\
| General Utility Functions
\=====================================================================================================================*/

/**
* Logs any string, number or object to the console with custom prefix to be able to filter by
* @param {mixed} msg
* @param {String} filter_prefix
* @return {string} output
*/
function mylog(msg, filter_prefix = "") {
    let output = "";
    if($('#main-debug_mode').prop( "checked" )) {
        filter_prefix = "JavaScript: "
    }
    if(typeof(msg) == 'string') {
        output = filter_prefix + msg
    }
    if(typeof(msg) == 'object') {
        output = filter_prefix + JSON.stringify(msg);
    }

    console.log(output);
    return output;
}

/**
* Takes a html <select> object, and returns either all values, or if specified, only the selected values as comma
* seperated string. Optional readable parameter returns the string in a human readable format with 'and' placed before
* the last value
* @param {Object} object_id
* @param {Number} [selected = 0]
* @param {Number} [readable = 0]
* @return {string} output
*/
function select_values_to_string(object_id, selected = 0, readable = 0) {
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
        mylog('No object values to convert to string.');
        return '';
    }
}

/*=====================================================================================================================\
| Javascript functions that can be called by Python code on the backend:
\=====================================================================================================================*/
// Logs all python output to the javascript console
eel.expose(javascript_log);
function javascript_log(msg) {
    if($('#main-debug_mode').prop( "checked" )) {
        console.log("    Python: " + msg);
    }
}

eel.expose(set_directory);
function set_directory(working_dir) {
    $("#main-working_dir").value = working_dir;
    mylog("Working Directory set to: '" + working_dir + "'");
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
                if (directories.trim() != "") {
                    element.add(new Option(directories, directories))
                }
            }
        } else if (element.tagName == 'TABLE') {
            render_replace_table(element_id, value);
        } else {
            element.value = value;
        }
        mylog(element_id + " has been set to: '" + value + "'");
    }
}




/*=====================================================================================================================\
| Python Functions that can be called from Java Script
\=====================================================================================================================*/
// Load the specified configuration/settings file located in the same directory as this program
function load_settings_file(settings_file) {
    eel.load_settings_file(settings_file);
}

function select_directory() {
    eel.set_working_directory();
}

function save_directory() {
    eel.save_settings('MAIN', 'working_dir', $('#main-working_dir').val())
}

function save_setting(section, key, value) {
    mylog('settings.ini: [' + section + '] "' + key + '" value updated to "' + value + '"');
    eel.save_settings(section, key, value);
}

// Ignore Functions
function add_ignored_directory() {
    let directory_name = prompt("Type the name of a directory you would like to ignore:","");

    if(directory_name != null && directory_name != "") {
        $("#ignore_settings-dir_ignore_list").append(new Option(directory_name, directory_name));

        save_setting('IGNORE_SETTINGS', 'dir_ignore_list',
                     select_values_to_string('#ignore_settings-dir_ignore_list'));
    }
}

function delete_ignored_directory() {
    let del_confirm = false;
    let ignored_directories_list = $('#ignore_settings-dir_ignore_list :selected');
    let remaining_folder_list = [];

    if(ignored_directories_list.length > 0) {
        let folder_string = select_values_to_string('#ignore_settings-dir_ignore_list', 1, 1)

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
                         select_values_to_string('#ignore_settings-dir_ignore_list'));
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
                     select_values_to_string('#ignore_settings-file_ext_ignore_list'));
    }
}

function delete_ignored_file_ext () {
    let del_confirm = false;
    let file_ext_ignore_list_id = '#ignore_settings-file_ext_ignore_list';
    let ignored_file_ext_list = $(file_ext_ignore_list_id).children();
    let ignored_file_ext_list_selected = $(file_ext_ignore_list_id + ' :selected');
    let selected_ext_list_readable = select_values_to_string(file_ext_ignore_list_id, 1, 1);

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
            save_setting('IGNORE_SETTINGS', 'file_ext_ignore_list', select_values_to_string(file_ext_ignore_list_id));
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
                     select_values_to_string('#ignore_settings-file_ignore_list'));
    }
}

function delete_ignored_file_name () {
    let del_confirm = false;
    let file_name_ignore_list_id = '#ignore_settings-file_ignore_list';
    let ignored_file_name_list = $(file_name_ignore_list_id).children();
    let ignored_file_name_list_selected = $(file_name_ignore_list_id + ' :selected');
    let selected_name_list_readable = select_values_to_string(file_name_ignore_list_id, 1, 1);

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
            save_setting('IGNORE_SETTINGS', 'file_ignore_list', select_values_to_string(file_name_ignore_list_id));
        }
    } else {
        alert("Please select at least one item to delete.");
    }
}

// Unwanted Functions
function add_unwanted_dirs() {
    let dir_name = prompt("Type the full name of directories you would like to be deleted:","");

    if(dir_name != null && dir_name != "") {
        $("#delete_settings-unwanted_dirs_list").append(new Option(dir_name, dir_name));

        save_setting('DELETE_SETTINGS', 'unwanted_dirs_list',
                     select_values_to_string('#delete_settings-unwanted_dirs_list'));
    }
}

function delete_unwanted_dirs () {
    let del_confirm = false;
    let dir_name_ignore_list_id = '#delete_settings-unwanted_dirs_list';
    let ignored_dir_name_list = $(dir_name_ignore_list_id).children();
    let ignored_dir_name_list_selected = $(dir_name_ignore_list_id + ' :selected');
    let selected_name_list_readable = select_values_to_string(dir_name_ignore_list_id, 1, 1);

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
            save_setting('DELETE_SETTINGS', 'unwanted_dirs_list', select_values_to_string(dir_name_ignore_list_id));
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
                     select_values_to_string('#delete_settings-unwanted_file_ext_list'));
    }
}

function delete_unwanted_file_ext() {
    let del_confirm = false;
    let file_ext_delete_list_id = '#delete_settings-unwanted_file_ext_list';
    let delete_file_ext_list = $(file_ext_delete_list_id).children();
    let delete_file_ext_list_selected = $(file_ext_delete_list_id + ' :selected');
    let selected_ext_list_readable = select_values_to_string(file_ext_delete_list_id, 1, 1);

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
            save_setting('DELETE_SETTINGS', 'unwanted_file_ext_list', select_values_to_string(file_ext_delete_list_id));
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
                     select_values_to_string('#delete_settings-unwanted_files_list'));
    }
}

function delete_unwanted_files_list() {
    let del_confirm = false;
    let file_name_delete_list_id = '#delete_settings-unwanted_files_list';
    let delete_file_name_list = $(file_name_delete_list_id).children();
    let delete_file_name_list_selected = $(file_name_delete_list_id + ' :selected');
    let selected_name_list_readable = select_values_to_string(file_name_delete_list_id, 1, 1);

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
            save_setting('DELETE_SETTINGS', 'unwanted_files_list', select_values_to_string(file_name_delete_list_id));
        }
    } else {
        alert("Please select at least one item to delete.");
    }
}

// Replace Functions
function render_replace_table(table_name, table_json) {
    let table_json_object = JSON.parse(table_json);
    let row = 0;

    for (let prop in table_json_object) {
        $(`<tr>
               <td><input type="text" id="replace_target_` + row + `" value="` + prop + `"></td>
               <td><input type="text" id="replace_result_` + row + `" value="` + table_json_object[prop] + `"></td>
               <td class="replace_controls">
                   <button type="button" class="button_delete" 
                    onclick="delete_from_replace_table('` + table_name + `','` + row + `')">X</button>
               </td>
           </tr>`).appendTo('#' + table_name + ' tbody');
        row++;
    }
}

function update_replace_table(table_id) {
    let settings_name = table_id.replace("replace_settings-", "");
    let update_json = "";
    let table_row = '#' + table_id + ' tbody';
    $('#' + table_id + ' tbody tr').each(function () {
        let replace_target = $('td:eq(0) input',this)[0].value;
        let replace_result = $('td:eq(1) input',this)[0].value;
        update_json = update_json + '"' + replace_target + '":"' + replace_result + '",'
    });
    update_json = "{" + update_json.slice(0, -1) + "}"
    save_setting('REPLACE_SETTINGS', settings_name, update_json);
    $(table_row).children().remove();
    render_replace_table(table_id, update_json);
}

function add_to_replace_table(table_id) {
    let new_row_number = $('#' + table_id + ' > tbody > tr').length;
    let target_add = $('#' + table_id + '_target_add').val();
    let destination_add = $('#' + table_id + '_destination_add').val();
    $(`<tr>
           <td><input type="text" id="replace_target_` + new_row_number + `" value="` + target_add + `"></td>
           <td><input type="text" id="replace_result_` + new_row_number + `" value="` + destination_add  + `"></td>
           <td class="replace_controls">
               <button type="button" class="button_delete" 
                onclick="delete_from_replace_table('` + table_id + `','` + new_row_number + `')">X</button>
           </td>
       </tr>`).appendTo('#' + table_id + ' tbody');
    $('#' + table_id + '_target_add').val('');
    $('#' + table_id + '_destination_add').val('');
    update_replace_table(table_id);
}

function delete_from_replace_table(table_id, row) {
    let css_row = parseInt(row) + 1;
    let table_row = '#' + table_id + ' tbody tr';
    let replace_target = "#replace_settings-file_word_replace_list tbody tr:nth-child("+ css_row +") td:nth-child(1) input";
    let replace_result = "#replace_settings-file_word_replace_list tbody tr:nth-child("+ css_row +") td:nth-child(2) input";
    let target_value = $(replace_target).val();
    let result_value = $(replace_result).val();
    let del_confirm = confirm("Are you sure you want to remove the replacement rule: \n" +
                               target_value + " -> " + result_value + " ?");
    if(del_confirm === true) {
        mylog("Deleting replace rule " + table_row + " - " + row + ": " + target_value + " -> " + result_value);
        $(table_row)[row].remove();
        update_replace_table(table_id);
    } else { mylog(target_value + " -> " + result_value + " Replace table delete operation aborted. ") }
}

load_settings_file("settings.ini")