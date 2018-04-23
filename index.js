import { Component, EventEmitter, Input, NgModule, Output, Pipe, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import 'rxjs/Rx';
import { differenceWith, intersectionWith, orderBy } from 'lodash';
import * as _ from 'lodash';

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
        // event called when item or items from available items(left box) is selected
        this.onAvailableItemSelected = new EventEmitter();
        // event called when item or items from selected items(right box) is selected
        this.onSelectedItemsSelected = new EventEmitter();
        // event called when items are moved between boxes, returns state of both boxes and item moved
        this.onItemsMoved = new EventEmitter();
        this.desabilitarBotoes = false;
        this.corBorda = 'red';
        this.obrigatorio = false;
        // private variables to manage class
        this.searchTermAvailable = '';
        this.searchTermSelected = '';
        this.availableItems = [];
        this.selectedItems = [];
        this.availableListBoxControl = new FormControl();
        this.selectedListBoxControl = new FormControl();
        this.availableSearchInputControl = new FormControl();
        this.selectedSearchInputControl = new FormControl();
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
            this.availableItems = (items || []).map(function (item, index) {
                return ({
                    value: item[_this.valueField].toString(),
                    text: item[_this.textField]
                });
            }).slice();
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
        this.selectedItems = this.selectedItems.concat(intersectionWith(this.availableItems, this.availableListBoxControl.value, function (item, value) { return item.value === value; }));
        // now filter available items to not include marked values
        this.availableItems = differenceWith(this.availableItems, this.availableListBoxControl.value, function (item, value) { return item.value === value; }).slice();
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

    DualListBoxComponent.prototype.moveToSelectedList = function (itens = []) {
        var itensId = [] = itens.map((x) => { return x.value })
        this.selectedItems = this.availableItems.filter(x => itensId.indexOf(x.value) != -1);
        this.availableItems = this.availableItems.filter(x => this.selectedItems.indexOf(x) == -1)
        console.log(this.selectedItems);
        this.selectedListBoxControl.setValue([]);
        this.selectedSearchInputControl.setValue('');
        this.writeValue(this.getValues());
    }
    /**
     * Move marked items from selected items to available items
     * @return {?}
     */
    DualListBoxComponent.prototype.moveMarkedSelectedItemsToAvailable = function () {
        // first move items to available
        this.availableItems = this.availableItems.concat(intersectionWith(this.selectedItems, this.selectedListBoxControl.value, function (item, value) { return item.value === value; }));
        // now filter available items to not include marked values
        this.selectedItems = differenceWith(this.selectedItems, this.selectedListBoxControl.value, function (item, value) { return item.value === value; }).slice();
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
            this.selectedItems = this.selectedItems.concat(intersectionWith(this.availableItems, value, function (item, value) { return item.value === value; }));
            this.availableItems = differenceWith(this.availableItems, value, function (item, value) { return item.value === value; }).slice();
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
    {
        type: Component, args: [{
            selector: 'ng2-dual-list-box',
            template: "<div class=\"row\" [formGroup]=\"listBoxForm\">  <div class=\"col-md-4 col-lg-4 col-sm-12\"> <h6 class=\"vertical-spacing-5\">{{availableText}}</h6>  <select class=\"form-control list-box\" formControlName=\"availableListBox\" multiple> <option [disabled]=\"desabilitarBotoes\"  *ngFor=\"let item of availableItems | arrayFilter:['text', searchTermAvailable] | arraySort:['text', 'ASC'];trackBy:trackByValue\" [value]=\"item?.value\" >{{item?.text}}</option> </select> </div> <div class=\"col-md-1 col-lg-1 col-sm-12 center-block text-center\"><div class=\"row col-md-12 text-center\">  <button type=\"button\" [disabled]=\"desabilitarBotoes \" class=\"btn btn-primary col-md-12 col-md-offset-6 atr top80 sm-spacing\" *ngIf=\"moveAllButton\" (click)=\"moveAllItemsToSelected()\" style='align-center'><span class=\"fa fa-angle-double-right \" style='font-size : 20px'></span> </button></div> <div class=\"row col-md-12 center-block text-center\">  <button type=\"button\" class=\"btn btn-primary col-md-12 col-md-offset-2 str vertical-spacing-5 sm-spacing\" [disabled]=\"!availableListBoxControl.value?.length || desabilitarBotoes\" (click)=\"moveMarkedAvailableItemsToSelected()\"> <span class=\"fa fa-angle-right \" style='font-size : 20px'></span> </button></div>  <div class=\"row col-md-12 center-block text-center\"> <button type=\"button\" class=\"btn btn-primary col-md-12 col-md-offset-2 stl vertical-spacing-5 sm-spacing\" [disabled]=\"!selectedListBoxControl.value?.length || desabilitarBotoes \" (click)=\"moveMarkedSelectedItemsToAvailable()\"> <span class=\"fa fa-angle-left\" style='font-size : 20px'></span> </button></div> <div class=\"row col-md-12 center-block text-center\"> <button [disabled]=\"desabilitarBotoes\"  type=\"button\" class=\"btn btn-primary col-md-12 col-md-offset-2 atl bottom10 sm-spacing\" *ngIf=\"moveAllButton\" (click)=\"moveAllItemsToAvailable()\"> <span class=\"fa fa-angle-double-left\" style = 'font-size: 20px'></span></button></div> </div> <div class=\"col-md-4 col-lg-4 col-sm-12\"> <h6 class=\"vertical-spacing-5\">{{selectedText}}<span *ngIf='obrigatorio' style='color: red'>*</span></h6> <select  class=\"form-control list-box\" formControlName=\"selectedListBox\" [style.border-color]=\"corBorda\" multiple> <option [disabled]=\"desabilitarBotoes\" *ngFor=\"let item of selectedItems | arrayFilter:['text', searchTermSelected] | arraySort:['text', 'ASC'];trackBy:trackByValue\" [value]=\"item?.value\">{{item?.text}}</option> </select> </div> </div>",
            styles: [" .list-box { min-height: 200px; width: 100%; } .top100 { margin-top: 100px; } .top80 { margin-top: 45px; } .bottom10 { margin-bottom: 10px; } .vertical-spacing-5 { margin-top: 5px; margin-bottom: 5px; } .center-block { min-height: 50px; } /* Small Devices, Tablets */ @media only screen and (max-width : 768px) { .sm-spacing { margin-top: 10px; margin-bottom: 10px; } } /* Tablets in portrait */ @media only screen and (min-width : 768px) and (max-width : 992px) { .sm-spacing { margin-top: 10px; margin-bottom: 10px; } } /* Extra Small Devices, Phones */  @media only screen and (max-width : 480px) { .sm-spacing { margin-top: 10px; margin-bottom: 10px; } }"],
            providers: [{
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(function () { return DualListBoxComponent; }),
                multi: true
            }]
        },]
    },
];
/**
 * @nocollapse
 */
DualListBoxComponent.ctorParameters = function () {
    return [
        { type: FormBuilder, },
    ];
};
DualListBoxComponent.propDecorators = {
    'data': [{ type: Input },],
    'availableSearch': [{ type: Input },],
    'selectedSearch': [{ type: Input },],
    'valueField': [{ type: Input },],
    'textField': [{ type: Input },],
    'title': [{ type: Input },],
    'debounceTime': [{ type: Input },],
    'moveAllButton': [{ type: Input },],
    'availableText': [{ type: Input },],
    'selectedText': [{ type: Input },],
    'desabilitarBotoes': [{ type: Input },],
    'corBorda' : [{ type: Input },],
    'obrigatorio' : [{ type: Input },],
    'availableFilterPlaceholder': [{ type: Input },],
    'selectedFilterPlaceholder': [{ type: Input },],
    'onAvailableItemSelected': [{ type: Output },],
    'onSelectedItemsSelected': [{ type: Output },],
    'onItemsMoved': [{ type: Output },],
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
        return orderBy(array, function (item) { return item.hasOwnProperty(key) ? item[key] : item; }, direction.toLowerCase());
    };
    return ArraySortPipe;
}());
ArraySortPipe.decorators = [
    {
        type: Pipe, args: [{
            name: 'arraySort'
        },]
    },
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
    {
        type: Pipe, args: [{
            name: 'arrayFilter'
        },]
    },
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
    {
        type: NgModule, args: [{
            imports: [
                CommonModule,
                ReactiveFormsModule
            ],
            declarations: [
                ArraySortPipe,
                ArrayFilterPipe,
                DualListBoxComponent
            ],
            exports: [
                DualListBoxComponent
            ]
        },]
    },
];
/**
 * @nocollapse
 */
DualListBoxModule.ctorParameters = function () { return []; };

export { DualListBoxModule, DualListBoxComponent };
