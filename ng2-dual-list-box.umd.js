(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('@angular/forms'), require('rxjs/Rx'), require('lodash')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common', '@angular/forms', 'rxjs/Rx', 'lodash'], factory) :
	(factory((global['ng2-dual-list-box'] = global['ng2-dual-list-box'] || {}),global._angular_core,global._angular_common,global._angular_forms,null,global._));
}(this, (function (exports,_angular_core,_angular_common,_angular_forms,rxjs_Rx,_) { 'use strict';

var DualListBoxComponent = (function () {
    /**
     * @param {?} fb
     */
    function DualListBoxComponent(fb) {
        this.fb = fb;
        // field to use for value of option
        this.valueField = 'id';
        // field to use for displaying option text
        this.textField = 'name';
        // time to debounce search output in ms
        this.debounceTime = 500;
        // show/hide button to move all items between boxes
        this.moveAllButton = true;
        // text displayed over the available items list box
        this.availableText = 'Available items';
        // text displayed over the selected items list box
        this.selectedText = 'Selected items';
        // set placeholder text in available items list box
        this.availableFilterPlaceholder = 'Filter...';
        // set placeholder text in selected items list box
        this.selectedFilterPlaceholder = 'Filter...';
        this.desabilitarBotoes = false;
        // event called when item or items from available items(left box) is selected
        this.onAvailableItemSelected = new _angular_core.EventEmitter();
        // event called when item or items from selected items(right box) is selected
        this.onSelectedItemsSelected = new _angular_core.EventEmitter();
        // event called when items are moved between boxes, returns state of both boxes and item moved
        this.onItemsMoved = new _angular_core.EventEmitter();
        // private variables to manage class
        this.searchTermAvailable = '';
        this.searchTermSelected = '';
        this.availableItems = [];
        this.selectedItems = [];
        this.availableListBoxControl = new _angular_forms.FormControl();
        this.selectedListBoxControl = new _angular_forms.FormControl();
        this.availableSearchInputControl = new _angular_forms.FormControl();
        this.selectedSearchInputControl = new _angular_forms.FormControl();
        // control value accessors
        this._onChange = function (_$$1) { };
        this._onTouched = function () { };
        this.listBoxForm = this.fb.group({
            availableListBox: this.availableListBoxControl,
            selectedListBox: this.selectedListBoxControl,
            availableSearchInput: this.availableSearchInputControl,
            selectedSearchInput: this.selectedSearchInputControl
        });
    }
    Object.defineProperty(DualListBoxComponent.prototype, "data", {
        /**
         * @param {?} items
         * @return {?}
         */
        set: function (items) {
            var _this = this;
            this.availableItems = (items || []).map(function (item, index) { return ({
                value: item[_this.valueField].toString(),
                text: item[_this.textField]
            }); }).slice();
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(DualListBoxComponent.prototype, "availableSearch", {
        /**
         * @param {?} searchTerm
         * @return {?}
         */
        set: function (searchTerm) {
            this.searchTermAvailable = searchTerm;
            this.availableSearchInputControl.setValue(searchTerm);
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(DualListBoxComponent.prototype, "selectedSearch", {
        /**
         * @param {?} searchTerm
         * @return {?}
         */
        set: function (searchTerm) {
            this.searchTermSelected = searchTerm;
            this.selectedSearchInputControl.setValue(searchTerm);
        },
        enumerable: true,
        configurable: true
    });
    
    /**
     * @return {?}
     */
    DualListBoxComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.availableListBoxControl
            .valueChanges
            .subscribe(function (items) { return _this.onAvailableItemSelected.emit(items); });
        this.selectedListBoxControl
            .valueChanges
            .subscribe(function (items) { return _this.onSelectedItemsSelected.emit(items); });
        this.availableSearchInputControl
            .valueChanges
            .debounceTime(this.debounceTime)
            .distinctUntilChanged()
            .subscribe(function (search) { return _this.searchTermAvailable = search; });
        this.selectedSearchInputControl
            .valueChanges
            .debounceTime(this.debounceTime)
            .distinctUntilChanged()
            .subscribe(function (search) { return _this.searchTermSelected = search; });
    };
    /**
     * Move all items from available to selected
     * @return {?}
     */
    DualListBoxComponent.prototype.moveAllItemsToSelected = function () {
        if (!this.availableItems.length) {
            return;
        }
        this.selectedItems = this.selectedItems.concat(this.availableItems);
        this.availableItems = [];
        this.onItemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: this.availableListBoxControl.value
        });
        this.availableListBoxControl.setValue([]);
        this.writeValue(this.getValues());
    };
    /**
     * Move all items from selected to available
     * @return {?}
     */
    DualListBoxComponent.prototype.moveAllItemsToAvailable = function () {
        if (!this.selectedItems.length) {
            return;
        }
        this.availableItems = this.availableItems.concat(this.selectedItems);
        this.selectedItems = [];
        this.onItemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: this.selectedListBoxControl.value
        });
        this.selectedListBoxControl.setValue([]);
        this.writeValue([]);
    };
    /**
     * Move marked items from available items to selected items
     * @return {?}
     */
    DualListBoxComponent.prototype.moveMarkedAvailableItemsToSelected = function () {
        // first move items to selected
        this.selectedItems = this.selectedItems.concat(_.intersectionWith(this.availableItems, this.availableListBoxControl.value, function (item, value) { return item.value === value; }));
        // now filter available items to not include marked values
        this.availableItems = _.differenceWith(this.availableItems, this.availableListBoxControl.value, function (item, value) { return item.value === value; }).slice();
        // clear marked available items and emit event
        this.onItemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: this.availableListBoxControl.value
        });
        this.availableListBoxControl.setValue([]);
        this.availableSearchInputControl.setValue('');
        this.writeValue(this.getValues());
    };
    /**
     * Move marked items from selected items to available items
     * @return {?}
     */
    DualListBoxComponent.prototype.moveMarkedSelectedItemsToAvailable = function () {
        // first move items to available
        this.availableItems = this.availableItems.concat(_.intersectionWith(this.selectedItems, this.selectedListBoxControl.value, function (item, value) { return item.value === value; }));
        // now filter available items to not include marked values
        this.selectedItems = _.differenceWith(this.selectedItems, this.selectedListBoxControl.value, function (item, value) { return item.value === value; }).slice();
        // clear marked available items and emit event
        this.onItemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: this.selectedListBoxControl.value
        });
        this.selectedListBoxControl.setValue([]);
        this.selectedSearchInputControl.setValue('');
        this.writeValue(this.getValues());
    };
    /**
     * Move single item from available to selected
     * @param {?} item
     * @return {?}
     */
    DualListBoxComponent.prototype.moveAvailableItemToSelected = function (item) {
        this.availableItems = this.availableItems.filter(function (listItem) { return listItem.value !== item.value; });
        this.selectedItems = this.selectedItems.concat([item]);
        this.onItemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: [item.value]
        });
        this.availableSearchInputControl.setValue('');
        this.availableListBoxControl.setValue([]);
        this.writeValue(this.getValues());
    };
    /**
     * Move single item from selected to available
     * @param {?} item
     * @return {?}
     */
    DualListBoxComponent.prototype.moveSelectedItemToAvailable = function (item) {
        this.selectedItems = this.selectedItems.filter(function (listItem) { return listItem.value !== item.value; });
        this.availableItems = this.availableItems.concat([item]);
        this.onItemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: [item.value]
        });
        this.selectedSearchInputControl.setValue('');
        this.selectedListBoxControl.setValue([]);
        this.writeValue(this.getValues());
    };
    /**
     * Function to pass to ngFor to improve performance, tracks items
     * by the value field
     * @param {?} index
     * @param {?} item
     * @return {?}
     */
    DualListBoxComponent.prototype.trackByValue = function (index, item) {
        return item[this.valueField];
    };
    /**
     * @param {?} value
     * @return {?}
     */
    DualListBoxComponent.prototype.writeValue = function (value) {
        if (this.selectedItems && value && value.length > 0) {
            this.selectedItems = this.selectedItems.concat(_.intersectionWith(this.availableItems, value, function (item, value) { return item.value === value; }));
            this.availableItems = _.differenceWith(this.availableItems, value, function (item, value) { return item.value === value; }).slice();
        }
        this._onChange(value);
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    DualListBoxComponent.prototype.registerOnChange = function (fn) {
        this._onChange = fn;
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    DualListBoxComponent.prototype.registerOnTouched = function (fn) {
        this._onTouched = fn;
    };
    /**
     * Utility method to get values from
     * selected items
     * @return {?}
     */
    DualListBoxComponent.prototype.getValues = function () {
        return (this.selectedItems || []).map(function (item) { return item.value; });
    };
    return DualListBoxComponent;
}());
DualListBoxComponent.decorators = [
    { type: _angular_core.Component, args: [{
                selector: 'ng2-dual-list-box',
                template: "<div class=\"row\" [formGroup]=\"listBoxForm\"> <div class=\"col-md-5 col-lg-5 col-sm-12\"> <h4 class=\"text-center vertical-spacing-5\">{{availableText}}</h4> <input type=\"text\" class=\"form-control vertical-spacing-5\" placeholder=\"{{availableFilterPlaceholder}}\" formControlName=\"availableSearchInput\" /> <select class=\"form-control list-box\" formControlName=\"availableListBox\" multiple> <option *ngFor=\"let item of availableItems | arrayFilter:['text', searchTermAvailable] | arraySort:['text', 'ASC'];trackBy:trackByValue\" [value]=\"item?.value\" (dblclick)=\"moveAvailableItemToSelected(item)\">{{item?.text}}</option> </select> </div> <div class=\"col-md-2 col-lg-2 col-sm-12 center-block text-center\"> <button type=\"button\" class=\"btn btn-default col-md-8 col-md-offset-2 atr top80 sm-spacing\" *ngIf=\"moveAllButton\" (click)=\"moveAllItemsToSelected()\"> <span class=\"glyphicon glyphicon-list\"></span> <span class=\"glyphicon glyphicon-chevron-right\"></span> </button> <button type=\"button\" class=\"btn btn-default col-md-8 col-md-offset-2 str vertical-spacing-5 sm-spacing\" [disabled]=\"!availableListBoxControl.value?.length\" (click)=\"moveMarkedAvailableItemsToSelected()\"> <span class=\"glyphicon glyphicon-chevron-right\"></span> </button> <button type=\"button\" class=\"btn btn-default col-md-8 col-md-offset-2 stl vertical-spacing-5 sm-spacing\" [disabled]=\"!selectedListBoxControl.value?.length\" (click)=\"moveMarkedSelectedItemsToAvailable()\"> <span class=\"glyphicon glyphicon-chevron-left\"></span> </button> <button type=\"button\" class=\"btn btn-default col-md-8 col-md-offset-2 atl bottom10 sm-spacing\" *ngIf=\"moveAllButton\" (click)=\"moveAllItemsToAvailable()\"> <span class=\"glyphicon glyphicon-chevron-left\"></span> <span class=\"glyphicon glyphicon-list\"></span> </button> </div> <div class=\"col-md-5 col-lg-5 col-sm-12\"> <h4 class=\"text-center vertical-spacing-5\">{{selectedText}}</h4> <input type=\"text\" class=\"form-control vertical-spacing-5\" placeholder=\"{{selectedFilterPlaceholder}}\" formControlName=\"selectedSearchInput\" /> <select class=\"form-control list-box\" formControlName=\"selectedListBox\" multiple> <option *ngFor=\"let item of selectedItems | arrayFilter:['text', searchTermSelected] | arraySort:['text', 'ASC'];trackBy:trackByValue\" [value]=\"item?.value\" (dblclick)=\"moveSelectedItemToAvailable(item)\">{{item?.text}}</option> </select> </div> </div>",
                styles: [".list-box { min-height: 200px; width: 100%; } .top100 { margin-top: 100px; } .top80 { margin-top: 80px; } .bottom10 { margin-bottom: 10px; } .vertical-spacing-5 { margin-top: 5px; margin-bottom: 5px; } .center-block { min-height: 50px; } /* Small Devices, Tablets */ @media only screen and (max-width : 768px) { .sm-spacing { margin-top: 10px; margin-bottom: 10px; } } /* Tablets in portrait */ @media only screen and (min-width : 768px) and (max-width : 992px) { .sm-spacing { margin-top: 10px; margin-bottom: 10px; } } /* Extra Small Devices, Phones */  @media only screen and (max-width : 480px) { .sm-spacing { margin-top: 10px; margin-bottom: 10px; } }"],
                providers: [{
                        provide: _angular_forms.NG_VALUE_ACCESSOR,
                        useExisting: _angular_core.forwardRef(function () { return DualListBoxComponent; }),
                        multi: true
                    }]
            },] },
];
/**
 * @nocollapse
 */
