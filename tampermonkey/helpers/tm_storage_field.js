/**
 * This class implements a Tampermonkey storage field
 */
class StorageField {
    /**
     * Constructs a new field
     * 
     * @param {string} name - name of field in storage
     * @param {any} defaultValue - default value
     * @param {function} validator - validator function for new field params
     */
    constructor(name, defaultValue, validator = undefined) {
        this.name = name;
        this.default = defaultValue;
        this.validator = validator;
    }

    /**
     * Validates a new field value
     * 
     * @param {any} value - value to validate
     */
    is_valid(value) {
        if (this.validatior) {
            return this.validatior(value);
        }
        else {
            return true;
        }
    }

    /**
     * Handler for Tampermonkey menu command
     * 
     * This param is tend to update a storage field.
     * Field will be update be user from prompt.
     * 
     * @param {string} menuParamName - a readeble description of updating param
     */
    update_from_menu_handler(menuParamName) {
        const promtText = `Set ${menuParamName} (default: ${this.default}):`;
        let newFieldValue = window.prompt(promtText, this.get());
        if (this.is_valid(newFieldValue)) {
            this.set(newFieldValue);
        }
    }

    /**
     * Returns the field value or a default value
     */
    get() {
        return GM_getValue(this.name, this.default);
    }

    /**
     * Sets a new field value in the storage without a validation
     * 
     * @param {any} newFieldValue - a new field value
     */
    set(newFieldValue) {
        GM_setValue(this.name, newFieldValue);
    }
}