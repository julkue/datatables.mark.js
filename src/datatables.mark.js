/*!***************************************************
 * datatables.mark.js v0.1.0
 * https://github.com/julmot/datatables.mark.js
 * Copyright (c) 2016, Julian Motz
 * Released under the MIT license https://git.io/voRZ7
 *****************************************************/
/**
 * Initializes mark.js on the specified DataTables instance
 */
class Mark_DataTables {

    /**
     * @param  {object} dtInstance - A DataTables instance
     * @param  {object} [options] - mark.js options
     */
    constructor(dtInstance, options) {
        if(typeof $.fn.mark !== "function" || typeof $.fn.unmark !== "function"){
            throw new Error(
                "jquery.mark.js is necessary for datatables.mark.js"
            );
        }
        this.instance = dtInstance;
        this.options = typeof options === "object" ? options : {};
        this.initMarkListener();
    }

    /**
     * Hooks into DataTables init events to call {@link Mark_DataTables#mark}
     */
    initMarkListener() {
        // hook into the draw event
        this.instance.on(
            "draw.dt.dth column-visibility.dt.dth column-reorder.dt.dth",
            this.mark.bind(this)
        );
        this.instance.on("destroy", () => {
            // remove listener
            this.instance.off(
                "draw.dt.dth column-visibility.dt.dth column-reorder.dt.dth"
            );
        });
        this.mark();
    }

    /**
     * Iterates over all instance table columns and marks column specific
     * search terms. If there aren't any, it tries to mark global search
     * terms
     */
    mark() {
        const globalSearch = this.instance.search();

        $(this.instance.table().body()).unmark(this.options);
        this.instance.columns({
            search: "applied",
            page: "current"
        }).nodes().each((nodes, colIndex) => {
            const columnSearch = this.instance.column(colIndex).search(),
                searchVal = columnSearch || globalSearch;
            if(searchVal) {
                nodes.forEach(node => {
                    $(node).mark(searchVal, this.options);
                });
            }
        });
    }

}

// hook into all DataTables initializations
$(document).on("init.dt.dth", (event, settings) => {
    // check if the event was triggered from DataTables
    if(event.namespace !== "dt"){
        return;
    }
    // check if mark.js is enabled for this instance or by default
    let options = null;
    if(settings.oInit.mark) {
        options = settings.oInit.mark;
    } else if($.fn.dataTable.defaults.mark) {
        options = $.fn.dataTable.defaults.mark;
    }
    if(options === null) {
        return;
    }
    // get DataTables table instance by settings object containing
    // the unique table id and initialize plugin instance
    new Mark_DataTables($.fn.dataTable.Api(settings), options);
});