DualListBoxComponent.ctorParameters = function () { return [
    { type: _angular_forms.FormBuilder, },
]; };
DualListBoxComponent.propDecorators = {
    'data': [{ type: _angular_core.Input },],
    'availableSearch': [{ type: _angular_core.Input },],
    'selectedSearch': [{ type: _angular_core.Input },],
    'valueField': [{ type: _angular_core.Input },],
    'textField': [{ type: _angular_core.Input },],
    'title': [{ type: _angular_core.Input },],
    'debounceTime': [{ type: _angular_core.Input },],
    'moveAllButton': [{ type: _angular_core.Input },],
    'availableText': [{ type: _angular_core.Input },],
    'selectedText': [{ type: _angular_core.Input },],
    'desabilitarBotoes': [{ type: _angular_core.Input },],
    'availableFilterPlaceholder': [{ type: _angular_core.Input },],
    'selectedFilterPlaceholder': [{ type: _angular_core.Input },],
    'onAvailableItemSelected': [{ type: _angular_core.Output },],
    'onSelectedItemsSelected': [{ type: _angular_core.Output },],
    'onItemsMoved': [{ type: _angular_core.Output },],
};

/**
 * Utility class to not hardcode sort directions
 */
var SortOptions = (function () {
    function SortOptions() {
    }
    return SortOptions;
}());
/**
 * Static property to defined ASC and DESC values
 * to avoid hardcoding and repeating
 * replaces string enums
 */
SortOptions.direction = {
    ASC: 'ASC',
    DESC: 'DESC'
};
/**
 * Pipe used to sort arrays by using lodash
 * Takes array and array of 2 strings(parameters), key and direction
 * direction must be either ASC or DESC
 */
var ArraySortPipe = (function () {
    function ArraySortPipe() {
    }
    /**
     * @param {?} array
     * @param {?} args
     * @return {?}
     */
    ArraySortPipe.prototype.transform = function (array, args) {
        array = array || [];
        if (typeof args === 'undefined' || args.length !== 2) {
            return array;
        }
        var key = args[0], direction = args[1];
        if (direction !== SortOptions.direction.ASC && direction !== SortOptions.direction.DESC) {
            return array;
        }
        // if there is no key we assume item is of string type
        return _.orderBy(array, function (item) { return item.hasOwnProperty(key) ? item[key] : item; }, direction.toLowerCase());
    };
    return ArraySortPipe;
}());
ArraySortPipe.decorators = [
    { type: _angular_core.Pipe, args: [{
                name: 'arraySort'
            },] },
];
/**
 * @nocollapse
 */
ArraySortPipe.ctorParameters = function () { return []; };
/**
 * Pipe used to filter array, takes input array and
 * array of 2 arguments, key of object and search term
 * if key does not exist, pipe assumes the item is string
 */
var ArrayFilterPipe = (function () {
    function ArrayFilterPipe() {
    }
    /**
     * @param {?} array
     * @param {?} args
     * @return {?}
     */
    ArrayFilterPipe.prototype.transform = function (array, args) {
        array = array || [];
        if (typeof args === 'undefined' || args.length !== 2) {
            return array;
        }
        var key = args[0], searchTerm = args[1];
        if (searchTerm.trim() === '') {
            return array;
        }
        return array.filter(function (item) { return item[key].toString().toLowerCase().search(searchTerm.toLowerCase().trim()) >= 0; });
    };
    return ArrayFilterPipe;
}());
ArrayFilterPipe.decorators = [
    { type: _angular_core.Pipe, args: [{
                name: 'arrayFilter'
            },] },
];
/**
 * @nocollapse
 */
ArrayFilterPipe.ctorParameters = function () { return []; };

var DualListBoxModule = (function () {
    function DualListBoxModule() {
    }
    /**
     * @return {?}
     */
    DualListBoxModule.forRoot = function () {
        return {
            ngModule: DualListBoxModule
        };
    };
    return DualListBoxModule;
}());
DualListBoxModule.decorators = [
    { type: _angular_core.NgModule, args: [{
                imports: [
                    _angular_common.CommonModule,
                    _angular_forms.ReactiveFormsModule
                ],
                declarations: [
                    ArraySortPipe,
                    ArrayFilterPipe,
                    DualListBoxComponent
                ],
                exports: [
                    DualListBoxComponent
                ]
            },] },
];
/**
 * @nocollapse
 */
DualListBoxModule.ctorParameters = function () { return []; };

exports.DualListBoxModule = DualListBoxModule;
exports.DualListBoxComponent = DualListBoxComponent;

Object.defineProperty(exports, '__esModule', { value: true });

})));
